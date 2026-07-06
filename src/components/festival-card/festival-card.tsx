import { View, Text } from '@tarojs/components';
import type { FestivalOpportunity } from '../../types';
import './festival-card.scss';

export interface FestivalCardProps {
  festival: FestivalOpportunity;
  onPick?: (festival: FestivalOpportunity) => void;
}

const RELATION_LABEL: Record<string, string> = {
  mother: '妈妈',
  wife: '老婆',
  grandma: '奶奶',
  father: '爸爸',
  friend: '朋友',
  colleague: '同事',
  kids: '孩子',
  partner: '伴侣'
};

export function FestivalCard({ festival, onPick }: FestivalCardProps) {
  const handleClick = () => {
    if (onPick) onPick(festival);
  };

  return (
    <View className="gp-festival-card" onClick={handleClick}>
      <View className="gp-festival-card__head">
        <Text className="gp-festival-card__emoji">{festival.emoji}</Text>
        <View className="gp-festival-card__title">
          <Text className="gp-festival-card__name">{festival.name}</Text>
          <Text className="gp-festival-card__when">
            {festival.daysAway === 0 ? '就今天' : `还差 ${festival.daysAway} 天`}
          </Text>
        </View>
      </View>
      <Text className="gp-festival-card__pitch">{festival.aiPitch}</Text>
      <View className="gp-festival-card__rel-row">
        {festival.recommendedRelations.slice(0, 3).map((r) => (
          <View key={r} className="gp-pill gp-pill--outline">
            <Text>{RELATION_LABEL[r] ?? r}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
