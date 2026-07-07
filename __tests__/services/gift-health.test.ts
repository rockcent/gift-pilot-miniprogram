import { giftHealthMock } from '../../src/services/ai/gift-health';
import { GIFT_HEALTH_STATUSES, judgeGiftHealth, buildHealthReason } from '../../src/types';

describe('services/ai/gift-health (V0.8 PR-4)', () => {
  test('fetchGiftHealthFlags returns one flag per giftId', async () => {
    const res = await giftHealthMock.fetchGiftHealthFlags(['gft_001', 'gft_002', 'gft_003']);
    expect(res.ok).toBe(true);
    expect(res.data).toHaveLength(3);
    for (const f of res.data ?? []) {
      expect(typeof f.giftId).toBe('string');
      expect(GIFT_HEALTH_STATUSES).toContain(f.status);
      expect(typeof f.reason).toBe('string');
      expect(f.reason.length).toBeGreaterThan(0);
      expect(typeof f.stats.orders7d).toBe('number');
      expect(typeof f.stats.clicks7d).toBe('number');
      expect(typeof f.stats.refundsTotal).toBe('number');
    }
  });

  test('judgeGiftHealth maps stats to one of 3 statuses', () => {
    expect(judgeGiftHealth({ orders7d: 5, clicks7d: 100, refundsTotal: 0 })).toBe('healthy');
    expect(judgeGiftHealth({ orders7d: 1, clicks7d: 100, refundsTotal: 0 })).toBe('cooling');
    expect(judgeGiftHealth({ orders7d: 0, clicks7d: 0, refundsTotal: 0 })).toBe('fading');
    expect(judgeGiftHealth({ orders7d: 5, clicks7d: 100, refundsTotal: 3 })).toBe('fading');
    expect(judgeGiftHealth({ orders7d: 3, clicks7d: 100, refundsTotal: 1 })).toBe('cooling');
  });

  test('buildHealthReason produces non-empty Chinese text per status', () => {
    const txt1 = buildHealthReason('healthy', { orders7d: 5, clicks7d: 100, refundsTotal: 0 });
    expect(txt1).toMatch(/健康|稳定|%/);
    const txt2 = buildHealthReason('cooling', { orders7d: 1, clicks7d: 80, refundsTotal: 0 });
    expect(txt2.length).toBeGreaterThan(0);
    const txt3 = buildHealthReason('fading', { orders7d: 0, clicks7d: 50, refundsTotal: 2 });
    expect(txt3).toMatch(/退款|订单|替换/);
  });

  test('replaceGift returns new gift with different id and title', async () => {
    const res = await giftHealthMock.replaceGift('gft_001');
    expect(res.ok).toBe(true);
    expect(res.data).not.toBeNull();
    expect(res.data!.oldGiftId).toBe('gft_001');
    expect(res.data!.newGift.id).not.toBe('gft_001');
    expect(typeof res.data!.newGift.title).toBe('string');
    expect(res.data!.newGift.title.length).toBeGreaterThan(0);
    expect(typeof res.data!.newGift.price_fen).toBe('number');
    expect(typeof res.data!.replacedAt).toBe('number');
  });

  test('sortFlags orders healthy → cooling → fading', async () => {
    const flags = [
      { giftId: 'a', status: 'fading' as const,  reason: 'x', stats: { orders7d: 0, clicks7d: 0, refundsTotal: 0 } },
      { giftId: 'b', status: 'healthy' as const, reason: 'x', stats: { orders7d: 5, clicks7d: 100, refundsTotal: 0 } },
      { giftId: 'c', status: 'cooling' as const, reason: 'x', stats: { orders7d: 1, clicks7d: 80, refundsTotal: 0 } }
    ];
    const sorted = giftHealthMock.sortFlags(flags);
    expect(sorted.map((f) => f.status)).toEqual(['healthy', 'cooling', 'fading']);
  });

  test('mock data includes gft_001..gft_004 which yield non-fading flags', async () => {
    const res = await giftHealthMock.fetchGiftHealthFlags(['gft_001', 'gft_002', 'gft_003', 'gft_004']);
    expect(res.ok).toBe(true);
    // 4 active gift 至少不是全 fading（mock 设计 orders7d >= 1）
    const fadingCount = (res.data ?? []).filter((f) => f.status === 'fading').length;
    expect(fadingCount).toBeLessThan(4);
  });
});
