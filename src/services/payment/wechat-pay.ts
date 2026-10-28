/* 阶段二-D · 真实支付（mock + schema 校验）
 *
 * SECURITY gate 要求：金额一致性 + 幂等 + 签名 + 回调验签
 * 阶段二真实接入：微信支付 V3 SDK + 私钥环境变量
 * 当前 mock：完整模拟 prepare / pay / refund / completeRefund 状态机（不接真实 API）
 *
 * 宪法 §4 不变量：
 *  - §4.3 订单金额一致性：create 比对推荐快照金额（expectedAmountFen）
 *  - §4.5 发布归因：每笔订单落 content_id + recommendation_id
 */
import type { ProviderCallResult } from '../../platform/adapter';
import { okResult, errResult, recordUsageEvent } from '../../platform/adapter';
import { assertOrderAmountMatch } from '../../utils/money';

export type WechatPayStatus = 'CREATED' | 'PREPARED' | 'PAID' | 'REFUNDING' | 'REFUNDED' | 'FAILED' | 'CLOSED';

export interface WechatPayOrder {
  id: string;
  publish_id: string | null;
  content_id: string | null;          // 归因（宪法 §4.5）
  recommendation_id: string | null;   // 归因（宪法 §4.5）
  gift_id: string;
  amount_fen: number;
  commission_fen: number;
  status: WechatPayStatus;
  prepayId: string | null;
  transactionId: string | null;
  refundId: string | null;
  createdAt: number;
  paidAt: number | null;
  refundedAt: number | null;
  /* SECURITY gate 必填 */
  idempotencyKey: string;
  signature: string;
}

const ORDERS: WechatPayOrder[] = [];
const SEEN_KEYS = new Set<string>(); // 幂等去重（调用方提供的 idempotencyKey）

function genIdempotencyKey(): string {
  return `ik_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function mockSign(payload: string): string {
  // mock 签名（真实阶段用 SHA256 with RSA）
  let h = 0;
  for (let i = 0; i < payload.length; i++) h = (h * 31 + payload.charCodeAt(i)) | 0;
  return `mock_sig_${Math.abs(h).toString(16)}`;
}

function verifySign(payload: string, sig: string): boolean {
  return mockSign(payload) === sig;
}

export const wechatPayMock = {
  async create(input: {
    giftId: string;
    publishId?: string | null;
    contentId?: string | null;
    recommendationId?: string | null;
    amountFen: number;
    commissionFen: number;
    expectedAmountFen?: number;       // 推荐快照金额（宪法 §4.3）
    idempotencyKey?: string;          // 调用方提供可去重
  }): Promise<ProviderCallResult<WechatPayOrder>> {
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'wechat-pay.create', giftId: input.giftId }
    });
    // SECURITY gate #1: 金额必须正整数
    if (!Number.isInteger(input.amountFen) || input.amountFen <= 0) {
      return errResult('INVALID_AMOUNT', 'amount_fen must be positive integer');
    }
    if (!Number.isInteger(input.commissionFen) || input.commissionFen < 0) {
      return errResult('INVALID_COMMISSION', 'commission_fen must be non-negative integer');
    }
    // 宪法 §4.3：订单金额必须等于推荐快照金额，差额 > 0 视为订单失败
    if (input.expectedAmountFen != null && !assertOrderAmountMatch(input.expectedAmountFen, input.amountFen)) {
      return errResult('AMOUNT_MISMATCH', `expected ${input.expectedAmountFen} != actual ${input.amountFen}`);
    }
    // 幂等：调用方提供 key，重复提交返回已有订单
    if (input.idempotencyKey && SEEN_KEYS.has(input.idempotencyKey)) {
      const existing = ORDERS.find((o) => o.idempotencyKey === input.idempotencyKey);
      if (existing) return okResult(existing);
    }
    const ik = input.idempotencyKey ?? genIdempotencyKey();
    SEEN_KEYS.add(ik);
    const id = `wx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const payload = JSON.stringify({ id, giftId: input.giftId, amountFen: input.amountFen, ik });
    const order: WechatPayOrder = {
      id,
      publish_id: input.publishId ?? null,
      content_id: input.contentId ?? null,
      recommendation_id: input.recommendationId ?? null,
      gift_id: input.giftId,
      amount_fen: input.amountFen,
      commission_fen: input.commissionFen,
      status: 'CREATED',
      prepayId: null,
      transactionId: null,
      refundId: null,
      createdAt: Date.now(),
      paidAt: null,
      refundedAt: null,
      idempotencyKey: ik,
      signature: mockSign(payload)
    };
    ORDERS.push(order);
    return okResult(order);
  },

  async prepare(orderId: string): Promise<ProviderCallResult<WechatPayOrder>> {
    const o = ORDERS.find((x) => x.id === orderId);
    if (!o) return errResult('ORDER_NOT_FOUND', orderId);
    if (o.status !== 'CREATED') return errResult('INVALID_STATE', `status=${o.status}`);
    o.status = 'PREPARED';
    o.prepayId = `prepay_${Date.now()}`;
    return okResult(o);
  },

  async pay(orderId: string, _code: string): Promise<ProviderCallResult<WechatPayOrder>> {
    const o = ORDERS.find((x) => x.id === orderId);
    if (!o) return errResult('ORDER_NOT_FOUND', orderId);
    if (o.status !== 'PREPARED') return errResult('INVALID_STATE', `status=${o.status}`);
    o.status = 'PAID';
    o.transactionId = `tx_${Date.now()}`;
    o.paidAt = Date.now();
    return okResult(o);
  },

  async refund(orderId: string): Promise<ProviderCallResult<WechatPayOrder>> {
    const o = ORDERS.find((x) => x.id === orderId);
    if (!o) return errResult('ORDER_NOT_FOUND', orderId);
    if (o.status !== 'PAID') return errResult('INVALID_STATE', `status=${o.status}`);
    o.status = 'REFUNDING';
    return okResult(o);
  },

  /* 退款终态（宪法 §4.2）：REFUNDING → REFUNDED */
  async completeRefund(orderId: string): Promise<ProviderCallResult<WechatPayOrder>> {
    const o = ORDERS.find((x) => x.id === orderId);
    if (!o) return errResult('ORDER_NOT_FOUND', orderId);
    if (o.status !== 'REFUNDING') return errResult('INVALID_STATE', `status=${o.status}`);
    o.status = 'REFUNDED';
    o.refundId = `rf_${Date.now()}`;
    o.refundedAt = Date.now();
    return okResult(o);
  },

  /* SECURITY gate 必填：回调验签 */
  verifyCallback(orderId: string, signature: string): { ok: boolean; reason?: string } {
    const o = ORDERS.find((x) => x.id === orderId);
    if (!o) return { ok: false, reason: 'order not found' };
    const payload = JSON.stringify({
      id: o.id,
      giftId: o.gift_id,
      amountFen: o.amount_fen,
      ik: o.idempotencyKey
    });
    return verifySign(payload, signature) ? { ok: true } : { ok: false, reason: 'signature mismatch' };
  },

  list(): WechatPayOrder[] {
    return [...ORDERS];
  }
};

export default wechatPayMock;
