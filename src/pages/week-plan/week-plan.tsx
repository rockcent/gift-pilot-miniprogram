import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { useAIStore } from '../../stores/ai-store';
import { FestivalCard } from '../../components/festival-card/festival-card';
import { formatYuan } from '../../utils/money';
import './week-plan.scss';

const DAY_LABEL: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六'
};

const SCENE_LABEL: Record<string, string> = {
  birthday: '生日',
  festival: '节日',
  campaign: '营销',
  routine: '日常'
};

const STATUS_LABEL: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  done: '已完成',
  skipped: '已跳过'
};

function isToday(iso: string): boolean {
  const today = new Date();
  const d = new Date(iso);
  return d.getFullYear() === today.getFullYear()
    && d.getMonth() === today.getMonth()
    && d.getDate() === today.getDate();
}

export default function WeekPlanPage() {
  const weekPlan = useAIStore((s) => s.weekPlan);
  const festivalOpportunities = useAIStore((s) => s.festivalOpportunities);
  const loadWeekPlan = useAIStore((s) => s.loadWeekPlan);
  const loadFestivalOpportunities = useAIStore((s) => s.loadFestivalOpportunities);

  useEffect(() => {
    if (!weekPlan) loadWeekPlan();
    if (festivalOpportunities.length === 0) loadFestivalOpportunities();
  }, [weekPlan, festivalOpportunities, loadWeekPlan, loadFestivalOpportunities]);

  const summary = useMemo(() => {
    if (!weekPlan) return null;
    const all = weekPlan.days.flatMap((d) => d.tasks);
    const total = all.length;
    const done = all.filter((t) => t.status === 'done').length;
    return {
      total,
      done,
      pending: total - done,
      ratio: total > 0 ? Math.round((done / total) * 100) : 0
    };
  }, [weekPlan]);

  const onPickFestival = () => {
    Taro.navigateTo({ url: '/pages/index/index' });
  };

  const onStartTask = () => {
    Taro.navigateTo({ url: '/pages/index/index' });
  };

  return (
    <View className="gp-page gp-week-plan">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">📅 一周经营计划</Text>
          <Text className="gp-caption">{weekPlan?.weekId ?? '加载中…'} · 持续经营助手开始接管</Text>
        </View>

        {summary && (
          <View className="gp-week-plan__kpi">
            <View className="gp-week-plan__kpi-block">
              <Text className="gp-week-plan__kpi-num">{summary.done}</Text>
              <Text className="gp-week-plan__kpi-label">已完成</Text>
            </View>
            <View className="gp-week-plan__kpi-block">
              <Text className="gp-week-plan__kpi-num">{summary.pending}</Text>
              <Text className="gp-week-plan__kpi-label">待开始</Text>
            </View>
            <View className="gp-week-plan__kpi-block">
              <Text className="gp-week-plan__kpi-num">{formatYuan(weekPlan!.weeklyKpi.commissionTargetFen)}</Text>
              <Text className="gp-week-plan__kpi-label">佣金目标（元）</Text>
            </View>
          </View>
        )}

        {weekPlan && (
          <View className="gp-week-plan__days">
            {weekPlan.days.map((d) => {
              const date = new Date(d.date);
              const dayLabel = DAY_LABEL[date.getDay()] ?? '';
              const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
              const todayClass = isToday(d.date) ? 'gp-week-plan__day--today' : '';
              return (
                <View key={d.date} className={`gp-week-plan__day ${todayClass}`}>
                  <View className="gp-week-plan__day-head">
                    <Text className="gp-week-plan__day-name">{dayLabel}</Text>
                    <Text className="gp-week-plan__day-date">{dateLabel}</Text>
                  </View>
                  <View className="gp-week-plan__day-tasks">
                    {d.tasks.map((t) => (
                      <View key={t.id} className={`gp-week-plan__task gp-week-plan__task--${t.status}`}>
                        <View className="gp-week-plan__task-row">
                          <View className="gp-pill gp-pill--outline">
                            <Text>{SCENE_LABEL[t.scene] ?? t.scene}</Text>
                          </View>
                          <Text className="gp-week-plan__task-status">{STATUS_LABEL[t.status]}</Text>
                        </View>
                        <Text className="gp-week-plan__task-title">{t.title}</Text>
                      </View>
                    ))}
                    {d.tasks.length === 0 && (
                      <Text className="gp-week-plan__day-empty">小礼今天给你休息一下 ✨</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {festivalOpportunities.length > 0 && (
          <View className="gp-week-plan__festivals">
            <Text className="gp-week-plan__section-title">🎉 今日节日机会</Text>
            {festivalOpportunities.slice(0, 3).map((f) => (
              <FestivalCard key={f.id} festival={f} onPick={onPickFestival} />
            ))}
          </View>
        )}

        <View className="gp-week-plan__cta" onClick={onStartTask}>
          <Text className="gp-week-plan__cta-text">开始今日任务 →</Text>
        </View>
      </ScrollView>
    </View>
  );
}
