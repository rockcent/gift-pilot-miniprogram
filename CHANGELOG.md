# Changelog

## v0.6.0-mvp · 2026-07-06

礼有方（GiftPilot）微信小程序 MVP v0.6 首发。

### Features
- 10 个核心页面：表达需求 / AI 选品推荐 / 内容生成 / 封面设计 / 发布确认 / 发布成功 / 订单佣金 / 经营复盘 / AI 下一步计划 / 我的 AI 记忆
- 9 个核心组件：Brand / ChatBubble / GiftCard / ContentCard / CoverCard / MetricCard / PlanRow / AIMemoryRow / AISixBanner / TopBar
- 4 个 Zustand stores：ai / orders / memory + 分享 / 复盘联动
- AI mock 适配器：接口形态 = `@rockcent/platform/ai` ProviderCallResult，阶段二可零成本切真实 LLM

### Engineering
- Taro 3.6 + React 18 + TypeScript 5 工程骨架
- 平台 pin：`@rockcent/platform` 锁定 `platform-v1.15.2`
- 视觉 token：策绿 / 礼杏 / 心意珊瑚 / 暖白 全局落地
- 3 个 smoke 脚本（平台 pin / 敏感扫描 / 整数金额 / 6 大 AI 标签）
- GitHub Actions 最小 CI

### Documentation
- `.specify/constitution.md` v0.1（项目宪法）
- `.specify/features/mvp-v0/spec.md`（产品规格）
- `.specify/features/mvp-v0/plan.md`（技术方案）
- `.specify/features/mvp-v0/tasks.md`（任务清单）

### Out of scope（阶段二起）
- 真实微信支付
- 真实第三方商品 API
- 真实朋友圈 / 视频号发布
- 礼有方 Pro / 礼有方云 / 开放平台

## v0.8.0-pr1 · 2026-07-06

礼有方（GiftPilot）微信小程序 V0.8 AI 经营版 / PR-1：周经营计划 + 节日机会。

### Features
- **周经营计划**：新增 `pages/week-plan/`，7 天格子 + KPI Bar + 今日任务高亮 + 进度统计
- **节日机会**：AI 对话首页"今日节日机会"卡片 + 新组件 `components/festival-card/`
- 6 个节日 mock 数据（夏日打卡 / 建军 / 父亲 / 七夕 / 中秋 / 双十一）按天数过滤 [0, 30] 范围内
- 7 天 × 21 任务 mock 数据（含 done / in_progress / pending / 跳过 4 状态，4 种场景类型）

### Engineering
- `ai-store` 增 `weekPlan` + `festivalOpportunities` 字段 + `loadWeekPlan` + `loadFestivalOpportunities` action
- 2 个 mock service（`services/ai/plan.ts` + `services/ai/festival.ts`）— 接口形态严格 = ProviderCallResult
- 类型扩展（`WeekPlan` / `WeekPlanDay` / `DayTask` / `SceneKind` / `FestivalOpportunity` / `FestivalRelation` + `computeDaysAway()`）
- 路由注册：`app.config.ts` 新增 `pages/week-plan/index`
- smoke 加第 11 页（10 旧 + 1 新 V0.8）

### Testing
- 13 个新增 jest 单测：
  - `__tests__/services/plan.test.ts`（7 tests 含 `computeDaysAway`）
  - `__tests__/services/festival.test.ts`（3 tests）
  - `__tests__/stores/ai-store-v08.test.ts`（4 tests 含 reset 验证）
- 总测试数：14 (旧) + 13 (新) = **27 tests in 7 suites 全部 PASS**

### Documentation
- `.specify/features/v0-8-ai-operation/{spec.md, plan.md, tasks.md}` 路线图三件套（commit `3d90045`）
- `README.md` 新增 V0.8 路线图段（PR-1 / PR-2 / PR-3 / PR-4）
- 本 CHANGELOG

### Out of scope（本 PR-1 不做）
- 风格学习（PR-2）
- 发布时间优化 + 多平台内容（PR-3）
- 商品替换提醒（PR-4）
- 真实微信云开发 / 真实 LLM / 真实商品库（阶段二）

## v0.8.0-pr2 · 2026-07-06

礼有方（GiftPilot）微信小程序 V0.8 AI 经营版 / PR-2：风格学习（6 chip + 风格档案持久化）。

### Features
- 内容生成工作台加 6 风格 chip 横排：自然分享 / 实用推荐 / 情绪价值 / 个性化 / 专业 / 轻松幽默
- AI 记忆页加'风格档案'区块，显示 6 个 chip 各自 used 计数 + '✓ 已学习' 状态
- '📌 记住这个风格' 按钮 + '重置风格档案' 二次确认弹窗
- `personal`（个性化）chip：自动按 `styleProfile.emojiRate` 注入 emoji + 按 `sentenceLen` 截断

### Engineering
- `src/types/index.ts` 增 `StyleId` / `StyleChipMeta` / `StyleUsageStat` / `StyleProfile` + `STYLE_IDS` + `blankStyleProfile()` helper
- `src/services/ai/style.ts` 新增：mock `learnFromEdit` + `generatePersonal` + `getChipMetaList` + 6 静态 chip 数据
- `src/stores/memory-store.ts` 扩字段：增 `styleProfile` + 4 action（`rememberStyle` / `updateStyleProfile` / `applyPersonalStyle` / `resetStyleProfile`），`clear()` 同时重置 styleProfile
- `src/pages/content/index.tsx` 改：`useMemo` 6 chip + 横排 `ScrollView` + onPickChip + '📌' 按钮 + Taro 弹 toast
- `src/pages/memory/index.tsx` 改：风格档案区块 6 chip 网格 + Taro.showModal 重置
- `src/components/content-card/content-card.tsx` 改：可选 `onRemember` prop + '📌 记住' 按钮

### Testing
- 14 个新增 jest 单测：
  - `__tests__/services/style.test.ts` (7 tests): 6 chips 完整 + unique id + learnFromEdit + generatePersonal 3 case
  - `__tests__/stores/memory-style.test.ts` (7 tests): initial + rememberStyle + resetStyleProfile + clear() + applyPersonalStyle 3 case
- 总：14 v0.6 + 14 PR-1 + 14 PR-2 = **41 tests in 9 suites 全部 PASS**

### Guard
- `scripts/smoke-weapp.mjs` 加 'all 6 V0.8 PR-2 style chips present in services/ai/style.ts'
- 全 7 smoke checks PASS

### Documentation
- `.specify/features/v0-8-style-learning/{spec.md, plan.md, tasks.md}` 三件套
- 本 CHANGELOG + README V0.8 段

### Out of scope（本 PR-2 不做）
- 真实 LLM（阶段二）
- 风格融合 / 跨用户共享（V1.0）


## v0.8.0-pr3 · 2026-07-07

礼有方（GiftPilot）微信小程序 V0.8 AI 经营版 / PR-3：发布时间优化 + 多平台内容。

### Features
- **发布时间优化**：发布确认页加 ⏰ AI 推荐发布时间（3 档：明早 8:30 / 今晚 21:00 / 后天中午），每档带 reason + 预估打开率；点击 1 档写入 `publish.scheduled_at`，再次点击取消；不选 = 立即发布
- **多平台内容**：内容页加 📤 多平台分发（朋友圈 ≤80 字 ≤6 行 / 小红书 ≤200 字 emoji 多 / 视频号 hook 开头 ≤80 字）+ 字数统计 + 「📋 一键复制全部平台版」按钮
- **计划显示**：下周计划页加 🕐 「计划于 XX 发布」卡片（仅当用户已选定时档时显示，从 `publish.scheduled_at` 解析）

### Engineering
- `src/types/index.ts` 增 `PublishTimeSlot` / `PublishTimeSlotId` / `PlatformId` / `PlatformContent` / `MultiPlatformBundle` + `PUBLISH_TIME_SLOT_IDS` + `PLATFORM_IDS` 常量
- `src/services/ai/publish-time.ts` 新增（38 行）：`fetchPublishTimeSlots(now?)` 3 档 + `getSlotById`；自带 21:00 后跨日 roll 逻辑
- `src/services/ai/multi-platform.ts` 新增（97 行）：`generateMultiPlatform({ sourceText, giftName })` 三平台改写 + `formatCopyAll` 拼接
- `src/stores/ai-store.ts` 扩：`publishTimeSlots` / `multiPlatformContents` 字段 + 3 action（`loadPublishTimeSlots` / `loadMultiPlatform` / `setPublishTimeSlot`）；`buildPublish` 接 `scheduledAtIso` 可选参数；`reset` 同步重置 2 字段
- `src/pages/publish-confirm/index.tsx` 改：3 slot 卡片 + active 高亮 + onConfirm 调 `setPublishTimeSlot`
- `src/pages/content/index.tsx` 改：3 mini 卡片 + 字数统计 + hashtags + 一键复制按钮 + useEffect 自动 load
- `src/pages/next-plan/index.tsx` 改：scheduledLabel 计算 + 🕐 卡片区块
- SCSS 增量：`gp-pub__slot-grid` + `gp-pub__slot` + `--active` + `gp-content__multi` + `gp-content__multi-card` + `gp-page__schedule`

### Testing
- 10 个新增 jest 单测：
  - `__tests__/services/publish-time.test.ts` (4 tests): 3 slot + shape 校验 + 21:00 roll + getSlotById
  - `__tests__/services/multi-platform.test.ts` (6 tests): 3 variant + moments ≤80 字 ≤6 行 + xiaohongshu ≤200 字 emoji >0 + 视频号 hook 开头 + formatCopyAll null + formatCopyAll 拼接
- 总：14 v0.6 + 14 PR-1 + 14 PR-2 + 10 PR-3 = **51 tests in 11 suites 全部 PASS**

### Guard
- `scripts/smoke-weapp.mjs` 重写为「先全部 check 后汇总」，加 3 项 PR-3 校验（3 档 slot IDs + 3 平台 IDs + 2 服务文件）
- 全 10 smoke checks PASS
- `npm run lint` 未引入新 error（2 个 pre-existing emoji regex 错误属 PR-2，不动）
- `npm run build:h5` webpack 5.75.0 PASS（1 entrypoint size warning，非错误）

### Documentation
- `.specify/features/v0-8-multi-platform/{spec.md, plan.md, tasks.md}` 三件套（commit `f6c7e5a`）
- `dist-screenshots/{content, publish-confirm, next-plan}.png` 重渲染
- 本 CHANGELOG + README V0.8 段 PR-3 ✅

### Out of scope（本 PR-3 不做）
- 真实 LLM（阶段二）
- 跨平台账号绑定 / 自动发布（V1.0）
- 商品替换提醒（PR-4）

## v0.8.0-pr4 · 2026-07-07

礼有方（GiftPilot）微信小程序 V0.8 AI 经营版 / PR-4：商品替换提醒（V0.8 最后一项增量）。

### Features
- **健康度区块**：复盘页加 🎁 推荐礼物健康度（按 healthy → cooling → fading 排序，每行：🟢🟡🔴 圆点 + 礼物名 + 状态 pill + reason）
- **1 键换品**：🟡🔴 行尾「换新品」按钮触发 `replaceGift(oldGiftId)` mock service，返回新 gift 并写回 `recommendation.gifts` 对应索引；toast 反馈「✅ 已换为 XX」
- **健康判定规则**（mock 阶段）：🟢 orders7d ≥3 AND ctr ≥5% AND 无退款 / 🟡 7 日 1-2 单或 ctr 1-5% 或 1 退款 / 🔴 无订单或 ctr <1% 或 ≥2 退款

### Engineering
- `src/types/index.ts` 增 `GiftHealthStatus` / `GiftHealthStat` / `GiftHealthFlag` / `GiftReplacement` + `GIFT_HEALTH_STATUSES` 常量 + 2 纯函数 `judgeGiftHealth()` + `buildHealthReason()`
- `src/services/ai/gift-health.ts` 新增（~95 行）：mock `fetchGiftHealthFlags(giftIds)` + `replaceGift(oldGiftId)` + `sortFlags()`；mock 统计基于 `giftId` hash 稳定随机
- `src/stores/ai-store.ts` 扩：`giftHealthFlags[]` + `lastReplacement` 字段 + 2 action（`loadGiftHealthFlags` / `replaceGift`，后者自动写回 recommendation.gifts）；`reset` 同步清 2 字段
- `src/pages/review/index.tsx` 改：加 🎁 健康区块 + useEffect auto load + onReplace 调 mock + Taro.showToast
- `src/pages/review/index.scss` 改：3 档边框色（绿/杏/珊瑚）+ reason 样式 + 换品按钮

### Testing
- 6 个新增 jest 单测：
  - `__tests__/services/gift-health.test.ts` (6 tests): 3 status shape + judgeGiftHealth 5 case + buildHealthReason 3 case + replaceGift 新旧对比 + sortFlags 顺序 + mock gft_001-004 不全 fading
- 总：14 v0.6 + 13 PR-1 + 14 PR-2 + 10 PR-3 + 6 PR-4 = **57 tests in 12 suites 全部 PASS**

### Guard
- `scripts/smoke-weapp.mjs` 加 2 项 PR-4 校验（3 档 health status + service 文件）
- 全 **12 smoke checks PASS**
- `npm run lint` PR-4 引入 0 new error（修了一个 useMemo-在-early-return-后 的 react-hooks/rules-of-hooks）
- `npm run build:h5` webpack 5.75.0 PASS

### Documentation
- `.specify/features/v0-8-gift-health-alert/{spec.md, plan.md, tasks.md}` 三件套（commit `12fc6d8`）
- `dist-screenshots/review.png` 重渲染
- 本 CHANGELOG + README V0.8 段 PR-4 ✅

### V0.8 完结

PR-1 → PR-2 → PR-3 → PR-4 全部 merged，V0.8 AI 经营版 6 项增量完成 4 项：
- ✅ 周经营计划 + 节日机会 (PR-1)
- ✅ 风格学习 (PR-2)
- ✅ 发布时间优化 + 多平台内容 (PR-3)
- ✅ 商品替换提醒 (PR-4)

剩 PRD §13 V0.8 的 #1 一周经营计划（已含 PR-1 节日机会扩展） + #2 节日机会（PR-1 已交付）。

### Out of scope（本 PR-4 不做 + V0.8 路线图完结后）
- 真实 LLM（阶段二）
- 真实点击 / 转化追踪（mock stats）
- 跨礼物维度推荐模型（V1.0）
- 自动换品（仅 1 键手动触发）

## v1.20.0-platform-upgrade · 2026-07-07

礼有方（GiftPilot）微信小程序 platform v1.15.2 → **v1.20.0** 升级。

### 范围
- 仅消费侧升级（per AGENTS.md + migration-guide-v1.20.0.md）
- 3 项 OQ-1 breaking 适配

### 改动
- `@rockcent/platform` pin: `platform-v1.15.2` → **`platform-v1.20.0`** (commit `7574f41`)
- `engines.node`: `>=20.0.0` → **`>=22.0.0`**（OQ-1 ②）
- `scripts/screenshot-h5.mjs`: codemod 自动应用 dirname-ems（OQ-1 ②）
  - 删 `__filename` / `__dirname` polyfill
  - `__dirname` → `import.meta.dirname`
  - 删 unused `import { fileURLToPath }`
- npm install `--legacy-peer-deps --package-lock-only`（沿用 V0.8 PR-1 web 端方案绕开 webpack 5.75.0 peer conflict）

### Codemod Findings (dry-run)
- `deep-import-path` codemod: **0 findings**（mini 端未 import `@rockcent/platform/ai` 子路径，types/ 内部定义 `ProviderCallResult<T>`）
- `promise-type-narrowing` codemod: **0 findings**（同上原因）
- `dirname-ems` codemod: **1 file / 3 changes**（仅 `scripts/screenshot-h5.mjs`）

### 验证
- `npm test`: **57 tests in 12 suites PASS**（与 v0.8 PR-4 main 等同）
- `node scripts/smoke-weapp.mjs`: **12/12 checks PASS**（含 `platform pin` form 仍为 `git+https://...#platform-v...`）
- `npm run build:h5`: webpack 5.75.0 PASS
- Node: **v22.22.2**（满足 `>=22.0.0`）

### Out of scope（本升级 PR 不做）
- 真实 LLM 接入（V1.0 PR-6 待启动）
- 真实商品库 / 支付 / 后端（V1.0 待启动）

## v1.0.0-stage2 · 2026-07-08

礼有方（GiftPilot）微信小程序 V1.0 平台对接 + 阶段二 A→E mega-PR。
架构层对齐 V1.0，runtime 数据 mock；真实凭证需 PM 提供后接入。

### Features
- **PR-15** AI 推荐引擎 7 因子（PRD §6.2）：content-fit / relation / recency / inventory / margin / sentiment / risk，加权排序
- **PR-16** 多模态输入页：6 模态 → 结构化 GiftQuery
- **PR-17** AI 批量任务中心：批量生成 / 发布 / 复盘，并发可调
- **PR-18** 平台管理后台（mini 端简化版）：身份 / 商品供给 / CPS / 微信支付 / usage 监控
- **阶段二-A** 平台适配��� `src/platform/adapter.ts`：5 个 `@rockcent/platform` 子包接线
- **阶段二-B** 7 个新 service：recommend-engine / multimodal / batch / product-supply / wechat-pay / cps / api-server
- **阶段二-C** CPS 商品库 mock（source: taobao / jd / pdd / mock）
- **阶段二-D** SECURITY gate：wechat-pay 含 `idempotencyKey` + `verifyCallback` + `signature`

### Pages
- 11 → 14 个页面（新增 `pages/multimodal/index` + `pages/batch/index` + `pages/admin/index`）
- 3 张新增截图：`multimodal.png` / `batch.png` / `admin.png`

### Engineering
- 平台 pin：`@rockcent/platform` 锁定 `platform-v1.20.0`（Node 22 floor + dirname-ems codemod）
- 新增 `nginx/gift.rockcent.com.conf`（与网页端共享 conf，含 `/h5/` 子路径块）
- 新增 `scripts/deploy-preflight.sh`（8 项预检）+ `scripts/deploy-production.sh`（rsync + nginx reload）
- `package.json` 加 3 个 deploy script：`deploy:preflight` / `deploy:dry-run` / `deploy:production`
- smoke 升级到 **18/18 PASS**（含 14 页面 + 阶段二-D SECURITY gate + 阶段二-C CPS enums + 阶段二-B 5 平台包）

### 部署目标
- 主机：`rockops@8.138.150.206`（aliyun-rockcent-prod）
- 路径：`/usr/share/nginx/giftpilot/h5/dist/`（子路径 `/h5/`，与网页端共 server block）
- 公网 URL：`https://gift.rockcent.com/h5/`
- 部署命令：`npm run deploy:production`（PM Mac 终端，沙箱拦截 SSH）

### 验证
- `npm test`: **87 tests in 19 suites PASS**（V0.6×10 + V0.8 PR-1~4 + V1.0 PR-15~18 + 阶段二-A→E）
- `npm run smoke:weapp`: **18/18 checks PASS**
- `npm run build:h5`: webpack 5.75.0 PASS（含 Taro 14 页面）
- `npm run screenshot:h5`: **14/14 PNG OK**（含 multimodal / batch / admin）
- Node: **v22.22.2**

### Out of scope（本 PR 不做）
- 真实 LLM / 真实商品库 / 真实支付 / 真实后端（待 PM 提供凭证）
- 真实多模态 ASR/OCR/image embedding（mock 文本）
- 真实批量任务队列（mock Promise.all）
- 真实机构管理 / 推客评分（V1.1/V1.2 后置）
