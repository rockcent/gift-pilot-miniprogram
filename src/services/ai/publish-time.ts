/* V0.8 PR-3 · 发布时间候选 mock service
 * 接口形态 = ProviderCallResult<T>（与宪法 §6 + §8.2 一致）。
 */
import type { ProviderCallResult, PublishTimeSlot, PublishTimeSlotId } from '../../types';
import { okResult, errResult } from '../../utils/trace';

function simulate(ms = 180): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function generateThreeSlots(now = new Date()): PublishTimeSlot[] {
  const tomorrow8 = new Date(now); tomorrow8.setDate(now.getDate() + 1); tomorrow8.setHours(8, 30, 0, 0);
  const tonight21 = new Date(now); tonight21.setHours(21, 0, 0, 0);
  if (tonight21.getTime() <= now.getTime()) tonight21.setDate(tonight21.getDate() + 1);
  const dayAfter12 = new Date(now); dayAfter12.setDate(now.getDate() + 2); dayAfter12.setHours(12, 0, 0, 0);
  return [
    { id: 'tomorrow-morning', label: '明早 8:30',  scheduledAt: tomorrow8.toISOString(), reason: '上班路上刷手机高峰',  expectedCtr: 0.18 },
    { id: 'tonight-evening',  label: '今晚 21:00', scheduledAt: tonight21.toISOString(), reason: '睡前送礼决策时段',   expectedCtr: 0.22 },
    { id: 'day-after-noon',   label: '后天中午',  scheduledAt: dayAfter12.toISOString(), reason: '周末礼物准备时段',   expectedCtr: 0.15 }
  ];
}

export const publishTimeMock = {
  async fetchPublishTimeSlots(now?: Date): Promise<ProviderCallResult<PublishTimeSlot[]>> {
    try {
      await simulate(220);
      return okResult<PublishTimeSlot[]>(generateThreeSlots(now));
    } catch (e) {
      return errResult<PublishTimeSlot[]>('PUBLISH_TIME_FETCH_FAIL', String(e));
    }
  },

  getSlotById(id: PublishTimeSlotId, list: PublishTimeSlot[]): PublishTimeSlot | undefined {
    return list.find((s) => s.id === id);
  }
};

export default publishTimeMock;
