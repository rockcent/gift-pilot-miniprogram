import { planMock } from '../../src/services/ai/plan';
import { computeDaysAway } from '../../src/types';

describe('services/ai/plan (V0.8 PR-1)', () => {
  test('fetchWeekPlan returns ok with valid 7-day plan', async () => {
    const res = await planMock.fetchWeekPlan();
    expect(res.ok).toBe(true);
    expect(res.error).toBeNull();
    expect(res.trace_id).toMatch(/^tr_/);
    const wp = res.data!;
    expect(wp.weekId).toMatch(/^\d{4}-W\d{2}$/);
    expect(wp.days).toHaveLength(7);
    expect(wp.weeklyKpi.publishTarget).toBeGreaterThan(0);
    expect(Number.isInteger(wp.weeklyKpi.commissionTargetFen)).toBe(true);
  });

  test('every day has at least one task, total ≥ 7', async () => {
    const res = await planMock.fetchWeekPlan();
    const wp = res.data!;
    for (const day of wp.days) {
      expect(day.tasks.length).toBeGreaterThanOrEqual(1);
    }
    const total = wp.days.reduce((acc, d) => acc + d.tasks.length, 0);
    expect(total).toBeGreaterThanOrEqual(7);
  });

  test('task status is one of allowed values, scene is allowed', async () => {
    const res = await planMock.fetchWeekPlan();
    const scenes: Array<string> = [];
    const statuses: Array<string> = [];
    for (const day of res.data!.days) for (const t of day.tasks) {
      scenes.push(t.scene);
      statuses.push(t.status);
    }
    for (const s of scenes) {
      expect(['birthday', 'festival', 'campaign', 'routine']).toContain(s);
    }
    for (const st of statuses) {
      expect(['pending', 'in_progress', 'done', 'skipped']).toContain(st);
    }
  });
});

describe('computeDaysAway (V0.8 PR-1 utils)', () => {
  test('returns 0 for today', () => {
    const today = new Date('2026-07-06T08:00:00.000Z');
    expect(computeDaysAway('2026-07-06T00:00:00.000Z', today)).toBe(0);
  });
  test('returns positive for future dates', () => {
    const today = new Date('2026-07-06T08:00:00.000Z');
    expect(computeDaysAway('2026-08-08T00:00:00.000Z', today)).toBe(33);
    expect(computeDaysAway('2026-07-12T00:00:00.000Z', today)).toBe(6);
  });
  test('returns negative for past dates', () => {
    const today = new Date('2026-07-06T08:00:00.000Z');
    expect(computeDaysAway('2026-05-10T00:00:00.000Z', today)).toBeLessThan(0);
  });
});
