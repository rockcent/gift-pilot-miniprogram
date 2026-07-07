import { multimodalMock } from '../../src/services/ai/multimodal';

describe('services/ai/multimodal (V1.0 PR-16)', () => {
  test('parse detects relation=mother from keywords', async () => {
    const res = await multimodalMock.parse({ mode: 'text', payload: '送给妈妈的生日礼物' });
    expect(res.ok).toBe(true);
    expect(res.data!.relation).toBe('mother');
    expect(res.data!.scene).toBe('birthday');
  });

  test('parse detects scene=festival for 中秋', async () => {
    const res = await multimodalMock.parse({ mode: 'text', payload: '中秋节想送长辈' });
    expect(res.data!.scene).toBe('festival');
    expect(res.data!.relation).toBe('mother'); // 长辈
  });

  test('parse defaults to friend + routine when no keywords match', async () => {
    const res = await multimodalMock.parse({ mode: 'text', payload: 'abc 123 xyz' });
    expect(res.data!.relation).toBe('friend');
    expect(res.data!.scene).toBe('routine');
  });

  test('transcribe returns mock Chinese text', async () => {
    const res = await multimodalMock.transcribe('mock://audio.m4a');
    expect(res.ok).toBe(true);
    expect(typeof res.data).toBe('string');
    expect((res.data as string).length).toBeGreaterThan(0);
  });

  test('ocrScreenshot returns mock text', async () => {
    const res = await multimodalMock.ocrScreenshot('mock://screenshot.jpg');
    expect(res.ok).toBe(true);
    expect((res.data as string).includes('同事') || (res.data as string).includes('生日')).toBe(true);
  });

  test('resolveLink extracts product id from URL', async () => {
    const res = await multimodalMock.resolveLink('https://item.jd.com/123456.html');
    expect(res.data!.title).toContain('123456');
    expect(typeof res.data!.price_fen).toBe('number');
  });
});
