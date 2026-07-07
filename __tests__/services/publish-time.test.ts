import { publishTimeMock } from '../../src/services/ai/publish-time';
import { PUBLISH_TIME_SLOT_IDS } from '../../src/types';

describe('services/ai/publish-time (V0.8 PR-3)', () => {
  test('fetchPublishTimeSlots returns exactly 3 slots', async () => {
    const res = await publishTimeMock.fetchPublishTimeSlots();
    expect(res.ok).toBe(true);
    expect(res.data).not.toBeNull();
    expect(res.data).toHaveLength(3);
  });

  test('each slot has required fields and PRD-mandated ids', async () => {
    const res = await publishTimeMock.fetchPublishTimeSlots();
    const slots = res.data ?? [];
    const ids = slots.map((s) => s.id);
    expect(ids).toEqual(PUBLISH_TIME_SLOT_IDS);
    for (const s of slots) {
      expect(typeof s.id).toBe('string');
      expect(typeof s.label).toBe('string');
      expect(s.label.length).toBeGreaterThan(0);
      expect(typeof s.scheduledAt).toBe('string');
      expect(s.scheduledAt.length).toBeGreaterThan(0);
      // ISO 可解析
      const t = Date.parse(s.scheduledAt);
      expect(Number.isFinite(t)).toBe(true);
      expect(typeof s.reason).toBe('string');
      expect(s.reason.length).toBeGreaterThan(0);
      expect(s.expectedCtr).toBeGreaterThan(0);
      expect(s.expectedCtr).toBeLessThanOrEqual(1);
    }
  });

  test('tonight-evening slot rolls to next day if now is after 21:00', async () => {
    // 假设 now = 22:00，tonight 21:00 已过，应 roll 到明天 21:00
    const fakeNow = new Date('2026-07-07T22:00:00');
    const res = await publishTimeMock.fetchPublishTimeSlots(fakeNow);
    const tonight = (res.data ?? []).find((s) => s.id === 'tonight-evening');
    expect(tonight).toBeDefined();
    const tomorrowSameHour = new Date(fakeNow);
    tomorrowSameHour.setDate(fakeNow.getDate() + 1);
    tomorrowSameHour.setHours(21, 0, 0, 0);
    expect(tonight!.scheduledAt).toBe(tomorrowSameHour.toISOString());
  });

  test('getSlotById returns matching slot', async () => {
    const res = await publishTimeMock.fetchPublishTimeSlots();
    const list = res.data ?? [];
    const target = list[1];
    const found = publishTimeMock.getSlotById(target.id, list);
    expect(found).toBeDefined();
    expect(found!.id).toBe(target.id);
    expect(publishTimeMock.getSlotById('not-exist' as any, list)).toBeUndefined();
  });
});
