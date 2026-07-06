import { useMemoryStore } from '../../src/stores/memory-store';
import { STYLE_IDS } from '../../src/types';

describe('stores/memory-store V0.8 PR-2 fields', () => {
  beforeEach(() => useMemoryStore.getState().clear());

  test('initial styleProfile has 6 styles with used=0', () => {
    const s = useMemoryStore.getState();
    expect(s.styleProfile.weights).toBeDefined();
    for (const id of STYLE_IDS) {
      const w = s.styleProfile.weights[id];
      expect(w.used).toBe(0);
      expect(w.lastUsedAt).toBeNull();
    }
    expect(s.styleProfile.totalEdits).toBe(0);
    expect(s.styleProfile.sentenceLen).toBe('medium');
    expect(s.styleProfile.emojiRate).toBe(0.3);
  });

  test('rememberStyle(id) increments weights[id].used by 1 and updates lastUsedAt', () => {
    useMemoryStore.getState().rememberStyle('share');
    const w1 = useMemoryStore.getState().styleProfile.weights.share;
    expect(w1.used).toBe(1);
    expect(typeof w1.lastUsedAt === 'number' && w1.lastUsedAt > 0).toBe(true);
    expect(useMemoryStore.getState().styleProfile.totalEdits).toBe(1);

    useMemoryStore.getState().rememberStyle('share');
    expect(useMemoryStore.getState().styleProfile.weights.share.used).toBe(2);
  });

  test('resetStyleProfile zeroes all weights', () => {
    useMemoryStore.getState().rememberStyle('share');
    useMemoryStore.getState().rememberStyle('funny');
    useMemoryStore.getState().resetStyleProfile();
    const profile = useMemoryStore.getState().styleProfile;
    for (const id of STYLE_IDS) {
      expect(profile.weights[id].used).toBe(0);
      expect(profile.weights[id].lastUsedAt).toBeNull();
    }
  });

  test('clear() also resets styleProfile', () => {
    useMemoryStore.getState().rememberStyle('review');
    useMemoryStore.getState().update({ goal_text: 'changed' });
    useMemoryStore.getState().clear();
    expect(useMemoryStore.getState().memory.goal_text).not.toBe('changed');
    expect(useMemoryStore.getState().styleProfile.weights.review.used).toBe(0);
  });

  test('applyPersonalStyle returns base text when id!=personal', () => {
    const res = useMemoryStore.getState().applyPersonalStyle('原始文案', 'share');
    expect(res).toBe('原始文案');
  });

  test('applyPersonalStyle modifies when id=personal + high emojiRate', () => {
    useMemoryStore.getState().updateStyleProfile({ emojiRate: 0.8, sentenceLen: 'medium' });
    const base = '这是第一段。这里的第二段。结束。';
    const out = useMemoryStore.getState().applyPersonalStyle(base, 'personal');
    expect(out).not.toBe(base);
    expect(out).toMatch(/[✨🌸🎁💝]/);
  });

  test('applyPersonalStyle truncates when sentenceLen=short', () => {
    useMemoryStore.getState().updateStyleProfile({ emojiRate: 0, sentenceLen: 'short' });
    const long = '这是一段比较长的文案。'.repeat(20);
    const out = useMemoryStore.getState().applyPersonalStyle(long, 'personal');
    expect(out.length).toBeLessThanOrEqual(61);
    expect(out.endsWith('…')).toBe(true);
  });
});
