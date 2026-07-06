# V0.8 PR-2 风格学习 · 执行稿

**Spec**：`.specify/features/v0-8-style-learning/spec.md`
**Plan**：`.specify/features/v0-8-style-learning/plan.md`（**必须人工 review 通过**）
**PR 范围**：#3 风格学习（6 chip + 风格档案持久化）

---

## 阶段 A：前置

- [ ] **T-A1** `feature/v0-8-pr2-style-learning` 分支已建（基于 main 含 PR-1 squash merge `849c6a6`）
- [ ] **T-A2** SDD 三件套（spec.md / plan.md / tasks.md） commit
- [ ] **T-A3** PM review plan.md §"待 PM 拍板" — 拍板后开工

## 阶段 B：类型 + 数据 + 服务

- [ ] **T-B1** `src/types/index.ts` 增 `StyleId` / `StyleChipMeta` / `StyleUsageStat` / `StyleProfile`
- [ ] **T-B2** `src/services/ai/style.ts` mock: `learnFromEdit` + `generatePersonal` + `getChipMetaList` + 6 chip 静态数据
- [ ] **T-B3** `npx tsc --noEmit` 仅本目录 0 error

## 阶段 C：Store

- [ ] **T-C1** `src/stores/memory-store.ts` 增 `styleProfile` 字段 + initial defaults (6 keys all used=0)
- [ ] **T-C2** `rememberStyle(id)` + `updateStyleProfile(patch)` + `applyPersonalStyle(text, id)` + `resetStyleProfile()` + 让 `clear()` 也 reset
- [ ] **T-C3** 红纸练习：reducer 测试 — partial update 保留旧权重

## 阶段 D：UI

- [ ] **T-D1** `src/pages/content/index.tsx` 改：
  - 用 `styleMock.getChipMetaList()` 渲染 6 chip
  - 横排 ScrollView
  - 点 chip → onPickChip(id) → setActiveStyleId + generateContent + applyPersonalStyle
  - 文案下方"📌 记住这个风格" 按钮 → `rememberStyle(activeStyleId)`
- [ ] **T-D2** `src/pages/memory/index.tsx` 改：
  - 新增"风格档案"区块
  - 6 chip + 各自 used 计数 + lastUsedAt
  - "重置风格档案" 按钮 → `resetStyleProfile()`
- [ ] **T-D3** `src/components/content-card/content-card.tsx` 改：
  - 加 "📌" 按钮 → `rememberStyle(styleId)`
  - props 加 `onRemember?: (id: StyleId) => void`
- [ ] **T-D4** SCSS 检查：颜色用 `var(--brand-*)`，不引入新色

## 阶段 E：测试

- [ ] **T-E1** `__tests__/services/style.test.ts` (6 tests)：6 chip 数量 + unique id + learnFromEdit + generatePersonal 3 case
- [ ] **T-E2** `__tests__/stores/memory-style.test.ts` (6+ tests)：initial + rememberStyle + resetStyleProfile + clear() + applyPersonalStyle 2 case
- [ ] **T-E3** `npm test` 全过（28 旧 + 12 新 = 40 cases in 9 suites）
- [ ] **T-E4** `npm run lint` 0 errors

## 阶段 F：守卫 + 文档 + 截图

- [ ] **T-F1** `scripts/smoke-weapp.mjs` 加 `all 6 V0.8 PR-2 style IDs present in style.ts`
- [ ] **T-F2** `node ./scripts/smoke-weapp.mjs` PASS（应 7 checks）
- [ ] **T-F3** `README.md` V0.8 路线图段更新：PR-2 ✅
- [ ] **T-F4** `CHANGELOG.md` 增 v0.8.0-pr2 段
- [ ] **T-F5** `dist-screenshots/content-with-personal.png` H5 渲染 personal chip + "📌" 按钮
- [ ] **T-F6** `dist-screenshots/memory-style-profile.png` H5 渲染 风格档案区块

## 阶段 G：交付

- [ ] **T-G1** commit `feat(miniprogram): V0.8 PR-2 风格学习 (6 chip + 风格档案)`
- [ ] **T-G2** push `feature/v0-8-pr2-style-learning`
- [ ] **T-G3** `gh pr create` 提 PR #2
- [ ] **T-G4** CI run success + PM review + merge
