import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { PlanRow } from '../../components/plan-row/plan-row';
import { useAIStore } from '../../stores/ai-store';
import './index.scss';

export default function NextPlanPage() {
  const plan = useAIStore((s) => s.plan);
  const loadPlan = useAIStore((s) => s.loadPlan);

  useEffect(() => {
    if (plan.length === 0) loadPlan();
  }, [plan.length, loadPlan]);

  const onGenerate = () => Taro.showToast({ title: 'MVP mock · 已触发生成', icon: 'none' });
  const onManage = () => Taro.navigateTo({ url: '/pages/memory/index' });

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">小礼为你制定了下周计划</Text>
          <Text className="gp-caption">05.12 - 05.18 · 基于记忆与复盘结果</Text>
        </View>

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
