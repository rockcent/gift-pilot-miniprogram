import { useAIStore } from '../../src/stores/ai-store';

describe('stores/ai-store V0.8 PR-1 fields', () => {
  beforeEach(() => useAIStore.getState().reset());

  test('initial state for V0.8 fields: weekPlan=null, festivals=[]', () => {
    const s = useAIStore.getState();
    expect(s.weekPlan).toBeNull();
    expect(s.festivalOpportunities).toEqual([]);
  });

  test('loadWeekPlan populates weekPlan from mock', async () => {
    const res = await useAIStore.getState().loadWeekPlan();
    expect(res.ok).toBe(true);
    const wp = useAIStore.getState().weekPlan;
    expect(wp).not.toBeNull();
    expect(wp!.days).toHaveLength(7);
  });

  test('loadFestivalOpportunities populates festivals sorted by daysAway', async () => {
    const res = await useAIStore.getState().loadFestivalOpportunities();
    expect(res.ok).toBe(true);
    const list = useAIStore.getState().festivalOpportunities;
    expect(list.length).toBeGreaterThan(0);
    for (let i = 1; i < list.length; i += 1) {
      expect(list[i].daysAway).toBeGreaterThanOrEqual(list[i - 1].daysAway);
    }
  });

  test('reset() clears V0.8 fields without touching legacy fields', () => {
    // first populate
    useAIStore.setState({
      weekPlan: { weekId: '2026-W99', startDate: '2099-01-01', days: [], weeklyKpi: { publishTarget: 0, commissionTargetFen: 0 } },
      festivalOpportunities: [{ id: 'x', name: 'X', emoji: 'x', startDate: '2099-01-01', endDate: '2099-01-01', daysAway: 0, recommendedRelations: ['mother'], hotGifts: [], aiPitch: 'x' }]
    });
    useAIStore.getState().reset();
    expect(useAIStore.getState().weekPlan).toBeNull();
    expect(useAIStore.getState().festivalOpportunities).toEqual([]);
  });
});
