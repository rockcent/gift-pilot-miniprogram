# 礼有方小程序 · V0.8 PR-4 商品替换提醒 · 技术方案

**对应 Spec**：`.specify/features/v0-8-gift-health-alert/spec.md`
**对应 PRD**：根目录 `礼有方_AI原生小程序_PRD_V0.8.md` §13 V0.8 #6 + §6.6
**对应宪法**：`.specify/constitution.md`
**最后更新**：2026-07-07

---

## 技术栈 / 锁定

| 维度 | 选型 |
|---|---|
| 框架 | Taro 3.6 + React 18 + TS 5（复用 v0.6） |
| 状态 | `ai-store` 增 2 字段（**不动 memory-store / orders-store**） |
| 平台 | `@rockcent/platform/web-client` 复用 pin |
| 数据 | mock-only（基于 mock-orders.json 4 单 mock） |
| 视觉 | `--brand-*` 全局，**不引入新色**（用 brand-green / brand-apricot / brand-coral 表达 3 档） |

---

## 文件改动范围（PR-4 锁定 ~6 个）

| 类型 | 路径 | 改动 |
|---|---|---|
| 改 types | `src/types/index.ts` | 新增 `GiftHealthStatus` / `GiftHealthFlag` / `GiftReplacement` |
| 新 service | `src/services/ai/gift-health.ts` | mock `fetchGiftHealthFlags()` + `replaceGift(giftId)` |
| 改 store | `src/stores/ai-store.ts` | 增 `giftHealthFlags[]` + `lastReplacement` + 3 action + reset 同步 |
| 改 page | `src/pages/review/index.tsx` | 加 "🎁 推荐礼物健康度" 区块（3 档徽章 + reason + 换品按钮） |
| 改 scss | `src/pages/review/index.scss` | 健康徽章（绿/杏/珊瑚） |
| 新测试 | `__tests__/services/gift-health.test.ts` | mock service + 3 档 shape + replaceGift |
| 改 smoke | `scripts/smoke-weapp.mjs` | 加 '3 PR-4 health status enum values present in types' |
| 改 README + CHANGELOG | — | 同步 |

**估算 6 文件改动**。宪法 §7.2 ≥ 3 触发 SDD（本文件履行）。

---

## PR-4 详细设计

### D-1：`GiftHealthStatus` 类型

```ts
export type GiftHealthStatus = 'healthy' | 'cooling' | 'fading';

export interface GiftHealthStat {
  orders7d: number;       // 7 日订单数
  clicks7d: number;       // 7 日点击数
  refundsTotal: number;   // 累计退款单数
}

export interface GiftHealthFlag {
  giftId: string;
  status: GiftHealthStatus;
  reason: string;         // 中文 1 句，如 '7 天仅 1 笔订单 / 点击率 1.2%'
  stats: GiftHealthStat;
}

export interface GiftReplacement {
  oldGiftId: string;
  newGift: Gift;
  replacedAt: number;
}
```

### D-2：mock 健康判定规则（v0.8 mock 阶段）

| 状态 | 规则 |
|---|---|
| 🟢 healthy | orders7d ≥ 3 AND 点击率 ≥ 5% AND refundsTotal == 0 |
| 🟡 cooling | orders7d ∈ [1,2] OR 点击率 ∈ [1%, 5%) OR refundsTotal == 1 |
| 🔴 fading | orders7d == 0 OR 点击率 < 1% OR refundsTotal ≥ 2 |

### D-3：`ai-store` 扩展

```ts
interface AIState {
  // ... v0.6 / PR-1 / PR-2 / PR-3 字段 ...
  
  /* V0.8 PR-4: 商品健康度 + 替换 */
  giftHealthFlags: GiftHealthFlag[];
  lastReplacement: GiftReplacement | null;
  loadGiftHealthFlags: (giftIds: string[]) => Promise<ProviderCallResult<GiftHealthFlag[]>>;
  replaceGift: (giftId: string) => Promise<ProviderCallResult<GiftReplacement>>;
  reset: () => void;  // 同步重置 2 新字段
}
```

### D-4：`replaceGift` mock 行为

- 选定 giftId → 从 `mock-gifts.json` 池中随机抽 1 个不同 ID 的 gift；
- 返回 `{ oldGiftId, newGift, replacedAt }`；
- store 自动更新 `recommendation.gifts` 对应索引；
- 若无 recommendation 则仅返回 replacement 不写回。

### D-5：`review` 页 UI

```tsx
<View className="gp-page__section">
  <Text className="gp-h2">🎁 推荐礼物健康度</Text>
  <Text className="gp-caption">基于 7 日点击与订单，AI 帮你看哪些值得保留</Text>
  
  {/* 按 healthy → cooling → fading 排序 */}
  {sortedFlags.map((flag) => (
    <View key={flag.giftId} className={`gp-health__row gp-health__row--${flag.status}`}>
      <View className={`gp-health__dot gp-health__dot--${flag.status}`} />
      <Text>{giftName}</Text>
      <Text className="gp-health__reason">{flag.reason}</Text>
      {flag.status !== 'healthy' && (
        <View className="gp-btn gp-btn--outline" onClick={() => onReplace(flag.giftId)}>
          <Text>换新品</Text>
        </View>
      )}
    </View>
  ))}
</View>
```

### D-6：SCSS 视觉 token 复用

| 状态 | 复用 token |
|---|---|
| 🟢 healthy | `var(--brand-green)` |
| 🟡 cooling | `var(--brand-apricot)` |
| 🔴 fading | `var(--brand-coral)` |

---

## 风险 & 回退

- **R1**: mock-gifts.json 池子太小（仅 4 单 gift），换品可能重复 → 池子 ≥ 8 即可；本 PR 沿用 v0.6 mock-gifts.json 已有规模
- **R2**: review 页加载健康 flag 异步 → 与 PR-1 / PR-2 / PR-3 一致 useEffect auto load；失败回退显示"加载中…"
- **R3**: replaceGift 写回 recommendation.gifts 后，content / cover 页可能拿到新 gift ID → 这是预期行为（用户主动触发），UI 通过 Taro.showToast 提示

---

## 宪法自检

| 项 | 验证 |
|---|---|
| §6.1 平台 pin | smoke 校验 `git+https://github.com/rockcent/rockcent-platform.git#platform-v` 形式 |
| §4 金额 `_fen` | 本 PR 不改金额字段；新 gift.price_fen 来自 mock-gifts.json |
| §5 话术 | 不出现"保证出单"等；改用"AI 帮你看哪些值得保留" |
| §6.2 vis token | 健康 3 色全部复用 `--brand-*`，不引入新色 |
| §7.1 SDD | 本文件履行 |
| §7.3 feat: 前缀 | commit `feat(miniprogram): V0.8 PR-4 商品替换提醒` |
| mock 接口形态 | ProviderCallResult<T> 与 v0.6 / PR-1 / PR-2 / PR-3 一致 |
