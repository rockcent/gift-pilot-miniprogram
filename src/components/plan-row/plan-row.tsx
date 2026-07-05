import { View, Text } from '@tarojs/components';
import type { PlanItem } from '../../types';
import './plan-row.scss';

export interface PlanRowProps {
  item: PlanItem;
}

const STATUS_LABEL: Record<PlanItem['status'], string> = {
  PLANNED: '待推荐',
  GENERATED: '已生成',
  DONE: '已完成'
};

export function PlanRow({ item }: PlanRowProps) {
  return (
    <View className="gp-plan-row">
      <View className="gp-plan-row__date">
        <Text className="gp-plan-row__date-num">{item.week_date}</Text>
      </View>
      <View className="gp-plan-row__body">
        <View className="gp-plan-row__top">
          <Text className="gp-plan-row__scene">{item.scene}</Text>
          <View className="gp-pill gp-pill--apricot">
            <Text>{STATUS_LABEL[item.status]}</Text>
          </View>
        </View>
        <View className="gp-plan-row__meta">
          <Text className="gp-plan-row__meta-item">🎯 {item.relation}</Text>
          <Text className="gp-plan-row__meta-item">💰 {item.budget_text}</Text>
          <Text className="gp-plan-row__meta-item">⏰ {item.suggested_time}</Text>
        </View>
      </View>
    </View>
  );
}

export default PlanRow;
