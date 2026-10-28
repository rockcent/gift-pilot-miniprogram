# Feature Spec: v1.3 微信支付三端接入 + 下单流程 wiring（小程序仓）

> 仓库：gift-pilot-miniprogram（Taro，产出 小程序 + H5）
> 承接：v1.2 合规加固（F1–F5，支付不变量已收敛为单一真源）
> 宪法：§4 支付不变量 / §6 隐私 / §7 SDD / §8 mock 豁免止于真实接入

## 1. 背景
v1.2 已将 `services/payment/wechat-pay.ts` 的支付不变量（§4.2 退款终态 / §4.3 金额一致性 / §4.5 归因 / 幂等去重）收敛并固化为单测。但：
- 当前漏斗 `recommend → content → publish-confirm → publish-success` **没有下单/支付步骤**；
- `wechatPayMock.create` **零调用方**（模块 orphaned）；
- `platform/adapter.ts` 的 gateway 仍是死代码（`providers:[]`、`gateway.call` 零调用，F2 遗留）。

本 feature 把支付模块接入真实下单流程，并以微信支付真实化（**小程序支付 + H5 支付**，由本仓 Taro 双端产出覆盖）。

## 2. 目标
1. 在漏斗中加入「送礼下单」步骤（新增 `pages/checkout`，或在 `recommend` 选礼后进入）。
2. 以 `gift.price_fen`（整数分）为订单金额来源，调用 `create`，复用 v1.2 全部不变量。
3. 引入 `PaymentProvider` 抽象：mock 实现（现状）+ 真实微信实现（小程序 `wx.requestPayment` / H5 支付），真实实现经 `@rockcent/platform` 后端代理。
4. 让 `platform/adapter.ts` 的 gateway 真正承载支付代理 + ai-metering（修 F2 死代码）。

## 3. 范围
- **In**：下单页、PaymentProvider 抽象、mock→real 切换、金额/归因/幂等/退款终态接线、下单后写入 `orders-store`、回调解密占位。
- **Out**：微信小店商品库接入、视频号种草、企微 B 端、真实 LLM（均为独立 feature）。

## 4. 约束 / 闸门（硬性）
- 真实微信支付需 **PM 提供微信支付商户号 + API 密钥 + 证书**，且**必须经 `@rockcent/platform` 后端代理**（前端不得持有密钥，违反 `SECURITY_AND_PAYMENT_GATE.md`）。
- 触发真实接入规则；宪法 §4 不变量为硬约束。
- 关系记忆 / 隐私退出机制由 PM 拍板；本 feature 不写回隐私数据。
- 平台 pin 维持 `platform-v1.20.0`，不擅自 bump。
- 实施前 `pnpm test` 必须绿（沙箱无法跑，需本地）。
- **未拿到真实凭证前**，仅实现 mock→real 抽象与下单 UI 接线（mock 可跑通），真实分支留 TODO + 显式守卫（无凭证即抛明确错误，不静默）。

## 5. 不变量（承接 v1.2）
- §4.1 整数分：金额全程 `price_fen`，禁止浮点。
- §4.2 退款终态：`completeRefund → REFUNDED`。
- §4.3 金额一致性：`create` 调 `assertOrderAmountMatch(gift.price_fen, amountFen)`。
- §4.5 归因：`content_id` + `recommendation_id` 必填落库。
- 幂等：`idempotencyKey` 模块级去重。

## 6. 验收
- mock 模式下：选礼 → checkout → 微信支付（mock）→ 订单写入 orders-store → 跳 orders 页，全链路可跑。
- 金额不一致被拒、退款终态 REFUNDED、归因字段落库、幂等去重 均有测试覆盖（继承 v1.2）。
- 真实分支在无凭证时显式失败，不在生产静默降级。
