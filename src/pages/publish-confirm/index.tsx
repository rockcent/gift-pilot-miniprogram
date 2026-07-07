import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { useAIStore } from '../../stores/ai-store';
import './index.scss';

type Channel = 'timeline' | 'channels' | 'article';
const CHANNEL_LABEL: Record<Channel, string> = {
  timeline: '朋友圈',
  channels: '视频号',
  article: '微信图文'
};

export default function PublishConfirmPage() {
  const [channels, setChannels] = useState<Channel[]>(['timeline']);
  /* V0.8 PR-3: 发布时间 */
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const recommendation = useAIStore((s) => s.recommendation);
  const contents = useAIStore((s) => s.contents);
  const cover = useAIStore((s) => s.cover);
  const buildPublish = useAIStore((s) => s.buildPublish);
  const confirmPublish = useAIStore((s) => s.confirmPublish);
  const publishTimeSlots = useAIStore((s) => s.publishTimeSlots);
  const loadPublishTimeSlots = useAIStore((s) => s.loadPublishTimeSlots);
  const setPublishTimeSlot = useAIStore((s) => s.setPublishTimeSlot);

  useEffect(() => {
    if (publishTimeSlots.length === 0) loadPublishTimeSlots();
  }, [publishTimeSlots.length, loadPublishTimeSlots]);

  const toggle = (c: Channel) => {
    setChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const onConfirm = () => {
    if (!recommendation || !contents.length || !cover) return;
    const slot = publishTimeSlots.find((s) => s.id === activeSlot);
    const pub = buildPublish(recommendation.id, contents[0].id, cover.id, channels, slot?.scheduledAt ?? null);
    if (activeSlot) setPublishTimeSlot(activeSlot as any);
    confirmPublish();
    Taro.navigateTo({ url: '/pages/publish-success/index' });
  };

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">即将发布的内容</Text>
        </View>

        {cover && contents[0] && (
          <View className="gp-page__preview">
            <View className="gp-page__art-mini">
              <Text className="gp-page__art-mini-title">{cover.title}</Text>
              <Text className="gp-page__art-mini-sub">{cover.subtitle}</Text>
              <View className="gp-page__art-mini-cover">🎁</View>
            </View>
            <View className="gp-page__preview-body">
              <View className="gp-pill gp-pill--green">
                <Text>{contents[0].style_label}</Text>
              </View>
              <Text className="gp-page__preview-text">{contents[0].body}</Text>
              <View className="gp-page__tags">
                {contents[0].tags.map((t) => (
                  <View key={t} className="gp-pill gp-pill--apricot">
                    <Text>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View className="gp-page__section">
          <Text className="gp-h2">发布渠道</Text>
          <View className="gp-page__channels">
            {(Object.keys(CHANNEL_LABEL) as Channel[]).map((c) => (
              <View
                key={c}
                className={`gp-page__chip ${channels.includes(c) ? 'gp-page__chip--on' : ''}`}
                onClick={() => toggle(c)}
              >
                <Text>{channels.includes(c) ? '✓ ' : ''}{CHANNEL_LABEL[c]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gp-page__section gp-pub__time-section">
          <Text className="gp-h2">⏰ AI 推荐发布时间</Text>
          <Text className="gp-caption">点击 1 档即可写入定时；不选 = 立即发布</Text>
          <View className="gp-pub__slot-grid">
            {publishTimeSlots.map((slot) => {
              const active = activeSlot === slot.id;
              return (
                <View key={slot.id}
                  className={`gp-pub__slot ${active ? 'gp-pub__slot--active' : ''}`}
                  onClick={() => setActiveSlot(active ? null : slot.id)}>
                  <Text className="gp-pub__slot-label">{slot.label}</Text>
                  <Text className="gp-pub__slot-reason">{slot.reason}</Text>
                  <Text className="gp-pub__slot-ctr">预估打开率 {(slot.expectedCtr * 100).toFixed(0)}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="gp-page__section">
          <View className="gp-page__score">
            <Text className="gp-page__score-num">92</Text>
            <Text className="gp-page__score-max">/100</Text>
            <Text className="gp-page__score-label">内容质量评分</Text>
          </View>
          <View className="gp-page__score-grid">
            <View className="gp-page__score-cell">
              <Text className="gp-caption">广告感</Text>
              <Text>低</Text>
            </View>
            <View className="gp-page__score-cell">
              <Text className="gp-caption">情感表达</Text>
              <Text>高</Text>
            </View>
            <View className="gp-page__score-cell">
              <Text className="gp-caption">流畅度</Text>
              <Text>高</Text>
            </View>
            <View className="gp-page__score-cell">
              <Text className="gp-caption">吸引力</Text>
              <Text>高</Text>
            </View>
          </View>
        </View>

        <View className="gp-page__cta-row gp-page__cta-row--fixed">
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={onConfirm}>
            <Text>确认发布</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
