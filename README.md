# 礼有方（GiftPilot）微信小程序

> AI 礼物经营助手 · 送礼有方，推荐有数。

![status](https://img.shields.io/badge/version-v0.6.0--mvp-blue)
![platform](https://img.shields.io/badge/platform-rockcent--v1.15.2-green)
![node](https://img.shields.io/badge/node-%3E%3D20-blue)

## 简介

把「不知道送什么、不知道怎么说、不知道为什么没出单」三件事，封装成一条 10 步 AI 原生链路：

```
表达需求 → 选品 → 内容 → 封面 → 发布 → 订单 → 复盘 → AI 下一步 → AI 记忆
```

## 仓库结构

```
gift-pilot-miniprogram/
├── .specify/                         # SDD 规范
│   ├── constitution.md               # 项目宪法（最高不变量）
│   └── features/mvp-v0/
│       ├── spec.md                   # 产品规格
│       ├── plan.md                   # 技术方案
│       └── tasks.md                  # 任务清单
├── src/
│   ├── app.tsx / app.config.ts       # Taro 入口 + TabBar 配置
│   ├── pages/                        # 10 个核心页面
│   ├── components/                   # 9 个核心组件
│   ├── stores/                       # Zustand stores
│   ├── services/                     # AI / Orders / Memory 服务（含 mock）
│   ├── types/                        # 领域类型
│   ├── utils/                        # money / id / trace
│   ├── data/                         # mock 数据
│   └── styles/                       # 视觉 token + 全局
├── __tests__/                        # Jest 单测
├── scripts/                          # smoke / platform-deps / no-sensitive
├── .github/workflows/ci.yml          # GitHub Actions
├── dist-screenshots/                 # H5 渲染的 10 张视觉预览
└── package.json                      # 平台 pin @rockcent/platform
```

## 技术栈

| 维度 | 选型 |
|---|---|
| 框架 | Taro 3.6 + React 18 |
| 语言 | TypeScript 5 |
| 状态 | Zustand 4 |
| 平台 | `@rockcent/platform`（pinned `git+https://...#platform-v1.15.2`） |
| 包管理 | pnpm（npm 回退） |

## 启动

```bash
pnpm install --frozen-lockfile       # 阶段二生成 lockfile 后启用
pnpm run dev:weapp                 # 开发模式（Taro watch）
pnpm run build:weapp               # 输出到 dist/（需真实 AppID）
pnpm run build:h5                  # 输出到 dist/（H5 视觉验证，零 AppID 依赖）
pnpm run screenshot:h5             # 渲染 dist/ 并生成 10 张 420x820 PNG 截图
pnpm run smoke:weapp               # 跑 smoke 检查（无需安装依赖）
pnpm run check:platform-deps       # 平台 pin 检查
pnpm run check:no-sensitive        # 敏感信息扫描
```

## 微信开发者工具导入

1. `pnpm run build:weapp` 生成 `dist/`；
2. 复制 `project.config.example.json` → `project.config.json`，填入真实 AppID（不入仓）；
3. 微信开发者工具 → 导入项目 → 项目目录选 `dist/`。

## MVP 范围（V0.6）

- ✅ 10 个核心页面（AI 对话 / 推荐 / 内容 / 封面 / 发布确认 / 发布成功 / 订单 / 复盘 / 下一步 / AI 记忆）
- ✅ 9 个核心组件 + 视觉 token（策绿 #23B26D / 礼杏 #F6C98D / 心意珊瑚 #F47C6C / 暖白 #FAF9F6）
- ✅ Zustand stores + mock 数据 + mock AI 适配（接口形态 = 真实 ProviderCallResult）
- ✅ 4 个 smoke 脚本（平台 pin / 敏感扫描 / 整数金额 / 6 大 AI 标签）
- ✅ GitHub Actions 最小 CI
- ✅ H5 视觉预览（10 张截图，见 `dist-screenshots/README.md`）

## V0.8 路线图 AI 经营版（.specify/features/v0-8-ai-operation/）

- ✅ **PR-1** 周经营计划 + 节日机会（commit `a1c9962` 起；本页 11 张截图）
  - 新页面 `pages/week-plan/`：7 天格子 + KPI Bar + 今日高亮 + 节日卡
  - 新组件 `components/festival-card/`：emoji + 倒计时 + 推荐语 + 关系 chips
  - `ai-store` 增 `weekPlan` + `festivalOpportunities` 字段 + 2 个 `load*` action
  - 2 个 mock service（接口形态 = 真实 ProviderCallResult）
  - 2 个 mock 数据（7 天 21 任务 + 6 个节日 0–128 天分布）
  - index 页加 2 张 V0.8 卡片
  - 13 个新增 jest 单测（plan / festival / store-v08）
- ⏳ PR-2 风格学习
- ⏳ PR-3 发布时间优化 + 多平台内容
- ⏳ PR-4 商品替换提醒

- ⏳ 阶段二：接通真实微信云开发后端 + 真实 LLM（OpenAI 兼容）+ 真实商品库
- ⏳ 阶段三：礼有方 Pro
- ⏳ 阶段四：礼有方云（SaaS）

## 平台合规

礼有方小程序**严格遵循** rockcent 平台规范：

- `@rockcent/platform` 通过 `git+https://github.com/rockcent/rockcent-platform.git#platform-v1.15.2` 锁定，**禁止**使用 `github:` / `git+ssh:` / `file:` 形式
- 金额统一用「分」整数（`_fen` 后缀字段），展示时 `/100`
- 订单状态机 `CREATED → PENDING → PAID → CLOSED`，MVP 实现前三态
- 推荐结果保存为不可变快照，便于复盘归因
- AI 记忆属于用户私有，不跨用户共享，不上传训练
- 任何真实支付 / 密钥改动必须读 `/Volumes/Rock2/codex/cloud-server-ops/standards/SECURITY_AND_PAYMENT_GATE.md`

## 与本地 Claude Code 协作

- 单组件 / 单页面 / 单测改动 → 可派给本地 `claude -p --permission-mode dontAsk`
- 跨文件架构 / 平台 pin / 支付 / 数据库 → Codex 主导
- 提交信息使用 `feat: / fix: / chore: / docs: / refactor: / test:` 前缀

## License

内部使用。
