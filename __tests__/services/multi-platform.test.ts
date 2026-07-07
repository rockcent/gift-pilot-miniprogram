import { multiPlatformMock } from '../../src/services/ai/multi-platform';
import { PLATFORM_IDS } from '../../src/types';

describe('services/ai/multi-platform (V0.8 PR-3)', () => {
  const giftName = '永生花音乐盒';

  test('generateMultiPlatform returns 3 platform variants', async () => {
    const res = await multiPlatformMock.generateMultiPlatform({
      sourceText: '送给妈妈的生日礼物，她喜欢永生花和小音乐。温暖一点不要太正式。',
      giftName
    });
    expect(res.ok).toBe(true);
    expect(res.data).not.toBeNull();
    expect(res.data!.variants).toHaveLength(3);
    const ids = res.data!.variants.map((v) => v.platformId);
    expect(ids).toEqual(PLATFORM_IDS);
  });

  test('moments variant is short (<=80 chars) and split into <=6 lines', async () => {
    const longText = '很长很长的源文。'.repeat(20);
    const res = await multiPlatformMock.generateMultiPlatform({
      sourceText: longText,
      giftName
    });
    const moments = res.data!.variants.find((v) => v.platformId === 'moments')!;
    expect(moments.charLimit).toBe(80);
    expect(moments.body.length).toBeLessThanOrEqual(80);
    const lineCount = moments.body.split('\n').filter((s) => s.trim().length > 0).length;
    expect(lineCount).toBeLessThanOrEqual(6);
  });

  test('xiaohongshu variant is <=200 chars and contains emojis', async () => {
    const res = await multiPlatformMock.generateMultiPlatform({
      sourceText: '日常送礼推荐。',
      giftName
    });
    const xhs = res.data!.variants.find((v) => v.platformId === 'xiaohongshu')!;
    expect(xhs.charLimit).toBe(200);
    expect(xhs.body.length).toBeLessThanOrEqual(200);
    expect(xhs.emojiRate).toBeGreaterThan(0);
    // emoji 计数 > 0
    const emojiCount = (xhs.body.match(/[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}]/gu) ?? []).length;
    expect(emojiCount).toBeGreaterThan(0);
  });

  test('shipinhao variant opens with a hook and stays short', async () => {
    const res = await multiPlatformMock.generateMultiPlatform({
      sourceText: '送礼是一门功课。',
      giftName
    });
    const ship = res.data!.variants.find((v) => v.platformId === 'shipinhao')!;
    expect(ship.charLimit).toBe(80);
    expect(ship.body.length).toBeLessThanOrEqual(80);
    // hook 开头为中文短语
    const hookPatterns = ['今天发现一个小心思', '重要的事讲一遍', '如果你也在纠结这件事', '今天才明白为什么'];
    const startsWithHook = hookPatterns.some((h) => ship.body.startsWith(h));
    expect(startsWithHook).toBe(true);
  });

  test('formatCopyAll returns empty string for null', () => {
    expect(multiPlatformMock.formatCopyAll(null)).toBe('');
  });

  test('formatCopyAll concatenates all 3 platform bodies with separator', async () => {
    const res = await multiPlatformMock.generateMultiPlatform({
      sourceText: '送礼小建议。',
      giftName
    });
    const out = multiPlatformMock.formatCopyAll(res.data);
    expect(out.length).toBeGreaterThan(0);
    expect(out).toContain('[moments]');
    expect(out).toContain('[xiaohongshu]');
    expect(out).toContain('[shipinhao]');
    expect(out).toContain('---');
  });
});
