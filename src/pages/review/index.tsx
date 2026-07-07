import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { MetricCard } from '../../components/metric-card/metric-card';
import { useAIStore } from '../../stores/ai-store';
import { giftHealthMock } from '../../services/ai/gift-health';
import { formatYuan } from '../../utils/money';
import './index.scss';

const STATUS_EMOJI: Record<string, string> = {
  healthy: '🟢',
  cooling: '🟡',
  fading: '🔴'
};

const STATUS_LABEL: Record<string, string> = {
  healthy: '健康',
  cooling: '衰减',
  fading: '衰退'
};

export default function ReviewPage() {
  const review = useAIStore((s) => s.review);
  const loadReview = useAIStore((s) => s.loadReview);
  const recommendation = useAIStore((s) => s.recommendation);
  /* V0.8 PR-4: 商品健康度 */
  const giftHealthFlags = useAIStore((s) => s.giftHealthFlags);
  const loadGiftHealthFlags = useAIStore((s) => s.loadGiftHealthFlags);
  const replaceGift = useAIStore((s) => s.replaceGift);

  useEffect(() => {
    if (!review) loadReview();
  }, [review, loadReview]);

  /* V0.8 PR-4: 当有 recommendation.gifts 时加载健康 flag */
  const giftIds = useMemo(() => (recommendation?.gifts ?? []).map((g) => g.id), [recommendation]);
  useEffect(() => {
    if (giftIds.length > 0 && giftHealthFlags.length === 0) {
      loadGiftHealthFlags(giftIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftIds.length]);

  /* V0.8 PR-4: 健康 flag 按 healthy→cooling→fading 排序 + 用 recommendation.gifts 找 title */
  const sortedFlags = useMemo(() => {
    const sorted = giftHealthMock.sortFlags(giftHealthFlags);
    return sorted.map((flag) => {
      const gift = recommendation?.gifts.find((g) => g.id === flag.giftId);
      return { ...flag, giftTitle: gift?.title ?? '未知礼物' };
    });
  }, [giftHealthFlags, recommendation]);

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

  const onReplace = async (giftId: string) => {
    const res = await replaceGift(giftId);
    if (res.ok && res.data) {
      Taro.showToast({ title: `✅ 已换为 ${res.data.newGift.title}`, icon: 'success', duration: 1500 });
    } else {
      Taro.showToast({ title: '替换失败，请重试', icon: 'none' });
    }
  };

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

        {/* V0.8 PR-4: 推荐礼物健康度 */}
        {sortedFlags.length > 0 && (
          <View className="gp-page__section gp-health">
            <Text className="gp-h2">🎁 推荐礼物健康度</Text>
            <Text className="gp-caption">基于 7 日点击与订单，AI 帮你看哪些值得保留</Text>
            {sortedFlags.map((flag) => (
              <View key={flag.giftId} className={`gp-health__row gp-health__row--${flag.status}`}>
                <View className="gp-health__row-head">
                  <Text className="gp-health__dot">{STATUS_EMOJI[flag.status]}</Text>
                  <Text className="gp-health__title">{flag.giftTitle}</Text>
                  <View className={`gp-pill gp-pill--${flag.status === 'healthy' ? 'green' : flag.status === 'cooling' ? 'apricot' : 'coral'}`}>
                    <Text>{STATUS_LABEL[flag.status]}</Text>
                  </View>
                </View>
                <Text className="gp-health__reason">{flag.reason}</Text>
                {flag.status !== 'healthy' && (
                  <View className="gp-health__actions">
                    <View className="gp-btn gp-btn--outline" onClick={() => onReplace(flag.giftId)}>
                      <Text>换新品</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

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
