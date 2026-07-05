import { useMemoryStore } from '../../src/stores/memory-store';

describe('stores/memory', () => {
  beforeEach(() => useMemoryStore.getState().clear());

  test('update budget_range_fen keeps integer pair', () => {
    useMemoryStore.getState().update({ budget_range_fen: [20000, 50000] });
    const m = useMemoryStore.getState().memory;
    expect(m.budget_range_fen).toEqual([20000, 50000]);
    expect(Number.isInteger(m.budget_range_fen[0])).toBe(true);
    expect(Number.isInteger(m.budget_range_fen[1])).toBe(true);
  });

  test('update goal_text updates text', () => {
    useMemoryStore.getState().update({ goal_text: '月佣金 ¥3,000' });
    expect(useMemoryStore.getState().memory.goal_text).toBe('月佣金 ¥3,000');
  });
});
