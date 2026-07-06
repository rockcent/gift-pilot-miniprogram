/* V0.8 PR-2 · 风格学习 mock service
 * 接口形态严格按宪法 §6 + plan §D-4：ProviderCallResult<T>。
 */
import type {
  ProviderCallResult,
  SentenceLen,
  StyleChipMeta,
  StyleId,
  StyleProfile,
  StyleUsageStat
} from '../../types';
import { STYLE_IDS } from '../../types';
import { okResult, errResult } from '../../utils/trace';

const SENTENCE_LEN_LIMIT: Record<SentenceLen, number> = {
  short: 60,
  medium: 140,
  long: 320
};

const CONTENT_EMOJIS = ['✨', '🌸', '🌿', '🎁', '💝', '☕', '🌞', '🍃'];

export const STYLE_CHIPS: StyleChipMeta[] = [
  { id: 'share',        label: '自然分享',     emoji: '✨', description: '温暖随性，像发朋友圈',  presetStyle: 'share',     isPersonalized: false },
  { id: 'review',       label: '实用推荐',     emoji: '📋', description: '理性对比，简明扼要',    presetStyle: 'review',    isPersonalized: false },
  { id: 'emotion',      label: '情绪价值',     emoji: '💗', description: '有画面感，不喊口号',    presetStyle: 'emotion',   isPersonalized: false },
  { id: 'personal',     label: '个性化',       emoji: '🎯', description: '基于你的风格档案生成',  presetStyle: 'share',     isPersonalized: true },
  { id: 'professional', label: '专业',         emoji: '💼', description: '克制冷静，适合 B 端',    presetStyle: 'review',    isPersonalized: false },
  { id: 'funny',        label: '轻松幽默',     emoji: '😄', description: '年轻同事聚会首选',      presetStyle: 'share',     isPersonalized: false }
];

function simulate(ms = 220): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function pickEmoji(seed: number): string {
  return CONTENT_EMOJIS[seed % CONTENT_EMOJIS.length];
}

function sprinkleEmojis(text: string, rate: number, seed = Date.now()): string {
  if (rate <= 0) return text;
  const sentences = text.split(/[。！？!?]/).filter((s) => s.trim().length > 0);
  return sentences
    .map((s, i) => (i % Math.max(1, Math.round(1 / rate)) === 0 ? `${pickEmoji(seed + i)} ${s.trim()}` : s.trim()))
    .join('。 ');
}

function truncateByLength(text: string, len: SentenceLen): string {
  const limit = SENTENCE_LEN_LIMIT[len];
  if (text.length <= limit) return text;
  return text.slice(0, limit - 1) + '…';
}

export const styleMock = {
  getChipMetaList(): StyleChipMeta[] {
    return STYLE_CHIPS.slice();
  },

  getChipById(id: StyleId): StyleChipMeta | undefined {
    return STYLE_CHIPS.find((c) => c.id === id);
  },

  async learnFromEdit(input: { styleId: StyleId; originalText: string; editedText: string }): Promise<ProviderCallResult<StyleUsageStat>> {
    try {
      await simulate(180);
      const newStat: StyleUsageStat = { used: 1, lastUsedAt: Date.now() };
      return okResult<StyleUsageStat>(newStat);
    } catch (e) {
      return errResult<StyleUsageStat>('STYLE_LEARN_FAIL', String(e));
    }
  },

  async generatePersonal(input: { baseText: string; profile: StyleProfile }): Promise<ProviderCallResult<string>> {
    try {
      await simulate(280);
      let out = input.baseText;
      if (input.profile.emojiRate > 0.5) out = sprinkleEmojis(out, input.profile.emojiRate);
      out = truncateByLength(out, input.profile.sentenceLen);
      return okResult<string>(out);
    } catch (e) {
      return errResult<string>('STYLE_PERSONAL_FAIL', String(e));
    }
  },

  // 静态断言：6 id 必须存在
  assertSixIds(): { ok: boolean; missing: StyleId[] } {
    const present = new Set(STYLE_IDS);
    const missing: StyleId[] = [];
    for (const c of STYLE_CHIPS) {
      if (!present.has(c.id)) missing.push(c.id);
    }
    return { ok: missing.length === 0, missing };
  }
};

export default styleMock;
