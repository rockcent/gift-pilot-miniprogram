#!/usr/bin/env bash
# scripts/deploy-preflight.sh
# 礼有方小程序 H5 部署预检（不部署，只检查）
# 通过后才允许跑 deploy-production.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

errs=()
oks=()
ok()  { oks+=("$1"); }
bad() { errs+=("$1"); }

echo "=== Pre-flight: gift-pilot-miniprogram (Taro H5) deploy ==="

# 1. 工作树状态（必须 main 分支）
HEAD_BRANCH=$(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD)
if [ "$HEAD_BRANCH" != "main" ]; then
  bad "HEAD on '$HEAD_BRANCH' (expected main)"
else
  ok "HEAD on main"
fi

# 2. 工作树可干净
if git -C "$ROOT_DIR" diff --check HEAD >/dev/null 2>&1; then
  ok "git diff --check HEAD clean"
else
  bad "git diff --check HEAD has whitespace/conflict markers"
fi

# 3. dist/ 已 build
if [ ! -f "dist/index.html" ]; then
  bad "dist/index.html missing — run \`npm run build:h5\` first"
else
  ok "dist/index.html exists (Taro H5 build)"
fi

# 4. smoke-weapp 必须过
if node ./scripts/smoke-weapp.mjs >/dev/null 2>&1; then
  ok "smoke-weapp passed (18 checks: platform pin + 14 pages + 7 services + SECURITY gate)"
else
  bad "smoke-weapp failed — run \`npm run smoke:weapp\` to see why"
fi

# 5. 平台 pin 正确
if node ./scripts/check-platform-deps-local.mjs >/dev/null 2>&1; then
  ok "platform pin valid (git+https only, no github:/ssh:/file:)"
else
  bad "platform pin invalid — run \`npm run check:platform-deps\`"
fi

# 6. 敏感扫描
if node ./scripts/check-no-sensitive.mjs >/dev/null 2>&1; then
  ok "no sensitive files tracked"
else
  bad "sensitive files detected — run \`npm run check:no-sensitive\`"
fi

# 7. nginx 配置结构存在（含 /h5/ 子路径）
if [ ! -f "nginx/gift.rockcent.com.conf" ]; then
  bad "nginx/gift.rockcent.com.conf missing"
else
  if grep -q "location \^~ /h5/" nginx/gift.rockcent.com.conf; then
    ok "nginx config present with /h5/ subpath"
  else
    bad "nginx/gift.rockcent.com.conf missing /h5/ location block"
  fi
fi

# 8. SSH key 可读
KEY="${REMOTE_KEY:-$HOME/.ssh/id_ed25519_rockcent_root}"
if [ -f "$KEY" ]; then
  ok "SSH key $KEY exists"
else
  bad "SSH key $KEY missing"
fi

# 9. 远端 host 可达（best-effort）
HOST="${REMOTE_HOST:-8.138.150.206}"
if nc -z -w 3 "$HOST" 22 2>/dev/null; then
  ok "ssh reachable at $HOST:22"
else
  oks+=("(skipped) ssh unreachable at $HOST:22 — sandbox or VPN, run from PM Mac terminal")
fi

# 汇总
echo ""
echo "--- Pre-flight summary ---"
if [ "${#oks[@]}" -gt 0 ]; then
  for o in "${oks[@]}"; do echo "  ✓ $o"; done
fi
if [ "${#errs[@]}" -gt 0 ]; then
  for e in "${errs[@]}"; do echo "  ✗ $e"; done
fi
echo ""

if [ "${#errs[@]}" -gt 0 ]; then
  echo "[preflight] FAIL — fix ${#errs[@]} issue(s) before deploy"
  exit 1
fi
echo "[preflight] OK — ready for deploy"
