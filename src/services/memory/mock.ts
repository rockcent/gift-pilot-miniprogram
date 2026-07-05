import memory from '../../data/mock-memory.json';
import type { AIMemory } from '../../types';

export default {
  async get(_userId: string) {
    await new Promise((r) => setTimeout(r, 60));
    return { ok: true, data: memory as AIMemory, error: null };
  },
  async put(_userId: string, mem: AIMemory) {
    await new Promise((r) => setTimeout(r, 80));
    return { ok: true, data: mem, error: null };
  }
};
