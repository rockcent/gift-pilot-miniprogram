# 礼有方小程序 · V0.8 PR-4 · 商品替换提醒（路线子 Spec）

**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §13 V0.8 #6 (商品替换提醒)
**对应路线图**：`.specify/features/v0-8-ai-operation/spec.md` §"V0.8 6 项增量 #6"
**范围**：复盘页加每个推荐礼物的健康状态徽章 + 1 键"换新品"
**最后更新**：2026-07-07（提出，待 PM review）

---

## Feature Summary

把 v0.6 "复盘只看数字" 升级为 **"复盘 + 商品健康度 + 1 键换新品"**：

```
[原 v0.6]                 [PR-4]
只看总发布/订单/佣金       每个推荐礼物加 🟢🟡🔴 健康徽章 + reason
无换品能力                 🟡🔴 显示 "建议替换理由" + 1 键"换新品"
```

`ai-store` 增 **`giftHealthFlags: GiftHealthFlag[]`** + **`lastReplacement: GiftReplacement | null`**。

`review` 页加 "🎁 推荐礼物健康度" 区块（按 🟢→🟡→🔴 排序，每行：礼物缩略 + 状态徽章 + 原因 + 🟡🔴 行尾"换新品"按钮）。

---

## User Flows

### Flow 1：复盘查看商品健康（命中 PRD §6.6）

1. 经营复盘页 → 已有 KPI Bar + 数据亮点 + 下周建议；
2. 新增 "🎁 推荐礼物健康度" 区块：3 档徽章 🟢 健康 / 🟡 衰减 / 🔴 衰退；
3. 每行显示：礼物缩略图 + 名称 + 7 日订单 + 点击率 + 健康原因；
4. 🟢 行：仅徽章，无按钮；
5. 🟡🔴 行：行尾 "换新品" 按钮 + reason 文案。

### Flow 2：1 键换新品（命中 PRD §6.6 第 2 段）

1. 用户在 🟡🔴 行点击 "换新品"；
2. AI 调用 `replaceGift(giftId)` mock service；
3. 新礼品替换：返回新 `Gift` 对象（不同 ID / title / image / 价格）；
4. `ai-store.recommendation.gifts` 中对应索引替换；
5. 对应 `Publish` 记录（若有）写入 `replaced_by_gift_id`；
6. toast 显示 "✅ 已换为 XX"。

---

## Acceptance Criteria

### 宪法级

- [ ] SDD 三件套（spec.md + plan.md + tasks.md）
- [ ] §6.1 平台 pin 形式不变
- [ ] §4 金额 `_fen` 整数（PR-4 不动金额）
- [ ] §5 不出现"保证出单"等话术
- [ ] §7.3 commit 前缀 `feat:`/`fix:`
- [ ] mock 接口形态 = ProviderCallResult

### PR-4 最小验收

| 项 | 验证 |
|---|---|
| 健康状态 mock | `fetchGiftHealthFlags()` 返回 N 个 flag，每 flag 含 giftId + status + reason + stats |
| 健康徽章 3 档 | review 页每行礼物前显示 🟢/🟡/🔴 圆形徽章 |
| 排序逻辑 | 🟢 在前 → 🟡 → 🔴 |
| 衰减 reason | 🟡 行显示 "7 天仅 X 笔订单 / 点击率 X%" 简明原因 |
| 衰退 reason | 🔴 行显示 "已 X 天无点击" 或 "出现 X 单退款" |
| 1 键换品 | 🟡🔴 行 "换新品" 按钮触发 mock service |
| 替换写回 | ai-store.recommendation.gifts 中被替换索引更新；新 giftId 写入 |
| toast 反馈 | toast 显示 "✅ 已换为 XX" |
| smoke | "3 PR-4 health status enum values present in types" |
| 单测 | ≥ 5 个新单测 |

### 不在 PR-4 范围

- ❌ 真实 LLM（阶段二）
- ❌ 真实点击 / 转化追踪（mock stats）
- ❌ 跨礼物维度推荐模型（V1.0）
- ❌ 自动换品（仅 1 键手动触发）
