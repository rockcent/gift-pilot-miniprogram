# 礼有方小程序 · V0.8 PR-2 · 风格学习（路线子 Spec）

**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §13 V0.8 第 3 项
**对应路线图**：`.specify/features/v0-8-ai-operation/spec.md` §"V0.8 6 项增量 #3"
**范围**：MVP v0.6 文案风格 3 → 6 chip + 用户风格档案持久化 + AI 记忆可学习
**最后更新**：2026-07-06（提出，待 PM review）

---

## Feature Summary

把"风格"从 v0.6 的**固定 3 种文案**（share/review/emotion）升级为**6 种风格 chip + 用户学习档案**：

```
[原有 3 chip]                [新增 3 chip]
share  自然分享           → personal  个性化（基于 memory 学）
review 实用推荐           → professional 专业（克制）
emotion 情绪价值          → funny      轻松幽默
```

`memory-store` 增 **`styleProfile: StyleProfile`**（v0.6 已有 `preferred_styles: string[]`，PR-2 升级为结构化对象）。

`content-card` 加"📌 记住这个风格" 按钮：把当前选中的 style + 用户微调反馈写回 `styleProfile`。

`memory` 页加"风格档案" 区块。

---

## User Flows

### Flow 1：6 chip 切换（核心，命中 PRD §6.3 文案风格扩展）

1. 内容生成工作台 → 顶部 chip 区；
2. 6 个 chip 横排（share / review / emotion / personal / professional / funny）；
3. 用户点 chip → AI 用 mock 重新生成该风格的文案；
4. 用户看 3 版文案 + 评分。

### Flow 2：风格学习（命中 Flow 2 §III）

1. 用户对当前文案做"编辑 1 行" 或 "📌 记住这个风格" 按钮点击；
2. `styleMock.learnFromEdit({ styleId, originalText, editedText })` 异步 mock；
3. 写入 `memory-store.styleProfile.weights[styleId] += 1` + `lastUsedAt = now`；
4. memory 页"风格档案"展示 6 chip 各自的 used + lastUsed。

### Flow 3：个性化生成（命中 Flow 2 §III）

1. 用户点 chip "personal"（个性化）；
2. `styleMock.generate({ styleId: 'personal', baseStyle: aiMock.generateContent() })` 合并 styleProfile 的 emojiRate / sentenceLen；
3. 文案表现出偏好特征（emoji 多 / 短句多）。

---

## Acceptance Criteria

### 宪法级（自动卡死）

- [ ] SDD 流程：spec.md（本文件）+ plan.md + tasks.md 三件套
- [ ] §6.1 平台 pin 形式不变（仍 `git+https://...#platform-vX.Y.Z`）
- [ ] §4 金额 `_fen` 整数（PR-2 不动金额，但 smoke 自动检查）
- [ ] §5.5 不引入"保证出单"等话术；§5.2 推荐必给理由
- [ ] §6 AI 记忆属于用户私有，UI 保留一键清空入口（memory 页"清空"按钮仍保留）
- [ ] §7.3 commit `feat: / fix: ...` 前缀
- [ ] mock 接口形态 = ProviderCallResult，与 §6 + §8.2 一致

### PR-2 最小验收

| 项 | 验证 |
|---|---|
| chip 数 | content 页横排 6 chip，旧 3 chip 内容仍在；新 3 chip 各显示图标 + 名称 |
| 切换响应 | 点 chip 切换 → 文案在 ≤2.2 s 内更新 + 显示 style_label + quality_score |
| "📌 记住这个风格" 按钮 | 点击后 styleProfile.weights[styleId] += 1，刷新 memory 页可见 |
| 风格档案展示 | memory 页显示 6 个 chip 当前 used 计数 + 最近使用时间 |
| 个性化生成 | 点 personal chip，文案 emoji 增加 + sentenceLen 缩短 |
| AI 记忆"清空" | memory-store.clear() 也清空 styleProfile，UI 同步 |
| 单测 | ≥ 12 个新单测（6 chip 切换 + styleProfile reducer + 个性化生成 mock + clear） |

### 不在 PR-2 范围

- ❌ 真实 LLM 接入（阶段二）
- ❌ 风格权重 > 1 时的"风格融合"（V1.0）
- ❌ 跨用户风格共享（§4.6 宪法禁止）
- ❌ 历史文案语料机器学习（V1.0）

---

## PR 拆分（提议）

PR-2 = 1 个独立 PR，不拆 sub-PR。理由：

- 改动 ≈ 8 个文件（含 1 个 mock service / 1 个 store 加字段 / 1 个 type / 2 个新测试 / 2 页面改 / 1 文案 chip）
- 跨页面 <= 3 (content + memory + ContentCard 组件)，宪法 §7.2 "3 个以上文件走 SDD" 触发，但跨页面不深，1 PR 可控
- 不动 §4 数据不变量、不动 mock 数据
- 主 store 仅 memory 增量（PR-1 已加 weekPlan，PR-2 不冲突）

---

## 待 PM 拍板

1. PR-2 chip 数严格 6 vs 4（"删 share 或 emotion chip，保留其余")— 推 6 与 PRD §6.3 文案风格对齐
2. PR-2 是否包括"风格档案导出"功能 — 推否（V1.0 再说）
3. PR-2 merge 后是否要把 push trigger 也加上（push 触发 CI，PR 走 PR CI）— 推 yes 给 push trigger
4. 风格学习用户可见提示文案 — 当前拟用 "📌 小礼会记住你喜欢的风格，下次自动靠近"
