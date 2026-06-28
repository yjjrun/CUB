# Deploying CUB to AWS (EC2 + nginx)

CUB runs on a single Amazon Linux 2023 EC2 instance: `server.py` runs as a systemd
service behind nginx, SQLite lives on the persistent EBS root volume, and a stable
Elastic IP fronts the box. TLS is from Let's Encrypt. DNS can be any provider — the
live site uses Cloudflare.

```
Browser → DNS (cub-buddy.com) → Elastic IP → EC2
            └ nginx (80/443, TLS) → server.py (127.0.0.1:8000) → SQLite on EBS
```

Estimated cost: ~$4–8/mo (t4g.micro + 20 GB gp3 + Elastic IP).

> The examples deploy the `main` branch. If you haven't merged the deployment
> changes into `main` yet, substitute your branch name (e.g. `1st-iteration`).

## Prerequisites

- AWS CLI configured (`aws configure`).
- An EC2 key pair in your target region:
  ```bash
  aws ec2 create-key-pair --region <region> --key-name cub-buddy-key \
    --query KeyMaterial --output text > ~/.ssh/cub-buddy-key.pem
  chmod 400 ~/.ssh/cub-buddy-key.pem
  ```

## 1. Launch the infrastructure

Pick whichever matches your IAM permissions.

### Option A — CloudFormation (one command)

Needs `cloudformation:*` and `ssm:GetParameter`.

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation.yaml \
  --stack-name cub-buddy \
  --parameter-overrides \
      KeyName=cub-buddy-key \
      SshLocation=$(curl -s https://checkip.amazonaws.com)/32 \
      Branch=main

aws cloudformation describe-stacks --stack-name cub-buddy \
  --query "Stacks[0].Outputs" --output table
```

### Option B — direct EC2 CLI (no CloudFormation needed)

How the live site was actually deployed (the account lacked CloudFormation/SSM
permissions). Needs only EC2 create permissions.

```bash
REGION=us-east-2
VPC=$(aws ec2 describe-vpcs --region $REGION --filters Name=isDefault,Values=true \
  --query "Vpcs[0].VpcId" --output text)
SUBNET=$(aws ec2 describe-subnets --region $REGION \
  --filters Name=vpc-id,Values=$VPC Name=default-for-az,Values=true \
  --query "Subnets[0].SubnetId" --output text)
AMI=$(aws ec2 describe-images --region $REGION --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-arm64" "Name=state,Values=available" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text)
MYIP=$(curl -s https://checkip.amazonaws.com)/32

# Security group: SSH from your IP, HTTP/HTTPS from anywhere
SG=$(aws ec2 create-security-group --region $REGION --vpc-id $VPC \
  --group-name cub-buddy-sg --description "CUB web 80/443 + ssh" \
  --query GroupId --output text)
aws ec2 authorize-security-group-ingress --region $REGION --group-id $SG --ip-permissions \
  "IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=$MYIP}]" \
  "IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}]" \
  "IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges=[{CidrIp=0.0.0.0/0}]"

# User-data clones the repo and provisions the host
cat > /tmp/cub-userdata.sh <<'EOF'
#!/bin/bash
set -euxo pipefail
dnf -y install git
git clone --depth 1 --branch main https://github.com/yjjrun/CUB.git /opt/cub
CUB_BRANCH=main bash /opt/cub/deploy/bootstrap.sh
EOF

IID=$(aws ec2 run-instances --region $REGION \
  --image-id $AMI --instance-type t4g.micro --key-name cub-buddy-key \
  --security-group-ids $SG --subnet-id $SUBNET \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20,"VolumeType":"gp3","DeleteOnTermination":false}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=cub-buddy}]' \
  --user-data file:///tmp/cub-userdata.sh \
  --query "Instances[0].InstanceId" --output text)
aws ec2 wait instance-running --region $REGION --instance-ids $IID

# Stable Elastic IP
ALLOC=$(aws ec2 allocate-address --region $REGION --domain vpc --query AllocationId --output text)
aws ec2 associate-address --region $REGION --instance-id $IID --allocation-id $ALLOC
aws ec2 describe-addresses --region $REGION --allocation-ids $ALLOC \
  --query "Addresses[0].PublicIp" --output text
```

Wait ~2–3 min for user-data to finish, then open `http://<ElasticIP>/`.

## 2. Register the domain

Any registrar works. **Route 53 registration requires a paid AWS plan** — Free Tier
accounts are blocked, and newly upgraded accounts can hit a manual verification hold.
The live site is registered with **Cloudflare** (~$10/yr flat, free DNS + WHOIS
privacy); GoDaddy / Namecheap are also fine.

## 3. Point DNS at the instance

Add two A records at your DNS provider pointing to the Elastic IP:

| Type | Name  | Value         |
|------|-------|---------------|
| A    | `@`   | `<ElasticIP>` |
| A    | `www` | `<ElasticIP>` |

**Cloudflare:** set both records to **DNS only** (grey cloud, not proxied) so Let's
Encrypt can validate against the origin. After the cert is issued you may switch to
proxied (orange, SSL mode "Full (strict)") for Cloudflare's CDN/WAF.

Confirm: `dig +short cub-buddy.com` returns the Elastic IP.

## 4. Enable HTTPS (Let's Encrypt)

SSH in, install certbot, issue the cert (certbot edits nginx to add the 443 block and
an HTTP→HTTPS redirect), and add a renewal timer:

```bash
ssh -i ~/.ssh/cub-buddy-key.pem ec2-user@<ElasticIP>

sudo dnf -y install python3-pip augeas-libs
sudo python3 -m pip install certbot certbot-nginx
sudo certbot --nginx -d cub-buddy.com -d www.cub-buddy.com \
  -m you@example.com --agree-tos --redirect -n

# Auto-renewal via systemd timer (Amazon Linux 2023 has no cron.d by default)
CB=$(command -v certbot)
sudo tee /etc/systemd/system/certbot-renew.service >/dev/null <<UNIT
[Unit]
Description=Certbot renewal
[Service]
Type=oneshot
ExecStart=$CB renew --quiet --deploy-hook "systemctl reload nginx"
UNIT
sudo tee /etc/systemd/system/certbot-renew.timer >/dev/null <<UNIT
[Unit]
Description=Run certbot renew daily
[Timer]
OnCalendar=*-*-* 03:00:00
RandomizedDelaySec=3600
Persistent=true
[Install]
WantedBy=timers.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable --now certbot-renew.timer
sudo certbot renew --dry-run
```

Visit **https://cub-buddy.com/** — done.

## Seed the demo dogs (optional)

The live DB starts empty. To show Mochi and Rocket on the match page, POST them to
the API (their photos ship in `assets/`):

```bash
curl -X POST https://cub-buddy.com/api/dogs -H "Content-Type: application/json" -d '{
  "name":"Mochi","shelter":"Sunny Paws Shelter","contactUrl":"https://example.com/mochi",
  "breed":"Labrador Retriever","ageYears":3,"sex":"Female","size":"Medium","color":"Golden",
  "imageUrl":"/assets/mochi.jpg","hdbApproved":true,"homeFit":"Most homes","exerciseNeed":"Moderate",
  "cbarqFactors":{"strangerAggression":0.3,"ownerAggression":0.1,"dogAggressionFear":0.4,"trainability":3.6,"chasing":1.0,"strangerFear":0.5,"nonsocialFear":0.5,"dogFear":0.5,"separation":0.7,"touchSensitivity":0.6,"excitability":1.7,"attachment":2.0,"energy":2.0}}'
```

(Or enter dogs through the partner intake at `/partner`, access code `CUBSHOP`.)

## Updating the app later

```bash
ssh -i ~/.ssh/cub-buddy-key.pem ec2-user@<ElasticIP>
sudo CUB_BRANCH=main bash /opt/cub/deploy/bootstrap.sh   # pull latest + restart
# or a quick code-only refresh:
sudo git -C /opt/cub pull && sudo systemctl restart cub
```

## Operations notes

- **Data persistence:** SQLite is at `/var/lib/cub/cub.sqlite` (outside the repo, so
  redeploys never overwrite it) on the EBS root volume (`DeleteOnTermination: false`).
  Back up: `sudo cp /var/lib/cub/cub.sqlite /var/lib/cub/cub.$(date +%F).bak`.
- **Logs:** `sudo journalctl -u cub -f` (app); `/var/log/nginx/` (proxy).
- **Security:** keep the SSH rule scoped to your IP; the app's only gate is the
  partner access code — fine for a prototype, not for real adopter data.
- **Tear down (direct-CLI deploy):**
  ```bash
  aws ec2 terminate-instances --region $REGION --instance-ids $IID
  aws ec2 release-address --region $REGION --allocation-id $ALLOC
  aws ec2 delete-security-group --region $REGION --group-id $SG
  ```
  CloudFormation deploys: `aws cloudformation delete-stack --stack-name cub-buddy`.

## Live deployment reference

| | |
|---|---|
| Region          | us-east-2 (Ohio)                              |
| Instance        | t4g.micro, Amazon Linux 2023 (arm64)          |
| Elastic IP      | 3.16.249.173                                  |
| Key pair        | cub-buddy-key (`~/.ssh/cub-buddy-key.pem`)     |
| DNS / registrar | Cloudflare (DNS-only A records)               |
| TLS             | Let's Encrypt, auto-renew via systemd timer   |
| Branch deployed | `main` (after PR #1 merges; live box currently runs `1st-iteration`) |
