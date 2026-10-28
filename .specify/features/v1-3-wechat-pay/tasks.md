# Tasks: v1.3 微信支付三端接入 + 下单流程 wiring（小程序仓）

- [ ] T1 新增 `services/payment/types.ts`：`PaymentProvider` 接口 + 统一 `WechatPayOrder` 出入参
- [ ] T2 `services/payment/mock.ts`：封装现有 `wechatPayMock`（沿用 v1.2 不变量：金额一致/归因/幂等/退款终态）
- [ ] T3 `services/payment/wechat.ts`：真实实现（小程序 `wx.requestPayment` / H5 `mweb_url`），经 `@rockcent/platform` 代理；无凭证抛 `PaymentCredentialsMissingError`
- [ ] T4 `services/payment/index.ts`：`PAYMENT_MODE` 切换 mock|wechat + 守卫
- [ ] T5 `platform/adapter.ts`：gateway 接入 payment provider + ai-metering（修 F2 死代码）
- [ ] T6 新增 `pages/checkout` 下单页（礼品/金额/收礼人占位/「微信支付送礼」CTA）
- [ ] T7 `pages/recommend` 加「去送礼」CTA 进入 checkout
- [ ] T8 `stores/orders-store.ts` 增加 `createOrder` 落库 action
- [ ] T9 下单流程接线：`price_fen` → `assertOrderAmountMatch` → `pay` → 写 orders-store → 跳 orders
- [ ] T10 集成测试：mock 全链路（下单→支付→落库→跳转）、金额不一致被拒、退款终态 REFUNDED、归因落库、幂等去重
- [ ] T11 README / `.specify` 同步（宪法 §7.1）

## 前置闸门（实现真实分支前必须）
- [ ] PM 提供微信支付商户号 + API 密钥 + 证书
- [ ] `@rockcent/platform` 支付代理（createUnifiedOrder / queryOrder / refund）就绪
- [ ] 法务对关系记忆 / 隐私退出机制签字（§6）
- [ ] 本地 `pnpm test` 绿灯（沙箱无法跑）
