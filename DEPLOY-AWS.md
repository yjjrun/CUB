# Deploying CUB to AWS (EC2 + Route 53)

This hosts CUB on a single Amazon Linux 2023 EC2 instance: `server.py` runs as a
systemd service behind nginx, SQLite lives on the persistent EBS root volume, and
a stable Elastic IP fronts the box. All AWS, no third-party PaaS.

```
Browser → Route 53 (cub-buddy.com) → Elastic IP → EC2
            └ nginx (80/443, TLS) → server.py (127.0.0.1:8000) → SQLite on EBS
```

Estimated cost: ~$4–8/mo (t4g.micro/small + 20 GB gp3 + Elastic IP).

## Prerequisites

- AWS CLI configured (`aws configure`) with your account.
- An EC2 key pair in your target region (EC2 → Key Pairs → Create). Note its name.
- The branch is deployed from `main` by default — merge `1st-iteration` → `main`
  first, or pass `Branch=1st-iteration` in step 1.

## 1. Launch the infrastructure (CloudFormation)

From the repo root:

```bash
aws cloudformation deploy \
  --template-file aws/cloudformation.yaml \
  --stack-name cub-buddy \
  --parameter-overrides \
      KeyName=<your-key-pair-name> \
      SshLocation=$(curl -s https://checkip.amazonaws.com)/32 \
      Branch=main
```

`SshLocation` above locks SSH to your current IP. Then read the outputs:

```bash
aws cloudformation describe-stacks --stack-name cub-buddy \
  --query "Stacks[0].Outputs" --output table
```

Wait ~2–3 minutes for user-data to finish, then open `http://<PublicIp>/` — you
should see the CUB home page over plain HTTP.

## 2. Register the domain

Easiest within AWS: **Route 53 → Registered domains → Register** `cub-buddy.com`.
This auto-creates a hosted zone. (If you buy it at GoDaddy instead, create a Route 53
hosted zone for the domain and set GoDaddy's nameservers to the zone's NS records.)

## 3. Point DNS at the instance

In the Route 53 hosted zone for `cub-buddy.com`, create two **A** records pointing
at the `PublicIp` from step 1:

| Name              | Type | Value          |
|-------------------|------|----------------|
| cub-buddy.com     | A    | `<PublicIp>`   |
| www.cub-buddy.com | A    | `<PublicIp>`   |

CLI alternative:

```bash
ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name cub-buddy.com \
  --query "HostedZones[0].Id" --output text)
aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" \
  --change-batch '{"Changes":[
    {"Action":"UPSERT","ResourceRecordSet":{"Name":"cub-buddy.com","Type":"A","TTL":300,"ResourceRecords":[{"Value":"<PublicIp>"}]}},
    {"Action":"UPSERT","ResourceRecordSet":{"Name":"www.cub-buddy.com","Type":"A","TTL":300,"ResourceRecords":[{"Value":"<PublicIp>"}]}}
  ]}'
```

Wait for DNS to resolve: `dig +short cub-buddy.com` should return the Elastic IP.

## 4. Enable HTTPS (Let's Encrypt)

SSH in and run certbot — it edits the nginx config to add the 443 server block and
an HTTP→HTTPS redirect:

```bash
ssh -i <your-key>.pem ec2-user@<PublicIp>
sudo dnf -y install python3-pip augeas-libs
sudo python3 -m pip install certbot certbot-nginx
sudo certbot --nginx \
  -d cub-buddy.com -d www.cub-buddy.com \
  -m you@example.com --agree-tos --redirect -n
# Auto-renewal:
echo "0 3 * * * root certbot renew --quiet" | sudo tee /etc/cron.d/certbot-renew
```

Visit **https://cub-buddy.com/** — done.

## Updating the app later

SSH in and re-run the idempotent bootstrap (pulls latest code + restarts):

```bash
sudo CUB_BRANCH=main bash /opt/cub/deploy/bootstrap.sh
# or, for a quick code-only refresh:
sudo git -C /opt/cub pull && sudo systemctl restart cub
```

## Operations notes

- **Data persistence:** the SQLite DB is at `/var/lib/cub/cub.sqlite` (outside the
  repo, so redeploys never overwrite it) on the EBS root volume, which has
  `DeleteOnTermination: false`. Back it up with
  `sudo cp /var/lib/cub/cub.sqlite /var/lib/cub/cub.$(date +%F).bak`.
- **Empty on first boot:** the live DB starts empty by design (no seeded dogs). To
  show the demo dogs, add them via the partner intake (code `CUBSHOP`) or copy a
  seeded `cub.sqlite` into `/var/lib/cub/` and `sudo systemctl restart cub`.
- **Logs:** `sudo journalctl -u cub -f` (app) and `/var/log/nginx/` (proxy).
- **Security:** keep `SshLocation` scoped to your IP. The app has no auth beyond the
  partner access code — fine for a prototype, not for real adopter data.
- **Tear down:** `aws cloudformation delete-stack --stack-name cub-buddy` (the EIP
  and, because of DeleteOnTermination, the root volume may need manual cleanup).
