import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { AIMemoryRow } from '../../components/ai-memory-row/ai-memory-row';
import { useMemoryStore } from '../../stores/memory-store';
import { styleMock } from '../../services/ai/style';
import './index.scss';

export default function MemoryPage() {
  const memory = useMemoryStore((s) => s.memory);
  const update = useMemoryStore((s) => s.update);
  const clear = useMemoryStore((s) => s.clear);
  /* V0.8 PR-2: 风格档案 */
  const styleProfile = useMemoryStore((s) => s.styleProfile);
  const rememberStyle = useMemoryStore((s) => s.rememberStyle);
  const resetStyleProfile = useMemoryStore((s) => s.resetStyleProfile);

  const onEdit = (idx: number) => {
    const labels = ['primary_relations', 'budget_range_fen', 'preferred_styles', 'favorite_categories', 'best_publish_window', 'goal_text'] as const;
    Taro.showModal({
      title: '编辑记忆',
      editable: true,
      placeholderText: '编辑内容',
      success: ({ content }) => {
        if (!content) return;
        const key = labels[idx];
        if (key === 'budget_range_fen') {
          const m = content.match(/(\d+)\s*[-~到]\s*(\d+)/);
          if (m) {
            update({ budget_range_fen: [Number(m[1]) * 100, Number(m[2]) * 100] });
          }
        } else if (key === 'primary_relations') {
          update({ primary_relations: content.split(/[,，、\s]+/).filter(Boolean) });
        } else if (key === 'preferred_styles') {
          update({ preferred_styles: content.split(/[,，、\s]+/).filter(Boolean) });
        } else if (key === 'favorite_categories') {
          update({ favorite_categories: content.split(/[,，、\s]+/).filter(Boolean) });
        } else if (key === 'best_publish_window') {
          update({ best_publish_window: content });
        } else if (key === 'goal_text') {
          update({ goal_text: content });
        }
      }
    });
  };

  const onEditAll = () => {
    Taro.showModal({
      title: '继续我的偏好',
      content: 'MVP mock：阶段二将开放多轮偏好编辑。',
      showCancel: false
    });
  };

  const onClear = () => {
    Taro.showModal({
      title: '清空记忆',
      content: '确认清空 AI 记忆？此操作不可恢复。',
      success: ({ confirm }) => confirm && clear()
    });
  };

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">小礼对你的观察（可编辑）</Text>
          <Text className="gp-caption">基于你的发布与推荐点击习惯</Text>
        </View>

        <View className="gp-page__list">
          <AIMemoryRow index={1} label="主要推荐对象" tags={memory.primary_relations} onEdit={() => onEdit(0)} />
          <AIMemoryRow index={2} label="常用预算区间" range={memory.budget_range_fen} onEdit={() => onEdit(1)} />
          <AIMemoryRow index={3} label="偏好文章风格" tags={memory.preferred_styles} onEdit={() => onEdit(2)} />
          <AIMemoryRow index={4} label="擅长商品类目" tags={memory.favorite_categories} onEdit={() => onEdit(3)} />
          <AIMemoryRow index={5} label="最佳发布时间" text={memory.best_publish_window} onEdit={() => onEdit(4)} />
          <AIMemoryRow index={6} label="经营目标" text={memory.goal_text} onEdit={() => onEdit(5)} />
        </View>

        {/* V0.8 PR-2: 风格档案 */}
        <View className="gp-memory__style-profile">
          <View className="gp-memory__style-head">
            <Text className="gp-h2">风格档案</Text>
            <Text className="gp-caption">每次按 “📌 记住” 都会自动学习</Text>
          </View>
          <View className="gp-memory__chips">
            {styleMock.getChipMetaList().map((c) => {
              const stat = styleProfile.weights[c.id] ?? { used: 0, lastUsedAt: null };
              return (
                <View key={c.id} className="gp-memory__chip" onClick={() => rememberStyle(c.id)}>
                  <Text className="gp-memory__chip-emoji">{c.emoji}</Text>
                  <Text className="gp-memory__chip-label">{c.label}</Text>
                  <Text className="gp-memory__chip-stat">已用 {stat.used} 次</Text>
                  <Text className="gp-memory__chip-time">{stat.lastUsedAt ? "✓ 已学习" : "未使用"}</Text>
                </View>
              );
            })}
          </View>
          <View className="gp-memory__style-meta">
            <Text className="gp-caption">总记忆修改：{styleProfile.totalEdits} 次</Text>
            <View className="gp-btn gp-btn--text" onClick={() => {
              Taro.showModal({
                title: '重置风格档案',
                content: '确认重置？已学习的 6 种风格偏好会清空。',
                success: ({ confirm }) => confirm && resetStyleProfile()
              });
            }}>
              <Text>重置风格档案</Text>
            </View>
          </View>
        </View>

        <View className="gp-page__cta-row">
          <View
            className="gp-btn gp-btn--ghost"
            onClick={onClear}
            aria-label="一键清除 AI 记忆（宪法 §4.6）"
          >
            <Text>🗑️ 一键清除记忆</Text>
          </View>
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={onEditAll}>
            <Text>继续我的偏好</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
