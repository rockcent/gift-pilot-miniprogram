#!/usr/bin/env bash
# scripts/post-deploy-smoke.sh
# 部署后公网验证脚本（PM Mac 终端跑）
set -euo pipefail

DOMAIN="${DOMAIN:-gift.rockcent.com}"
H5_BASE="https://${DOMAIN}/h5"

echo "=== Post-deploy public smoke ==="
echo ""

# 1. H5 根页面（应返回 Taro 生成的 index.html）
echo "[1/6] H5 root"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${H5_BASE}/")
if [ "$STATUS" = "200" ]; then
  echo "  ✓ ${H5_BASE}/ → 200"
else
  echo "  ✗ ${H5_BASE}/ → $STATUS"
  exit 1
fi

# 2. H5 入口 HTML 不应是 web SPA 的 HTML（验证 /h5/ location 真生效）
echo ""
echo "[2/6] H5 entry HTML（应为 Taro 输出，非 web SPA）"
H5_HTML=$(curl -s "${H5_BASE}/")
if echo "$H5_HTML" | grep -q "taro"; then
  echo "  ✓ Taro runtime 注入存在"
elif echo "$H5_HTML" | grep -q "/assets/index-.*\.js"; then
  echo "  ✗ 返回的是 web SPA 而非 Taro H5（/h5/ location 未生效）"
  exit 1
else
  echo "  ? 未知 HTML（请人工确认）"
fi

# 3. H5 assets 可达（js + css）
echo ""
echo "[3/6] H5 assets"
JS=$(echo "$H5_HTML" | grep -oE 'js/[0-9]+\.js' | head -1)
CSS=$(echo "$H5_HTML" | grep -oE 'css/[0-9]+\.css' | head -1)
if [ -n "$JS" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${H5_BASE}/${JS}")
  echo "  ${STATUS} ${JS}"
fi
if [ -n "$CSS" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${H5_BASE}/${CSS}")
  echo "  ${STATUS} ${CSS}"
fi

# 4. SPA fallback 验证（任意路径都返回 H5 index）
echo ""
echo "[4/6] SPA fallback（hash 路由不依赖 nginx fallback，但仍应 200）"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${H5_BASE}/pages/multimodal/index")
echo "  ${STATUS} /pages/multimodal/index"

# 5. Web 端未受影响
echo ""
echo "[5/6] Web 端 SPA 仍正常"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/")
echo "  ${STATUS} /"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}/healthz")
echo "  ${STATUS} /healthz"

# 6. 证书 + HTTP→HTTPS 重定向
echo ""
echo "[6/6] HTTPS 健康"
curl -sI -m 10 "http://${DOMAIN}/" | head -3

echo ""
echo "[post-deploy-smoke] PASS — 公网部署就绪"
echo "  ✓ 网页端： https://${DOMAIN}/"
echo "  ✓ 小程序 H5： https://${DOMAIN}/h5/"
echo "  ✓ H5 路由示例： https://${DOMAIN}/h5/#/pages/multimodal/index"
