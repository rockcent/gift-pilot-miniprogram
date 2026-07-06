import { styleMock, STYLE_CHIPS } from '../../src/services/ai/style';
import { STYLE_IDS, blankStyleProfile } from '../../src/types';

describe('services/ai/style (V0.8 PR-2)', () => {
  test('STYLE_CHIPS has exactly 6 entries', () => {
    expect(STYLE_CHIPS).toHaveLength(6);
  });

  test('each chip has unique id, label, emoji, presetStyle', () => {
    const ids = new Set<string>();
    for (const c of STYLE_CHIPS) {
      expect(typeof c.id === 'string' && c.id.length > 0).toBe(true);
      expect(typeof c.label === 'string' && c.label.length > 0).toBe(true);
      expect(typeof c.emoji === 'string' && c.emoji.length > 0).toBe(true);
      expect(typeof c.description === 'string' && c.description.length > 0).toBe(true);
      expect(['share', 'review', 'emotion']).toContain(c.presetStyle);
      ids.add(c.id);
    }
    expect(ids.size).toBe(STYLE_CHIPS.length);
    expect(ids.size).toBe(6);
  });

  test('all 6 PRD-mandated StyleIds are present', () => {
    for (const id of STYLE_IDS) {
      const chip = styleMock.getChipById(id);
      expect(chip).toBeDefined();
    }
    expect(styleMock.assertSixIds().ok).toBe(true);
    expect(styleMock.assertSixIds().missing).toEqual([]);
  });

  test('learnFromEdit returns ok with used=1 and lastUsedAt', async () => {
    const res = await styleMock.learnFromEdit({
      styleId: 'share',
      originalText: 'A',
      editedText: 'B'
    });
    expect(res.ok).toBe(true);
    expect(res.data?.used).toBe(1);
    expect(typeof res.data?.lastUsedAt === 'number').toBe(true);
  });

  test('generatePersonal shortens text when sentenceLen=short', async () => {
    const longText = '这是一段非常长的文案。'.repeat(40);
    const profile = { ...blankStyleProfile(), sentenceLen: 'short' as const };
    const res = await styleMock.generatePersonal({ baseText: longText, profile });
    expect(res.ok).toBe(true);
    expect((res.data ?? '').length).toBeLessThanOrEqual(61);  // 60 + '…'
  });

  test('generatePersonal sprinkles emojis when emojiRate>0.5', async () => {
    const text = '第一句。第二句。第三句。第四句。';
    const profile = { ...blankStyleProfile(), emojiRate: 0.8 };
    const res = await styleMock.generatePersonal({ baseText: text, profile });
    expect(res.ok).toBe(true);
    expect(res.data).toMatch(/[✨🌸🌿🎁💝☕🌞🍃]/);
  });

  test('generatePersonal returns base text when emojiRate=0 and short input', async () => {
    const text = '很短的一句话';
    const profile = { ...blankStyleProfile(), emojiRate: 0, sentenceLen: 'medium' as const };
    const res = await styleMock.generatePersonal({ baseText: text, profile });
    expect(res.ok).toBe(true);
    expect(res.data).toBe(text);
  });
});
