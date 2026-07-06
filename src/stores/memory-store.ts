import { create } from 'zustand';
import type { AIMemory, SentenceLen, StyleId, StyleProfile } from '../types';
import { blankStyleProfile } from '../types';
import memorySeed from '../data/mock-memory.json';

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

const initialMemory: AIMemory = memorySeed as AIMemory;
const initialStyleProfile: StyleProfile = blankStyleProfile();

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memory: initialMemory,
  styleProfile: initialStyleProfile,

  update: (patch) =>
    set((s) => ({ memory: { ...s.memory, ...patch, updated_at: Date.now() } })),

  clear: () =>
    set({
      memory: { ...initialMemory, updated_at: Date.now() },
      styleProfile: blankStyleProfile()
    }),

  rememberStyle: (id) =>
    set((s) => {
      const cur = s.styleProfile.weights[id] ?? { used: 0, lastUsedAt: null };
      return {
        styleProfile: {
          ...s.styleProfile,
          weights: { ...s.styleProfile.weights, [id]: { used: cur.used + 1, lastUsedAt: Date.now() } },
          totalEdits: s.styleProfile.totalEdits + 1,
          learnedAt: Date.now()
        }
      };
    }),

  updateStyleProfile: (patch) =>
    set((s) => ({ styleProfile: { ...s.styleProfile, ...patch } })),

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

  resetStyleProfile: () => set({ styleProfile: blankStyleProfile() })
}));

// 内部 helper：导出供 memory 页"设置 sentenceLen"等使用
export function _internal_state_test_hook(): { initialMemory: AIMemory; initialStyleProfile: StyleProfile } {
  return { initialMemory, initialStyleProfile };
}

export const _sentenceLen: SentenceLen = 'medium';
export type { StyleId };
