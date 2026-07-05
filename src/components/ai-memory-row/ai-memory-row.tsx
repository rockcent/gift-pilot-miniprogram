import { View, Text } from '@tarojs/components';
import { formatYuanRange } from '../../utils/money';
import './ai-memory-row.scss';

export interface AIMemoryRowProps {
  index: number;
  label: string;
  text?: string;
  range?: [number, number];
  tags?: string[];
  onEdit?: () => void;
}

export function AIMemoryRow({ index, label, text, range, tags, onEdit }: AIMemoryRowProps) {
  return (
    <View className="gp-mem-row">
      <View className="gp-mem-row__index">
        <Text>{index}</Text>
      </View>
      <View className="gp-mem-row__body">
        <Text className="gp-mem-row__label">{label}</Text>
        {text && <Text className="gp-mem-row__text">{text}</Text>}
        {range && <Text className="gp-mem-row__text">{formatYuanRange(range[0], range[1])}</Text>}
        {tags && (
          <View className="gp-mem-row__tags">
            {tags.map((t) => (
              <View key={t} className="gp-pill gp-pill--apricot">
                <Text>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View className="gp-mem-row__edit" onClick={onEdit}>
        <Text>✎</Text>
      </View>
    </View>
  );
}

export default AIMemoryRow;
