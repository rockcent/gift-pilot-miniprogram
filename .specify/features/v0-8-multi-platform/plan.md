# 礼有方小程序 · V0.8 PR-3 发布时间 + 多平台内容 · 技术方案

**对应 Spec**：`.specify/features/v0-8-multi-platform/spec.md`
**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §13 V0.8 #4 + #5 + §6.3 第 3 段 + §6.4
**对应宪法**：`.specify/constitution.md`
**最后更新**：2026-07-06

---

## 技术栈 / 锁定

| 维度 | 选型 |
|---|---|
| 框架 | Taro 3.6 + React 18 + TS 5（复用 v0.6） |
| 状态 | `ai-store` 增 2 字段（**不动 memory-store**） |
| 平台 | `@rockcent/platform/web-client` 复用 pin |
| 数据 | mock-only |
| 视觉 | `--brand-*` 全局，**不引入新色** |

---

## 文件改动范围（PR-3 锁定 ~11 个）

| 类型 | 路径 | 改动 |
|---|---|---|
| 改 types | `src/types/index.ts` | 新增 `PublishTimeSlot` / `MultiPlatformBundle` / `PlatformId` |
| 改 store | `src/stores/ai-store.ts` | 增 `publishTimeSlots` + `multiPlatformContents` + 2 loaders + reset 同步 |
| 新 service | `src/services/ai/publish-time.ts` | mock `fetchPublishTimeSlots()` 返回 3 档 |
| 新 service | `src/services/ai/multi-platform.ts` | mock `generateMultiPlatform(input)` 返回 3 平台改写 |
| 改 page | `src/pages/publish-confirm/index.tsx` | 加"⏰ AI 推荐发布时间" 区块（3 档 + active + 选档 + scheduledAt） |
| 改 page | `src/pages/content/index.tsx` | 加"📤 多平台分发" chip 横排 + 3 mini 卡片 + 复制所有按钮 |
| 改 page | `src/pages/next-plan/index.tsx` | 加 "🕐 计划发布时间" 区块（如 publish 已 scheduled，显示绝对时间 + "到点提醒"） |
| 改 store | `src/stores/ai-store.ts` | `buildPublish` 增可选 `scheduledAt` 参数；新 action `setPublishTimeSlot` |
| 新测试 | `__tests__/services/publish-time.test.ts` | mock service + 3 档 shape |
| 新测试 | `__tests__/services/multi-platform.test.ts` | mock service + 3 平台文案格式 |
| 改 smoke | `scripts/smoke-weapp.mjs` | 新加 '3 PR-3 publish time slots + 3 platform IDs present' |
| 改 README + CHANGELOG | — | 同步 |

**估算 11 文件改动**。宪法 §7.2 ≥ 3 触发 SDD（本文件履行）。

---

## PR-3 详细设计

### D-1：`PublishTimeSlot` 类型

```ts
export interface PublishTimeSlot {
  id: 'tomorrow-morning' | 'tonight-evening' | 'day-after-noon';
  label: string;          // '明早 8:30'
  scheduledAt: string;    // ISO 'YYYY-MM-DDTHH:mm:ss.sssZ'
  reason: string;         // '受众多为上班族，清晨打开率高'
  expectedCtr: number;    // 0..1, 0.18
}
```

### D-2：`MultiPlatformBundle` 类型

```ts
export type PlatformId = 'moments' | 'xiaohongshu' | 'shipinhao';

export interface PlatformContent {
  platformId: PlatformId;
  title: string;          // '送同事的生日礼物灵感'
  body: string;           // 不同平台格式
  hashtags: string[];
  charLimit: number;      // 平台限制
  emojiRate: number;      // 实际 emoji 密度
}

export interface MultiPlatformBundle {
  source: ContentPiece;             // 引用的 v0.6 文案
  variants: PlatformContent[];       // 3 platform (moments/xiaohongshu/shipinhao)
  generatedAt: number;
}
```

### D-3：`ai-store` 扩展

```ts
interface AIState {
  // ... 现有 9 个字段 ...
  publishTimeSlots: PublishTimeSlot[];        // PR-3
  multiPlatformContents: MultiPlatformBundle | null;  // PR-3
  loadPublishTimeSlots: () => Promise<ProviderCallResult<PublishTimeSlot[]>>;
  loadMultiPlatform: (contentId: string) => Promise<ProviderCallResult<MultiPlatformBundle>>;
  setPublishTimeSlot: (slotId: string) => void;  // 写到 publish.scheduledAt
  reset: () => void;
}
```

### D-4：`services/ai/publish-time.ts` mock

```ts
function generateThreeSlots(now = new Date()): PublishTimeSlot[] {
  const tomorrow8 = new Date(now); tomorrow8.setDate(now.getDate() + 1); tomorrow8.setHours(8, 30, 0, 0);
  const tonight21 = new Date(now); tonight21.setHours(21, 0, 0, 0);
  if (tonight21.getTime() < now.getTime()) tonight21.setDate(tonight21.getDate() + 1);
  const dayAfter12 = new Date(now); dayAfter12.setDate(now.getDate() + 2); dayAfter12.setHours(12, 0, 0, 0);
  return [
    { id: 'tomorrow-morning',   label: '明早 8:30',  scheduledAt: tomorrow8.toISOString(), reason: '上班路上刷手机高峰', expectedCtr: 0.18 },
    { id: 'tonight-evening',    label: '今晚 21:00', scheduledAt: tonight21.toISOString(), reason: '睡前送礼决策时段', expectedCtr: 0.22 },
    { id: 'day-after-noon',     label: '后天中午',   scheduledAt: dayAfter12.toISOString(), reason: '周末礼物准备时段', expectedCtr: 0.15 }
  ];
}

export const publishTimeMock = {
  async fetchPublishTimeSlots(now?: Date): Promise<ProviderCallResult<PublishTimeSlot[]>> {
    await simulate(200);
    return okResult(generateThreeSlots(now));
  }
};
```

### D-5：`services/ai/multi-platform.ts` mock

```ts
export const multiPlatformMock = {
  async generateMultiPlatform(input: { sourceText: string; giftName: string }): Promise<ProviderCallResult<MultiPlatformBundle>> {
    await simulate(280);
    const variants: PlatformContent[] = [
      {
        platformId: 'moments',
        title: '送同事的灵感',
        body: [...input.sourceText].slice(0, 100).join('').replace(/[。；]/g, '\n').split('\n').slice(0, 6).join('\n'),
        hashtags: ['#生日礼物', '#同事'],
        charLimit: 100,
        emojiRate: 0.3
      },
      {
        platformId: 'xiaohongshu',
        title: '✨' + input.giftName + '推荐',
        body: (input.sourceText + ' 🎁🍃').slice(0, 200),
        hashtags: ['#礼物', '#好物推荐', '#生日'],
        charLimit: 200,
        emojiRate: 0.5
      },
      {
        platformId: 'shipinhao',
        title: '今天发现一个小心思',
        body: '今天发现：' + input.sourceText.slice(0, 50) + '…',
        hashtags: ['#送礼', '#生活'],
        charLimit: 80,
        emojiRate: 0.2
      }
    ];
    return okResult<MultiPlatformBundle>({ source: input as any, variants, generatedAt: Date.now() });
  }
};
```

### D-6：`publish-confirm` 页改造（关键点）

```tsx
const [activeSlot, setActiveSlot] = useState<string | null>(null);
const slots = useAIStore((s) => s.publishTimeSlots);
const loadSlots = useAIStore((s) => s.loadPublishTimeSlots);
const setPublishTimeSlot = useAIStore((s) => s.setPublishTimeSlot);

useEffect(() => { loadSlots(); }, []);

// 在 buildPublish 之前检查 activeSlot
const onConfirm = () => {
  if (!recommendation || !contents.length || !cover) return;
  const slot = slots.find((s) => s.id === activeSlot);
  const pub = buildPublish(recommendation.id, contents[0].id, cover.id, channels, slot?.scheduledAt ?? null);
  setPublishTimeSlot(activeSlot ?? 'now');
  confirmPublish();
  Taro.navigateTo({ url: '/pages/publish-success/index' });
};

// 渲染区块（在 cover / 合规结果 之后）
<View className="gp-pub__time">
  <Text className="gp-pub__time-title">⏰ AI 推荐发布时间</Text>
  {slots.map((slot) => (
    <View key={slot.id} className={`gp-pub__time-slot ${activeSlot === slot.id ? 'gp-pub__time-slot--active' : ''}`}
      onClick={() => setActiveSlot(slot.id)}>
      <Text className="gp-pub__time-label">{slot.label}</Text>
      <Text className="gp-pub__time-reason">{slot.reason}</Text>
      <Text className="gp-pub__time-ctr">预估打开率 {(slot.expectedCtr * 100).toFixed(0)}%</Text>
    </View>
  ))}
</View>
```

### D-7：`content` 页改造（关键点）

```tsx
const [activePlatform, setActivePlatform] = useState<PlatformId>('moments');
const platforms = useAIStore((s) => s.multiPlatformContents);
const loadMulti = useAIStore((s) => s.loadMultiPlatform);

useEffect(() => {
  if (contents.length > 0 && !platforms) loadMulti(contents[0].id);
}, [contents, platforms]);

<ScrollView scrollX className="gp-content__platform-strip">
  {['moments', 'xiaohongshu', 'shipinhao'].map((id) => (
    <View key={id} className={`gp-content__platform-chip ${activePlatform === id ? 'gp-content__platform-chip--active' : ''}`}
      onClick={() => setActivePlatform(id)}>
      <Text>{PLATFORM_LABEL[id]}</Text>
    </View>
  ))}
</ScrollView>

{platforms?.variants && (
  <View className="gp-content__platform-cards">
    {platforms.variants.map((v) => (
      <View key={v.platformId} className="gp-content__platform-card">
        <Text className="gp-content__platform-card-title">{v.title}</Text>
        <Text>{v.body}</Text>
      </View>
    ))}
  </View>
)}

<View className="gp-btn gp-btn--outline" onClick={() => {
  const all = platforms?.variants.map((v) => `[${v.platformId}] ${v.body}`).join('\n\n---\n\n') ?? '';
  Taro.setClipboardData({ data: all });
  Taro.showToast({ title: '已复制 3 个平台版本', icon: 'success', duration: 1500 });
}}>
  <Text>📋 一键复制全部平台版</Text>
</View>
```

### D-8：`next-plan` 页改造

```tsx
const publish = useAIStore((s) => s.publish);

// 在 publish 列表区（如有 scheduledAt 显示）
{nextPlanItems.map((it) => (
  <View key={it.id} className="gp-next__item">
    <Text>{it.title}</Text>
    {it.scheduledAt && (
      <Text className="gp-next__scheduled">🕐 计划于 {formatDate(it.scheduledAt)} 发布</Text>
    )}
  </View>
))}
```

### D-9：单测（≥ 8 个）

```ts
// __tests__/services/publish-time.test.ts
test('returns exactly 3 PR-3 publish time slots', async () => { ... });
test('each slot has id + label + scheduledAt ISO + reason + expectedCtr', async () => { ... });
test('tonight-evening rolls to next day when past 21:00', async () => { ... });

// __tests__/services/multi-platform.test.ts
test('returns bundle with 3 platform variants', async () => { ... });
test('moments variant ≤ 6 lines', async () => { ... });
test('xiaohongshu variant ≤ 200 chars with emoji', async () => { ... });
test('shipinhao variant starts with hook phrase', async () => { ... });
```

### D-10：smoke 增量

```js
const ptPath = path.join(ROOT, 'src/services/ai/publish-time.ts');
if (fs.existsSync(ptPath)) {
  const body = fs.readFileSync(ptPath, 'utf8');
  const slotIds = ['tomorrow-morning', 'tonight-evening', 'day-after-noon'];
  for (const id of slotIds) if (!body.includes(id)) bad('V0.8 PR-3 publish time slot missing: ' + id);
  if (!errs.some((e) => e.startsWith('V0.8 PR-3 publish time'))) ok('all 3 V0.8 PR-3 publish time slots present');
}
const mpPath = path.join(ROOT, 'src/services/ai/multi-platform.ts');
if (fs.existsSync(mpPath)) {
  const body = fs.readFileSync(mpPath, 'utf8');
  for (const id of ['moments', 'xiaohongshu', 'shipinhao']) if (!body.includes(id)) bad('V0.8 PR-3 platform missing: ' + id);
  if (!errs.some((e) => e.startsWith('V0.8 PR-3 platform'))) ok('all 3 V0.8 PR-3 platform IDs present');
}
```

---

## 风险与防御

| 风险 | 防御 |
|---|---|
| 用户不选时区错乱 | 用 ISO 字符串，所有时间以 UTC 表达 |
| moment 内容被截断 | charLimit 标记 + UI 显示 "…" |
| chip 切错平台 | activePlatform store-based |
| scheduledAt 与 confirmPublish 时序 | buildPublish 一次性写入；setPublishTimeSlot 仅写 meta |
| smoke 校验路径 | 文件存在才检 (cross-version 友好) |

---

## 不在 PR-3 范围

- ❌ 真实朋友圈 / 视频号 / 小红书 API
- ❌ 真实 LLM
- ❌ 时段学习（V1.0）
- ❌ 跨平台 A/B 测试（V1.0）

---

## 交付节点

| # | 节点 |
|---|---|
| N1 | SDD 三件套 ✅（本文件） |
| N2 | PM review 拍板 plan §"待 PM 拍板" 3 题 — **等 PM** |
| N3-N7 | types + stores + services + 3 pages + ContentCard 用 onRemember |
| N8 | 8+ jest 单测 |
| N9 | smoke + README + CHANGELOG + 截图 |
| N10 | push + PR #3 + CI green + merge |

---

## 待 PM 拍板

1. 平台 3 chip 名：朋友 / 小红书 / 视频号（**推荐与 PRD §13 #5 一致**）vs 朋友圈 / 视频号 / 公众号（v0.6 现有 PublishChannel）
2. "复制所有" 按钮文案：**"📋 一键复制全部平台版"** vs 简洁 "📋 复制全部"
3. 发布时间候选档默认 **3 档**（明早 / 今晚 / 后天中午）vs 4 档（加上"现在"立即发布）
