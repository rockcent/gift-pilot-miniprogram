import { create } from 'zustand';
import type { AIMemory, SentenceLen, StyleId, StyleProfile } from '../types';
import { blankStyleProfile } from '../types';
import memorySeed from '../data/mock-memory.json';
import { persistLocal, loadLocal } from '../platform/adapter';

const MEMORY_KEY = 'memory';
const STYLE_KEY = 'style-profile';

/* 清除后回到空白态（PRD §5.3 + 宪法 §4.6「用户可一键清除 AI 记忆」）：
 *   - 所有可枚举字段清空
 *   - budget_range_fen 重置为 [0, 0]
 *   - updated_at / learnedAt 重置为 0
 *   - id / user_id 保留 seed 默认
 *   - styleProfile 重置为 blankStyleProfile()
 */
const BLANK_MEMORY: AIMemory = {
  ...(memorySeed as AIMemory),
  primary_relations: [],
  budget_range_fen: [0, 0],
  preferred_styles: [],
  favorite_categories: [],
  best_publish_window: '',
  goal_text: '',
  updated_at: 0
};

const initialMemory: AIMemory = loadLocal<AIMemory>(MEMORY_KEY, memorySeed as AIMemory);
const initialStyleProfile: StyleProfile = loadLocal<StyleProfile>(STYLE_KEY, blankStyleProfile());

interface MemoryState {
  memory: AIMemory;
  styleProfile: StyleProfile;

  /* legacy v0.6 */
  update: (patch: Partial<AIMemory>) => void;
  clear: () => void;

  /* V0.8 PR-2: 风格学习 */
  rememberStyle: (id: StyleId) => void;
  updateStyleProfile: (patch: Partial<StyleProfile>) => void;
  applyPersonalStyle: (text: string, id: StyleId) => string;
  resetStyleProfile: () => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memory: initialMemory,
  styleProfile: initialStyleProfile,

  update: (patch) =>
    set((s) => {
      const next: AIMemory = { ...s.memory, ...patch, updated_at: Date.now() };
      persistLocal(MEMORY_KEY, next);
      return { memory: next };
    }),

  clear: () =>
    set(() => {
      /* 关键：清 storage + 重置内存 + styleProfile + 风格档案 */
      persistLocal(MEMORY_KEY, BLANK_MEMORY);
      persistLocal(STYLE_KEY, blankStyleProfile());
      return { memory: { ...BLANK_MEMORY, updated_at: Date.now() }, styleProfile: blankStyleProfile() };
    }),

  rememberStyle: (id) =>
    set((s) => {
      const cur = s.styleProfile.weights[id] ?? { used: 0, lastUsedAt: null };
      const nextStyle: StyleProfile = {
        ...s.styleProfile,
        weights: { ...s.styleProfile.weights, [id]: { used: cur.used + 1, lastUsedAt: Date.now() } },
        totalEdits: s.styleProfile.totalEdits + 1,
        learnedAt: Date.now()
      };
      persistLocal(STYLE_KEY, nextStyle);
      return { styleProfile: nextStyle };
    }),

  updateStyleProfile: (patch) =>
    set((s) => {
      const next = { ...s.styleProfile, ...patch };
      persistLocal(STYLE_KEY, next);
      return { styleProfile: next };
    }),

  applyPersonalStyle: (text, id) => {
    if (id !== 'personal') return text;
    const p = get().styleProfile;
    // 中文最多切 2 段即可，看出区别
    if (p.emojiRate > 0.5) {
      const mid = Math.floor(text.length / 2);
      const emoji = ['✨', '🌸', '🎁', '💝'][mid % 4];
      text = `${emoji} ${text.slice(0, mid).trim()}。${text.slice(mid).trim()}`;
    }
    const limit = p.sentenceLen === 'short' ? 60 : p.sentenceLen === 'medium' ? 140 : 320;
    return text.length <= limit ? text : text.slice(0, limit - 1) + '…';
  },

  resetStyleProfile: () =>
    set(() => {
      persistLocal(STYLE_KEY, blankStyleProfile());
      return { styleProfile: blankStyleProfile() };
    })
}));

// 内部 helper：导出供 memory 页"设置 sentenceLen"等使用
export function _internal_state_test_hook(): { initialMemory: AIMemory; initialStyleProfile: StyleProfile } {
  return { initialMemory, initialStyleProfile };
}

export const _sentenceLen: SentenceLen = 'medium';
export type { StyleId };
