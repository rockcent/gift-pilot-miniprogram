import { batchTasksMock } from '../../src/services/ai/batch';

describe('services/ai/batch (V1.0 PR-17)', () => {
  test('run executes all tasks and returns results', async () => {
    const labels = ['task-1', 'task-2', 'task-3', 'task-4', 'task-5'];
    const res = await batchTasksMock.run({
      kind: 'generate-content',
      labels,
      concurrency: 2,
      executor: async (label) => ({
        id: `cp_${label}`,
        type: 'share' as const,
        style_label: '自然分享',
        body: `mock body for ${label}`,
        tags: ['mock'],
        quality_score: 88
      })
    });
    expect(res.ok).toBe(true);
    expect(res.data).toHaveLength(5);
    const successCount = res.data!.filter((i) => i.status === 'success').length;
    expect(successCount).toBe(5);
    for (const item of res.data!) {
      expect(item.progress).toBe(1);
      expect(item.finishedAt).toBeGreaterThan(0);
    }
  });

  test('run respects concurrency limit (≤5 concurrent)', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;
    const labels = Array.from({ length: 10 }, (_, i) => `t${i}`);
    await batchTasksMock.run({
      kind: 'review',
      labels,
      concurrency: 3,
      executor: async (label) => {
        concurrent += 1;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise((r) => setTimeout(r, 30));
        concurrent -= 1;
        return { ok: true, label };
      }
    });
    expect(maxConcurrent).toBeLessThanOrEqual(3);
  });

  test('run marks failed tasks with error', async () => {
    const res = await batchTasksMock.run({
      kind: 'publish',
      labels: ['ok-1', 'fail-1', 'ok-2'],
      concurrency: 2,
      executor: async (label) => {
        if (label === 'fail-1') throw new Error('mock failure');
        return { publishId: label };
      }
    });
    const failItem = res.data!.find((i) => i.label === 'fail-1');
    const okItem = res.data!.find((i) => i.label === 'ok-1');
    expect(failItem!.status).toBe('failed');
    expect(failItem!.error).toContain('mock failure');
    expect(okItem!.status).toBe('success');
  });
});
