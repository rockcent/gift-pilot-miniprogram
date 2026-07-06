import { View, Text, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { useEffect, useMemo } from 'react';
import { ChatBubble, ChatInput } from '../../components/chat/chat-bubble';
import { AISixBanner } from '../../components/ai-six-banner/ai-six-banner';
import { FestivalCard } from '../../components/festival-card/festival-card';
import { useAIStore } from '../../stores/ai-store';
import { formatYuan, yuanToFen } from '../../utils/money';
import './index.scss';

export default function Index() {
  const [input, setInput] = useState('');
  const askHistory = useAIStore((s) => s.askHistory);
  const recommendation = useAIStore((s) => s.recommendation);
  const ask = useAIStore((s) => s.ask);

  /* V0.8 PR-1: 一周计划 + 节日机会 */
  const weekPlan = useAIStore((s) => s.weekPlan);
  const festivalOpportunities = useAIStore((s) => s.festivalOpportunities);
  const loadWeekPlan = useAIStore((s) => s.loadWeekPlan);
  const loadFestivalOpportunities = useAIStore((s) => s.loadFestivalOpportunities);

  useEffect(() => {
    if (!weekPlan) {
      loadWeekPlan();
    }
    if (festivalOpportunities.length === 0) {
      loadFestivalOpportunities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekKpi = useMemo(() => {
    if (!weekPlan) return null;
    const all = weekPlan.days.flatMap((d) => d.tasks);
    const pending = all.filter((t) => t.status === 'pending').length;
    return {
      pending,
      total: all.length,
      target: formatYuan(weekPlan.weeklyKpi.commissionTargetFen)
    };
  }, [weekPlan]);

  const goWeekPlan = () => Taro.navigateTo({ url: '/pages/week-plan/index' });


  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await ask(text);
  };

  const goRecommend = () => Taro.navigateTo({ url: '/pages/recommend/index' });

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        {/* 欢迎区 */}
        <View className="gp-page__hero">
          <View className="gp-page__hero-row">
            <View className="gp-page__avatar">
              <Text>小礼</Text>
            </View>
            <View className="gp-page__hero-text">
              <Text className="gp-page__hero-title">Hi，我是小礼 👋</Text>
              <Text className="gp-page__hero-sub">你的 AI 礼物经营助手</Text>
            </View>
          </View>
          <Text className="gp-page__hero-quote">
            今天准备送谁、预算多少、什么场景，我来帮你想得体又有新意。
          </Text>
        </View>

        {/* V0.8 PR-1: 今日计划卡 + 今日节日卡 */}
        <View className="gp-page__card">
          <Text className="gp-page__card-title">📅 今日计划</Text>
          {weekPlan ? (
            <>
              <Text className="gp-page__overview-row">本周还剩 {weekKpi?.pending} 条任务</Text>
              <Text className="gp-page__overview-row">佣金目标：{weekKpi?.target} 元</Text>
              <View className="gp-page__cta-row">
                <View className="gp-btn gp-btn--primary gp-btn--block" onClick={goWeekPlan}>
                  <Text>查看一周计划 →</Text>
                </View>
              </View>
            </>
          ) : (
            <Text className="gp-caption">小礼正在整理本周计划…</Text>
          )}
        </View>

        {festivalOpportunities.length > 0 && (
          <View className="gp-page__card">
            <Text className="gp-page__card-title">🎉 今日节日机会</Text>
            {festivalOpportunities.slice(0, 2).map((f) => (
              <FestivalCard key={f.id} festival={f} onPick={goWeekPlan} />
            ))}
          </View>
        )}

        {/* 对话历史 */}
        {askHistory.length > 0 && (
          <View className="gp-page__chat">
            {askHistory.map((m, i) => (
              <ChatBubble key={i} role={m.role} text={m.text} />
            ))}
          </View>
        )}

        {/* 推荐快照 */}
        {recommendation && (
          <View className="gp-page__card">
            <Text className="gp-page__card-title">{recommendation.match_label}</Text>
            <View className="gp-page__overview">
              <View className="gp-page__overview-row">
                <Text className="gp-caption">对象</Text>
                <Text>{recommendation.query.relation}</Text>
              </View>
              <View className="gp-page__overview-row">
                <Text className="gp-caption">关系</Text>
                <Text>{recommendation.query.scene}</Text>
              </View>
              <View className="gp-page__overview-row">
                <Text className="gp-caption">预算</Text>
                <Text>{formatYuan(recommendation.query.budget_fen)}</Text>
              </View>
              <View className="gp-page__overview-row">
                <Text className="gp-caption">场景</Text>
                <Text>{recommendation.query.scene}</Text>
              </View>
            </View>
            <View className="gp-page__cta-row">
              <View className="gp-btn gp-btn--primary gp-btn--block" onClick={goRecommend}>
                <Text>查看推荐</Text>
              </View>
            </View>
          </View>
        )}

        {/* 今日推荐机会 */}
        <View className="gp-page__card">
          <Text className="gp-page__card-title">🔥 今日推荐机会</Text>
          <ScrollView scrollX className="gp-page__hscroll">
            <View className="gp-page__hscroll-inner">
              <View className="gp-page__horiz-card">
                <View className="gp-page__horiz-cover">🎁</View>
                <View className="gp-page__horiz-body">
                  <Text className="gp-page__horiz-title">母亲节：送长辈健康礼物</Text>
                  <Text className="gp-page__horiz-meta">首推花盒 ¥26.60</Text>
                  <View className="gp-pill gp-pill--green">
                    <Text>一键生成</Text>
                  </View>
                </View>
              </View>
              <View className="gp-page__horiz-card">
                <View className="gp-page__horiz-cover">🌸</View>
                <View className="gp-page__horiz-body">
                  <Text className="gp-page__horiz-title">生日：送闺蜜永生花</Text>
                  <Text className="gp-page__horiz-meta">首推花盒 ¥16.60</Text>
                  <View className="gp-pill gp-pill--green">
                    <Text>一键生成</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <AISixBanner />

        <View className="gp-page__footer">
          <Text className="gp-mini">礼有方 · AI 礼物经营助手</Text>
        </View>
      </ScrollView>

      {/* 输入区 */}
      <View className="gp-page__input">
        <ChatInput
          placeholder="说说你今天想送谁、预算多少..."
          value={input}
          onChange={setInput}
          onSend={onSend}
        />
      </View>
    </View>
  );
}

export { yuanToFen };
