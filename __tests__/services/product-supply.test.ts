import { productSupplyMock } from '../../src/services/ai/product-supply';
import type { Gift } from '../../src/types';

const gifts: Gift[] = [
  { id: 'g1', title: 'A', brand: '', image: '', price_fen: 10000, price_text: '', match_score: 80, relation_tags: [], reason: '', category: 'x' },
  { id: 'g2', title: 'B', brand: '', image: '', price_fen: 30000, price_text: '', match_score: 85, relation_tags: [], reason: '', category: 'y' },
  { id: 'g3', title: 'C', brand: '', image: '', price_fen: 60000, price_text: '', match_score: 90, relation_tags: [], reason: '', category: 'z' }
];

describe('services/ai/product-supply (V1.0 PR-18)', () => {
  test('scoreGifts returns one score per gift', async () => {
    const res = await productSupplyMock.scoreGifts(gifts);
    expect(res.ok).toBe(true);
    expect(res.data).toHaveLength(3);
    for (const s of res.data!) {
      expect(s.giftId.length).toBeGreaterThan(0);
      expect(s.inventory).toBeGreaterThanOrEqual(0);
      expect(s.inventory).toBeLessThanOrEqual(1);
      expect(s.commissionYield).toBeGreaterThanOrEqual(0);
      expect(s.commissionYield).toBeLessThanOrEqual(1);
      expect(s.riskScore).toBeGreaterThanOrEqual(0);
      expect(s.riskScore).toBeLessThanOrEqual(1);
      expect(s.composite).toBeGreaterThanOrEqual(0);
      expect(s.composite).toBeLessThanOrEqual(100);
      expect(['promote', 'maintain', 'deprecate']).toContain(s.recommendation);
    }
  });

  test('higher composite → promote recommendation', async () => {
    const res = await productSupplyMock.scoreGifts(gifts);
    const sorted = [...res.data!].sort((a, b) => b.composite - a.composite);
    expect(sorted[0].recommendation).toBe('promote');
  });

  test('g3 (highest price) gets highest commissionYield', async () => {
    const res = await productSupplyMock.scoreGifts(gifts);
    const g3 = res.data!.find((s) => s.giftId === 'g3')!;
    expect(g3.commissionYield).toBeGreaterThanOrEqual(0.5);
  });
});
