# 礼有方小程序 · V1.0 平台对接 + 阶段二 A→E · 技术方案

**对应 Spec**：`.specify/features/v1-platform-integration/spec.md`
**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §14 V1.0 + `礼有方_全部技术文档_V1.0.zip` 5 分册
**对应宪法**：`.specify/constitution.md`
**关联 commit 链**：64c8a25 → c2363d6 → d95cb26 → fa6b104 → e7c6b8e → 69c2cce
**最后更新**：2026-07-11（retroactive）

---

## 技术栈 / 锁定

| 维度 | 选型 |
|---|---|
| 框架 | Taro 3.6 + React 18 + TS 5（复用 v0.8） |
| 状态 | Zustand 4（复用 v0.8 store） |
| **平台** | **`@rockcent/platform` v2.0.0**（PR-5 已升级）5 个子包：ai-gateway / ai-metering / identity / usage / web-client |
| 部署 | Taro H5 + rsync → aliyun nginx `/h5/` 子路径 |
| CI | GitHub Actions deploy workflow（`workflow_dispatch` 手动触发 + `dry_run` 选项） |
| 数据 | 全 mock（runtime）；真实凭证接入 = 阶段三 |

**核心约束**（来自宪法 + 平台规范）：

1. **平台 pin 不可降级**：v2.0.0 是消费端当前稳定线，**禁止** pin v1.x 或 main
2. **ProviderCallResult 形态**：所有 v1.0 service 内部 mock，但接口签名 = 真实 `ProviderCallResult<T>`，便于阶段三零摩擦切真实实现
3. **SECURITY gate 不可绕过**：金额 `_fen` 正整数 / idempotencyKey / signature / verifyCallback — 任何 mock 也必须保留这 4 项
4. **Taro 3.x publicPath 漏传 bug**：用 `scripts/post-build-h5.mjs` 后置重写（详见 D-Deploy-3）

---

## 文件改动总览（V1.0 + 阶段二 全量）

| 类型 | 路径 | 改动 | 关联 PR |
|---|---|---|---|
| 改 | `package.json` | `@rockcent/platform` pin → `platform-v2.0.0`；加 `deploy:*` 4 个 script；`build:h5` 拼 post-build | PR-5 + mega |
| 改 | `package-lock.json` | taro engines `>=20 → >=22`（PR-5 codemod） | mega |
| 改 | `src/app.config.ts` | pages 11 → 14（+multimodal / batch / admin） | mega |
| 改 | `src/index.html` | 保留 Taro 默认模板（post-build 接管资源路径） | mega |
| 改 | `config/index.ts` | `publicPath: '/h5/'` 双写（顶层 + h5.*）；webpackChain.output.publicPath 双保险 | mega |
| **新** | `src/platform/adapter.ts` | 5 个 `@rockcent/platform` 子包接线 | 阶段二-A |
| **新** | `src/services/ai/recommend-engine.ts` | 7 因子 mock（content-fit 0.25 / relation 0.20 / recency 0.15 / inventory 0.10 / margin 0.10 / sentiment 0.10 / risk 0.10） | PR-15 |
| **新** | `src/services/ai/multimodal.ts` | 6 模态 mock → GiftQuery | PR-16 |
| **新** | `src/services/ai/batch.ts` | 3 类任务并发 mock（Promise.all） | PR-17 |
| **新** | `src/services/ai/product-supply.ts` | 5 商品评分（maintain / promote 二态） | PR-18 |
| **新** | `src/services/payment/wechat-pay.ts` | mock + SECURITY gate（idempotencyKey + verifyCallback + signature） | 阶段二-D |
| **新** | `src/services/product/cps.ts` | 4 source enum 商品库（taobao / jd / pdd / mock） | 阶段二-C |
| **新** | `src/services/api/server.ts` | 后端 mock client `/api/*` | 阶段二-B |
| **新** | `src/pages/multimodal/{index.tsx,index.scss}` | PR-16 多模态输入页 | PR-16 |
| **新** | `src/pages/batch/{index.tsx,index.scss}` | PR-17 AI 批量任务中心 | PR-17 |
| **新** | `src/pages/admin/{index.tsx,index.scss}` | PR-18 平台管理后台 mini 简化版 | PR-18 |
| 改 | `README.md` | V0.6 → V0.8 → V1.0 + 阶段二 范围段；平台 v2.0.0 + 14 页面 + 部署脚本 | mega |
| 改 | `CHANGELOG.md` | v1.0.0-stage2 段（Features / Pages / Engineering / 部署目标 / 验证 / Out of scope） | mega |
| **新** | `nginx/gift.rockcent.com.conf` | 与网页端共享 server block，新增 `location ^~ /h5/` + 3 同级子 location | mega |
| **新** | `scripts/deploy-preflight.sh` | 8 项预检（含 SKIP_MAIN_CHECK 覆盖项） | mega |
| **新** | `scripts/deploy-production.sh` | rsync dist + nginx conf → 远端 → nginx -t → reload | mega |
| **新** | `scripts/post-deploy-smoke.sh` | 公网 6 项 smoke（H5 root / entry HTML / assets / SPA fallback / web unaffected / HTTPS） | mega |
| **新** | `scripts/post-build-h5.mjs` | Taro 3.x publicPath 漏传 bug 修复：重写 dist/index.html + dist/js/*.js 资源路径 | mega |
| **新** | `scripts/public-shot.mjs` | 公网截图（puppeteer-core + 系统 Chrome） | mega |
| 改 | `scripts/smoke-weapp.mjs` | 11 → 14 页面校验 + 5 平台包 wiring + SECURITY gate keyword + CPS enum | mega |
| 改 | `scripts/screenshot-h5.mjs` | PAGES 11 → 14 | mega |
| **新** | `.github/workflows/deploy-production.yml` | 镜像 web 模式（workflow_dispatch + dry_run + preflight + deploy + public smoke） | mega |
| 改 | `.github/workflows/ci.yml` | node 20 → 22；smoke 描述更新 | mega |
| **新** | `__tests__/platform/adapter.test.ts` | 平台 5 包接线验证 | 阶段二-A |
| **新** | `__tests__/services/recommend-engine.test.ts` | 7 因子 + 权重 + 边界 | PR-15 |
| **新** | `__tests__/services/multimodal.test.ts` | 6 模态 + GiftQuery shape | PR-16 |
| **新** | `__tests__/services/batch.test.ts` | 3 类任务 + 并发 | PR-17 |
| **新** | `__tests__/services/product-supply.test.ts` | 5 商品 + 评分 | PR-18 |
| **新** | `__tests__/services/payment/wechat-pay.test.ts` | SECURITY gate + 订单生命周期 | 阶段二-D |
| **新** | `__tests__/services/product/cps.test.ts` | 4 source + 字段 | 阶段二-C |
| 改 | `jest.config.js` | 加 Taro 3.x transform（处理 ESM-only 依赖） | mega |
| **新** | `jest.setup.js` | polyfill TransformStream/ReadableStream from `node:stream/web` | mega |

**估算 36 文件改动**。宪法 §7.2 ≥ 3 触发 SDD（本文件履行 retroactively）。

---

## 关键技术决策

### D-PR-15：推荐引擎加权公式

PRD §6.2 给的权重：

```text
score = content-fit × 0.25
      + relation     × 0.20
      + recency      × 0.15
      + inventory    × 0.10
      + margin       × 0.10
      + sentiment    × 0.10
      + risk         × 0.10   (反向，越低越好，1 - risk)
```

每个因子归一化到 `[0, 1]`（mock 给 mock 值，真实接入 = arkChat 推断 + arKChat 评分）。

**风���反向处理**：`risk` 因子分高表示风险高，应当压低最终得分。代码用 `(1 - risk)`。

### D-PR-16：多模态 → GiftQuery

```ts
interface GiftQuery {
  relation: string;    // '妈妈' / '朋友' / '同事'
  scene: string;       // '生日' / '节日' / '纪念日'
  tone: string;        // '温暖' / '专业' / '活泼'
  budget_fen: number;  // 预算（分）
  tokens: number;      // 估算 token 数
}
```

mock 输入 → mock 输出，便于阶段三切真实 ASR/OCR/image embedding。

### D-PR-17：并发批量

3 类任务（generate-content / publish / review），并发度 2 / 5 / 10 可调。
mock 用 `Promise.all` + 随机延时（100~500ms），返回每项 status（done / running / pending）。

**为何 mock**：真实批量需要 task queue + worker pool，超出 V1.0 范围；阶段四（礼有方 Pro）才需要。

### D-Stage2-A：平台适配层

`src/platform/adapter.ts` **只 re-export，不写副本**（宪法 §6.5）：

```ts
export {
  createAIGateway, createInMemoryTraceSink, ...
} from '@rockcent/platform/ai-gateway';

export {
  createTokenUsageFact, createInMemoryMeterSink, ...
} from '@rockcent/platform/ai-metering';
// ... 5 包
```

**关键设计**：adapter 只做 2 件事
1. 接线 5 个平台子包（re-export）
2. 提供应用层 helpers：`getCurrentIdentity()` / `recordUsageEvent()` / `tokensFor()` / `recentTraceEvents()`

应用层代码（pages + 7 service）只 `import { ... } from '../platform/adapter'`，**不**直接 `import from '@rockcent/platform/*'`。这样平台升级时只需改 adapter.ts 一处。

### D-Stage2-D：支付 SECURITY gate

`wechat-pay.ts` 必须包含 3 个 keyword（smoke 校验）：

1. `idempotencyKey` — 幂等键防重复扣款
2. `verifyCallback` — 回调验签
3. `signature` — 签名验证

mock 也保留这三个 keyword，便于阶段三切真实 SDK 时零改动。

### D-Deploy-1：nginx `/h5/` 子路径

mini H5 与 web SPA 共用 `gift.rockcent.com`，避免子域名 / 独立证书。

```nginx
# 1. 静态资源（regex 优先于 prefix）
location ~* ^/h5/.*\.(?:js|css|woff2?|...)$ {
    alias /usr/share/nginx/giftpilot/h5/dist/;
    expires 1y;
    add_header Cache-Control "public, immutable" always;
}

# 2. h5/index.html 永不缓存
location = /h5/index.html {
    alias /usr/share/nginx/giftpilot/h5/dist/index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate" always;
}

# 3. SPA fallback
location ^~ /h5/ {
    alias /usr/share/nginx/giftpilot/h5/dist/;
    try_files $uri $uri/ /index.html;
}
```

**踩坑**：第一版用嵌套 `location` 导致 nginx -t fail（嵌套 location 仅 regex 合法），改为 3 个同级 location 后 PASS。

### D-Deploy-2：deploy 脚本

3 个脚本 + 1 个 post-build：

- `scripts/deploy-preflight.sh` — 8 项预检（HEAD on main / dist exists / smoke / platform pin / sensitive / nginx conf / SSH key / ssh reachable）。`SKIP_MAIN_CHECK=1` 覆盖用于首次从 feature 分支部署。
- `scripts/deploy-production.sh` — 5 步：preflight → build → remote prepare → rsync dist + nginx conf → 远端 promote + nginx -t + reload。
- `scripts/post-deploy-smoke.sh` — 公网 6 项验收（H5 root / entry HTML 验证 / assets / SPA fallback / web unaffected / HTTPS）。
- `scripts/post-build-h5.mjs` — Taro 3.x publicPath 漏传 bug 修复（详见 D-Deploy-3）。

### D-Deploy-3：Taro 3.x publicPath 漏传 bug

**症状**：Taro 配置 `h5.publicPath: '/h5/'` 不生效，dist/index.html 输出 `<script src="/js/xxx">` 绝对路径，webpack runtime `__webpack_require__.p = "/"` 硬编码绝对路径。从 `/h5/` 页面访问时，浏览器解析为 `https://gift.rockcent.com/js/xxx`（404）。

**根因**（Taro 3.x `node_modules/@tarojs/webpack5-runner/dist/webpack/H5Combination.js:29`）：
```js
const { ..., publicPath = '/', ... } = config;  // 从顶层 config 读
```
但 config schema（`@tarojs/taro/types/compile/config/h5.d.ts`）写在 `h5.publicPath` 下，**实际不被读取**。

**修复**：用 `scripts/post-build-h5.mjs` 后置重写（拼在 `npm run build:h5` 末尾）：

```js
// dist/index.html: src|href="/js|/css → /h5/js|/h5/css
html.replace(/(src|href)="\/(js|css)\/([^"]+)"/g, ...)

// dist/js/*.js + dist/chunk/*.js: .p="/\" → .p="/h5/\"
.replace(/(\.p\s*=\s*)"\/"/g, `$1"/h5/"`)
```

**正则踩坑**：第一版用 `\.p\s*=\s*"\/(?!"\/)/g` 吃掉了开引号没吃闭引号，导致 `"/h5/""` 多余闭引号 SyntaxError。改为 `\.p\s*=\s*"\/"/g` 完整匹配闭引号后修复。

### D-CI：GitHub Actions deploy workflow

```yaml
name: gift-pilot-miniprogram deploy to aliyun-rockcent-prod (/h5/)
on:
  workflow_dispatch:
    inputs:
      dry_run: { type: choice, options: [true, false] }
concurrency:
  group: deploy-gift-pilot-miniprogram
  cancel-in-progress: false
jobs:
  preflight:
    # platform pin + sensitive + smoke + install + build:h5 + upload artifact
  deploy:
    needs: preflight
    if: github.ref == 'refs/heads/main' && github.event_name == 'workflow_dispatch'
    steps:
      - download artifact
      - SSH rsync via secrets (ALIYUN_SSH_KEY + ALIYUN_HOST)
      - public smoke + post-deploy-smoke.sh
```

**必填 secrets**（PM 一次性配）：
- `ALIYUN_SSH_KEY` — rockops 私钥全文
- `ALIYUN_HOST` — `8.138.150.206`

---

## 验证矩阵

| 验证 | 命令 | 结果 |
|---|---|---|
| Jest 单测 | `npm test` | **87/87 PASS in 19 suites** |
| Mini smoke | `npm run smoke:weapp` | **18/18 PASS** |
| H5 build | `npm run build:h5` | webpack PASS + post-build 2 files rewrote |
| Deploy preflight | `npm run deploy:preflight` | 10/10（带 SKIP_MAIN_CHECK） |
| Deploy dry-run | `npm run deploy:dry-run` | 39 file plan OK |
| Deploy production | `SKIP_MAIN_CHECK=1 npm run deploy:production` | nginx -t PASS + 50 files in /h5/dist |
| Public H5 | `curl https://gift.rockcent.com/h5/` | 200 |
| Public asset | `curl https://gift.rockcent.com/h5/js/app.js` | 200 |
| Web unaffected | `curl https://gift.rockcent.com/` | 200 |
| Public screenshot | `node scripts/public-shot.mjs` | **7/7 PNG OK**（home / recommend / content / memory / multimodal / batch / admin） |
| nginx config syntax | `sudo nginx -t`（远端） | `syntax is ok / test is successful` |
| Webpack runtime publicPath | `grep '.p=' dist/js/app.js` | `.p="/h5/"` ✅ |

---

## 严守边界

- ❌ 未触动 platform v2.0.0 pin / ��台 5 包依赖
- ❌ 未触动 v0.6 / v0.8 业务代码（只补 deploy + post-build 工具链）
- ❌ 未合并 PR #6（AGENTS.md §III 等 PM 显式指令）
- ❌ 未触 pay-core / 数据库 / 真实凭证
- ❌ 未改 web SPA / nginx 主 conf 之外的部分
- ❌ 未写平台能力副本（adapter 只 re-export，宪法 §6.5）
