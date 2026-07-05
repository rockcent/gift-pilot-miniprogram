import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { CoverCard } from '../../components/cover-card/cover-card';
import { useAIStore } from '../../stores/ai-store';
import type { CoverTemplate } from '../../types';
import './index.scss';

type Tab = 'cover' | 'quote' | 'blueprint';
const TAB_LABEL: Record<Tab, string> = {
  cover: '封面设计',
  quote: '语录图',
  blueprint: '灵感蓝图'
};
const STYLES: CoverTemplate['style'][] = ['minimal', 'warm', 'fresh', 'vintage'];
const STYLE_LABEL: Record<CoverTemplate['style'], string> = {
  minimal: '简约高级',
  warm: '温柔治愈',
  fresh: '清新自然',
  vintage: '复古轻奢'
};

export default function CoverPage() {
  const [activeTab, setActiveTab] = useState<Tab>('cover');
  const [activeStyle, setActiveStyle] = useState<CoverTemplate['style']>('minimal');
  const cover = useAIStore((s) => s.cover);
  const generateCover = useAIStore((s) => s.generateCover);
  const recommendation = useAIStore((s) => s.recommendation);

  useEffect(() => {
    if (!cover) {
      const giftId = recommendation?.gifts[0]?.id ?? 'gft_001';
      generateCover(giftId, activeStyle);
    }
  }, [cover, generateCover, recommendation, activeStyle]);

  const onPublish = () => Taro.navigateTo({ url: '/pages/publish-confirm/index' });

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
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

        {cover && (
          <View className="gp-page__main">
            <View className="gp-page__art">
              <Text className="gp-page__art-title">{cover.title}</Text>
              <Text className="gp-page__art-sub">{cover.subtitle}</Text>
              <View className="gp-page__art-cover">🎁</View>
            </View>
          </View>
        )}

        <View className="gp-page__section">
          <Text className="gp-h2">封面风格</Text>
          <ScrollView scrollX className="gp-page__hscroll">
            <View className="gp-page__hscroll-inner">
              {cover && (
                <CoverCard cover={cover} style={activeStyle} active onClick={() => {}} />
              )}
              {STYLES.map((s) => (
                <View key={s} onClick={() => setActiveStyle(s)}>
                  <View className={`gp-page__style ${activeStyle === s ? 'gp-page__style--active' : ''}`}>
                    <Text>{STYLE_LABEL[s]}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="gp-page__cta-row gp-page__cta-row--fixed">
          <View className="gp-btn gp-btn--ghost">
            <Text>重新生成</Text>
          </View>
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={onPublish}>
            <Text>下载保存 →</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
