/* V1.0 PR-16 · 多模态输入
 *
 * PRD §6.1 多模态输入框：文字 / 语音 / 商品截图 / 聊天截图 / 商品链接 / 商品图片
 * 阶段二真实接入：Taro.chooseMedia + ASR 后端 + OCR 后端 + image embedding
 * 当前阶段：mock 输入识别 + 解析为结构化 GiftQuery
 */
import type { GiftQuery } from '../../types';
import { okResult, recordUsageEvent, tokensFor } from '../../platform/adapter';
import type { ProviderCallResult } from '../../platform/adapter';

export type InputMode = 'text' | 'voice' | 'screenshot' | 'chat' | 'link' | 'image';

export interface MultimodalInput {
  mode: InputMode;
  payload: string; // 文字内容 / 语音转写 / 截图 OCR 文本 / 商品 URL / 图片描述
  durationMs?: number; // 语音时长
  imageUrl?: string; // 图片 URL（Taro.chooseMedia 返回的临时路径）
}

const RELATION_KEYWORDS: Record<string, string[]> = {
  mother: ['妈妈', '母亲', '妈', '长辈', '母'],
  wife: ['老婆', '妻子', '媳妇', '太太'],
  father: ['爸爸', '父亲', '爸'],
  friend: ['朋友', '闺蜜', '兄弟', '哥们'],
  colleague: ['同事', '老板', '上司', '领导'],
  kids: ['孩子', '儿子', '女儿', '宝宝'],
  partner: ['对象', '男票', '女票', '男朋友', '女朋友', '恋人']
};

const SCENE_KEYWORDS: Record<string, string[]> = {
  birthday: ['生日', '生辰', '庆生'],
  festival: ['春节', '中秋', '圣诞', '情人节', '七夕', '母亲节', '父亲节', '教师节'],
  anniversary: ['纪念日', '周年'],
  campaign: ['开业', '升职', '乔迁'],
  routine: ['日常', '随便', '感谢']
};

const TONE_KEYWORDS: Record<string, string[]> = {
  warm: ['温暖', '暖心', '温馨'],
  formal: ['正式', '商务', '尊敬'],
  casual: ['轻松', '随意', '日常']
};

function detectFromKeywords(text: string, table: Record<string, string[]>): string | null {
  for (const [key, words] of Object.entries(table)) {
    if (words.some((w) => text.includes(w))) return key;
  }
  return null;
}

function defaultBudget(text: string): number {
  // 200 元基准 + 字符影响
  return 20000 + Math.min(text.length * 50, 50000);
}

export const multimodalMock = {
  async parse(input: MultimodalInput): Promise<ProviderCallResult<GiftQuery>> {
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'multimodal.parse', mode: input.mode }
    });
    const text = input.payload;
    const relation = detectFromKeywords(text, RELATION_KEYWORDS) ?? 'friend';
    const scene = detectFromKeywords(text, SCENE_KEYWORDS) ?? 'routine';
    const tone = detectFromKeywords(text, TONE_KEYWORDS) ?? 'warm';
    const budgetFen = defaultBudget(text);
    const query: GiftQuery = {
      relation,
      scene,
      tone,
      budget_fen: budgetFen,
      raw_query: text
    };
    // 模拟 token 使用
    void tokensFor(text);
    return okResult(query);
  },

  async transcribe(audioUrl: string): Promise<ProviderCallResult<string>> {
    // mock ASR：直接返回固定文本
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'multimodal.asr', audioUrl: audioUrl.slice(0, 60) }
    });
    return okResult('送给妈妈的生日礼物，预算 300 左右，温暖一点不要太正式');
  },

  async ocrScreenshot(imageUrl: string): Promise<ProviderCallResult<string>> {
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'multimodal.ocr', imageUrl: imageUrl.slice(0, 60) }
    });
    return okResult('同事生日，关系不错，平时一起吃饭。希望送点实用的，预算 200 内。');
  },

  async resolveLink(url: string): Promise<ProviderCallResult<{ title: string; price_fen: number }>> {
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'multimodal.resolve-link', url: url.slice(0, 80) }
    });
    // mock：从 URL 抽 product id
    const id = url.split('/').pop() ?? 'unknown';
    return okResult({
      title: `来自链接的商品 ${id}`,
      price_fen: 19900
    });
  }
};

export default multimodalMock;
