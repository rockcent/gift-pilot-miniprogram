/* V1.0 PR-17 · AI 批量任务中心
 * 批量生成 / 批量发布 / 批量复盘
 */
import { View, Text, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { batchTasksMock } from '../../services/ai/batch';
import type { BatchTaskItem, BatchTaskKind } from '../../services/ai/batch';
import { recordUsageEvent } from '../../platform/adapter';
import './index.scss';

const KINDS: Array<{ kind: BatchTaskKind; label: string; emoji: string }> = [
  { kind: 'generate-content', label: '批量生成', emoji: '✍️' },
  { kind: 'publish',          label: '批量发布', emoji: '📤' },
  { kind: 'review',           label: '批量复盘', emoji: '📈' }
];

export default function BatchPage() {
  const [kind, setKind] = useState<BatchTaskKind>('generate-content');
  const [concurrency, setConcurrency] = useState(5);
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<BatchTaskItem[]>([]);

  const onRun = async () => {
    recordUsageEvent({ metric: 'AI_REQUEST_COUNT', quantity: 1, metadata: { feature: 'batch.run-ui', kind } });
    setRunning(true);
    setItems([]);
    const labels = Array.from({ length: 10 }, (_, i) => `${KINDS.find((k) => k.kind === kind)?.label}-${i + 1}`);
    const res = await batchTasksMock.run({
      kind,
      labels,
      concurrency,
      executor: async (label) => {
        await new Promise((r) => setTimeout(r, 100));
        return { id: label, ok: true, ts: Date.now() };
      }
    });
    setItems(res.data ?? []);
    setRunning(false);
    Taro.showToast({ title: `✅ 完成 ${res.data?.filter((i) => i.status === 'success').length ?? 0}/${labels.length}`, icon: 'success', duration: 1500 });
  };

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">🤖 AI 批量任务</Text>
          <Text className="gp-caption">PRD §6.1 任务中心 · 并发可调</Text>
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">任务类型</Text>
          <View className="gp-batch__chips">
            {KINDS.map((k) => (
              <View key={k.kind}
                className={`gp-batch__chip ${kind === k.kind ? 'gp-batch__chip--active' : ''}`}
                onClick={() => setKind(k.kind)}>
                <Text>{k.emoji} {k.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">并发度</Text>
          <View className="gp-batch__concurrency">
            {[2, 5, 10].map((n) => (
              <View key={n}
                className={`gp-batch__concurrency-chip ${concurrency === n ? 'gp-batch__chip--active' : ''}`}
                onClick={() => setConcurrency(n)}>
                <Text>{n} 并发</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gp-page__cta-row">
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={running ? undefined : onRun}>
            <Text>{running ? '⏳ 跑批中...' : '🚀 启动批量任务（10 任务）'}</Text>
          </View>
        </View>

        {items.length > 0 && (
          <View className="gp-page__section gp-batch__list">
            <Text className="gp-h2">📊 任务结果（{items.filter((i) => i.status === 'success').length}/{items.length} 成功）</Text>
            {items.map((item) => (
              <View key={item.id} className="gp-batch__item">
                <View className="gp-batch__item-head">
                  <Text className="gp-batch__item-label">{item.label}</Text>
                  <Text className={`gp-batch__item-status gp-batch__item-status--${item.status}`}>
                    {item.status === 'success' ? '✅' : item.status === 'failed' ? '❌' : '⏳'}
                  </Text>
                </View>
                <View className="gp-batch__progress-bar">
                  <View className="gp-batch__progress-fill" style={{ width: `${item.progress * 100}%` }} />
                </View>
                <View className="gp-batch__item-meta">
                  <Text className="gp-caption">
                    {item.finishedAt ? `${item.finishedAt - (item.startedAt ?? 0)}ms` : '运行中...'}
                  </Text>
                  {item.error && <Text className="gp-caption" style={{ color: 'var(--brand-coral)' }}>{item.error}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
