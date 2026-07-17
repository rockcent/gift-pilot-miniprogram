# V1.0 平台对接 + 阶段二 A→E · 执行稿（retroactive 追溯）

**Spec**：`.specify/features/v1-platform-integration/spec.md`
**Plan**：`.specify/features/v1-platform-integration/plan.md`
**PR 范围**：[#6](https://github.com/rockcent/gift-pilot-miniprogram/pull/6) `feat(miniprogram): V1.0 + 阶段二 mega-PR`
**commit 链**：64c8a25 → c2363d6 → d95cb26 → fa6b104 → e7c6b8e → 69c2cce（6 commit 已 push）
**最后更新**：2026-07-11

---

## 阶段 A：前置（V1.0 启动条件）

- [x] **T-A1** 平台 v1.20.0 tag 存在（rockcent-platform `7574f41`）
- [x] **T-A2** 平台升级 PR-5 已 merged（`909b550` chore: upgrade @rockcent/platform v1.15.2 → v1.20.0）
- [x] **T-A3** `.specify/features/v1-platform-integration/` 目录已建（retroactive）

## 阶段 B：阶段二-A 平台适配层（7 包接线）

- [x] **T-B1** `src/platform/adapter.ts` re-export 5 个平台子包
  - `@rockcent/platform/ai-gateway` (createAIGateway + AiTraceEvent + createInMemoryTraceSink)
  - `@rockcent/platform/ai-metering` (createTokenUsageFact + createInMemoryMeterSink + recordAIUsage + calculateTokenCost)
  - `@rockcent/platform/identity` (USER_STATUS + ORGANIZATION_STATUS + types)
  - `@rockcent/platform/usage` (USAGE_METRICS + UsageMetric + UsageEventInput)
  - `@rockcent/platform/web-client` (createStorage + safeJsonParse + getClientDeviceId + getClientDeviceLabel)
- [x] **T-B2** adapter 暴露 helpers：`getCurrentIdentity()` / `recordUsageEvent()` / `tokensFor()` / `recentMeterEvents()` / `recentTraceEvents()` / `getRecentUsageEvents()`
- [x] **T-B3** 单测：`__tests__/platform/adapter.test.ts`

## 阶段 C：V1.0 PR-15 推荐引擎

- [x] **T-C1** `src/services/ai/recommend-engine.ts` 7 因子 + 权重（content-fit 0.25 / relation 0.20 / recency 0.15 / inventory 0.10 / margin 0.10 / sentiment 0.10 / risk 0.10）
- [x] **T-C2** `pages/recommend/index` 接入 recommend-engine（原有页面改造）
- [x] **T-C3** 单测：`__tests__/services/recommend-engine.test.ts`

## 阶段 D：V1.0 PR-16 多模态

- [x] **T-D1** `src/services/ai/multimodal.ts` 6 模态（text / voice / screenshot / chat / link / image）→ GiftQuery
- [x] **T-D2** `src/pages/multimodal/index.{tsx,scss}` UI（6 chip + 文字内容输入 + AI 识别按钮 + 结果展示）
- [x] **T-D3** `recordUsageEvent` 接入
- [x] **T-D4** 单测：`__tests__/services/multimodal.test.ts`

## 阶段 E：V1.0 PR-17 批量任务

- [x] **T-E1** `src/services/ai/batch.ts` 3 类任务（generate-content / publish / review）+ 并发度可调
- [x] **T-E2** `src/pages/batch/index.{tsx,scss}` UI（任务类型 chip + 并发度选择 + 启动按钮 + 实时状态）
- [x] **T-E3** 单测：`__tests__/services/batch.test.ts`

## 阶段 F：V1.0 PR-18 管理后台

- [x] **T-F1** `src/services/ai/product-supply.ts` 5 商品评分 + maintain/promote 二态
- [x] **T-F2** `src/pages/admin/index.{tsx,scss}` UI（身份区 + 供给策略 + CPS + 微信支付 + usage 监控）
- [x] **T-F3** 单测：`__tests__/services/product-supply.test.ts`

## 阶段 G：阶段二-B 7 service 形态统一

- [x] **T-G1** 7 service 全部 `ProviderCallResult<T>` 形态：
  - recommend-engine / multimodal / batch / product-supply
  - wechat-pay / cps / api-server
- [x] **T-G2** `services/api/server.ts` 后端 mock client `/api/*`

## 阶段 H：阶段二-C CPS 商品库

- [x] **T-H1** `src/services/product/cps.ts` 4 source enum（taobao / jd / pdd / mock）+ 字段（id / title / priceFen / commissionFen / stock / riskLevel）
- [x] **T-H2** 单测：`__tests__/services/product/cps.test.ts`

## 阶段 I：阶段二-D 支付 SECURITY gate

- [x] **T-I1** `src/services/payment/wechat-pay.ts` 含 `idempotencyKey` + `verifyCallback` + `signature`
- [x] **T-I2** 订单生命周期：CREATED → PENDING → PAID → CLOSED
- [x] **T-I3** 单测：`__tests__/services/payment/wechat-pay.test.ts`

## 阶段 J：阶段二-E 平台 pin v1.20.0

- [x] **T-J1** `package.json` `@rockcent/platform` → `git+https://...#platform-v1.20.0`
- [x] **T-J2** 依赖 Node 22 floor（PR-5 codemod；后续 lockfile 同步 `>=22`）
- [x] **T-J3** consumer PR 引用平台 commit + used modules + validation commands（PR-5 + PR-6 都做到）

## 阶段 K：app.config + config + jest 配置

- [x] **T-K1** `src/app.config.ts` pages 11 → 14（+multimodal / batch / admin）
- [x] **T-K2** `config/index.ts` `publicPath: '/h5/'` 双写（顶层 + h5.*）+ webpackChain 双保险
- [x] **T-K3** `jest.config.js` 加 Taro 3.x transform + transformIgnorePatterns
- [x] **T-K4** `jest.setup.js` polyfill TransformStream/ReadableStream from `node:stream/web`

## 阶段 L：部署工具链

- [x] **T-L1** `nginx/gift.rockcent.com.conf` 与网页端共享 server block + 3 个同级 `location` 处理 `/h5/`
- [x] **T-L2** `scripts/deploy-preflight.sh` 8 项预检 + `SKIP_MAIN_CHECK=1` 覆盖
- [x] **T-L3** `scripts/deploy-production.sh` 5 步（preflight → build → prepare → rsync → promote）
- [x] **T-L4** `scripts/post-deploy-smoke.sh` 公网 6 项验收
- [x] **T-L5** `scripts/post-build-h5.mjs` Taro 3.x publicPath 漏传 bug 修复（dist/index.html + dist/js/*.js 重写）
- [x] **T-L6** `scripts/public-shot.mjs` 公网 puppeteer 截图

## 阶段 M：CI workflow

- [x] **T-M1** `.github/workflows/deploy-production.yml` 镜像 web 模式（workflow_dispatch + dry_run + preflight + deploy + public smoke）
- [x] **T-M2** `.github/workflows/ci.yml` node 20 → 22 + smoke 描述更新

## 阶段 N：smoke + 文档 + 截图

- [x] **T-N1** `scripts/smoke-weapp.mjs` 升级 11 → 14 页面校验 + 5 平台包 wiring + SECURITY gate keyword + CPS enum
- [x] **T-N2** `scripts/screenshot-h5.mjs` PAGES 11 → 14
- [x] **T-N3** `README.md` V0.6 → V0.8 → V1.0 + 阶段二 范围段 + 平台 v1.20.0 + 14 页面 + 部署脚本
- [x] **T-N4** `CHANGELOG.md` v1.0.0-stage2 段（Features / Pages / Engineering / 部署目标 / 验证 / Out of scope）
- [x] **T-N5** `cloud-server-ops/CURRENT_WORK.md` 顶部插入本轮接手行（CI_RELEASE_STANDARD §post-deploy mandate）

## 阶段 O：真实部署 + 公网验证

- [x] **T-O1** SSH 可达验证（`nc -z -w 3 8.138.150.206 22`）
- [x] **T-O2** 部署 3 次（最后 1 次 PASS，前 2 次 nginx -t fail + SyntaxError 自动回滚，备份完整）
- [x] **T-O3** 远端 `/usr/share/nginx/giftpilot/h5/dist/` 50 文件就位
- [x] **T-O4** 远端 nginx 备份 `h5-20260708_003817` / `h5-20260708_004215` / `h5-20260708_004546`（最后一份为当前）
- [x] **T-O5** 公网 `https://gift.rockcent.com/h5/` 7/7 截图渲染 PASS

## 阶段 P：待 PM 拍板（不自动）

- [ ] **T-P1** PM merge PR #6（https://github.com/rockcent/gift-pilot-miniprogram/pull/6）
- [ ] **T-P2** PM 在仓库 Settings → Secrets 配 `ALIYUN_SSH_KEY` + `ALIYUN_HOST`
- [ ] **T-P3** PM 提供阶段三凭证（Ark API key / 微信支付证书 / CPS 凭证 / 云开发账号）

---

## 关联提交

| commit | 主题 |
|---|---|
| `64c8a25` | feat(miniprogram): V1.0 + 阶段二 mega (platform adapter + 7 services + 3 pages + tests + smoke + deploy) |
| `c2363d6` | feat(deploy): add post-deploy public smoke script |
| `d95cb26` | fix(h5/deploy): add /h5/ subpath asset + runtime rewrite (Taro 3.x publicPath bug) |
| `fa6b104` | (后续修复 rebase) |
| `e7c6b8e` | chore(miniprogram): 同步 lockfile taro engines.node ≥20→≥22 |
| `69c2cce` | ci(miniprogram): add deploy-production.yml + upgrade ci.yml to Node 22 + V1.0 (14 pages) |
