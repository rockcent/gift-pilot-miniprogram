# MVP v0.6 · 礼有方小程序 · 技术方案

**对应规格**：`.specify/features/mvp-v0/spec.md`
**对应宪法**：`.specify/constitution.md` §6 工程不变量
**目标读者**：Codex / 本地 claudecode / 未来接手开发者
**最后更新**：2026-07-06

---

## 1. 技术栈选型

| 维度 | 选型 | 理由 |
|---|---|---|
| 框架 | **Taro 3.6.x** | 跨端 React + TS，团队熟；可一键出 H5 / RN；官方支持小程序 |
| 语言 | **TypeScript 5.x** | 与 rockcent-platform 一致；类型安全 |
| UI 库 | **自研 + `@tarojs/components`** | 复用 rockcent-platform/ui 的 token / button / card 概念；Taro 自身提供基础组件 |
| 状态管理 | **Zustand 4.x** | 比 Redux 轻；与 React Query 配合好 |
| 数据请求 | **@rockcent/platform/web-client** | 平台统一 API 客户端（带 timeoutMs / 401 / 403 / safe JSON parse） |
| AI 适配 | **@rockcent/platform/ai + @rockcent/platform/ai-gateway** | 统一 ProviderCallResult，阶段二切真实 LLM |
| AI 计量 | **@rockcent/platform/ai-metering**（平台 GA 后启用） | token / 成本事实 |
| 包管理 | **pnpm** | 与 rockcent-platform 一致；不允许 yarn |
| Lint | **ESLint + @typescript-eslint** | 与 rockcent-platform 一致 |
| 测试 | **Jest + @testing-library/react-native（Taro preset）** | 与 platform 同步 |
| 构建 | **Taro CLI `build:weapp`** | 输出到 `dist/` 给微信开发者工具 |
| CI | **GitHub Actions**（最小版：lint + build:weapp + smoke） | 阶段二补完 |

## 2. 平台接入

礼有方小程序通过 npm 安装 `@rockcent/platform`：

```json
{
  "dependencies": {
    "@rockcent/platform": "git+https://github.com/rockcent/rockcent-platform.git#platform-v1.15.2"
  }
}
```

**MVP 阶段实际启用**：
- `@rockcent/platform/config` — 读 `APP_ENV / API_BASE / WX_APPID_PLACEHOLDER`；
- `@rockcent/platform/web-client` — API 客户端基类；
- `@rockcent/platform/ai` + `@rockcent/platform/ai-gateway` — AI 适配器接口（mock 实现）；
- `@rockcent/platform/share` — 分享卡片 payload；
- `@rockcent/platform/deploy-kit` — `npm run smoke:weapp` 用。

**MVP 阶段未启用**（平台未 GA 或不适用）：
- `@rockcent/platform/agent-runtime` — 留给阶段二；
- `@rockcent/platform/ai-metering` — 留给阶段二；
- `@rockcent/platform/usage` — 留给阶段二。

## 3. 目录结构

```text
gift-pilot-miniprogram/
├── .specify/
│   ├── constitution.md
│   └── features/mvp-v0/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── .github/workflows/
│   └── ci.yml                       # GitHub Actions（lint + build:weapp + smoke）
├── src/
│   ├── app.tsx                      # Taro 入口
│   ├── app.config.ts                # 全局 app config
│   ├── pages/
│   │   ├── index/                   # 1. 表达需求（AI 对话首页）
│   │   ├── recommend/               # 2. AI 选品推荐
│   │   ├── content/                 # 3. 内容生成工作台
│   │   ├── cover/                   # 4. 封面设计
│   │   ├── publish-confirm/         # 5. 发布确认
│   │   ├── publish-success/         # 6. 发布成功
│   │   ├── orders/                  # 7. 订单与佣金
│   │   ├── review/                  # 8. 经营复盘（AI 分析）
│   │   ├── next-plan/               # 9. AI 下一步计划
│   │   └── memory/                  # 10. 我的 AI 记忆
│   ├── components/
│   │   ├── brand/                   # Logo / Slogan
│   │   ├── chat/                    # AI 对话气泡
│   │   ├── gift-card/               # 礼物卡
│   │   ├── content-card/            # 文案卡
│   │   ├── cover-template-card/     # 封面模板卡
│   │   ├── metric-card/             # 数据卡
│   │   ├── plan-row/                # AI 计划行
│   │   └── ai-memory-row/           # AI 记忆行
│   ├── stores/                      # Zustand stores
│   │   ├── ai-store.ts              # 对话 / 推荐 / 复盘
│   │   ├── orders-store.ts          # 订单 / 佣金
│   │   └── memory-store.ts          # AI 记忆
│   ├── services/                    # 平台接入层
│   │   ├── ai/                      # AI 适配（mock + 真实）
│   │   ├── orders/                  # 订单 API
│   │   └── memory/                  # 记忆 API
│   ├── data/
│   │   ├── mock-gifts.json          # mock 商品库
│   │   ├── mock-orders.json         # mock 订单
│   │   ├── mock-content.json        # mock 文案模板
│   │   └── mock-memory.json         # mock 记忆默认
│   ├── styles/
│   │   ├── tokens.scss              # 视觉 token（宪法 §2）
│   │   ├── global.scss              # 全局 reset
│   │   └── ai-six.scss              # 6 大 AI 标签
│   └── utils/
│       ├── money.ts                 # 金额分/元互转
│       ├── id.ts                    # uuid / orderId 生成
│       └── trace.ts                 # ai-gateway trace 包装
├── __tests__/                       # 单元测试
│   ├── money.test.ts
│   ├── stores/
│   └── pages/
├── public/
│   └── assets/                      # logo / icons / 礼物图（用 mock 占位）
├── package.json
├── tsconfig.json
├── babel.config.js
├── .eslintrc.js
├── project.config.json              # 微信开发者工具项目配置
├── README.md
└── .env.example
```

## 4. 数据模型（TypeScript 类型）

```ts
// 礼物 / 推荐
export interface Gift {
  id: string;
  title: string;
  brand: string;
  image: string;
  price_fen: number;          // 内部用分
  price_text: string;         // 展示用 ¥199 起 ¥23.8
  match_score: number;        // 0-100
  relation_tags: string[];    // ['同事','生日']
  reason: string;             // "适合同事，不过分亲昵"
  category: string;           // '香薰','永生花','礼盒'
}

// 推荐快照（不可变）
export interface RecommendationSnapshot {
  id: string;
  user_id: string;
  created_at: number;
  gifts: Gift[];
  query: { relation: string; budget_fen: number; scene: string; tone: string };
}

// 文案
export interface ContentPiece {
  id: string;
  type: 'share' | 'review' | 'emotion';
  body: string;
  tags: string[];
}

// 封面模板
export interface CoverTemplate {
  id: string;
  style: 'minimal' | 'warm' | 'fresh' | 'vintage';
  title: string;
  subtitle: string;
  image_placeholder: string;
}

// 发布
export interface Publish {
  id: string;
  recommendation_id: string;
  content_id: string;
  cover_id: string;
  channels: ('timeline' | 'channels' | 'article')[];
  scheduled_at: number | null;
  status: 'CREATED' | 'PENDING' | 'PAID' | 'CLOSED' | 'FAILED';
  quality_score: number;
  published_at: number | null;
}

// 订单
export interface Order {
  id: string;
  publish_id: string;         // 归因
  gift_id: string;
  amount_fen: number;         // 内部用分
  commission_fen: number;     // 佣金（分）
  status: 'CREATED' | 'PAID' | 'CLOSED' | 'REFUNDING' | 'REFUNDED' | 'FAILED';
  created_at: number;
  paid_at: number | null;
  closed_at: number | null;
}

// AI 记忆
export interface AIMemory {
  id: string;
  user_id: string;
  primary_relations: string[];     // 主要推荐对象
  budget_range_fen: [number, number]; // 常用预算区间
  preferred_styles: string[];       // 偏好文章风格
  favorite_categories: string[];    // 擅长商品类目
  best_publish_window: string;      // 最佳发布时间
  goal_text: string;                // 经营目标
  updated_at: number;
}
```

## 5. API 设计（MVP 阶段 mock）

```ts
// 全部走 @rockcent/platform/web-client，统一返回 Promise<ApiResult<T>>
api.ai.ask(query: string): Promise<AskResult>
api.ai.recommend(relation, budgetFen, scene): Promise<Gift[]>
api.ai.generateContent(giftId, style): Promise<ContentPiece[]>
api.ai.generateCover(giftId, style): Promise<CoverTemplate>
api.ai.review(userId, fromTs, toTs): Promise<ReviewResult>
api.ai.nextPlan(userId, weekStartTs): Promise<PlanItem[]>
api.ai.memory.get(userId): Promise<AIMemory>
api.ai.memory.put(userId, memory): Promise<void>
api.orders.list(userId, filter): Promise<Order[]>
api.orders.summary(userId): Promise<{ today_fen: number; month_fen: number; expected_fen: number }>
```

MVP 阶段所有接口由 `src/services/*/mock.ts` 提供，但调用点全部走 `@rockcent/platform/web-client` 的 `createApiClient()`，便于阶段二把 `baseUrl` 切到真实后端。

## 6. AI 接入（MVP mock）

mock LLM 在 `src/services/ai/mock.ts`，**接口形态必须**与 `@rockcent/platform/ai` 的 `ProviderCallResult` 一致：

```ts
export interface ProviderCallResult<T> {
  ok: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  usage?: { prompt_tokens: number; completion_tokens: number };
  trace_id: string;
}
```

mock 实现对 query 做关键词分类（relation / budget / scene），从 `mock-gifts.json` 里过滤出 3 条结果，并返回带 `reason / match_score / match_label` 的快照。阶段二切真实 LLM 时只需替换 `provider` 实现。

## 7. 视觉系统落地

`src/styles/tokens.scss`：

```scss
:root {
  --brand-green: #23B26D;
  --brand-apricot: #F6C98D;
  --brand-coral: #F47C6C;
  --brand-bg: #FAF9F6;
  --brand-ink: #1F2933;
  --brand-muted: #6B7280;
  --radius-card: 16px;
  --radius-pill: 999px;
  --shadow-card: 0 4px 16px rgba(31, 41, 51, 0.06);
}
```

所有页面组件直接用 token，不允许硬编码色值。

## 8. 安全 / 隐私 / 合规

- 不在仓内提交任何 `.env` / `project.config.json` 里的真实 AppID / secret；用 `.env.example` 与 `project.config.example.json`；
- 用户 AI 记忆只存 `wx.setStorageSync('ai-memory')`（本地）+ 接口层 mock 同步；阶段二起走云开发；
- 不发起任何真实支付；订单 mock 在前端 store；
- 金额统一用分；展示时 `/ 100 + '元'`；
- 截图与小礼人格校验由本地 claudecode 协助做二次 review。

## 9. CI / Smoke

`.github/workflows/ci.yml` 三个 step：

```yaml
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run build:weapp
      - run: pnpm run smoke:weapp  # 调用 @rockcent/platform/deploy-kit 的 mini smoke
```

## 10. 风险与回滚

- Taro 3.6 + 微信小程序兼容性：参考 Taro 官方 issue 与 release notes，锁定 `^3.6.0`；
- 平台版本升级：跟随 rockcent-platform release；阶段二前不升 v2.x；
- 模拟数据：阶段二切真实接口时把 mock 文件保留为测试夹具。
