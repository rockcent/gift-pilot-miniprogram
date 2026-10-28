# spec · v1-2 合规加固（compliance hardening）

- **status**: draft
- **date**: 2026-07-30
- **owner**: Senior Developer（接手开发）
- **关联审查**: `gift-pilot-code-review.md`（F1–F5）

## 背景
代码审查发现 5 项宪法 §4 / §6 违规或"名不副实"隐患，全部位于 **mock 层**（§8.2 豁免内，不涉及真实凭证、真实 SDK、真实 LLM）：

| ID | 问题 | 宪法依据 |
|----|------|----------|
| F1 | `assertOrderAmountMatch` 有定义有单测，但全仓零调用 → 展示价≠实付价会静默通过 | §4.3 |
| F2 | `ProviderCallResult` 两套定义（`utils/trace.ts` 用 `trace_id`；`platform/adapter.ts` 用 `traceId`）→ 阶段三切换真实 Provider 时类型错配 | §6 |
| F3 | `refund()` 只到 `REFUNDING`，`REFUNDED` 永远设不上 | §4.2 |
| F4 | 幂等键自生成、不接收入参、不去重；admin 页还展示出来（表象无功能） | SECURITY gate |
| F5 | 支付订单缺 `content_id` / `recommendation_id` 归因 | §4.5 |

## 目标
在不接入真实支付 / 真实 LLM 的前提下，把 F1–F5 全部修到"名实相符"，并用单测固化。

## 范围（in scope）
- 改：`types/index.ts`、`utils/trace.ts`、`platform/adapter.ts`、`services/payment/wechat-pay.ts`、`services/ai/mock.ts`
- 增：对应单测
- 不改：真实微信支付 SDK、真实 LLM、平台版本锁定（`platform-v1.20.0`）、`SECURITY_AND_PAYMENT_GATE` 真实接入路径

## 不变量校验
- §4.1 整数分：`wechat-pay.create` 已校验正整数
- §4.3 金额一致性：`create` 内调用 `assertOrderAmountMatch(expected, actual)`
- §4.5 归因：`WechatPayOrder` 增加 `content_id` / `recommendation_id` 并落库
- §6 平台复用：`ProviderCallResult<T>` 单一真源在 `types/index.ts`，与 `@rockcent/platform/ai` 对齐（`traceId`）

## 已知限制（out of scope）
- `wechatPayMock` 当前在 UI 流程中无调用方（支付模块处于 orphaned 状态）。本次让其内部不变量全部生效 + 单测固化；把"支付模块接入下单 UI 流程"列为独立 feature（阶段三）。
- Web 仓无支付模块、无 `platform/adapter`：本次仅做 `ProviderCallResult` 类型同构（F2 的一半），F1/F3/F4/F5 在 web 记为 gap。
