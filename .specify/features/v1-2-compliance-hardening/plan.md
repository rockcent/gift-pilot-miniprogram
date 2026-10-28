# plan · v1-2 合规加固

## 设计决策
1. **单一 `ProviderCallResult<T>` 真源**：在 `types/index.ts` 定义为
   `{ ok, data, error, usage?, cost?, traceId }`（与 `@rockcent/platform/ai` 对齐）。
   `utils/trace.ts` 改为 `export { okResult, errResult } from '../platform/adapter'` 的薄重导出；
   `platform/adapter.ts` 删除本地 interface，`import type { ProviderCallResult } from '../types'` 并 `export type { ProviderCallResult }`。
2. **金额一致性（F1）**：`wechat-pay.create` 增加可选入参 `expectedAmountFen`，调用 `assertOrderAmountMatch`，不符返回 `errResult('AMOUNT_MISMATCH', ...)`。
3. **归因（F5）**：`WechatPayOrder` 增加 `content_id` / `recommendation_id`；`create` 接受并落库。
4. **幂等去重（F4）**：`create` 接受可选 `idempotencyKey`；模块级 `Set` 去重，重复提交返回已有订单。
5. **退款终态（F3）**：新增 `completeRefund(orderId)`：`REFUNDING → REFUNDED` + `refundedAt`。`refund()` 仍只到 `REFUNDING`。
6. **mock 计量（F2 收尾）**：`platform/adapter.ts` 的 `okResult` 在记录 `recordTokenUsage` 时包 `try/catch`（非浏览器环境不抛）；`ai/mock.recommend` 传入估算 `usage`，使 ai-metering 在 mock 层真实触发。

## 风险与缓解
- `recordTokenUsage` 在 jest node 环境可能抛错 → `okResult` 内 `try/catch` 包裹，绝不影响主流程与测试。
- 字段重命名 `trace_id → traceId`：仅 `utils/trace.ts` 内部使用，无外部读取方（grep 已确认），安全。
- `utils/trace.ts` 改为重导出后，`ai/mock.ts` 仍 `import { okResult, errResult } from '../../utils/trace'`，行为不变。

## 验证
- 单测新增：金额不匹配被拒 / 幂等去重 / 退款终态 / 归因字段 / `ProviderCallResult` 形状。
- **环境限制**：沙箱无法跑 `jest`（进程被 SIGKILL），需在本地复核：
  ```bash
  cd "codex/gift pilot/gift-pilot-miniprogram" && pnpm install && pnpm test
  ```
