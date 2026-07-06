/* V0.8 PR-1 · 节日机会 mock service
 * 接口形态严格按宪法 §6：ProviderCallResult<FestivalOpportunity[]>。
 * fetchFestivalOpportunities 自动过滤 30 天外 + 按 daysAway 升序。
 */
import type { FestivalOpportunity, ProviderCallResult } from '../../types';
import { computeDaysAway } from '../../types';
import { okResult, errResult } from '../../utils/trace';
import festivalSeed from '../../data/mock-festivals.json';

function simulate(ms = 220): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const HORIZON_DAYS = 30;

export const festivalMock = {
  async fetchFestivalOpportunities(today: Date = new Date()): Promise<ProviderCallResult<FestivalOpportunity[]>> {
    try {
      await simulate(300);
      const all = festivalSeed as unknown as FestivalOpportunity[];
      const enriched = all
        .map((f) => ({ ...f, daysAway: computeDaysAway(f.startDate, today) }))
        .filter((f) => f.daysAway >= 0 && f.daysAway <= HORIZON_DAYS)
        .sort((a, b) => a.daysAway - b.daysAway);
      return okResult<FestivalOpportunity[]>(enriched);
    } catch (e) {
      return errResult<FestivalOpportunity[]>('FESTIVAL_FETCH_FAIL', String(e));
    }
  }
};

export default festivalMock;
