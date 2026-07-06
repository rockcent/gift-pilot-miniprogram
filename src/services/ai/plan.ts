/* V0.8 PR-1 · 一周经营计划 mock service
 * 接口形态严格按宪法 §6 + plan §D-5：ProviderCallResult<WeekPlan>。
 * 阶段二用 @rockcent/platform/ai 真实 provider 替换。
 */
import type { ProviderCallResult, WeekPlan } from '../../types';
import { okResult, errResult } from '../../utils/trace';
import weekPlanSeed from '../../data/mock-week-plan.json';

function simulate(ms = 220): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const planMock = {
  async fetchWeekPlan(): Promise<ProviderCallResult<WeekPlan>> {
    try {
      await simulate(800);
      const seed = weekPlanSeed as unknown as WeekPlan;
      return okResult<WeekPlan>(seed);
    } catch (e) {
      return errResult<WeekPlan>('PLAN_FETCH_FAIL', String(e));
    }
  }
};

export default planMock;
