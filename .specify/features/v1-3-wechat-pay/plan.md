# Plan: v1.3 微信支付三端接入 + 下单流程 wiring（小程序仓）

## 架构
- 新增 `services/payment/types.ts`：`PaymentProvider` 接口
  `{ createOrder, pay, refund, completeRefund }`，统一 `WechatPayOrder` 出入参（沿用 v1.2 字段 + `content_id`/`recommendation_id`）。
- `services/payment/mock.ts`：封装现有 `wechatPayMock`（沿用 v1.2 不变量，作为默认实现）。
- `services/payment/wechat.ts`：真实实现。
  - 小程序端：`@rockcent/platform` 代理 `createUnifiedOrder` → 前端 `wx.requestPayment({...paySign})`。
  - H5 端：`@rockcent/platform` 代理下单 → `location.href = mweb_url`（H5 支付）。
  - 回调解密占位（需后端，前端仅存 `transaction_id`）。
- `services/payment/index.ts`：按 `process.env.PAYMENT_MODE`（`mock`|`wechat`）选择实现；`wechat` 无凭证时抛 `PaymentCredentialsMissingError`。
- `platform/adapter.ts`：gateway 增加 `payment` provider，承载下单代理 + ai-metering（修 F2 死代码）；`recordTokenUsage` 已在 v1.2 加 try/catch。
- 新页面 `pages/checkout/index.tsx` + `index.scss`：展示礼品 / 金额（fenToYuan 展示）/ 收礼人（微信选人占位）/ CTA「微信支付送礼」→ `createOrder` → `pay` → 成功写 `orders-store` → 跳 `pages/orders`。
- `pages/recommend/index.tsx`：`onPick` 增加「去送礼」CTA 进入 checkout。
- `stores/orders-store.ts`：新增 `createOrder(order)` action 落库（当前仅 `loadMock`）。

## 文件清单
- 新增：`services/payment/{types,mock,wechat,index}.ts`、`pages/checkout/{index.tsx,index.scss}`
- 改：`services/payment/wechat-pay.ts`（迁为 mock 实现或保留别名）、`stores/orders-store.ts`、`platform/adapter.ts`、`pages/recommend/index.tsx`
- 文档：本 `.specify` 三件套、README 同步（§7.1）

## 数据流
`recommendation.gifts[i].price_fen`
  → checkout 构造 `WechatPayOrder{ amountFen: gift.price_fen, commissionFen, content_id, recommendation_id, idempotencyKey }`
  → `createOrder`（内部 `assertOrderAmountMatch`）
  → `pay`（mock 直接成功 / wechat 调后端代理 + 前端调起）
  → 成功后 `orders-store.createOrder` + `Taro.navigateTo(orders)`

## 风险
- 真实微信支付必须服务端下单（密钥安全）→ 强依赖 `@rockcent/platform` 支付代理就绪；若平台侧未实现，真实分支阻塞，仅 mock 可交付。
- 小程序/H5 环境判断：`process.env.TARO_ENV` 区分 `weapp` / `h5`。
- 回调解密需后端，前端先记录 `prepay_id`/`transaction_id`，最终态以 `completeRefund`/`queryOrder` 为准。
