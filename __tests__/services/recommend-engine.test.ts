import { recommendEngineMock, scoreGift } from '../../src/services/ai/recommend-engine';
import type { Gift, GiftQuery } from '../../src/types';

const gifts: Gift[] = [
  { id: 'g1', title: '香氛礼盒', brand: 'X', image: '', price_fen: 19900, price_text: '¥199', match_score: 85, relation_tags: ['同事', '生日'], reason: '', category: '香氛' },
  { id: 'g2', title: '永生花', brand: 'Y', image: '', price_fen: 16800, price_text: '¥168', match_score: 78, relation_tags: ['闺蜜'], reason: '', category: '永生花' },
  { id: 'g3', title: '奢侈品', brand: 'Z', image: '', price_fen: 99900, price_text: '¥999', match_score: 90, relation_tags: ['同事'], reason: '', category: '奢侈品' }
];
const query: GiftQuery = {
  relation: '同事',
  scene: '生日',
  tone: 'warm',
  budget_fen: 20000,
  raw_query: '同事生日礼物'
};

describe('services/ai/recommend-engine (V1.0 PR-15)', () => {
  test('scoreGift returns 0..100 integer', () => {
    for (const g of gifts) {
      const s = scoreGift(g, query, {
        totalOrders: 5, totalPublish: 8, totalClicks: 320, conversionRate: 0.03,
        preferredStyles: [], preferredCategories: ['香氛']
      });
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  test('rank returns sorted gifts by match_score desc', async () => {
    const res = await recommendEngineMock.rank({ query, candidates: gifts });
    expect(res.ok).toBe(true);
    const ranked = res.data!;
    expect(ranked).toHaveLength(3);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].match_score).toBeGreaterThanOrEqual(ranked[i].match_score);
    }
  });

  test('奢侈品 (g3) gets lower score than g1 due to price超出', async () => {
    const res = await recommendEngineMock.rank({ query, candidates: gifts });
    const ranked = res.data!;
    const g3Idx = ranked.findIndex((g) => g.id === 'g3');
    const g1Idx = ranked.findIndex((g) => g.id === 'g1');
    expect(g1Idx).toBeLessThan(g3Idx); // g1 价格合理 → 排前
  });
});
