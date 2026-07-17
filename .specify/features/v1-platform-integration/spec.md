# 礼有方小程序 · V1.0 平台对接 + 阶段二 A→E（路线图 Spec）

**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §14 "V1.0 路线图" + `礼有方_全部技术文档_V1.0.zip` 内 5 个分册
**范围**：V0.8（PR-1~4）之后到阶段三（真实后端接入）之间的全部增量
**最后更新**：2026-07-11（retroactive doc, code 已 shipped via PR #6）
**关联 PR**：[#6 feat(miniprogram): V1.0 + 阶段二 mega-PR](https://github.com/rockcent/gift-pilot-miniprogram/pull/6)
**关联 commit 链**：64c8a25 → c2363d6 → d95cb26 → fa6b104 → e7c6b8e → 69c2cce

---

## Feature Summary

把礼有方小程序从「v0.8 单机 mock + 1 人 demo」升级为 **「v1.0 平台对齐 + 真实凭证待接入」**：

```
[v0.8]
  mock LLM · mock 商品 · mock 支付 · 平台包 v1.15.2
   ↓
[v1.0 + 阶段二]
  平台适配层接通 5 个 @rockcent/platform 包
  6 新 service 形态 = 真实 ProviderCallResult<T>（零摩擦切真实 LLM/支付/商品）
  3 新页面（多模态 / 批量 / 管理后台）
  阿里云 /h5/ 子路径部署 + CI workflow
  SECURITY gate 已就位（idempotencyKey + verifyCallback + signature）
   ↓
[阶段三：待 PM 提供凭证]
  真实 Ark API key → 替换 recommend-engine mock
  真实微信支付证书 → 替换 wechat-pay mock
  真实 CPS 凭证 → 替换 cps mock
  真实云开发账号 → 替换 server mock
```

**关键不变量**：所有 v1.0 新增 service 严格遵守宪法 §6.5「禁止直接复制平台能力」——先查 `/Volumes/Rock2/rockcent-platform/packages`，已存在的（ai-gateway / ai-metering / identity / usage / web-client）一律从平台导入，本地不写副本。

---

## 范围（V1.0 PR-15~18 + 阶段二 A→E，6 大块）

| # | 块 | 涉及文件 | 涉及 store / adapter | 涉及 service | 等级 |
|---|---|---|---|---|---|
| **PR-15** | AI 推荐引擎 7 因子 | 新 `pages/recommend/` 改造 | `ai-store.recommendation` | `services/ai/recommend-engine.ts` | P0 |
| **PR-16** | 多模态输入 6 模态 | 新 `pages/multimodal/` | — | `services/ai/multimodal.ts` | P0 |
| **PR-17** | AI 批量任务中心 | 新 `pages/batch/` | — | `services/ai/batch.ts` | P1 |
| **PR-18** | 平台管理后台 mini 版 | 新 `pages/admin/` | — | `services/ai/product-supply.ts` | P1 |
| **阶段二-A** | 平台适配层 5 包接线 | 新 `src/platform/adapter.ts` | — | — | P0 |
| **阶段二-B** | 7 新 service 形态 = ProviderCallResult | 7 个 service 文件 | — | recommend-engine / multimodal / batch / product-supply / wechat-pay / cps / api-server | P0 |
| **阶段二-C** | CPS 商品库 mock | 新 `services/product/cps.ts` | — | source enum: taobao/jd/pdd/mock | P1 |
| **阶段二-D** | 支付 SECURITY gate | 新 `services/payment/wechat-pay.ts` | — | idempotencyKey + verifyCallback + signature | P0 |
| **阶段二-E** | 平台 pin 升 v1.20.0 | `package.json` 改 pin | — | — | P0 |

**等级定义**：
- P0 = 平台对接必要项，缺则阶段三无法启动
- P1 = 体验增量，可延后到 V1.1

---

## User Flows

### Flow 1：多模态输入 → 结构化 GiftQuery（PR-16）

1. 用户在 `pages/multimodal/index` 选择 6 种输入模式之一（文字 / 语音 / 商品截图 / 聊天截图 / 商品链接 / 商品图片）；
2. 切换模式时 toast 提示；
3. 用户输入内容 → 点击「🔍 AI 识别」；
4. mock service 解析为 `GiftQuery { relation, scene, tone, budget_fen, tokens }`；
5. `recordUsageEvent({ metric: 'AI_REQUEST_COUNT', quantity: 1 })`；
6. 渲染结构化结果 + tokens 数。

### Flow 2：批量任务调度（PR-17）

1. 用户在 `pages/batch/index` 选择任务类型（批量生成 / 批量发布 / 批量复盘）；
2. 调整并发度（2 / 5 / 10）；
3. 点击「🚀 启动批量任务（10 任务）」；
4. `recordUsageEvent` + 模拟并发执行（mock Promise.all）；
5. 实时显示任务列表（done / running / pending）；
6. 完成后 toast 总耗时。

### Flow 3：管理后台（PR-18）

1. 用户进入 `pages/admin/index`（mini 端简化版，非 §6.8 完整后台）；
2. 显示当前身份（user / org / role / device）；
3. 显示 5 个 mock 商品供给评分（gft_001~005，按综合分排序，状态 maintain / promote）；
4. 显示 5 个 CPS 商品（mock source，价格 + 佣金 + 库存 + 风险等级）；
5. 显示微信支付订单（空状态："暂无订单（先在小程序下单）"）；
6. 显示阶段二 usage / trace 实时计数。

### Flow 4：阶段三凭证接入（占位 Flow，实际未实现）

1. PM 提供真实凭证（Ark key / 微信支付证书 / CPS 凭证 / 云开发账号）；
2. 平台适配层 `src/platform/adapter.ts` 切换 sink / provider；
3. 7 个 service 内部仍是 ProviderCallResult 形态，无需改 caller；
4. 真实数据流：arkChat() → tokens → cost → meter sink → usage 监控；
5. SECURITY gate 仍生效（金额正整数 / 幂等键 / 签名）。

---

## Acceptance Criteria

### 宪法级（不变量）

- [x] §6.1 平台 pin 形式 `git+https://...#platform-v1.20.0`（PR-5 `909b550`）
- [x] §6.4 平台依赖 lockfile 严格 git+https（无 github: / git+ssh: / file:）
- [x] §6.5 不复制平台能力——adapter.ts 只 re-export，不写副本
- [x] §6.7 支付 SECURITY gate：金额正整数 / idempotencyKey / signature
- [x] §7.1 SDD 三件套（本文件履行 retroactively）
- [x] §7.3 commit 前缀 `feat:`/`fix:`/`chore:`/`docs:`/`refactor:`/`test:`
- [x] §8.2 mock 接口形态 = ProviderCallResult<T>（无 mock 写假数据）

### V1.0 PR-15 验收

- [x] 7 因子：content-fit / relation / recency / inventory / margin / sentiment / risk
- [x] 加权：0.25 / 0.20 / 0.15 / 0.10 / 0.10 / 0.10 / 0.10（PRD §6.2）
- [x] 排序输出 + reason
- [x] 单测覆盖 7 因子 + 权重 + 边界

### V1.0 PR-16 验收

- [x] 6 模态（text / voice / screenshot / chat / link / image）
- [x] 结构化 GiftQuery { relation, scene, tone, budget_fen, tokens }
- [x] recordUsageEvent 接入
- [x] 公网截图渲染（57KB multimodal.png）

### V1.0 PR-17 验收

- [x] 3 任务类型（generate-content / publish / review）
- [x] 并发度可调（2 / 5 / 10）
- [x] 实时状态（done / running / pending）
- [x] recordUsageEvent 接入
- [x] 公网截图渲染（40KB batch.png）

### V1.0 PR-18 验收

- [x] 身份区（user / org / role / device via identity package）
- [x] 商品供给策略 5 mock（maintain / promote 二态）
- [x] CPS 商品 5 mock（4 source enum）
- [x] 微信支付订单区（空态 + wechatPayMock.list）
- [x] 阶段二 usage / trace 监控（recentMeterEvents / recentTraceEvents / getRecentUsageEvents）
- [x] 公网截图渲染（150KB admin.png）

### 阶段二-A 验收

- [x] `src/platform/adapter.ts` 接线 5 个 `@rockcent/platform` 子包：
  - `@rockcent/platform/ai-gateway` (createAIGateway + AiTraceEvent + createInMemoryTraceSink)
  - `@rockcent/platform/ai-metering` (createTokenUsageFact + createInMemoryMeterSink + recordAIUsage + calculateTokenCost)
  - `@rockcent/platform/identity` (USER_STATUS + ORGANIZATION_STATUS + types)
  - `@rockcent/platform/usage` (USAGE_METRICS + UsageEventInput)
  - `@rockcent/platform/web-client` (createStorage + safeJsonParse + getClientDeviceId + getClientDeviceLabel)

### 阶段二-B 验收

- [x] 7 service 形态 = `ProviderCallResult<T>`：
  - `services/ai/recommend-engine.ts`
  - `services/ai/multimodal.ts`
  - `services/ai/batch.ts`
  - `services/ai/product-supply.ts`
  - `services/payment/wechat-pay.ts`
  - `services/product/cps.ts`
  - `services/api/server.ts`

### 阶段二-C 验收

- [x] CPS 商品库 `source` enum: `taobao` / `jd` / `pdd` / `mock`
- [x] 商品字段：id / title / priceFen / commissionFen / stock / riskLevel
- [x] 单测覆盖 4 source + 字段 + 边界

### 阶段二-D 验收

- [x] wechat-pay 包含 `idempotencyKey` 字段
- [x] 包含 `verifyCallback` 函数
- [x] 包含 `signature` 验证
- [x] smoke 校验三项 keyword 都在源码中

### 阶段二-E 验收

- [x] `package.json` `@rockcent/platform` pin 升 `platform-v1.20.0`
- [x] 依赖 Node 22 floor（PR-5 codemod）
- [x] 消费者 PR 含平台 commit + used modules + validation commands

### 部署级

- [x] nginx conf 含 `/h5/` 子路径 location（与网页端共享 server block）
- [x] `.github/workflows/deploy-production.yml` 镜像 web 模式
- [x] `scripts/post-build-h5.mjs` 重写 dist 资源路径（修复 Taro 3.x publicPath 漏传 bug）
- [x] 公网 `https://gift.rockcent.com/h5/` 7/7 截图渲染 PASS
- [x] 远端 `/usr/share/nginx/giftpilot/backups/h5-20260708_004546/` 备份就位
- [x] CURRENT_WORK.md 部署记录已补（CI_RELEASE_STANDARD §post-deploy mandate）

---

## 不在范围（阶段三/四起后置）

- ❌ 真实 Ark API key 接入（PM 凭证待提供）
- ❌ 真实微信支付证书（PM 凭证待提供）
- ❌ 真实 CPS 商品库 API（PM 凭证待提供）
- ❌ 真实云开发 / 后端（PM 凭证待提供）
- ❌ 真实多模态 ASR / OCR / image embedding（mock 文本）
- ❌ 真实批量任务队列（mock Promise.all）
- ❌ 真实机构管理 / 推客评分（V1.1 / V1.2 后置）
- ❌ 视频号 / 朋友圈真实发布（PRD §6.5 阶段三起）
