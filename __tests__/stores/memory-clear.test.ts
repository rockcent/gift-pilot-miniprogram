/* 礼有方小程序 · 关系记忆一键清除测试（宪法 §4.6 + §5.3）
 *
 * 验证 useMemoryStore.clear() 真清空所有 memory 字段 + 风格档案，
 * 满足 PRD §5.3「用户可一键清除 AI 记忆」。
 */
import { useMemoryStore } from '../../src/stores/memory-store';
import { blankStyleProfile } from '../../src/types';

describe('stores/memory-clear (宪法 §4.6 一键清除)', () => {
  beforeEach(() => {
    useMemoryStore.getState().clear();
  });

  test('clear 重置 memory 为初始空白 seed', () => {
    useMemoryStore.getState().update({
      goal_text: '月佣金 ¥3,000',
      primary_relations: ['妈妈', '闺蜜']
    });
    expect(useMemoryStore.getState().memory.goal_text).toBe('月佣金 ¥3,000');

    useMemoryStore.getState().clear();

    const m = useMemoryStore.getState().memory;
    expect(m.goal_text).not.toBe('月佣金 ¥3,000');
    expect(Array.isArray(m.primary_relations)).toBe(true);
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
});
