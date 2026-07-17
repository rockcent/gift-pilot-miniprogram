/* V1.0 PR-15 · 个性化推荐模型
 *
 * PRD §6.2 推荐得分公式：
 *   场景匹配度 × 25% + 关系安全度 × 20% + 人群匹配度 × 15%
 *   + 历史转化率 × 15% + 商品口碑 × 10% + 佣金收益 × 10% + 库存稳定性 × 5%
 *
 * 输入：用户 query（关系 / 场景 / tone）+ 礼物 candidates + 用户历史 stats
 * 输出：按 match_score 降序的 gifts
 */
import type { Gift, GiftQuery } from '../../types';
import { okResult, recordUsageEvent } from '../../platform/adapter';
import type { ProviderCallResult } from '../../platform/adapter';

export interface UserBehaviorStats {
  totalOrders: number;
  totalPublish: number;
  totalClicks: number;
  conversionRate: number; // 0..1
  preferredStyles: string[]; // ['分享', '种草']
  preferredCategories: string[]; // ['香氛', '永生花']
}

export interface RecommendEngineInput {
  query: GiftQuery;
  candidates: Gift[];
  userStats?: UserBehaviorStats;
}

const DEFAULT_USER_STATS: UserBehaviorStats = {
  totalOrders: 5,
  totalPublish: 8,
  totalClicks: 320,
  conversionRate: 0.031,
  preferredStyles: ['分享', '种草'],
  preferredCategories: ['香氛', '永生花']
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function sceneMatch(gift: Gift, q: GiftQuery): number {
  // 礼物 category 或 relation_tags 命中 query.relation 或 query.scene
  const tags = gift.relation_tags ?? [];
  const hit = tags.some((t) => t.includes(q.relation) || t.includes(q.scene));
  return hit ? 1 : 0.4;
}

function relationSafety(gift: Gift, q: GiftQuery): number {
  // 价格区间合理性：budget_fen 上下浮动 50% 都接受
  const lo = q.budget_fen * 0.5;
  const hi = q.budget_fen * 1.5;
  if (gift.price_fen < lo) return 0.6; // 太便宜显得不用心
  if (gift.price_fen > hi) return 0.5; // 太贵显得负担
  return 1;
}

function peopleMatch(gift: Gift, stats: UserBehaviorStats): number {
  const cats = stats.preferredCategories;
  if (cats.length === 0) return 0.6;
  return cats.some((c) => gift.category.includes(c)) ? 1 : 0.5;
}

function historyConversion(stats: UserBehaviorStats): number {
  // 历史转化率 0..0.1 映射到 0.5..1
  return clamp01(0.5 + stats.conversionRate * 5);
}

function productReputation(gift: Gift): number {
  // 用 match_score 作为代理
  return clamp01(gift.match_score / 100);
}

function commissionYield(gift: Gift): number {
  // 假设 commission 30%；价格越高分越高（但有上界）
  const commissionFen = Math.round(gift.price_fen * 0.3);
  return clamp01(commissionFen / 50000); // 500 元 = 1.0
}

function inventoryStability(_gift: Gift): number {
  // mock：所有 5 个 mock gift 都 stable
  return 1;
}

export function scoreGift(gift: Gift, q: GiftQuery, stats: UserBehaviorStats): number {
  const scene = sceneMatch(gift, q) * 0.25;
  const relation = relationSafety(gift, q) * 0.20;
  const people = peopleMatch(gift, stats) * 0.15;
  const hist = historyConversion(stats) * 0.15;
  const rep = productReputation(gift) * 0.10;
  const comm = commissionYield(gift) * 0.10;
  const inv = inventoryStability(gift) * 0.05;
  return Math.round((scene + relation + people + hist + rep + comm + inv) * 100);
}

export const recommendEngineMock = {
  async rank(input: RecommendEngineInput): Promise<ProviderCallResult<Gift[]>> {
    const stats = input.userStats ?? DEFAULT_USER_STATS;
    const ranked = [...input.candidates]
      .map((g) => ({ ...g, match_score: scoreGift(g, input.query, stats) }))
      .sort((a, b) => b.match_score - a.match_score);
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'recommend-engine.rank', candidates: input.candidates.length }
    });
    return okResult(ranked);
  }
};

export default recommendEngineMock;
