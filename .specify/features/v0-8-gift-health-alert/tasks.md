# V0.8 PR-4 商品替换提醒 · 执行稿

**Spec**：`.specify/features/v0-8-gift-health-alert/spec.md`
**Plan**：`.specify/features/v0-8-gift-health-alert/plan.md`（**必须人工 review 通过**）
**PR 范围**：#6 商品替换提醒

---

## 阶段 A：前置

- [ ] **T-A1** `feature/v0-8-pr4-gift-health-alert` 分支已建（基于 main 含 PR-3 squash `74003b6`）
- [ ] **T-A2** SDD 三件套（spec.md / plan.md / tasks.md）commit
- [ ] **T-A3** PM review plan.md 3 个 yes/no 问题

## 阶段 B：类型 + 数据 + 服务

- [ ] **T-B1** `src/types/index.ts`: `GiftHealthStatus` + `GiftHealthStat` + `GiftHealthFlag` + `GiftReplacement` + `GIFT_HEALTH_STATUSES`
- [ ] **T-B2** `src/services/ai/gift-health.ts`: mock `fetchGiftHealthFlags(giftIds)` 返回 N 个 flag + `replaceGift(giftId)` 返回 replacement
- [ ] **T-B3** `npx tsc --noEmit` 本目录 0 error

## 阶段 C：Store

- [ ] **T-C1** `src/stores/ai-store.ts`: 增 `giftHealthFlags[]` + `lastReplacement` + `loadGiftHealthFlags(giftIds)` + `replaceGift(giftId)` + reset 同步
- [ ] **T-C2** `replaceGift` 成功后写回 `recommendation.gifts` 对应索引

## 阶段 D：UI

- [ ] **T-D1** `src/pages/review/index.tsx`: 加 "🎁 推荐礼物健康度" 区块（按 healthy → cooling → fading 排序）
- [ ] **T-D2** `src/pages/review/index.scss`: 健康徽章 3 色（绿/杏/珊瑚）+ reason 文案 + 换品按钮样式

## 阶段 E：测试

- [ ] **T-E1** `__tests__/services/gift-health.test.ts` (5+ tests): 3 status shape + reason 文案 + replaceGift 新旧对比 + null recommendation 容错
- [ ] **T-E2** `npm test`: 51 v0.8 (14+14+13+10) + 5+ PR-4 = 56-58 tests in 12-13 suites
- [ ] **T-E3** `npm run lint` 0 new errors

## 阶段 F：守卫 + 文档 + 截图

- [ ] **T-F1** `scripts/smoke-weapp.mjs`: 加 '3 PR-4 gift health status enum values present in types' + 'gift-health.ts service file present'
- [ ] **T-F2** README.md V0.8 段标 PR-4 ✅
- [ ] **T-F3** CHANGELOG.md: v0.8.0-pr4 段
- [ ] **T-F4** 重渲染 screenshots：`review.png`

## 阶段 G：交付

- [ ] **T-G1** commit `feat(miniprogram): V0.8 PR-4 商品替换提醒 (3 档健康度 + 1 键换品)`
- [ ] **T-G2** push `feature/v0-8-pr4-gift-health-alert`
- [ ] **T-G3** `gh pr create` 提 PR #4
- [ ] **T-G4** CI run success + PM review + merge → V0.8 完结
