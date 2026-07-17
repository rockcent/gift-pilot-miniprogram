# 礼有方（GiftPilot）微信小程序

> AI 礼物经营助手 · 送礼有方，推荐有数。

![status](https://img.shields.io/badge/version-v0.6.0--mvp-blue)
![platform](https://img.shields.io/badge/platform-rockcent--v1.20.0-green)
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
│   ├── app.tsx / app.config.ts       # Taro 入口 + TabBar 配置（14 个页面）
│   ├── pages/                        # 14 个页面（V0.6×10 + V0.8 PR-1 + V1.0 PR-16/17/18）
│   ├── components/                   # 9 个核心组件
│   ├── stores/                       # Zustand stores
│   ├── platform/adapter.ts           # V1.0 平台适配层（5 个 @rockcent/platform 子包）
│   ├── services/                     # AI / Orders / Memory / Product / Payment / API 服务
│   │   ├── ai/                       #   7 个：recommend-engine / multimodal / batch / product-supply 等
│   │   ├── payment/wechat-pay.ts     #   阶段二-D SECURITY gate（idempotency / verifyCallback / signature）
│   │   ├── product/cps.ts            #   阶段二-C CPS 商品库（taobao/jd/pdd/mock）
│   │   └── api/server.ts             #   后端 mock client
│   ├── types/                        # 领域类型
│   ├── utils/                        # money / id / trace
│   ├── data/                         # mock 数据
│   └── styles/                       # 视觉 token + 全局
├── __tests__/                        # Jest 单测（19 suites / 87 tests）
├── scripts/
│   ├── smoke-weapp.mjs               # 18 项 smoke 检查（platform + 14 pages + SECURITY gate）
│   ├── screenshot-h5.mjs             # 14 张 H5 截图
│   ├── check-platform-deps-local.mjs
│   ├── check-no-sensitive.mjs
│   ├── deploy-preflight.sh           # 部署预检（8 项）
│   └── deploy-production.sh          # 部署到 aliyun-rockcent-prod:/h5/
├── nginx/gift.rockcent.com.conf      # 与网页端共享 conf，含 /h5/ 子路径块
├── .github/workflows/ci.yml          # GitHub Actions
├── dist-screenshots/                 # H5 渲染的 14 张视觉预览
└── package.json                      # 平台 pin @rockcent/platform v1.20.0
```

## 技术栈

| 维度 | 选型 |
|---|---|
| 框架 | Taro 3.6 + React 18 |
| 语言 | TypeScript 5 |
| 状态 | Zustand 4 |
| 平台 | `@rockcent/platform`（pinned `git+https://...#platform-v1.20.0`） |
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

## MVP 范围（V0.6 → V0.8 → V1.0）

- ✅ **V0.6** 10 个核心页面（AI 对话 / 推荐 / 内容 / 封面 / 发布确认 / 发布成功 / 订单 / 复盘 / 下一步 / AI 记忆）
- ✅ **V0.8 AI 经营版** 4 PRs（PR-1 周计划 + PR-2 风格 + PR-3 发布时间 + PR-4 商品健康度）
- ✅ **V1.0 平台对接** 4 PRs（PR-15 推荐引擎 7 因子 + PR-16 多模态输入 + PR-17 AI 批量 + PR-18 平台管理）
- ✅ **阶段二** A→E 全量适配（5 个平台包接入 + 7 个 service + CPS + SECURITY gate）
- ✅ 9 个核心组件 + 视觉 token（策绿 #23B26D / 礼杏 #F6C98D / 心意珊瑚 #F47C6C / 暖白 #FAF9F6）
- ✅ Zustand stores + mock 数据 + mock AI 适配（接口形态 = 真实 `ProviderCallResult<T>`）
- ✅ **18 项 smoke 检查**（平台 pin / 敏感扫描 / 整数金额 / 6 大 AI 标签 / 14 页面 / SECURITY gate）
- ✅ **19 suites / 87 tests** Jest 单测全 PASS
- ✅ GitHub Actions 最小 CI
- ✅ H5 视觉预览（14 张截图，见 `dist-screenshots/`）
- ✅ **阿里云部署脚本**（`npm run deploy:{preflight,dry-run,production}` → aliyun `/h5/` 子路径）

## V0.8 路线图 AI 经营版（.specify/features/v0-8-ai-operation/）

- ✅ **PR-1** 周经营计划 + 节日机会（merge `849c6a6`；11 张截图）
  - 见 `.specify/features/v0-8-ai-operation/`
- ✅ **PR-2** 风格学习（6 chip + 风格档案持久化）
  - 见 `.specify/features/v0-8-style-learning/`
  - `content` 页加 6 chip 横排（share / review / emotion / personal / professional / funny）
  - `memory-store` 增 `styleProfile` + 4 action（`rememberStyle` / `updateStyleProfile` / `applyPersonalStyle` / `resetStyleProfile`）
  - `memory` 页加'风格档案'区块（6 chip + 各自 used + lastUsedAt）
  - 新增 `services/ai/style.ts` mock service
  - `ContentCard` 组件可选 `onRemember` prop + '📌 记住' 按钮
  - 14 个新增 jest 单测（`style` 7 + `memory-style` 7）
- ✅ **PR-3** 发布时间优化 + 多平台内容
  - 见 `.specify/features/v0-8-multi-platform/`
  - `publish-confirm` 页加 ⏰ AI 推荐发布时间（3 档：明早 8:30 / 今晚 21:00 / 后天中午；点击写入定时）
  - `content` 页加 📤 多平台分发（朋友圈 ≤80 字 ≤6 行 / 小红书 ≤200 字 emoji 多 / 视频号 hook 开头 ≤80 字）+ 一键复制全部
  - `next-plan` 页加 🕐 计划于 XX 发布 卡片（当有定时时显示）
  - 新增 `services/ai/publish-time.ts` + `multi-platform.ts` mock service
  - `ai-store` 增 `publishTimeSlots` / `multiPlatformContents` + 3 action
  - 10 个新增 jest 单测（`publish-time` 4 + `multi-platform` 6）
  - smoke 升级到 10/10 check PASS（加 3 档 slot + 3 平台 ID + 2 服务文件）
- ✅ **PR-4** 商品替换提醒
  - 见 `.specify/features/v0-8-gift-health-alert/`
  - 复盘页加 🎁 推荐礼物健康度 区块（🟢健康 / 🟡衰减 / 🔴衰退 3 档徽章 + reason）
  - 🟡🔴 行尾「换新品」1 键触发 `replaceGift(giftId)` mock service，自动写回 `recommendation.gifts` 对应索引
  - 新增 `services/ai/gift-health.ts` mock service + `judgeGiftHealth()` + `buildHealthReason()` 纯函数
  - `ai-store` 增 `giftHealthFlags[]` + `lastReplacement` + 2 action（`loadGiftHealthFlags` / `replaceGift`）
  - 6 个新增 jest 单测（`gift-health` 6 含纯函数判定 + mock service + 排序 + mock 数据）
  - smoke 升级到 12/12 check PASS（加 3 档 health status + service 文件）

- ✅ **V1.0 平台对接** 4 PRs（架构层 + 数据 mock；真实凭证需 PM 提供）
  - **PR-15** AI 推荐引擎 7 因子（PRD §6.2）：content-fit 0.25 / relation 0.20 / recency 0.15 / inventory 0.10 / margin 0.10 / sentiment 0.10 / risk 0.10
  - **PR-16** 多模态输入（PRD §6.1）：文字 / 语音 / 商品截图 / 聊天截图 / 商品链接 / 商品图片 6 模态 → 结构化 GiftQuery
  - **PR-17** AI 批量任务中心：批量生成 / 批量发布 / 批量复盘 3 类，并发可调
  - **PR-18** 平台管理后台（mini 端简化版）：身份 / 商品供给策略 / CPS 商品库 / 微信支付订单 / usage 监控
- ✅ **阶段二-A** 平台适配层 `src/platform/adapter.ts`：5 个 `@rockcent/platform` 子包接线
  - `ai-gateway` + `ai-metering` + `identity` + `usage` + `web-client`
- ✅ **阶段二-B** 7 个新 service：recommend-engine / multimodal / batch / product-supply / wechat-pay / cps / api-server
- ✅ **阶段二-C** CPS 商品库 mock（source: taobao / jd / pdd / mock）
- ✅ **阶段二-D** SECURITY gate：wechat-pay 含 `idempotencyKey` + `verifyCallback` + `signature`
- ✅ **阶段二-E** 平台 pin 升 v1.20.0（Node 22 floor + dirname-ems codemod）
- ⏳ 阶段三：接通真实微信云开发后端 + 真实 LLM（OpenAI 兼容）+ 真实商品库
- ⏳ 阶段四：礼有方 Pro
- ⏳ 阶段五：礼有方云（SaaS）

## 平台合规

礼有方小程序**严格遵循** rockcent 平台规范：

- `@rockcent/platform` 通过 `git+https://github.com/rockcent/rockcent-platform.git#platform-v1.20.0` 锁定，**禁止**使用 `github:` / `git+ssh:` / `file:` 形式
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
