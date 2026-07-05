import { create } from 'zustand';
import type { AIMemory } from '../types';
import memorySeed from '../data/mock-memory.json';

interface MemoryState {
  memory: AIMemory;
  update: (patch: Partial<AIMemory>) => void;
  clear: () => void;
}

const initial: AIMemory = memorySeed as AIMemory;

export const useMemoryStore = create<MemoryState>((set) => ({
  memory: initial,
  update: (patch) =>
    set((s) => ({ memory: { ...s.memory, ...patch, updated_at: Date.now() } })),
  clear: () => set({ memory: { ...initial, updated_at: Date.now() } })
}));
