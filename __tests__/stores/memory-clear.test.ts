/* 礼有方小程序 · 关系记忆一键清除测试（宪法 §4.6 + §5.3）
 *
 * 验证 useMemoryStore.clear() 真清空所有 memory 字段 + 风格档案，
 * 满足 PRD §5.3「用户可一键清除 AI 记忆」。
 *
 * v2 (2026-07-17 CTO 深度升级)：增加持久化验证 — clear/update 必须
 * 走 @rockcent/platform/web-client storage，不能只重置内存。
 */
import { useMemoryStore } from '../../src/stores/memory-store';
import { blankStyleProfile } from '../../src/types';
import { loadLocal } from '../../src/platform/adapter';

const MEMORY_KEY = 'memory';
const STYLE_KEY = 'style-profile';

describe('stores/memory-clear (宪法 §4.6 一键清除 + 持久化)', () => {
  beforeEach(() => {
    /* 每个用例前清空 storage + store */
    if (typeof window !== 'undefined') {
      try { window.localStorage.clear(); } catch { /* noop */ }
    }
    useMemoryStore.setState({
      memory: {
        ...useMemoryStore.getState().memory,
        primary_relations: [],
        budget_range_fen: [0, 0],
        preferred_styles: [],
        favorite_categories: [],
        best_publish_window: '',
        goal_text: '',
        updated_at: 0
      },
      styleProfile: blankStyleProfile()
    });
  });

  test('clear 重置 memory 为空白 (宪法 §4.6 一键清除)', () => {
    useMemoryStore.getState().update({
      goal_text: '月佣金 ¥3,000',
      primary_relations: ['妈妈', '闺蜜']
    });
    expect(useMemoryStore.getState().memory.goal_text).toBe('月佣金 ¥3,000');

    useMemoryStore.getState().clear();

    const m = useMemoryStore.getState().memory;
    expect(m.goal_text).toBe('');
    expect(m.primary_relations).toEqual([]);
    expect(m.preferred_styles).toEqual([]);
    expect(m.favorite_categories).toEqual([]);
    expect(m.best_publish_window).toBe('');
  });

  test('clear 同时重置 styleProfile 为 blankStyleProfile', () => {
    useMemoryStore.getState().rememberStyle('warm');
    useMemoryStore.getState().rememberStyle('professional');
    const profile = useMemoryStore.getState().styleProfile;
    expect(profile.totalEdits).toBeGreaterThanOrEqual(2);

    useMemoryStore.getState().clear();

    const cleared = useMemoryStore.getState().styleProfile;
    expect(cleared.totalEdits).toBe(0);
    expect(cleared).toEqual(blankStyleProfile());
  });

  test('clear 刷新 updated_at 时间戳', async () => {
    const before = useMemoryStore.getState().memory.updated_at;
    await new Promise((r) => setTimeout(r, 5));
    useMemoryStore.getState().clear();
    const after = useMemoryStore.getState().memory.updated_at;
    expect(after).toBeGreaterThan(before);
  });

  test('clear 后立刻 update 仍正常工作', () => {
    useMemoryStore.getState().clear();
    useMemoryStore.getState().update({ goal_text: '重启经营目标' });
    expect(useMemoryStore.getState().memory.goal_text).toBe('重启经营目标');
  });

  test('clear 后 rememberStyle 仍正常工作', () => {
    useMemoryStore.getState().clear();
    useMemoryStore.getState().rememberStyle('warm');
    expect(useMemoryStore.getState().styleProfile.weights['warm']?.used).toBe(1);
  });

  /* ===== v2 新增：持久化验证 ===== */

  test('update 会持久化到 storage (跨刷新保留)', () => {
    useMemoryStore.getState().update({ goal_text: '跨刷新验证' });
    const stored = loadLocal<{ goal_text: string }>(MEMORY_KEY, { goal_text: '' });
    expect(stored.goal_text).toBe('跨刷新验证');
  });

  test('rememberStyle 会持久化到 storage', () => {
    useMemoryStore.getState().rememberStyle('warm');
    const stored = loadLocal<{ totalEdits: number }>(STYLE_KEY, blankStyleProfile());
    expect(stored.totalEdits).toBeGreaterThanOrEqual(1);
  });

  test('clear 必须把 storage 里的 memory 重置为空白', () => {
    useMemoryStore.getState().update({ goal_text: '私密偏好' });
    expect(loadLocal<{ goal_text: string }>(MEMORY_KEY, { goal_text: '' }).goal_text).toBe('私密偏好');

    useMemoryStore.getState().clear();

    const stored = loadLocal<{ goal_text: string }>(MEMORY_KEY, { goal_text: 'NOT_EMPTY' });
    expect(stored.goal_text).toBe('');
    expect(stored.primary_relations).toEqual([]);
  });

  test('clear 必须把 storage 里的 style-profile 重置为 blankStyleProfile', () => {
    useMemoryStore.getState().rememberStyle('warm');
    useMemoryStore.getState().rememberStyle('warm');
    expect(loadLocal<{ totalEdits: number }>(STYLE_KEY, blankStyleProfile()).totalEdits).toBeGreaterThanOrEqual(2);

    useMemoryStore.getState().clear();

    const stored = loadLocal<{ totalEdits: number }>(STYLE_KEY, blankStyleProfile());
    expect(stored.totalEdits).toBe(0);
    expect(stored).toEqual(blankStyleProfile());
  });
});
