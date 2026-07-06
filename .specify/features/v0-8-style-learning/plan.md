# 礼有方小程序 · V0.8 PR-2 风格学习 · 技术方案

**对应 Spec**：`.specify/features/v0-8-style-learning/spec.md`
**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §13 V0.8 #3 + §6.3 文案风格扩展
**对应宪法**：`.specify/constitution.md`
**最后更新**：2026-07-06

---

## 技术栈 / 锁定

| 维度 | 选型 |
|---|---|
| 框架 | Taro 3.6 + React 18 + TS 5（复用 v0.6） |
| 状态 | Zustand 4：`memory-store` 扩展（**不动 ai-store**） |
| 平台 | `@rockcent/platform/web-client` + `ai`（复用 v0.6 pin） |
| 数据 | mock-only，PR-2 不接后端 |
| 视觉 token | `--brand-*` 全局（宪法 §6.2） |

**为什么动 memory-store 而非 ai-store**：PR-2 是"AI 记忆可学习"，数据归属用户。ai-store 是"AI 当次会话状态"。

---

## 文件改动范围（PR-2 锁定 ~8 个）

| 类型 | 路径 | 改动 |
|---|---|---|
| 改 types | `src/types/index.ts` | 新增 `StyleId` / `StyleProfile` / `StyleChipMeta` |
| 改 store | `src/stores/memory-store.ts` | 增 `styleProfile` + `rememberStyle(id)` + `applyPersonalization(text, profile)` 等 |
| 新 service | `src/services/ai/style.ts` | mock: `learnFromEdit` + `generatePersonal` + `chipMetaList` |
| 改 page | `src/pages/content/index.tsx` | 6 chip 横排 + "📌 记住这个风格" 按钮 + "personal" 自动注入 emojiRate/sentenceLen |
| 改 page | `src/pages/memory/index.tsx` | 加"风格档案" 区块（6 chip + 各自 used + lastUsed） |
| 改组件 | `src/components/content-card/content-card.tsx` | 加 "📌" 按钮 |
| 新测试 | `__tests__/services/style.test.ts` | mock service + 6 chip 数据 |
| 新测试 | `__tests__/stores/memory-style.test.ts` | rememberStyle + clear |
| 改 smoke | `scripts/smoke-weapp.mjs` | 加 '6 chip data present' 检查 |
| 改 README + CHANGELOG | — | 同步 |

**估算 ~9 文件改动**。宪法 §7.2 ≥ 3 触发 SDD（本文件履行）。

---

## PR-2 详细设计

### D-1：`StyleId` + `StyleProfile` 类型

```ts
// src/types/index.ts 追加
export type StyleId = 'share' | 'review' | 'emotion' | 'personal' | 'professional' | 'funny';

export interface StyleChipMeta {
  id: StyleId;
  label: string;          // '自然分享'
  emoji: string;          // '✨'
  description: string;    // '温暖随性，像自己发朋友圈'
  presetStyle: 'share' | 'review' | 'emotion';   // 复制 v0.6 已有 3 种之一
  isPersonalized: boolean;   // personal 为 true
}

export interface StyleUsageStat {
  used: number;             // 用户手动 "📌" 次数
  lastUsedAt: number | null;
}

export interface StyleProfile {
  weights: Record<StyleId, StyleUsageStat>;  // 6 keys, default used=0
  sentenceLen: 'short' | 'medium' | 'long';     // 用户行为推断（personal 用）
  emojiRate: number;                             // 0..1, 默认 0.3
  totalEdits: number;                            // 用户编辑过的次数
  learnedAt: number | null;
}
```

### D-2：`style-chip-meta` 静态数据（6 个）

```ts
export const STYLE_CHIPS: StyleChipMeta[] = [
  { id: 'share',        label: '自然分享',     emoji: '✨', description: '温暖随性，像发朋友圈',     presetStyle: 'share',     isPersonalized: false },
  { id: 'review',       label: '实用推荐',     emoji: '📋', description: '理性对比，简明扼要',       presetStyle: 'review',    isPersonalized: false },
  { id: 'emotion',      label: '情绪价值',     emoji: '💗', description: '有画面感，不喊口号',       presetStyle: 'emotion',   isPersonalized: false },
  { id: 'personal',     label: '个性化',       emoji: '🎯', description: '基于你的风格档案生成',     presetStyle: 'share',     isPersonalized: true },
  { id: 'professional', label: '专业',         emoji: '💼', description: '克制冷静，适合 B 端',       presetStyle: 'review',    isPersonalized: false },
  { id: 'funny',        label: '轻松幽默',     emoji: '😄', description: '年轻同事聚会首选',          presetStyle: 'share',     isPersonalized: false }
];
```

### D-3：`memory-store` 扩展

```ts
interface MemoryState {
  memory: AIMemory;             // v0.6 已有（含 preferred_styles: string[]）
  styleProfile: StyleProfile;   // PR-2 新加
  rememberStyle: (id: StyleId) => void;
  updateStyleProfile: (patch: Partial<StyleProfile>) => void;
  applyPersonalStyle: (text: string, id: StyleId) => string;
  resetStyleProfile: () => void;
  clear: () => void;             // 也 reset styleProfile
}
```

**`rememberStyle` 行为**：
- 找到当前 `StyleId` 对应的 `StyleUsageStat`
- `used += 1` + `lastUsedAt = now` + `totalEdits += 1`

**`applyPersonalStyle`**：
- 仅当 `id === 'personal'` 生效
- 按 `sentenceLen` 截断（short / medium / long）
- 按 `emojiRate` 注入 emoji（在每句头/尾随机位置）
- 否则返回原 text（function pure）

### D-4：`services/ai/style.ts` mock

```ts
export const styleMock = {
  async learnFromEdit(input: { styleId: StyleId; originalText: string; editedText: string; }): Promise<ProviderCallResult<StyleUsageStat>> {
    await simulate();
    const newStat: StyleUsageStat = { used: 1, lastUsedAt: Date.now() };
    return okResult(newStat);
  },

  async generatePersonal(input: { baseText: string; profile: StyleProfile; }): Promise<ProviderCallResult<string>> {
    await simulate();
    // 用 emojiRate / sentenceLen 改写
    let out = input.baseText;
    if (input.profile.emojiRate > 0.5) out = sprinkleEmojis(out, 0.4);
    out = truncateByLength(out, input.profile.sentenceLen);
    return okResult(out);
  },

  getChipMetaList(): StyleChipMeta[] {
    return STYLE_CHIPS;
  }
};
```

### D-5：`pages/content/index.tsx` 改造

```tsx
const [activeStyleId, setActiveStyleId] = useState<StyleId>('share');

const chips = useMemo(() => styleMock.getChipMetaList(), []);
const onPickChip = async (id: StyleId) => {
  setActiveStyleId(id);
  const chip = chips.find((c) => c.id === id);
  if (!chip) return;
  const base = await aiMock.generateContent(giftId, chip.presetStyle);
  let text = base.data?.[0]?.body ?? '';
  if (chip.isPersonalized) {
    const personalized = await styleMock.generatePersonal({ baseText: text, profile: useMemoryStore.getState().styleProfile });
    text = personalized.data ?? text;
  }
  // set contents
};

const onRememberStyle = () => {
  useMemoryStore.getState().rememberStyle(activeStyleId);
};

// 横排 6 chip（ScrollView horizontal）
<ScrollView scrollX className="gp-content__chips">
  {chips.map((c) => (
    <View
      key={c.id}
      className={`gp-content__chip ${activeStyleId === c.id ? 'gp-content__chip--active' : ''}`}
      onClick={() => onPickChip(c.id)}
    >
      <Text>{c.emoji}</Text>
      <Text>{c.label}</Text>
    </View>
  ))}
</ScrollView>

// 当前文案下方 "📌" 按钮
<View className="gp-btn gp-btn--outline" onClick={onRememberStyle}>
  <Text>📌 记住这个风格</Text>
</View>
```

### D-6：`pages/memory/index.tsx` 加"风格档案"区块

```tsx
const styleProfile = useMemoryStore((s) => s.styleProfile);
const rememberStyle = useMemoryStore((s) => s.rememberStyle);
const resetStyleProfile = useMemoryStore((s) => s.resetStyleProfile);

<View className="gp-memory__style">
  <Text className="gp-h2">风格档案</Text>
  <View className="gp-memory__chips">
    {chips.map((c) => {
      const stat = styleProfile.weights[c.id];
      return (
        <View key={c.id} className="gp-memory__chip" onClick={() => rememberStyle(c.id)}>
          <Text>{c.emoji} {c.label}</Text>
          <Text className="gp-memory__chip-stat">已用 {stat.used} 次</Text>
          {stat.lastUsedAt && <Text className="gp-caption">最近 {formatTimeAgo(stat.lastUsedAt)}</Text>}
        </View>
      );
    })}
  </View>
  <Text className="gp-caption">小礼会记住你喜欢的风格，下次自动靠近。</Text>
  <View className="gp-btn gp-btn--text" onClick={resetStyleProfile}>
    <Text>重置风格档案</Text>
  </View>
</View>
```

### D-7：测试覆盖（≥12 个新单测）

```ts
// __tests__/services/style.test.ts
test('STYLE_CHIPS has exactly 6 entries', () => { ... });
test('each chip has unique id, label, emoji', () => { ... });
test('learnFromEdit returns ok with used=1 + lastUsedAt', async () => { ... });
test('generatePersonal shortens text when sentenceLen=short', async () => { ... });
test('generatePersonal sprinkles emojis when emojiRate>0.5', async () => { ... });
test('generatePersonal returns base text when emojiRate=0', async () => { ... });

// __tests__/stores/memory-style.test.ts
test('styleProfile initial has all 6 styles with used=0', () => { ... });
test('rememberStyle(id) increments weight[id].used by 1', () => { ... });
test('rememberStyle(id) updates lastUsedAt', () => { ... });
test('resetStyleProfile zeroes all weights', () => { ... });
test('clear() also resets styleProfile', () => { ... });
test('applyPersonalStyle returns base when id!=personal', () => { ... });
test('applyPersonalStyle modifies when id=personal with emojiRate>0.5', () => { ... });
```

### D-8：smoke 增量

```js
// scripts/smoke-weapp.mjs 在 AI 6 labels 检查之后插入：
const styleChipPath = path.join(ROOT, 'src/services/ai/style.ts');
const styleChipBody = fs.readFileSync(styleChipPath, 'utf8');
const sixStyleIds = ['share','review','emotion','personal','professional','funny'];
for (const id of sixStyleIds) {
  if (!styleChipBody.includes(`'${id}'`)) bad('V0.8 PR-2 style missing: ' + id);
}
if (!errs.some((e) => e.startsWith('V0.8 PR-2'))) ok('all 6 V0.8 PR-2 style IDs present in style.ts');
```

---

## 风险与防御

| 风险 | 防御 |
|---|---|
| 记忆跨 tab 显示错乱 | `useMemoryStore` Zustand single source of truth |
| 个性化生成阻断等 2s | mock 800ms + skeleton |
| 用户清空需要双重确认 | 二次 dialog |
| 风格权重视图频繁重渲染 | useMemo on `weights` shallow |
| 现有 `ContentPiece.type` 4.5 兼容 | `StyleId` 新枚举不影响 v0.6 ContentPiece.type |
| `AIMemory.preferred_styles` 字段保留 | v0.6 用户偏好仍写那里；styleProfile 是新结构 |
| styles/[id].emoji 表情兼容 | emoji 字符是 Unicode，Taro 渲染通用 |

---

## 不在 PR-2 范围

- ❌ 真实 LLM（阶段二）
- ❌ 风格融合（V1.0）
- ❌ 跨用户风格共享（§4.6 禁）
- ❌ 风格档案导出 JSON
- ❌ 历史文案语料学习

---

## 交付节点

| # | 节点 |
|---|---|
| N1 | SDD 三件套 ✅ (本文件 + spec.md + tasks.md) |
| N2 | PM review 拍板本 plan（**等 PM**） |
| N3 | types + memory-store + 新 service 实现 |
| N4 | content 页 6 chip 横排 + 📌 按钮 |
| N5 | memory 页 风格档案 + reset 按钮 |
| N6 | ContentCard 组件 📌 按钮 |
| N7 | 12+ 个 jest 单测 |
| N8 | smoke 检查 + README + CHANGELOG + 截图 |
| N9 | push feature 分支 + 提 PR + CI green + PM review + merge |

---

## 待 PM 拍板

1. chip 数 6（PRD §6.3 一致）vs 4（精简）— **推 6**
2. 是否要 PR-2 merge 后加 push trigger 直接 deploy（min 仅 smoke，不 deploy）— **推 yes**
3. 风格档案"重置"按钮文字 — **推 "重置风格档案"**
