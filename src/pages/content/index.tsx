import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { ContentCard } from '../../components/content-card/content-card';
import { useAIStore } from '../../stores/ai-store';
import './index.scss';

type Tab = 'copy' | 'voice' | 'art' | 'strategy';
const TAB_LABEL: Record<Tab, string> = {
  copy: '文案生成',
  voice: '话术',
  art: '短组画',
  strategy: '图文策略'
};

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('copy');
  const [activeId, setActiveId] = useState<string | null>(null);
  const contents = useAIStore((s) => s.contents);
  const generateContent = useAIStore((s) => s.generateContent);
  const recommendation = useAIStore((s) => s.recommendation);

  useEffect(() => {
    if (contents.length === 0) {
      const giftId = recommendation?.gifts[0]?.id ?? 'gft_001';
      generateContent(giftId, 'share');
    }
  }, [contents.length, generateContent, recommendation]);

  useEffect(() => {
    if (contents.length > 0 && !activeId) setActiveId(contents[0].id);
  }, [contents, activeId]);

  const onCover = () => Taro.navigateTo({ url: '/pages/cover/index' });

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">为你生成了 {contents.length} 种风格文案</Text>
          <Text className="gp-caption">最出效果的是一点虚心但偏向于自然感的散文礼物文案，建议更多朋友分享、不知到底的礼品是错但谁会懂✨</Text>
        </View>

        <View className="gp-page__tabs">
          {(Object.keys(TAB_LABEL) as Tab[]).map((k) => (
            <View
              key={k}
              className={`gp-page__tab ${activeTab === k ? 'gp-page__tab--active' : ''}`}
              onClick={() => setActiveTab(k)}
            >
              <Text>{TAB_LABEL[k]}</Text>
            </View>
          ))}
        </View>

        <View className="gp-page__list">
          {contents.map((c) => (
            <ContentCard
              key={c.id}
              content={c}
              active={c.id === activeId}
              onCopy={() => {
                setActiveId(c.id);
                Taro.setClipboardData({ data: c.body });
              }}
              onRegenerate={() => setActiveId(c.id)}
              onOptimize={() => setActiveId(c.id)}
            />
          ))}
        </View>

        <View className="gp-page__suggest">
          <View className="gp-page__suggest-row">
            <Text className="gp-caption">推荐标题（可改）</Text>
            <Text className="gp-page__suggest-text">送同事的高颜值香氛礼盒！好闻又体面</Text>
          </View>
          <View className="gp-page__suggest-row">
            <Text className="gp-caption">推荐标签</Text>
            <View className="gp-page__tags">
              {['生日', '礼物', '同事', '香氛', '礼盒'].map((t) => (
                <View key={t} className="gp-pill gp-pill--apricot">
                  <Text>#{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="gp-page__cta-row gp-page__cta-row--fixed">
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={onCover}>
            <Text>生成封面 →</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
