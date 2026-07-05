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
