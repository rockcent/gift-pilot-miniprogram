import { festivalMock } from '../../src/services/ai/festival';

describe('services/ai/festival (V0.8 PR-1)', () => {
  test('returns only festivals within [0, 30] days, sorted asc by daysAway', async () => {
    const today = new Date('2026-07-06T08:00:00.000Z');
    const res = await festivalMock.fetchFestivalOpportunities(today);
    expect(res.ok).toBe(true);
    expect(res.error).toBeNull();
    const list = res.data!;
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    for (const f of list) {
      expect(f.daysAway).toBeGreaterThanOrEqual(0);
      expect(f.daysAway).toBeLessThanOrEqual(30);
    }
    for (let i = 1; i < list.length; i += 1) {
      expect(list[i].daysAway).toBeGreaterThanOrEqual(list[i - 1].daysAway);
    }
  });

  test('excludes festivals more than 30 days away and any past dates', async () => {
    const today = new Date('2026-07-06T08:00:00.000Z');
    const res = await festivalMock.fetchFestivalOpportunities(today);
    const list = res.data!;
    // mid-autumn (10-03) = 89 days, must be excluded
    // double-eleven (11-11) = 128 days, must be excluded
    expect(list.find((f) => f.id === 'mid-autumn-2026')).toBeUndefined();
    expect(list.find((f) => f.id === 'double-eleven-2026')).toBeUndefined();
  });

  test('each festival has emoji + name + aiPitch + recommendedRelations + hotGifts', async () => {
    const today = new Date('2026-07-06T08:00:00.000Z');
    const res = await festivalMock.fetchFestivalOpportunities(today);
    for (const f of res.data!) {
      expect(typeof f.emoji === 'string' && f.emoji.length > 0).toBe(true);
      expect(typeof f.name === 'string' && f.name.length > 0).toBe(true);
      expect(typeof f.aiPitch === 'string' && f.aiPitch.length > 0).toBe(true);
      expect(Array.isArray(f.recommendedRelations)).toBe(true);
      expect(f.recommendedRelations.length).toBeGreaterThan(0);
      expect(Array.isArray(f.hotGifts)).toBe(true);
    }
  });
});
