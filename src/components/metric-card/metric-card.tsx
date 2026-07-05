import { View, Text } from '@tarojs/components';
import { formatYuan } from '../../utils/money';
import './metric-card.scss';

export interface MetricCardProps {
  label: string;
  valueFen?: number;
  valueText?: string;
  tone?: 'green' | 'apricot' | 'coral' | 'ink';
  hint?: string;
}

export function MetricCard({ label, valueFen, valueText, tone = 'green', hint }: MetricCardProps) {
  return (
    <View className={`gp-metric gp-metric--${tone}`}>
      <Text className="gp-metric__label">{label}</Text>
      <Text className="gp-metric__value">
        {valueText ?? (valueFen !== undefined ? formatYuan(valueFen) : '—')}
      </Text>
      {hint && <Text className="gp-metric__hint">{hint}</Text>}
    </View>
  );
}

export default MetricCard;
