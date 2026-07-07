/* V0.8 PR-4 · 商品健康度 mock service
 * 接口形态 = ProviderCallResult<T>（与宪法 §6 + §8.2 一致）。
 * 规则来源：types/judgeGiftHealth() + types/buildHealthReason() —— mock 阶段固定。
 */
import type {
  Gift,
  GiftHealthFlag,
  GiftHealthStat,
  GiftHealthStatus,
  GiftReplacement,
  ProviderCallResult
} from '../../types';
import { judgeGiftHealth, buildHealthReason } from '../../types';
import { okResult, errResult } from '../../utils/trace';
import mockGifts from '../../data/mock-gifts.json';

function simulate(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* mock 健康统计 —— 用 giftId hash 做稳定随机，让每次请求都得到一致结果 */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mockStatFor(giftId: string): GiftHealthStat {
  const h = hashStr(giftId);
  // 4 个 mock-orders 分布在 4 个 gift，gft_001 ~ gft_004 真实有订单；其他低活跃
  const isActive = ['gft_001', 'gft_002', 'gft_003', 'gft_004'].includes(giftId);
  if (isActive) {
    return {
      orders7d: (h % 3) + 1,       // 1-3 单
      clicks7d: ((h % 6) + 2) * 20, // 40-140 击
      refundsTotal: h % 5 === 0 ? 1 : 0
    };
  }
  return {
    orders7d: h % 7 === 0 ? 0 : ((h % 7) <= 1 ? 1 : 0),
    clicks7d: h % 3 === 0 ? 0 : ((h % 3) * 15),
    refundsTotal: h % 11 === 0 ? 2 : 0
  };
}

/* mock 替换：随机选不同 ID 的 gift */
function pickReplacement(oldGiftId: string): Gift {
  const pool = (mockGifts as Gift[]).filter((g) => g.id !== oldGiftId);
  if (pool.length === 0) {
    // 极端兜底：返回 mock 第一项
    return mockGifts[0] as Gift;
  }
  const h = hashStr(oldGiftId + '_replace');
  return pool[h % pool.length];
}

export const giftHealthMock = {
  async fetchGiftHealthFlags(giftIds: string[]): Promise<ProviderCallResult<GiftHealthFlag[]>> {
    try {
      await simulate(240);
      const flags: GiftHealthFlag[] = giftIds.map((id) => {
        const stats = mockStatFor(id);
        const status: GiftHealthStatus = judgeGiftHealth(stats);
        return { giftId: id, status, reason: buildHealthReason(status, stats), stats };
      });
      return okResult<GiftHealthFlag[]>(flags);
    } catch (e) {
      return errResult<GiftHealthFlag[]>('GIFT_HEALTH_FETCH_FAIL', String(e));
    }
  },

  async replaceGift(oldGiftId: string): Promise<ProviderCallResult<GiftReplacement>> {
    try {
      await simulate(280);
      const newGift = pickReplacement(oldGiftId);
      return okResult<GiftReplacement>({
        oldGiftId,
        newGift,
        replacedAt: Date.now()
      });
    } catch (e) {
      return errResult<GiftReplacement>('GIFT_REPLACE_FAIL', String(e));
    }
  },

  /* 排序：healthy → cooling → fading */
  sortFlags(flags: GiftHealthFlag[]): GiftHealthFlag[] {
    const order: Record<GiftHealthStatus, number> = { healthy: 0, cooling: 1, fading: 2 };
    return [...flags].sort((a, b) => order[a.status] - order[b.status]);
  }
};

export default giftHealthMock;
