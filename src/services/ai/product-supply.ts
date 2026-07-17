/* V1.0 PR-18 · 商品供给策略
 *
 * PRD §14 #6：库存感知 + 佣金优化 + 风险评分
 * mock 阶段：基于 mock-gifts 计算 3 项分数，输出 healthy / cooling / fading
 */
import type { Gift } from '../../types';
import { okResult, recordUsageEvent } from '../../platform/adapter';
import type { ProviderCallResult } from '../../platform/adapter';

export interface SupplyScore {
  giftId: string;
  inventory: number;        // 0..1, 1 = 充足
  commissionYield: number;  // 0..1
  riskScore: number;        // 0..1, 0 = 安全
  composite: number;        // 0..100
  recommendation: 'promote' | 'maintain' | 'deprecate';
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const productSupplyMock = {
  async scoreGifts(gifts: Gift[]): Promise<ProviderCallResult<SupplyScore[]>> {
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'product-supply.score', count: gifts.length }
    });
    const scores: SupplyScore[] = gifts.map((g) => {
      const h = hash(g.id);
      const inventory = Math.min(1, (h % 7 === 0) ? 0.2 : ((h % 5) / 5 + 0.5));
      const commissionYield = Math.min(1, g.price_fen / 50000);
      const riskScore = (h % 11 === 0) ? 0.7 : ((h % 13) / 13 * 0.3); // 偶尔 0.7
      // composite = 库存 × 40% + 佣金 × 35% + (1 - 风险) × 25%
      const composite = Math.round((inventory * 0.4 + commissionYield * 0.35 + (1 - riskScore) * 0.25) * 100);
      const recommendation: SupplyScore['recommendation'] =
        composite >= 70 ? 'promote' :
        composite >= 45 ? 'maintain' : 'deprecate';
      return { giftId: g.id, inventory, commissionYield, riskScore, composite, recommendation };
    });
    return okResult(scores);
  }
};

export default productSupplyMock;
