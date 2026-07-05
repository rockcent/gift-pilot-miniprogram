import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { GiftCard } from '../../components/gift-card/gift-card';
import { useAIStore } from '../../stores/ai-store';
import './index.scss';

export default function RecommendPage() {
  const [activeTab, setActiveTab] = useState<'best' | 'decent' | 'commission'>('best');
  const recommendation = useAIStore((s) => s.recommendation);
  const recommend = useAIStore((s) => s.recommend);
  const generateContent = useAIStore((s) => s.generateContent);

  useEffect(() => {
    if (!recommendation) {
      recommend({
        relation: '同事',
        budget_fen: 20000,
        scene: '生日',
        tone: 'warm',
        raw_query: ''
      });
    }
  }, [recommendation, recommend]);

  const onPick = async (giftId: string) => {
    await generateContent(giftId, 'share');
    Taro.navigateTo({ url: '/pages/content/index' });
  };

  const gifts = recommendation?.gifts ?? [];

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">为你推荐 {gifts.length} 份合适��礼物</Text>
          <Text className="gp-caption">结合关系、场景、预算和氛围为你服务</Text>
          <View className="gp-page__tabs">
            {([
              ['best', '最匹配'],
              ['decent', '更体面点'],
              ['commission', '佣金更高']
            ] as const).map(([k, label]) => (
              <View
                key={k}
                className={`gp-page__tab ${activeTab === k ? 'gp-page__tab--active' : ''}`}
                onClick={() => setActiveTab(k)}
              >
                <Text>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gp-page__list">
          {gifts.map((g, i) => (
            <GiftCard key={g.id} gift={g} rank={i + 1} onClick={() => onPick(g.id)} />
          ))}
        </View>

        <View className="gp-page__cta-row gp-page__cta-row--fixed">
          <View className="gp-btn gp-btn--ghost">
            <Text>换一版</Text>
          </View>
          <View className="gp-btn gp-btn--primary">
            <Text>调整条件</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
