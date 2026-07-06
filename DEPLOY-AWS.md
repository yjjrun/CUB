# Deploying CUB to AWS (EC2 + nginx)

CUB is a React (Vite) SPA with a Python JSON API. On one Amazon Linux 2023 EC2
instance, nginx serves the built frontend from `dist/` and proxies `/api/*` to
`server.py` (a systemd service); SQLite lives on the persistent EBS volume, behind a
stable Elastic IP and Let's Encrypt TLS. DNS is any provider (the live site uses
Cloudflare).

```
Browser → DNS → Elastic IP → EC2 → nginx (TLS)
                                     ├── /       → dist/ (React SPA)
                                     └── /api/*  → server.py → SQLite on EBS
```

Current production Elastic IP: `32.236.69.57`.

Cost ~$4–8/mo (t4g.micro + 20 GB gp3 + Elastic IP). Examples deploy `main`; swap in
your branch if not yet merged.

## Local development

Two processes — the Python API and the Vite dev server (hot reload):

```bash
npm install        # first time only
npm run api        # terminal 1: Python JSON API on http://127.0.0.1:8000
npm run dev        # terminal 2: Vite dev server on http://localhost:5173
```

Open **http://localhost:5173** — Vite proxies `/api/*` to the Python API and hot-reloads
edits. To preview a production build locally: `npm run build && npm run preview`.

## 1. Key pair

```bash
aws ec2 create-key-pair --region us-east-2 --key-name meetmycub-key \
  --query KeyMaterial --output text > ~/.ssh/meetmycub-key.pem
chmod 400 ~/.ssh/meetmycub-key.pem
```

## 2. Launch the instance

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

SG=$(aws ec2 create-security-group --region $REGION --vpc-id $VPC \
  --group-name meetmycub-sg --description "CUB web + ssh" --query GroupId --output text)
aws ec2 authorize-security-group-ingress --region $REGION --group-id $SG --ip-permissions \
  "IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=$MYIP}]" \
  "IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}]" \
  "IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges=[{CidrIp=0.0.0.0/0}]"

cat > /tmp/cub-userdata.sh <<'EOF'
#!/bin/bash
set -euxo pipefail
dnf -y install git
git clone --depth 1 --branch main https://github.com/yjjrun/CUB.git /opt/cub
CUB_BRANCH=main bash /opt/cub/deploy/bootstrap.sh
EOF

IID=$(aws ec2 run-instances --region $REGION \
  --image-id $AMI --instance-type t4g.micro --key-name meetmycub-key \
  --security-group-ids $SG --subnet-id $SUBNET \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20,"VolumeType":"gp3","DeleteOnTermination":false}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=meetmycub}]' \
  --user-data file:///tmp/cub-userdata.sh \
  --query "Instances[0].InstanceId" --output text)
aws ec2 wait instance-running --region $REGION --instance-ids $IID

ALLOC=$(aws ec2 allocate-address --region $REGION --domain vpc --query AllocationId --output text)
aws ec2 associate-address --region $REGION --instance-id $IID --allocation-id $ALLOC
aws ec2 describe-addresses --region $REGION --allocation-ids $ALLOC \
  --query "Addresses[0].PublicIp" --output text
```

Wait ~2–3 min, then open `http://<ElasticIP>/`. First boot also installs Node and runs
`npm ci && npm run build` (needs Node 18+; if the dnf `nodejs` is too old for Vite,
install `nodejs20` in `bootstrap.sh`).

## 3. DNS

Register the domain at any registrar (the live site uses GoDaddy; Route 53
registration needs a paid AWS plan). Add two records → the Elastic IP:

| Type | Name  | Value         |
|------|-------|---------------|
| A    | `@`   | `32.236.69.57` |
| CNAME | `www` | `@` |

Delete registrar parking records such as `76.223.105.230` and `13.248.243.5`.
Confirm with `dig +short meetmycub.com`; it should return `32.236.69.57`.

## 4. HTTPS

```bash
ssh -i ~/.ssh/meetmycub-key.pem ec2-user@meetmycub.com

sudo dnf -y install python3-pip augeas-libs
sudo python3 -m pip install certbot certbot-nginx
sudo certbot --nginx -d meetmycub.com -d www.meetmycub.com \
  -m you@example.com --agree-tos --redirect -n

# Auto-renewal (AL2023 has no cron.d) — systemd timer:
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
sudo systemctl daemon-reload && sudo systemctl enable --now certbot-renew.timer
```

Visit **https://meetmycub.com/**.

## Migrating the existing live box to the React build

A box provisioned before the React frontend serves everything from Python. Switch it
to the SPA build once (the bootstrap guard won't overwrite the certbot-managed nginx
site, so replace it explicitly and re-run certbot):

```bash
ssh -i ~/.ssh/meetmycub-key.pem ec2-user@meetmycub.com

# Pull latest + build; installs Node, produces dist/
sudo CUB_BRANCH=main bash /opt/cub/deploy/bootstrap.sh

# Swap nginx to the dist-serving config, re-add TLS, reload
sudo cp /opt/cub/deploy/nginx-cub.conf /etc/nginx/conf.d/cub.conf
sudo certbot --nginx -d meetmycub.com -d www.meetmycub.com --redirect -n
sudo nginx -t && sudo systemctl reload nginx
```

## Operations

- **SSH:** `ssh -i ~/.ssh/meetmycub-key.pem ec2-user@meetmycub.com` (resolves via
  DNS — no IP to track; if you later proxy DNS through Cloudflare, SSH to the Elastic
  IP from `aws ec2 describe-addresses` instead).
- **Update:** SSH in, then `sudo CUB_BRANCH=main bash /opt/cub/deploy/bootstrap.sh`
  (pulls latest + restarts).
- **Data:** SQLite at `/var/lib/cub/cub.sqlite` (outside the repo; survives redeploys).
  Back up with `sudo cp /var/lib/cub/cub.sqlite /var/lib/cub/cub.$(date +%F).bak`.
- **Create a partner account:** SSH in, then
  `cd /opt/cub && sudo -u cub python3 server.py add-partner --name "Shelter Name"`.
  This prints a one-time access code for that shelter to log in with at `/shelter`.
- **Logs:** `sudo journalctl -u cub -f`.
- **Tear down:** `aws ec2 terminate-instances --instance-ids $IID`,
  `aws ec2 release-address --allocation-id $ALLOC`,
  `aws ec2 delete-security-group --group-id $SG` (all `--region $REGION`).

## Live reference

us-east-2 · t4g.micro · key `meetmycub-key` · GoDaddy DNS · Let's Encrypt
(systemd auto-renew) · branch `main`.
Current Elastic IP: `32.236.69.57`.
