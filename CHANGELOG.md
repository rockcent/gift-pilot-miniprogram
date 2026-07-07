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
