import { wechatPayMock } from '../../../src/services/payment/wechat-pay';

describe('services/payment/wechat-pay (阶段二-D)', () => {
  test('create validates amount_fen is positive integer', async () => {
    const r1 = await wechatPayMock.create({ giftId: 'g1', publishId: null, amountFen: 0, commissionFen: 0 });
    expect(r1.ok).toBe(false);
    expect(r1.error?.code).toBe('INVALID_AMOUNT');

    const r2 = await wechatPayMock.create({ giftId: 'g1', publishId: null, amountFen: 199.5 as unknown as number, commissionFen: 0 });
    expect(r2.ok).toBe(false);
    expect(r2.error?.code).toBe('INVALID_AMOUNT');
  });

  test('create → prepare → pay state machine', async () => {
    const c = await wechatPayMock.create({ giftId: 'g1', publishId: 'p1', amountFen: 19900, commissionFen: 5970 });
    expect(c.ok).toBe(true);
    expect(c.data!.status).toBe('CREATED');
    expect(c.data!.idempotencyKey.length).toBeGreaterThan(0);
    expect(c.data!.signature.length).toBeGreaterThan(0);

    const p = await wechatPayMock.prepare(c.data!.id);
    expect(p.ok).toBe(true);
    expect(p.data!.status).toBe('PREPARED');
    expect(p.data!.prepayId).not.toBeNull();

    const paid = await wechatPayMock.pay(c.data!.id, 'mock_code');
    expect(paid.ok).toBe(true);
    expect(paid.data!.status).toBe('PAID');
    expect(paid.data!.transactionId).not.toBeNull();
    expect(paid.data!.paidAt).toBeGreaterThan(0);
  });

  test('SECURITY: verifyCallback rejects bad signature', () => {
    const c = wechatPayMock.create({ giftId: 'g2', publishId: null, amountFen: 100, commissionFen: 30 });
    return c.then((res) => {
      const id = res.data!.id;
      expect(wechatPayMock.verifyCallback(id, 'bad_signature').ok).toBe(false);
      expect(wechatPayMock.verifyCallback(id, res.data!.signature).ok).toBe(true);
    });
  });

  test('refund requires PAID state', async () => {
    const c = await wechatPayMock.create({ giftId: 'g3', publishId: null, amountFen: 500, commissionFen: 150 });
    const r1 = await wechatPayMock.refund(c.data!.id);
    expect(r1.ok).toBe(false);
    expect(r1.error?.code).toBe('INVALID_STATE');

    await wechatPayMock.prepare(c.data!.id);
    await wechatPayMock.pay(c.data!.id, 'code');
    const r2 = await wechatPayMock.refund(c.data!.id);
    expect(r2.ok).toBe(true);
    expect(r2.data!.status).toBe('REFUNDING');
  });

  test('list returns all created orders', async () => {
    const before = wechatPayMock.list().length;
    await wechatPayMock.create({ giftId: 'gx', publishId: null, amountFen: 1000, commissionFen: 300 });
    expect(wechatPayMock.list().length).toBe(before + 1);
  });
});
