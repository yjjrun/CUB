#!/usr/bin/env bash
# Provision an Amazon Linux 2023 host to run CUB behind nginx.
# Idempotent: safe to re-run to pull the latest code and restart the service.
#
# Usage (on the instance, as root):
#   sudo CUB_BRANCH=main bash /opt/cub/deploy/bootstrap.sh
set -euo pipefail

REPO_URL="${CUB_REPO_URL:-https://github.com/yjjrun/CUB.git}"
BRANCH="${CUB_BRANCH:-main}"
APP_DIR="/opt/cub"
DATA_DIR="/var/lib/cub"   # outside the repo so redeploys never clobber the live DB

dnf -y install git python3 nginx

# Dedicated, unprivileged service account.
id cub &>/dev/null || useradd --system --home-dir "$APP_DIR" --shell /sbin/nologin cub

# Fetch or update the code.
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$APP_DIR" checkout -B "$BRANCH" "origin/$BRANCH"
else
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

# Persistent data directory for the SQLite database (lives on the EBS root volume).
install -d -o cub -g cub "$DATA_DIR"
chown -R cub:cub "$APP_DIR"

# systemd unit + nginx reverse proxy.
install -m 0644 "$APP_DIR/deploy/cub.service" /etc/systemd/system/cub.service
install -m 0644 "$APP_DIR/deploy/nginx-cub.conf" /etc/nginx/conf.d/cub.conf

# Let nginx reach the local app port when SELinux is enforcing.
command -v setsebool >/dev/null && setsebool -P httpd_can_network_connect 1 || true

systemctl daemon-reload
systemctl enable --now cub
nginx -t
systemctl enable --now nginx
systemctl reload nginx || systemctl restart nginx

echo "CUB bootstrap complete. App is live on http://<this-host>/"
echo "Next: point DNS at this host, then run certbot for HTTPS (see DEPLOY-AWS.md)."
