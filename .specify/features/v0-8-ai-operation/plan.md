# 礼有方小程序 · V0.8 PR-1 技术方案

**对应 Spec**：`.specify/features/v0-8-ai-operation/spec.md`
**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §13 V0.8（#1 周经营计划 + #2 节日机会）
**对应宪法**：`.specify/constitution.md`（最高不变量）
**最后更新**：2026-07-06（提出，待 PM review 后实施）

---

## 技术栈与依赖

| 维度 | 选型 | 备注 |
|---|---|---|
| 框架 | Taro 3.6 + React 18 + TS 5 | 复用 v0.6 |
| 状态 | Zustand 4 | `ai-store` 增字段，**不新建 store** |
| 平台 | `@rockcent/platform/web-client` + `ai` + `usage` | 复用 v0.6 pin |
| 数据 | mock-only（PR-1 不接真实后端） | 与 §8.2 一致 |
| 视觉 token | `styles/tokens.scss` 复用 | 视觉与 v0.6 完全一致（宪法 §6.2） |

---

## 文件改动范围（PR-1 锁定）

| 类型 | 路径 | 改动 |
|---|---|---|
| 新页面 | `src/pages/week-plan/index.tsx` + `.scss` | 新建 |
| 新组件 | `src/components/festival-card/festival-card.tsx` + `.scss` | 新建 |
| 改 store | `src/stores/ai-store.ts` | 新增 `weekPlan: WeekPlan` + `festivalOpportunities: Festival[]` |
| 改 service | `src/services/ai/plan.ts` + `services/ai/festival.ts` | 新建两个 mock service |
| 改数据 | `src/data/mock-week-plan.json` + `mock-festivals.json` | 新建 mock 数据 |
| 改页面 | `src/pages/index/index.tsx` | 加"今日计划"卡 + "节日机会"卡 |
| 改样式 | `src/pages/index/index.scss` | 视觉与 token 一致 |
| 改测试 | `__tests__/ai-plan.test.ts` + `ai-festival.test.ts` | 新建，覆盖 mock + reducer + 卡片渲染 |
| 改 README | `README.md` | 同步 PR-1 范围（§MVP 范围增 #1 #2） |

**估算 8 个新文件 + 2 个改动文件 = 10 个文件** — 跨宪法 §7.2 的"≥3 个文件"阈值，**走 SDD**（本文件即履行）。

---

## PR-1 详细设计

### D-1：`ai-store` 新增字段

```ts
export interface WeekPlan {
  weekId: string;                    // '2026-W27'
  startDate: string;                 // ISO
  days: Array<{
    date: string;                    // YYYY-MM-DD
    tasks: Array<{
      id: string;                    // uuid
      title: string;                 // '母亲节贺卡'
      scene: 'birthday' | 'festival' | 'campaign' | 'routine';
      expectedSlots: number;         // 期望素材量
      status: 'pending' | 'in_progress' | 'done' | 'skipped';
    }>;
  }>;
  weeklyKpi: { publishTarget: number; commissionTargetFen: number };
}

export interface FestivalOpportunity {
  id: string;                        // 'mother-day-2026'
  name: string;                      // '母亲节'
  startDate: string;                 // ISO
  endDate: string;
  daysAway: number;
  recommendedRelations: Array<'mother' | 'wife' | 'grandma'>;
  hotGifts: string[];                // mock gift IDs
  aiPitch: string;                   // AI 推荐语气（一句话）
}

// ai-store.ts
interface AIState {
  // ... 现有字段 ...
  weekPlan: WeekPlan | null;
  festivalOpportunities: FestivalOpportunity[];
  loadWeekPlan: () => Promise<void>;        // mock，5s 后 resolve
  loadFestivalOpportunities: () => Promise<void>;
}
```

### D-2：今日计划卡片（index 页）

```tsx
// src/pages/index/index.tsx 新组件
<View className="gp-today-card">
  <Text className="gp-today-title">📅 今日计划</Text>
  {weekPlan ? (
    <View className="gp-today-row">
      <Text>本周还剩 {pendingTasks} 条任务</Text>
      <Text>本周已赚 {earnedYuan} 元 / 目标 {kpiYuan} 元</Text>
      <View className="gp-today-cta" onClick={goWeekPlan}>查看一周计划 →</View>
    </View>
  ) : (
    <View className="gp-today-empty">
      <Text>小礼正在整理本周计划…</Text>
    </View>
  )}
</View>
```

视觉：与 v0.6 gift-card 同色板（策绿 #23B26D 作背景），全宽圆角。**不引入新色**（宪法 §2）。

### D-3：`pages/week-plan/index.tsx`

页面模块：

```
[Header]    一周经营计划 · 2026-W27
[KPI Bar]   目标 5 篇 / 完成 3 篇 / 佣金目标 200 元 / 已赚 80 元
[Days 7 列] 周一 ☐  ☐ 已发 2 ��    + 任务行
           周二 ☑  文案 1 + 封面 1
           …
[今日高亮] 黄边，3 条任务
[节日卡]   母亲节还差 8 天，建议 3 个商品
[底部 CTA] "开始今日任务" → MVP 现有 AI 选品
```

### D-4：节日卡组件 `festival-card`

```tsx
<View className="gp-festival-card" onClick={onPick}>
  <View className="gp-festival-row">
    <Text className="gp-festival-emoji">🎁</Text>
    <View className="gp-festival-text">
      <Text className="gp-festival-name">{festival.name}</Text>
      <Text className="gp-festival-meta">还差 {festival.daysAway} 天</Text>
    </View>
  </View>
  <Text className="gp-festival-pitch">{festival.aiPitch}</Text>
</View>
```

### D-5：`services/ai/plan.ts` mock

```ts
export async function fetchWeekPlan(): Promise<WeekPlan> {
  // 5s 模拟 → 返回 mock-week-plan.json 内容
  await sleep(800);
  return (await import('../../data/mock-week-plan.json')).default as WeekPlan;
}
```

**接口形态必须 = 真实 AI provider call**（`Promise<ProviderCallResult>`），就算里面包 mock — 与 §8.2 一致。

### D-6：`services/ai/festival.ts` mock

```ts
export async function fetchFestivalOpportunities(): Promise<FestivalOpportunity[]> {
  await sleep(300);
  const all = (await import('../../data/mock-festivals.json')).default as FestivalOpportunity[];
  const today = new Date();
  return all
    .map((f) => ({ ...f, daysAway: daysBetween(today, new Date(f.startDate)) }))
    .filter((f) => f.daysAway >= 0 && f.daysAway <= 30)
    .sort((a, b) => a.daysAway - b.daysAway);
}
```

### D-7：mock 数据

`src/data/mock-week-plan.json`：7 天，3-5 任务 / 天，包含 1 个已完成 + 1 个 in_progress + 3 个 pending。
`src/data/mock-festivals.json`：6 个节日（母节、父亲节、儿童节、中秋、七夕、双十一），其中"母亲节"距今 8 天，"七夕"距今 14 天。

### D-8：测试覆盖

```ts
// __tests__/ai-plan.test.ts
test('loadWeekPlan returns 7-day plan with at least one task/day', async () => { ... });
test('weekPlan reducer updates todayHighlight correctly', () => { ... });

// __tests__/ai-festival.test.ts
test('only festivals within 30 days are returned, sorted by daysAway', async () => { ... });
test('festival card renders emoji + name + daysAway', () => { ... });
```

---

## PR-1 任务清单（详细）

### T-P1.1 数据
- [ ] `src/data/mock-week-plan.json` 写满 7 天 25 任务
- [ ] `src/data/mock-festivals.json` 写 6 个节日，距今 0–180 天分布

### T-P1.2 类型
- [ ] `src/types/week-plan.ts` 新增 WeekPlan / DayTask / WeeklyKpi
- [ ] `src/types/festival.ts` 新增 FestivalOpportunity

### T-P1.3 服务层
- [ ] `src/services/ai/plan.ts` mock fetchWeekPlan（接口 = ProviderCallResult）
- [ ] `src/services/ai/festival.ts` mock fetchFestivalOpportunities

### T-P1.4 Store
- [ ] `src/stores/ai-store.ts` 增 `weekPlan` / `festivalOpportunities` / `loadWeekPlan` / `loadFestivalOpportunities`

### T-P1.5 UI
- [ ] `src/components/festival-card/festival-card.tsx` + scss（emoji + name + daysAway + pitch）
- [ ] `src/pages/week-plan/index.tsx` + scss（页面骨架 + KPI Bar + 7 天格）
- [ ] `src/pages/index/index.tsx` 加"今日计划卡" + "今日节日卡"

### T-P1.6 测试
- [ ] `__tests__/ai-plan.test.ts`（reducer + mock service）
- [ ] `__tests__/ai-festival.test.ts`（filter days + sort by daysAway + card render）

### T-P1.7 工具与守卫
- [ ] `scripts/smoke-miniapp.mjs` 加 PR-1 检查项（10 个页面 + 1 新页面 = 11 个）
- [ ] `scripts/check-platform-deps-local.mjs` 不动（仍 git+https）
- [ ] `scripts/check-no-sensitive.mjs` 不动
- [ ] 跑 `npm run lint` / `npm run build:weapp` / `npm run smoke:weapp` 全过
- [ ] 跑 `node .specify/.../tasks.md` 验收清单逐项打勾

### T-P1.8 文档
- [ ] `README.md` "MVP ��围" 增 #1 周计划 + #2 节日机会（标注 V0.8 路线图）
- [ ] 顶层 `礼有方_AI原生小程序_PRD_V0.8.md` 底部增 "V0.8 PR-1 已交付"
- [ ] 截图：`dist-screenshots/week-plan.png` + `dist-screenshots/festival-card.png`
- [ ] CHANGELOG 增 `feat(miniprogram): 周经营计划 + 节日机会 (V0.8 PR-1)`

---

## 风险与防御

| 风险 | 防御 |
|---|---|
| 7 天格子在 320px 屏溢出 | 用 `flex-wrap: wrap`，单列堆叠 |
| 节日时机错过（如过完） | `daysAway <= 30 && daysAway >= 0` filter |
| 现有 ai-store 类型 narrow 风险 | 增字段用 `optional: true`，reducer case 默认保持旧值 |
| Mock 调用阻塞 UI | `useEffect` + skeleton 占位 |
| PRD V0.6 mock 数据被覆盖 | 现有 mock-gifts / mock-orders / mock-memory / mock-content 0 改动 |
| §6.1 平台 pin 被改 | smoke + lock 检查双层 |
| 单元测试被现有 jest 配置影响 | 与 v0.6 同 jest.config.js，0 改动 |

---

## 不在 PR-1 范围

明确不做，避免 scope creep：

- ❌ 真实 AI 接入
- ❌ 微信登录 / 云开发
- ❌ 真实商品库
- ❌ 节日商品详情页（点击节日卡仍走 MVP AI 选品）
- ❌ 一周计划"完成度"图表（仅文案 + 进度条）
- ❌ 推送通知（订阅消息 API 阶段二）

---

## 交付节点

| # | 节点 | 是否阻塞 |
|---|---|---|
| N1 | PR-1 spec/plan（**本文件**）✅ | — |
| N2 | PM 拍板本 plan + PR-1 任务开工 | **是，阻塞等 PM** |
| N3 | T-P1.1~T-P1.5 实现 | 否 |
| N4 | T-P1.6 单测通过 | 否 |
| N5 | T-P1.7 guard 全过 | 否 |
| N6 | T-P1.8 文档 + 截图 | 否 |
| N7 | 提交 PR + GitHub Actions 自动 smoke | 否 |
| N8 | mini 端 H5 截图（10 → 11/12 张）+ 同步给 PM | 否 |
| N9 | PM review + merge PR-1 + 准备 PR-2 | 否 |

---

## 待 PM 拍板（请 yes/no）

1. V0.8 路线图分成 4 个 PR 推进（PR-1 周计划 + 节日机会 / PR-2 风格学习 / PR-3 发布时间 + 多平台 / PR-4 商品替换）— 还是合并？
2. PR-1 一次性 25 个任务（10 个文件、~5 个 PR review 文件）— 还是要先拆 sub-PR？
3. mini 端 git remote 是 `rockcent/gift-pilot-miniprogram` 还是其他？PR-1 走 GitHub PR 还是直接 push main？
4. 现有 v0.6 主线是否需要先 fork feature/v0-8 branch 再做？
