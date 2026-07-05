import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { MetricCard } from '../../components/metric-card/metric-card';
import { useAIStore } from '../../stores/ai-store';
import { formatYuan } from '../../utils/money';
import './index.scss';

export default function ReviewPage() {
  const review = useAIStore((s) => s.review);
  const loadReview = useAIStore((s) => s.loadReview);

  useEffect(() => {
    if (!review) loadReview();
  }, [review, loadReview]);

  if (!review) {
    return (
      <View className="gp-page gp-page--center">
        <Text className="gp-caption">小礼正在生成复盘中...</Text>
      </View>
    );
  }

  const fromDate = new Date(review.range.from_ts);
  const toDate = new Date(review.range.to_ts);
  const fmt = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;

  const onNextPlan = () => Taro.navigateTo({ url: '/pages/next-plan/index' });

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">小礼为你生成了本周经营复盘</Text>
          <Text className="gp-caption">{fmt(fromDate)} - {fmt(toDate)}</Text>
        </View>

        <View className="gp-page__row-3">
          <MetricCard label="总发布" valueText={`${review.total_publish} 篇`} tone="green" />
          <MetricCard label="总订单" valueText={`${review.total_orders} 笔`} tone="apricot" />
          <MetricCard label="预计佣金" valueFen={review.expected_commission_fen} tone="coral" />
        </View>

        <View className="gp-page__row-4">
          <MetricCard label="点击量" valueText={String(review.click_count)} tone="ink" />
          <MetricCard label="点击率" valueText={`${(review.click_rate * 100).toFixed(2)}%`} tone="green" />
          <MetricCard label="客单价" valueFen={review.aov_fen} tone="apricot" />
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">📈 数据亮点</Text>
          {review.highlights.map((h, i) => (
            <View key={i} className="gp-page__bullet">
              <View className="gp-page__bullet-dot" />
              <Text>{h}</Text>
            </View>
          ))}
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">🎯 下周建议</Text>
          {review.next_suggestions.map((h, i) => (
            <View key={i} className="gp-page__chip">
              <Text>{h}</Text>
            </View>
          ))}
        </View>

        <View className="gp-page__cta-row gp-page__cta-row--fixed">
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={onNextPlan}>
            <Text>生成下周发布计划</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
