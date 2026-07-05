# MVP v0.6 · 任务清单

**对应方案**：`.specify/features/mvp-v0/plan.md`
**编排原则**：按依赖顺序；先脚手架 → 数据层 → 平台接入 → 组件 → 页面 → 测试 → CI。
**协作分工**：Codex（架构 / 任务分解 / 评审 / merge） + 本地 claudecode（单仓单目标小粒度补丁，按本表标记 `🤖CC` 的项）。
**最后更新**：2026-07-06

---

## 阶段 0：脚手架（Codex 主导）

- [ ] **T-001** 初始化 Taro 3 + React + TS 工程，配置 `package.json` / `tsconfig.json` / `babel.config.js` / `.eslintrc.js`
- [ ] **T-002** 配置 `project.config.json` / `app.tsx` / `app.config.ts`（4 个 TabBar）
- [ ] **T-003** 接入 `@rockcent/platform` tag（pin `git+https://github.com/rockcent/rockcent-platform.git#platform-v1.15.2`），跑通 `pnpm install`
- [ ] **T-004** 写 `src/styles/tokens.scss` / `global.scss` / `ai-six.scss`（宪法 §2 落地）
- [ ] **T-005** `.env.example` + `project.config.example.json` + `.gitignore`

## 阶段 1：数据层（Codex 主导）

- [ ] **T-006** 定义类型 `src/types/{gift,content,cover,publish,order,memory}.ts`（宪法 §4）
- [ ] **T-007** mock 数据 `src/data/{mock-gifts,mock-orders,mock-content,mock-memory}.json`
- [ ] **T-008** utils：`src/utils/{money,id,trace}.ts` + 单测
- [ ] **T-009** stores（Zustand）：`ai-store.ts` / `orders-store.ts` / `memory-store.ts`

## 阶段 2：平台接入层（Codex 主导）

- [ ] **T-010** `src/services/api.ts` — 用 `@rockcent/platform/web-client` 包装 `createApiClient`
- [ ] **T-011** `src/services/ai/mock.ts` — LLM mock（接口形态 = `ProviderCallResult`）
- [ ] **T-012** `src/services/ai/index.ts` — provider 切换入口
- [ ] **T-013** `src/services/orders/{mock,index}.ts` + `src/services/memory/{mock,index}.ts`
- [ ] **T-014** `src/services/share.ts` — 用 `@rockcent/platform/share` 序列化分享卡片

## 阶段 3：组件层（🤖CC 可领）

- [ ] **T-020** 🤖CC `components/brand` (Logo + Slogan)
- [ ] **T-021** 🤖CC `components/chat` (AI 对话气泡 + 输入区)
- [ ] **T-022** 🤖CC `components/gift-card` (礼物卡：图 / 名称 / 价格 / 匹配度)
- [ ] **T-023** 🤖CC `components/content-card` (文案卡 + 风格 chip)
- [ ] **T-024** 🤖CC `components/cover-template-card` (封面模板卡)
- [ ] **T-025** 🤖CC `components/metric-card` (数据卡 + 进度条)
- [ ] **T-026** 🤖CC `components/plan-row` (AI 计划行)
- [ ] **T-027** 🤖CC `components/ai-memory-row` (AI 记忆行 + 编辑)
- [ ] **T-028** 🤖CC `components/tab-bar` (全局 Tab：AI 对话 / 探索 / 创作 / 我的)
- [ ] **T-029** 🤖CC `components/ai-six-banner` (底部 6 大 AI 标签 Footer)

## 阶段 4：页面层（Codex 主导 + 🤖CC 可拆单页）

- [ ] **T-040** `pages/index` 表达需求页（AI 对话首页）
- [ ] **T-041** `pages/recommend` AI 选品推荐页
- [ ] **T-042** `pages/content` 内容生成工作台
- [ ] **T-043** `pages/cover` 封面设计页
- [ ] **T-044** `pages/publish-confirm` 发布确认页
- [ ] **T-045** `pages/publish-success` 发布成功页
- [ ] **T-046** `pages/orders` 订单与佣金页
- [ ] **T-047** `pages/review` 经营复盘（AI 分析）页
- [ ] **T-048** `pages/next-plan` AI 下一步计划页
- [ ] **T-049** `pages/memory` 我的 AI 记忆页

## 阶段 5：测试（Codex 主导 + 🤖CC 可领）

- [ ] **T-060** 单测：`utils/money` / `utils/id` / `stores/*`（覆盖 90%）
- [ ] **T-061** 单测：`services/ai/mock`（mock LLM 输入输出对照）
- [ ] **T-062** 单测：`components/*` 渲染快照（关键 3 个组件）
- [ ] **T-063** E2E：用 `@rockcent/platform/deploy-kit` 跑 mini smoke（`smoke:weapp`）

## 阶段 6：CI / 文档（Codex 主导）

- [ ] **T-080** `.github/workflows/ci.yml`（lint + build:weapp + smoke）
- [ ] **T-081** `README.md`（含宪法引用 / 平台 pin / 启动步骤）
- [ ] **T-082** 本仓 `CHANGELOG.md`（v0.6.0-mvp）
- [ ] **T-083** 在 `/Volumes/Rock2/codex/cloud-server-ops/CURRENT_WORK.md` 补一行：gift-pilot-miniprogram MVP 启动

## 阶段 7：交付（Codex 主导）

- [ ] **T-100** 跑 `pnpm run lint` ✅
- [ ] **T-101** 跑 `pnpm run build:weapp` ✅ 生成 `dist/`
- [ ] **T-102** 跑 `pnpm run smoke:weapp` ✅
- [ ] **T-103** 给 PM 截图 / 录屏（10 个核心页面）给用户验收
- [ ] **T-104** git init + 提交（commit message 风格：Conventional Commits）

---

## 与本地 claudecode 的协作约定

- 每个 🤖CC 任务必须有：
  - 单一文件 / 组件粒度（**禁止**跨组件改多文件）；
  - 明确 props 接口与命名（README.md 写清楚）；
  - 完成报告（修改文件 + 验证命令 + 截图或日志片段）。
- Codex 在每个阶段结束��做整体 review + 集成测试。
- claudecode 不接触：`.env` / `project.config.json` / 平台 pin / 支付 / 数据库相关文件。

## 状态

- 当前阶段：**阶段 0 启动中**。
- 已完成：`spec.md` / `plan.md` / `tasks.md` / `constitution.md`。
- 待 PM 拍板：是否同意技术栈 Taro 3 + React + TS；是否同意 mock MVP 范围。
