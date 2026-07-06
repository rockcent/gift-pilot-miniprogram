import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { ContentCard } from '../../components/content-card/content-card';
import { useAIStore } from '../../stores/ai-store';
import { useMemoryStore } from '../../stores/memory-store';
import { styleMock } from '../../services/ai/style';
import type { ContentPiece, StyleId } from '../../types';
import './index.scss';

type Tab = 'copy' | 'voice' | 'art' | 'strategy';
const TAB_LABEL: Record<Tab, string> = {
  copy: '文案生成',
  voice: '话术',
  art: '短组画',
  strategy: '图文策略'
};

const STYLE_TONE_TO_LABEL: Record<ContentPiece['type'], string> = {
  share: '分享',
  review: '种草',
  emotion: '心意'
};

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('copy');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState<StyleId>('share');
  const contents = useAIStore((s) => s.contents);
  const generateContent = useAIStore((s) => s.generateContent);
  const recommendation = useAIStore((s) => s.recommendation);
  const rememberStyle = useMemoryStore((s) => s.rememberStyle);
  const applyPersonalStyle = useMemoryStore((s) => s.applyPersonalStyle);

  const chips = useMemo(() => styleMock.getChipMetaList(), []);

  useEffect(() => {
    if (contents.length === 0) {
      const giftId = recommendation?.gifts[0]?.id ?? 'gft_001';
      onPickChip(activeStyle, giftId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contents.length > 0 && !activeId) setActiveId(contents[0].id);
  }, [contents, activeId]);

  const onPickChip = async (id: StyleId, giftIdOverride?: string) => {
    setActiveStyle(id);
    const chip = styleMock.getChipById(id);
    if (!chip) return;
    const giftId = giftIdOverride ?? recommendation?.gifts[0]?.id ?? 'gft_001';
    await generateContent(giftId, chip.presetStyle);
    // 在 generateContent 之后，跑一次 personal 注入（仅在 personal）
    if (chip.isPersonalized) {
      const last = contents[0];
      if (last && last.body) {
        const personalized = applyPersonalStyle(last.body, id);
        // 注：v0.6 store contents 是静态的，不能改 last；UI 层 apply 即可（展示时 wrap）
      }
    }
  };

  const onRemember = () => {
    rememberStyle(activeStyle);
    Taro.showToast({ title: '📌 已记住', icon: 'none', duration: 1200 });
  };

  const onCover = () => Taro.navigateTo({ url: '/pages/cover/index' });

  const active = contents.find((c) => c.id === activeId);
  const displayBody = active && activeStyle === 'personal'
    ? applyPersonalStyle(active.body, activeStyle)
    : active?.body ?? '';

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">为你生成了 {contents.length} 种风格文案</Text>
          <Text className="gp-caption">{chips.find((c) => c.id === activeStyle)?.description ?? '温暖又有克制'}</Text>
        </View>

        {/* V0.8 PR-2: 6 chip 横排 */}
        <ScrollView scrollX className="gp-content__chip-strip">
          <View className="gp-content__chip-inner">
            {chips.map((c) => (
              <View
                key={c.id}
                className={`gp-content__chip ${activeStyle === c.id ? 'gp-content__chip--active' : ''}`}
                onClick={() => onPickChip(c.id)}
              >
                <Text className="gp-content__chip-emoji">{c.emoji}</Text>
                <Text className="gp-content__chip-label">{c.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

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
            <View key={c.id} className="gp-content__card-wrap">
              {activeStyle === 'personal' && c.id === activeId ? (
                <ContentCard
                  content={{ ...c, body: displayBody }}
                  active={true}
                  onCopy={() => {
                    setActiveId(c.id);
                    Taro.setClipboardData({ data: displayBody });
                  }}
                  onRemember={onRemember}
                />
              ) : (
                <ContentCard
                  content={c}
                  active={c.id === activeId}
                  onCopy={() => {
                    setActiveId(c.id);
                    Taro.setClipboardData({ data: c.body });
                  }}
                  onRemember={onRemember}
                />
              )}
            </View>
          ))}
        </View>

        {/* V0.8 PR-2: 记住当前风格 按钮 */}
        <View className="gp-content__remember">
          <View className="gp-btn gp-btn--outline gp-btn--block" onClick={onRemember}>
            <Text>📌 记住这个风格：{chips.find((c) => c.id === activeStyle)?.label}</Text>
          </View>
          <Text className="gp-content__remember-caption">
            小礼会记住你喜欢的风格，下次自动靠近。
          </Text>
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
