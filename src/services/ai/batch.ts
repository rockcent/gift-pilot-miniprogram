/* V1.0 PR-17 · AI 批量任务
 *
 * PRD §6.1 任务中心：批量生成内容 / 批量发布 / 批量复盘
 * mock 阶段：Promise.all 并发 + 进度事件
 */
import type { ContentPiece } from '../../types';
import { okResult, recordUsageEvent } from '../../platform/adapter';
import type { ProviderCallResult } from '../../platform/adapter';

export type BatchTaskKind = 'generate-content' | 'publish' | 'review';
export type BatchTaskStatus = 'pending' | 'running' | 'success' | 'failed';

export interface BatchTaskItem {
  id: string;
  kind: BatchTaskKind;
  label: string;
  status: BatchTaskStatus;
  progress: number; // 0..1
  error?: string;
  result?: unknown;
  startedAt?: number;
  finishedAt?: number;
}

export interface BatchTaskInput {
  kind: BatchTaskKind;
  labels: string[];
  concurrency?: number;
  executor: (label: string) => Promise<ContentPiece | { publishId: string } | { ok: boolean }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const batchTasksMock = {
  async run(input: BatchTaskInput): Promise<ProviderCallResult<BatchTaskItem[]>> {
    recordUsageEvent({
      metric: 'AI_REQUEST_COUNT',
      quantity: 1,
      metadata: { feature: 'batch.run', kind: input.kind, total: input.labels.length }
    });
    const concurrency = input.concurrency ?? 5;
    const items: BatchTaskItem[] = input.labels.map((label, i) => ({
      id: `bt_${Date.now()}_${i}`,
      kind: input.kind,
      label,
      status: 'pending' as BatchTaskStatus,
      progress: 0
    }));
    // 并发执行
    const queue = [...items];
    const workers: Promise<void>[] = [];
    for (let w = 0; w < Math.min(concurrency, queue.length); w++) {
      workers.push((async () => {
        while (queue.length > 0) {
          const next = queue.shift();
          if (!next) break;
          next.status = 'running';
          next.startedAt = Date.now();
          try {
            // mock 进度
            for (let p = 1; p <= 5; p++) {
              await sleep(80);
              next.progress = p / 5;
            }
            const res = await input.executor(next.label);
            next.status = 'success';
            next.result = res;
            next.progress = 1;
          } catch (e) {
            next.status = 'failed';
            next.error = String(e);
          } finally {
            next.finishedAt = Date.now();
          }
        }
      })());
    }
    await Promise.all(workers);
    return okResult(items);
  }
};

export default batchTasksMock;
