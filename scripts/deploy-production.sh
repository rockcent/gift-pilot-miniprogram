#!/usr/bin/env bash
# scripts/deploy-production.sh
# 礼有方小程序 H5 → aliyun-rockcent-prod (8.138.150.206) 部署脚本
#
# 流程：
#   1. 跑 preflight
#   2. npm run build:h5（如 dist/ 缺失或源码比 dist/index.html 新）
#   3. rsync dist/ + nginx conf → 远端 /tmp/giftpilot-h5-release/
#   4. ssh 远端：备份 → 替换 h5/dist/ → 写 nginx conf → nginx -t → reload
#
# 部署目标：/usr/share/nginx/giftpilot/h5/dist/
# 公网 URL：https://gift.rockcent.com/h5/
# Nginx conf：/etc/nginx/conf.d/gift.rockcent.com.conf（与网页端共享，含 /h5/ 子路径块）
#
# 用法：
#   bash scripts/deploy-production.sh                            # 真实部署
#   RSYNC_DRY_RUN=1 bash scripts/deploy-production.sh            # dry-run 只列变更
#   REMOTE_HOST=... REMOTE_KEY=... bash scripts/deploy-production.sh   # 自定义目标
#
# 前置：
#   - npm run build:h5 已生成 dist/
#   - SSH key ~/.ssh/id_ed25519_rockcent_root 可用
#   - 远端 nginx 已有 certbot 颁发的 gift.rockcent.com 证书
#     （首次部署前需手动：ssh aliyun 'sudo certbot certonly --webroot -w /var/www/certbot -d gift.rockcent.com'）
#   - 网页端已先部署（web 的 nginx conf 含 / 根路径 SPA fallback）
#   - ⚠️ 本脚本只覆盖 /h5/ 子路径 + nginx conf，不动 /usr/share/nginx/giftpilot/dist/

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE_HOST="${REMOTE_HOST:-8.138.150.206}"
REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_USER="${REMOTE_USER:-rockops}"
REMOTE_KEY="${REMOTE_KEY:-$HOME/.ssh/id_ed25519_rockcent_root}"
REMOTE_SITE_DIR="${REMOTE_SITE_DIR:-/usr/share/nginx/giftpilot}"
REMOTE_H5_DIR="${REMOTE_H5_DIR:-${REMOTE_SITE_DIR}/h5}"
REMOTE_TMP="${REMOTE_TMP:-/tmp/giftpilot-h5-release}"
REMOTE_NGINX_CONF_PATH="${REMOTE_NGINX_CONF_PATH:-/etc/nginx/conf.d/gift.rockcent.com.conf}"
RSYNC_DRY_RUN="${RSYNC_DRY_RUN:-0}"

SSH_ARGS=(-i "$REMOTE_KEY" -p "$REMOTE_PORT" -o StrictHostKeyChecking=no -o ServerAliveInterval=60)
SSH_TARGET="${REMOTE_USER}@${REMOTE_HOST}"

echo "=== gift-pilot-miniprogram (Taro H5) deploy ==="
echo "  remote:       $SSH_TARGET"
echo "  h5 site dir:  $REMOTE_H5_DIR"
echo "  nginx conf:   $REMOTE_NGINX_CONF_PATH"
echo "  dry-run:      $RSYNC_DRY_RUN"
echo ""

# 1. preflight
echo "[1/5] preflight ..."
bash "$ROOT_DIR/scripts/deploy-preflight.sh"

# 2. build
echo ""
echo "[2/5] build:h5 ..."
if [ ! -f "dist/index.html" ] || [ "src/app.tsx" -nt "dist/index.html" ] || [ "src/app.config.ts" -nt "dist/index.html" ] || [ "package.json" -nt "dist/index.html" ]; then
  echo "  → npm run build:h5"
  npm run build:h5
else
  echo "  → dist/index.html up-to-date, skip rebuild"
fi

# 3. 远端准备
echo ""
echo "[3/5] prepare remote ${SSH_TARGET}:${REMOTE_TMP} ..."
ssh "${SSH_ARGS[@]}" "$SSH_TARGET" "sudo mkdir -p '$REMOTE_TMP' '$REMOTE_H5_DIR' '$REMOTE_SITE_DIR/backups' && sudo chown -R \$USER:rockops '$REMOTE_TMP' '$REMOTE_H5_DIR'"

# 4. rsync dist/ + nginx 配置
echo ""
echo "[4/5] rsync ..."
rsync_args=(-az --delete --prune-empty-dirs)
if [ "$RSYNC_DRY_RUN" = "1" ]; then
  rsync_args+=(--dry-run --itemize-changes)
fi

# 4a. dist 静态文件（小程序 H5）
rsync "${rsync_args[@]}" \
  -e "ssh ${SSH_ARGS[*]}" \
  "$ROOT_DIR/dist/" "${SSH_TARGET}:${REMOTE_TMP}/dist/"

# 4b. nginx 配置（含 /h5/ 子路径块，与网页端共享同一 conf）
rsync "${rsync_args[@]}" \
  -e "ssh ${SSH_ARGS[*]}" \
  "$ROOT_DIR/nginx/gift.rockcent.com.conf" "${SSH_TARGET}:${REMOTE_TMP}/gift.rockcent.com.conf"

if [ "$RSYNC_DRY_RUN" = "1" ]; then
  echo ""
  echo "[5/5] dry-run complete — promotion skipped"
  echo "  re-run with RSYNC_DRY_RUN=0 to actually deploy"
  exit 0
fi

# 5. 远端 promote + nginx reload
echo ""
echo "[5/5] promote on remote ..."
ssh "${SSH_ARGS[@]}" "$SSH_TARGET" <<EOF
set -euo pipefail
TS="\$(date +%Y%m%d_%H%M%S)"

# 备份现网 h5
if [ -d "$REMOTE_H5_DIR/dist" ]; then
  sudo mkdir -p "$REMOTE_SITE_DIR/backups/h5-\$TS"
  sudo rsync -a --delete "$REMOTE_H5_DIR/dist/" "$REMOTE_SITE_DIR/backups/h5-\$TS/dist/"
fi

# 替换静态文件
sudo rm -rf "$REMOTE_H5_DIR/dist"
sudo mkdir -p "$REMOTE_H5_DIR/dist"
sudo rsync -a "$REMOTE_TMP/dist/" "$REMOTE_H5_DIR/dist/"
sudo chown -R root:root "$REMOTE_H5_DIR/dist"
sudo find "$REMOTE_H5_DIR/dist" -type d -exec chmod 2775 {} +
sudo find "$REMOTE_H5_DIR/dist" -type f -exec chmod 664 {} +

# 替换 nginx 配置（备份再覆盖）
if [ -f "$REMOTE_NGINX_CONF_PATH" ]; then
  sudo cp "$REMOTE_NGINX_CONF_PATH" "$REMOTE_NGINX_CONF_PATH.bak.\$TS"
fi
sudo install -o root -g root -m 0644 "$REMOTE_TMP/gift.rockcent.com.conf" "$REMOTE_NGINX_CONF_PATH"

# nginx 配置检查
if ! sudo nginx -t; then
  echo "[deploy-production] nginx -t FAILED — rolling back"
  if [ -f "$REMOTE_NGINX_CONF_PATH.bak.\$TS" ]; then
    sudo mv "$REMOTE_NGINX_CONF_PATH.bak.\$TS" "$REMOTE_NGINX_CONF_PATH"
  fi
  exit 1
fi

sudo systemctl reload nginx

echo "[deploy-production] OK — deployed at \$TS"
echo "  backup:   $REMOTE_SITE_DIR/backups/h5-\$TS"
echo "  domain:   https://gift.rockcent.com/h5/"
