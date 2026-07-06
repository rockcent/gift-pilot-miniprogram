# V0.8 PR-1 · 任务清单（执行稿，待 PM review 通过 plan.md 后逐项 ✅）

**Spec**：`.specify/features/v0-8-ai-operation/spec.md`
**Plan**：`.specify/features/v0-8-ai-operation/plan.md`（**必须人工 review 通过**）
**PR 范围**：#1 周经营计划 + #2 节日机会
**最后更新**：2026-07-06

---

## 阶段 A：前置（依赖项 - 不依赖实施）

- [ ] **T-A1** mini 端 `rockcent/gift-pilot-miniprogram` GitHub repo **建仓**（若用户拍板走 GH 远程）；若拍板走本地，则跳过
- [ ] **T-A2** `feature/v0-8-pr1-week-plan-festival` 分支（基于 `main`）
- [ ] **T-A3** 首 commit 含 `spec.md` / `plan.md` / `tasks.md` 三件套

## 阶段 B：数据 + 类型 + 服务（脚手架）

- [ ] **T-B1** `src/data/mock-week-plan.json`：7 天 25 任务
- [ ] **T-B2** `src/data/mock-festivals.json`：6 个节日 0-180 天分布
- [ ] **T-B3** `src/types/week-plan.ts`：WeekPlan / DayTask / WeeklyKpi
- [ ] **T-B4** `src/types/festival.ts`：FestivalOpportunity
- [ ] **T-B5** `src/services/ai/plan.ts`：fetchWeekPlan (mock, sleep 800ms, ProviderCallResult 形态)
- [ ] **T-B6** `src/services/ai/festival.ts`：fetchFestivalOpportunities (filter daysAway ∈ [0, 30])

## 阶段 C：Store

- [ ] **T-C1** `src/stores/ai-store.ts`：加 `weekPlan` + `festivalOpportunities` + `loadWeekPlan` + `loadFestivalOpportunities`
- [ ] **T-C2** reducer 单测：partial update 保留旧值

## 阶段 D：UI

- [ ] **T-D1** `src/components/festival-card/`：emoji + name + daysAway + pitch
- [ ] **T-D2** `src/pages/week-plan/`：KPI Bar + 7 天格 + 今日高亮 + 节日卡 + 底部 CTA
- [ ] **T-D3** `src/pages/index/index.tsx` 改：挂"今日计划卡" + "今日节日卡"
- [ ] **T-D4** SCSS 与 `tokens.scss` 一致（不引入新色）

## 阶段 E：测试

- [ ] **T-E1** `__tests__/ai-plan.test.ts`：loadWeekPlan + reducer + 卡片渲染
- [ ] **T-E2** `__tests__/ai-festival.test.ts`：filter + sort + card render
- [ ] **T-E3** `npm run lint`：0 errors
- [ ] **T-E4** `npm run build:weapp`：0 errors
- [ ] **T-E5** `npm test`：14 (现有) + 6 (新增) = 20 单测全过

## 阶段 F：守卫 + 文档

- [ ] **T-F1** `scripts/smoke-miniapp.mjs`：页面数 10 → 11
- [ ] **T-F2** `scripts/check-platform-deps-local.mjs`：仍 git+https 形式
- [ ] **T-F3** `scripts/check-no-sensitive.mjs`：仍 0 命中
- [ ] **T-F4** `README.md` "MVP 范围" 增 #1 #2，标 V0.8
- [ ] **T-F5** `CHANGELOG.md` 增 `feat(miniprogram): 周经营计划 + 节日机会 (V0.8 PR-1)`
- [ ] **T-F6** `dist-screenshots/week-plan.png` + `festival-card.png`：H5 渲染截图

## 阶段 G：交付

- [ ] **T-G1** commit message：`feat(miniprogram): 周经营计划 + 节日机会 (V0.8 PR-1)`
- [ ] **T-G2** push `feature/v0-8-pr1-week-plan-festival`（含三件套）
- [ ] **T-G3** 提 PR（或本地通知）
- [ ] **T-G4** PM review + merge → 准备 PR-2 风格学习
