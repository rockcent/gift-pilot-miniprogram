/* V0.8 PR-3 · 多平台内容 mock service
 * 三平台规则：
 *   - moments (朋友圈) ≤ 6 行；
 *   - xiaohongshu (小红书) ≤ 200 字 + emoji 多；
 *   - shipinhao (视频号) hook 开头 + 短。
 */
import type { MultiPlatformBundle, PlatformContent, PlatformId, ProviderCallResult } from '../../types';
import { okResult, errResult } from '../../utils/trace';

function simulate(ms = 220): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function truncateByChar(text: string, n: number): string {
  if (text.length <= n) return text;
  return text.slice(0, n - 1) + '…';
}

function toMomentsVariant(sourceText: string, giftName: string): PlatformContent {
  const body = truncateByChar(sourceText, 80)
    .replace(/[。；！？]/g, '\n')
    .split('\n')
    .filter((s) => s.trim())
    .slice(0, 6)
    .join('\n');
  return {
    platformId: 'moments',
    title: '送' + giftName + '的灵感',
    body: body || truncateByChar(sourceText, 60),
    hashtags: ['#生日礼物', '#日常分享'],
    charLimit: 80,
    emojiRate: 0.2
  };
}

function toXiaohongshuVariant(sourceText: string, giftName: string): PlatformContent {
  const head = `✨ ${giftName} 推荐｜${giftName.slice(0, 4)}好物分享`;
  const body = truncateByChar(`${head} \n${sourceText} 🍃 🎁 🌸`, 200);
  const emojiCount = (body.match(/[\u{1F300}-\u{1F9FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}]/gu) ?? []).length;
  return {
    platformId: 'xiaohongshu',
    title: '✨' + giftName,
    body,
    hashtags: ['#礼物', '#好物推荐', '#生日'],
    charLimit: 200,
    emojiRate: emojiCount / body.length
  };
}

function toShipinhaoVariant(sourceText: string, giftName: string): PlatformContent {
  const hooks = [
    '今天发现一个小心思',
    '重要的事讲一遍',
    '如果你也在纠结这件事',
    '今天才明白为什么'
  ];
  const hook = hooks[Math.abs(sourceText.length) % hooks.length];
  const body = truncateByChar(`${hook}：${giftName}。${sourceText.slice(0, 50)}`, 80);
  return {
    platformId: 'shipinhao',
    title: hook,
    body,
    hashtags: ['#送礼', '#生活记录'],
    charLimit: 80,
    emojiRate: 0.1
  };
}

export const multiPlatformMock = {
  async generateMultiPlatform(input: { sourceText: string; giftName: string }): Promise<ProviderCallResult<MultiPlatformBundle>> {
    try {
      await simulate(280);
      const variants: PlatformContent[] = [
        toMomentsVariant(input.sourceText, input.giftName),
        toXiaohongshuVariant(input.sourceText, input.giftName),
        toShipinhaoVariant(input.sourceText, input.giftName)
      ];
      return okResult<MultiPlatformBundle>({
        sourceText: input.sourceText,
        giftName: input.giftName,
        variants,
        generatedAt: Date.now()
      });
    } catch (e) {
      return errResult<MultiPlatformBundle>('MULTI_PLATFORM_FAIL', String(e));
    }
  },

  formatCopyAll(bundle: MultiPlatformBundle | null): string {
    if (!bundle) return '';
    return bundle.variants
      .map((v) => `[${v.platformId}] ${v.body}\n#${(v.hashtags[0] ?? '').replace(/^#/, '')}`)
      .join('\n\n---\n\n');
  }
};

export default multiPlatformMock;
