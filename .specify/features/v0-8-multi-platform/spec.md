# 礼有方小程序 · V0.8 PR-3 · 发布时间 + 多平台内容（路线子 Spec）

**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §13 V0.8 #4 (发布时间优化) + #5 (多平台内容)
**对应路线图**：`.specify/features/v0-8-ai-operation/spec.md` §"V0.8 6 项增量 #4 #5"
**范围**：MVP v0.6 发布链路加发布时间建议 + 内容生成加 3 平台分发
**最后更新**：2026-07-06（提出，待 PM review）

---

## Feature Summary

把 v0.6 的"立即发布"升级为**"AI 推荐 3 档候选时间 + 用户择一"**，并把 v0.6 的"1 版文案"升级为**"3 平台格式分发"**（朋友圈 / 小红书 / 视频号），一键复制全部分发版。

```
[原 v0.6]                 [PR-3]
立即发布                  AI 推荐 3 档 → 选 1 档 → scheduledAt
1 版文案                  朋友圈 ≤ 6 行 + 小红书 ≤ 200 字 + 视频号 hook
```

`ai-store` 增 **`publishTimeSlots: PublishTimeSlot[]`** + **`multiPlatformContents: MultiPlatformBundle`**。

`publish-confirm` 页加 "⏰ AI 推荐发布时间" 区块（3 档候选 + active 高亮 + "稍后发布"）。

`content` 页加 "📤 多平台分发" 标签栏（朋友圈 / 小红书 / 视频号 3 chip 横排）。

---

## User Flows

### Flow 1：AI 发布时间（命中 PRD §6.4 §6.5）

1. 发布确认页 → 已有文案 / 封面 / 合规结果；
2. 新增 "⏰ AI 推荐发布时间" 区块：3 档候选（明早 8:30 / 今晚 21:00 / 后天中午）；
3. 用户点 1 档 → active 高亮 + "✓ 已选明早 8:30"；
4. "立即发布" → 走 v0.6 链路，scheduledAt 写入 publish；
5. "稍后发布" → 写 scheduledAt + 跳转 next-plan（next-plan 展示该任务）。

### Flow 2：多平台分发（命中 PRD §6.3 第 3 段）

1. 内容生成工作台 → 已有 6 风格 chip × 3 内容；
2. 新增 "📤 多平台分发" 标签栏（朋友圈 / 小红书 / 视频号）；
3. 用户点 chip → AI 用该平台规则改写（朋友圈 ≤ 6 行 / 小红书 ≤ 200 字 + emoji / 视频号 hook 段开头）；
4. 渲染 3 个 mini 卡片；
5. "📋 复制所有"按钮 → 一次性复制 3 平台版本。

---

## Acceptance Criteria

### 宪法级

- [ ] SDD 三件套（spec.md + plan.md + tasks.md）
- [ ] §6.1 平台 pin 形式不变
- [ ] §4 金额 `_fen` 整数（PR-3 不动金额）
- [ ] §5 不出现"保证出单"等话术
- [ ] §7.3 commit 前缀 `feat:`/`fix:`
- [ ] mock 接口形态 = ProviderCallResult

### PR-3 最小验收

| 项 | 验证 |
|---|---|
| #4 publishTimeSlots | ai-store 启动 loadPublishTimeSlots 后得到 3 档，slot.scheduledAt ISO + reason |
| #4 publish-confirm 区块 | "⏰ AI 推荐发布时间" 显示 3 档 + active 高亮 + 点击切换 |
| #4 scheduledAt 持久化 | 点 "立即发布" 后 next-plan 显示 scheduledAt |
| #5 multiPlatformChip | content 页 3 chip 横排 + active 高亮 |
| #5 朋友圈格式 | 改写后 ≤ 6 行 + emoji 自然 |
| #5 小红书格式 | 改写后 ≤ 200 字 + 含 emoji |
| #5 视频号格式 | 改写后 hook 开头（"今天发现..."/"重要的事..."） |
| #5 一键复制 | "📋 复制所有" 把 3 平台版本写 clipboard |
| smoke | "3 publish time slots + 3 platform IDs present in services" |
| 单测 | ≥ 8 个新单测 |

### 不在 PR-3 范围

- ❌ 真实 LLM（阶段二）
- ❌ 真实朋友圈 / 视频号 API 调用（mock）
- ❌ 用户跨用户时段数据（V1.0 推荐模型）
- ❌ "稍后发布" 真实定时（mock scheduledAt，无 setTimeout）

---

## PR 拆分

PR-3 = 1 个独立 PR（含 #4 + #5 合并），不拆 sub-PR：
- 文件改动 ~11 个
- 涉及 3 个页面 (publish-confirm + content + next-plan)
- 涉及 1 个 store 增 2 字段
- 不动 §4 数据不变量

---

## 待 PM 拍板

1. 平台 3 chip 名（**朋友圈 / 小红书 / 视频号** vs **朋友圈 / 视频号 / 公众号**）— 推"朋友圈 / 小红书 / 视频号"与 PRD §13 #5 一致
2. "复制所有"按钮文案 — 推 "📋 一键复制全部平台版"
3. 发布时间候选档默认 3 档（**明早 / 今晚 / 后天中午**）vs 4 档（加上"现在"）— 推 3 档
