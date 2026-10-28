# tasks · v1-2 合规加固

- [ ] T1 `types/index.ts`：`ProviderCallResult<T>` 单一真源（`traceId` + `cost?`），删除 `trace_id`
- [ ] T2 `utils/trace.ts`：改为从 `platform/adapter` 重导出 `okResult/errResult`，从 `types` 重导出类型
- [ ] T3 `platform/adapter.ts`：删除本地 `ProviderCallResult` interface，改为 `import/export type from '../types'`；`okResult` 内 `recordTokenUsage` 包 `try/catch`
- [ ] T4 `services/payment/wechat-pay.ts`：接入 `assertOrderAmountMatch` + `content_id`/`recommendation_id` + 幂等去重 + `completeRefund`
- [ ] T5 `services/ai/mock.ts`：`recommend` 传入估算 `usage`，触发 mock 计量
- [ ] T6 单测：`wechat-pay.test.ts` 增补 mismatch / idempotency / refund terminal / attribution；`money.test.ts` 已覆盖 §4.3
- [ ] T7 Web 同构：`web/src/types/index.ts` + `web/src/utils/trace.ts` 统一 `traceId`（F1/F3/F4/F5 在 web 记为 gap）
- [ ] T8 `README.md` 同步合规加固说明
