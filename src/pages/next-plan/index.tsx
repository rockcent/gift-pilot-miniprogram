import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { PlanRow } from '../../components/plan-row/plan-row';
import { useAIStore } from '../../stores/ai-store';
import './index.scss';

export default function NextPlanPage() {
  const plan = useAIStore((s) => s.plan);
  const loadPlan = useAIStore((s) => s.loadPlan);
  /* V0.8 PR-3: 计划发布时间 */
  const publish = useAIStore((s) => s.publish);
  const publishTimeSlots = useAIStore((s) => s.publishTimeSlots);
  const loadPublishTimeSlots = useAIStore((s) => s.loadPublishTimeSlots);

  useEffect(() => {
    if (plan.length === 0) loadPlan();
  }, [plan.length, loadPlan]);

  useEffect(() => {
    if (publishTimeSlots.length === 0) loadPublishTimeSlots();
  }, [publishTimeSlots.length, loadPublishTimeSlots]);

  /* V0.8 PR-3: 从 publish.scheduled_at (ISO 字符串) / slot 列表中取最佳展示文案 */
  const scheduledLabel = (() => {
    if (!publish?.scheduled_at) return null;
    const iso = String(publish.scheduled_at);
    const slot = publishTimeSlots.find((s) => s.scheduledAt === iso);
    if (slot) return slot.label;
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return null;
    }
  })();

  const onGenerate = () => Taro.showToast({ title: 'MVP mock · 已触发生成', icon: 'none' });
  const onManage = () => Taro.navigateTo({ url: '/pages/memory/index' });

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">小礼为你制定了下周计划</Text>
          <Text className="gp-caption">05.12 - 05.18 · 基于记忆与复盘结果</Text>
        </View>

        {/* V0.8 PR-3: 计划发布时间 */}
        {scheduledLabel && (
          <View className="gp-page__schedule">
            <View className="gp-pill gp-pill--green">
              <Text>🕐 计划于 {scheduledLabel} 发布</Text>
            </View>
            <Text className="gp-page__schedule-caption">
              小礼已按你选的 AI 推荐档写入定时；如需调整可回发布页改档。
            </Text>
          </View>
        )}

        <View className="gp-page__list">
          {plan.map((p) => (
            <PlanRow key={p.id} item={p} />
          ))}
        </View>

        <View className="gp-page__tip">
          <Text className="gp-page__tip-title">📌 不同关系给同周</Text>
          <Text className="gp-page__tip-text">
            X、妈、家、同事属同关系对应发布信息看起来很重复，请注意发布差异化
          </Text>
        </View>

        <View className="gp-page__cta-row">
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={onGenerate}>
            <Text>一键生成内容</Text>
          </View>
          <View className="gp-btn gp-btn--ghost" onClick={onManage}>
            <Text>管理我的计划</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
