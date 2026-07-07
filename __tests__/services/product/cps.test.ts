import { cpsMock } from '../../../src/services/product/cps';

describe('services/product/cps (阶段二-C)', () => {
  test('search returns all 5 mock gifts by default', async () => {
    const res = await cpsMock.search({});
    expect(res.ok).toBe(true);
    expect(res.data!.length).toBe(5);
    for (const p of res.data!) {
      expect(['taobao', 'jd', 'pdd', 'mock']).toContain(p.source);
      expect(p.price_fen).toBeGreaterThan(0);
      expect(p.commission_fen).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(p.riskLevel);
    }
  });

  test('search filters by keyword', async () => {
    const res = await cpsMock.search({ keyword: '香氛' });
    expect(res.data!.length).toBeGreaterThan(0);
    for (const p of res.data!) {
      expect(p.title.includes('香氛')).toBe(true);
    }
  });

  test('search filters by price range', async () => {
    const res = await cpsMock.search({ minPriceFen: 10000, maxPriceFen: 25000 });
    for (const p of res.data!) {
      expect(p.price_fen).toBeGreaterThanOrEqual(10000);
      expect(p.price_fen).toBeLessThanOrEqual(25000);
    }
  });

  test('getById returns single product', async () => {
    const res = await cpsMock.getById('gft_001');
    expect(res.ok).toBe(true);
    expect(res.data).not.toBeNull();
    expect(res.data!.id).toBe('gft_001');
  });

  test('getById returns null for unknown id', async () => {
    const res = await cpsMock.getById('gft_999');
    expect(res.ok).toBe(true);
    expect(res.data).toBeNull();
  });
});
