/* 阶段二-C · 真实商品库（CPS mock）
 *
 * 真实接入：淘宝客 / 京东 / 拼多多 CPS SDK
 * 当前 mock：基于 mock-gifts.json 的标准化接口
 */
import type { Gift } from '../../types';
import mockGifts from '../../data/mock-gifts.json';
import { okResult, recordUsageEvent } from '../../platform/adapter';
import type { ProviderCallResult } from '../../platform/adapter';

export interface CpsProduct {
  id: string;
  source: 'taobao' | 'jd' | 'pdd' | 'mock';
  title: string;
  price_fen: number;
  commission_fen: number;
  category: string;
  image: string;
  brand: string;
  stock: number;
  url: string;
  riskLevel: 'low' | 'medium' | 'high';
}

function mockToCps(g: Gift): CpsProduct {
  return {
    id: g.id,
    source: 'mock',
    title: g.title,
    price_fen: g.price_fen,
    commission_fen: Math.round(g.price_fen * 0.3),
    category: g.category,
    image: g.image,
    brand: g.brand,
    stock: 100,
    url: `https://mock.cps.local/product/${g.id}`,
    riskLevel: 'low'
  };
}

export const cpsMock = {
  async search(query: { keyword?: string; category?: string; minPriceFen?: number; maxPriceFen?: number }): Promise<ProviderCallResult<CpsProduct[]>> {
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'cps.search', query: JSON.stringify(query).slice(0, 80) }
    });
    let products = (mockGifts as Gift[]).map(mockToCps);
    if (query.keyword) {
      const k = query.keyword.toLowerCase();
      products = products.filter((p) => p.title.toLowerCase().includes(k));
    }
    if (query.category) {
      products = products.filter((p) => p.category.includes(query.category!));
    }
    if (query.minPriceFen != null) products = products.filter((p) => p.price_fen >= query.minPriceFen!);
    if (query.maxPriceFen != null) products = products.filter((p) => p.price_fen <= query.maxPriceFen!);
    return okResult(products);
  },

  async getById(id: string): Promise<ProviderCallResult<CpsProduct | null>> {
    const g = (mockGifts as Gift[]).find((x) => x.id === id);
    if (!g) return okResult(null);
    return okResult(mockToCps(g));
  }
};

export default cpsMock;
