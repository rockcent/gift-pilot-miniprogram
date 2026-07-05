# 礼有方（GiftPilot）微信小程序 · 项目宪法

**版本：v0.1 · 2026-07-06 起生效 · 与 rockcent-platform v2.x 宪法平行**

本文是礼有方小程序的最高层不变量。spec / plan / tasks / code 不得与本宪法矛盾。
如需修订，必须由 PM（产品经理）拍板 + CTO 在 PR 中引用本宪法章节。

---

## §1 品牌与心智（Brand Invariants）

1.1 **品牌名**：中文「礼有方」；英文辅助名「GiftPilot」。
1.2 **AI 角色**：「小礼」。所有面向用户的对话默认由「小礼」承担。
1.3 **品类定位**：「AI 礼物经营助手」。**不**把自己定位为礼品商城 / AI 写作工具 / 海报生成器 / 返佣平台 / 传统分销。
1.4 **主口号**：「送礼有方，推荐有数。」
1.5 **小礼人格**：聪明、温暖、得体、可信、克制、有审美、有商业头脑。
1.6 **禁止人格**：微商式叫卖、夸张收益承诺、冰冷机器人、堆形容词、高高在上的礼仪专家、没有数据依据的顾问。

## §2 视觉规范（Visual Tokens）

| Token | 值 | 用途 |
|---|---|---|
| `--brand-green` | `#23B26D` 策绿 | 主色，按钮 / 成功 / 高亮 |
| `--brand-apricot` | `#F6C98D` 礼杏 | 辅助色，温度 / 包装 / 心意 |
| `--brand-coral` | `#F47C6C` 心意珊瑚 | 礼物角标 / 成功状态 / 情绪提示 |
| `--brand-bg` | `#FAF9F6` 暖白 | 全局背景 |
| `--brand-ink` | `#1F2933` | 主文字 |
| `--brand-muted` | `#6B7280` | 辅助文字 |

**禁止**：大红大金的微商风、过度蓝紫的冷科技风、复杂拟物、高密度金融数据感。

## §3 业务范围（Scope Boundary）

3.1 MVP v0.6 阶段必须实现 10 个核心页面（详见 `features/mvp-v0/spec.md`）：
   - 表达需求 / AI 选品推荐 / 内容生成 / 封面设计 / 发布确认
   - 发布成功 / 订单佣金 / 经营复盘 / AI 下一步计划 / 我的 AI 记忆

3.2 MVP 阶段**不**包含：
   - 真实支付接入（用 mock 数据演示订单佣金）；
   - 真实第三方商品库（用 mock 商品库）；
   - 真实社交平台发布（用「生成内容 + 复制」演示）；
   - SaaS / 机构版 / 开放平台（礼有方 Pro / 礼有方云 / 开放平台延后到阶段二、三、四）。

3.3 MVP 阶段**必须包含**：
   - 「小礼」AI 对话闭环（用 mock LLM 模拟，**接口签名**必须是真实 LLM 适配器形态，便于阶段二无缝切到真实 AI）；
   - 6 大 AI 原生体验标签（选对礼 / 谈得好 / 做得美 / 发得准 / 看得清 / 改得好）的 UI 占位与底部 Footer。

## §4 数据不变量（Data Invariants）

4.1 **金额**：内部统一用「分」整数（`amount_fen: number`）。**禁止**浮点数保存内部金额。
4.2 **订单状态机**：`CREATED → PENDING → PAID → CLOSED / REFUNDING → REFUNDED / FAILED`。
   MVP 阶段实现 `CREATED / PAID / CLOSED` 三态。
4.3 **订单金额一致性**：订单创建金额必须等于 AI 推荐时展示金额的快照，差额 > 0 视为订单失败。
4.4 **推荐快照**：AI 选品结果必须保存为不可变快照（`recommendation_snapshot`），便于复盘与归因。
4.5 **发布归因**：每个订单必须可追溯到某条发布内容（`content_id`）和某个推荐（`recommendation_id`）。
4.6 **用户偏好**：AI 记忆（用户的预算风格 / 常用关系 / 关系人标签）属于用户私有数据，**禁止**跨用户共享，**禁止**上传到任何模型训练管道。

## §5 AI 不变量（AI Invariants）

5.1 **小礼不油腻**：禁止使用「精准推荐」「大数据智能」等空泛话术；所有推荐必须给理由。
5.2 **可解释**：每条推荐必须能回答「为什么是这个礼物」「为什么是这个预算」。
5.3 **记忆可控**：用户可一键清除 AI 记忆（`我的 → AI 记忆 → 全部清空`）。
5.4 **风险主动**：当推荐可能违反用户偏好（预算超、关系不当）时，主动提醒用户而不是默默返回。
5.5 **不要承诺收益**：禁止任何「保证出单」「月入过万」类话术。

## §6 工程不变量（Engineering Invariants）

6.1 **平台复用**：礼有方小程序**必须**通过 `git+https://github.com/rockcent/rockcent-platform.git#platform-vX.Y.Z` 接入 `@rockcent/platform` 的以下能力（仅当 Taro 编译目标支持时）：
   - `@rockcent/platform/config`：环境变量与脱敏；
   - `@rockcent/platform/ai` + `@rockcent/platform/ai-gateway`：AI 提供商适配 + trace；
   - `@rockcent/platform/web-client`：API 客户端；
   - `@rockcent/platform/share`：分享卡片 payload 序列化；
   - `@rockcent/platform/deploy-kit`：smoke 校验。

   平台升级公式与 v2.x 不变量见 `/Volumes/Rock2/codex/cloud-server-ops/DEVELOPMENT_HANDOFF_GUIDE.md`。

6.2 **小程序代码仓锁定小程序的 `engines`**：`engines.node >= 20.0.0`，`engines.taro ^3.6.0`。
6.3 **包管理器**：推荐 pnpm；如不可用回退 npm，**禁止** yarn。
6.4 **平台 tag 锁定**：根 `package.json` 必须显式声明 `@rockcent/platform` 版本（`git+https://...#platform-vX.Y.Z`），**禁止**：
   - `github:rockcent/rockcent-platform`
   - `git+ssh://...`
   - `file:/Volumes/Rock2/rockcent-platform`

6.5 **禁止直接复制平台能力**：在写本地 helper 之前必须先 `rg -n "<helper-name>" /Volumes/Rock2/rockcent-platform/packages` 检查是否已有。

6.6 **CI / Deploy**：MVP 阶段必须配置 `npm run lint`、`npm run build:weapp`、`npm run smoke:weapp` 三个最小脚本。完整 CI 标准待阶段二补齐（参考 `/Volumes/Rock2/codex/cloud-server-ops/standards/CI_RELEASE_STANDARD.md`）。

6.7 **支付 / 密钥 / 退款**：MVP 阶段仅 mock；阶段二起任何涉及真实支付的改动必须读 `standards/SECURITY_AND_PAYMENT_GATE.md`。

## §7 文档纪律（Documentation Discipline）

7.1 每个功能交付必须包含：
   - `.specify/features/<name>/spec.md` ✅
   - `.specify/features/<name>/plan.md` ✅（人工 review）
   - `.specify/features/<name>/tasks.md` ✅（按依赖排序）
   - `README.md` 同步更新（本仓内 + 顶层目录）
7.2 多文件改动（>=3 个）必须走 SDD 流程；纯 UI 文案 / 颜色调整除外。
7.3 提交信息使用 `feat: / fix: / chore: / docs: / refactor: / test:` 前缀。
7.4 禁止把 `.env` / 真实私钥 / 真实 AppID 提交到仓内；使用 `.env.example` 占位。

## §8 风险豁免与变更（Risk & Amendment）

8.1 本宪法修订须 PM（产品经理）拍板；任何 spec / plan 与宪法冲突时以宪法为准。
8.2 MVP v0.6 阶段允许的「软豁免」：
   - 真实 AI 接入：可用 mock LLM，但接口形态必须是真实适配器（`@rockcent/platform/ai` ProviderCallResult）；
   - 真实微信支付：mock；不接微信支付 SDK；
   - 真实商品库：mock JSON；不接第三方电商 API。
8.3 豁免到期：阶段二（M1 起）必须完成���有 §8.2 mock 替换为真实接入。
