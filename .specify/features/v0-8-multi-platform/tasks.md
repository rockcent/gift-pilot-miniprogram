# V0.8 PR-3 发布时间 + 多平台内容 · 执行稿

**Spec**：`.specify/features/v0-8-multi-platform/spec.md`
**Plan**：`.specify/features/v0-8-multi-platform/plan.md`（**必须人工 review 通过**）
**PR 范围**：#4 发布时间优化 + #5 多平台内容

---

## 阶段 A：前置

- [ ] **T-A1** `feature/v0-8-pr3-publish-time-multi-platform` 分支已建（基于 main 含 PR-2 squash `d8e0b36`）
- [ ] **T-A2** SDD 三件套（spec.md / plan.md / tasks.md）commit
- [ ] **T-A3** PM review plan.md 3 个 yes/no 问题

## 阶段 B：类型 + 数据 + 服务

- [ ] **T-B1** `src/types/index.ts`: `PlatformId` + `PublishTimeSlot` + `PlatformContent` + `MultiPlatformBundle`
- [ ] **T-B2** `src/services/ai/publish-time.ts`: mock `fetchPublishTimeSlots()` 返回 3 档（明早 8:30 / 今晚 21:00 / 后天中午）
- [ ] **T-B3** `src/services/ai/multi-platform.ts`: mock `generateMultiPlatform(input)` 返回 3 平台变体
- [ ] **T-B4** `npx tsc --noEmit` 本目录 0 error

## 阶段 C：Store

- [ ] **T-C1** `src/stores/ai-store.ts`: 增 `publishTimeSlots[]` + `multiPlatformContents` + `loadPublishTimeSlots` + `loadMultiPlatform(contentId)` + `setPublishTimeSlot(slotId)` + 改 `buildPublish` 接受可选 `scheduledAt`
- [ ] **T-C2** reset 同步清 2 个新字段

## 阶段 D：UI

- [ ] **T-D1** `src/pages/publish-confirm/index.tsx`: 加"⏰ AI 推荐发布时间" 区块（3 档 + active + 点击 → setActiveSlot + onConfirm 写 scheduledAt）
- [ ] **T-D2** `src/pages/content/index.tsx`: 加"📤 多平台分发" 横排 chip + 3 mini 卡片 + "📋 一键复制全部平台版" 按钮
- [ ] **T-D3** `src/pages/next-plan/index.tsx`: 显示 publish.scheduledAt（"🕐 计划于 2026-07-08 21:00 发布"）
- [ ] **T-D4** SCSS 增量：time slot grid + platform chip strip + 平台卡片

## 阶段 E：测试

- [ ] **T-E1** `__tests__/services/publish-time.test.ts` (3 tests): 3 slot + shape + tonight roll
- [ ] **T-E2** `__tests__/services/multi-platform.test.ts` (4 tests): bundle × moments × xiaohongshu × shipinhao
- [ ] **T-E3** `npm test`: 41 v0.8 (14+14+13) + 7-10 PR-3 = 48-51 tests in 11 suites
- [ ] **T-E4** `npm run lint` 0 errors

## 阶段 F：守卫 + 文档 + 截图

- [ ] **T-F1** `scripts/smoke-weapp.mjs`: 加 '3 PR-3 publish time slots' + '3 platform IDs' (9 checks PASS)
- [ ] **T-F2** README.md V0.8 段标 PR-3 ✅
- [ ] **T-F3** CHANGELOG.md: v0.8.0-pr3 段
- [ ] **T-F4** 重渲染 screenshots：`publish-confirm.png` + `content.png` + `next-plan.png`

## 阶段 G：交付

- [ ] **T-G1** commit `feat(miniprogram): V0.8 PR-3 发布时间 + 多平台内容 (3 档 + 3 平台)`
- [ ] **T-G2** push `feature/v0-8-pr3-publish-time-multi-platform`
- [ ] **T-G3** `gh pr create` 提 PR #3
- [ ] **T-G4** CI run success + PM review + merge → 启动 PR-4
