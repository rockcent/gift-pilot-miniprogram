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
