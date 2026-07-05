import { View, Text, Image } from '@tarojs/components';
import type { Gift } from '../../types';
import { formatYuan } from '../../utils/money';
import './gift-card.scss';

export interface GiftCardProps {
  gift: Gift;
  rank?: number;
  selected?: boolean;
  onClick?: () => void;
}

export function GiftCard({ gift, rank, selected = false, onClick }: GiftCardProps) {
  return (
    <View className={`gp-gift ${selected ? 'gp-gift--selected' : ''}`} onClick={onClick}>
      <View className="gp-gift__cover">
        {gift.image ? <Image className="gp-gift__img" src={gift.image} mode="aspectFill" /> : <View className="gp-gift__placeholder">🎁</View>}
        {rank !== undefined && <View className="gp-gift__rank">{rank}</View>}
      </View>
      <View className="gp-gift__body">
        <Text className="gp-gift__title">{gift.title}</Text>
        <Text className="gp-gift__brand">{gift.brand}</Text>
        <Text className="gp-gift__price">{formatYuan(gift.price_fen)}</Text>
        <View className="gp-gift__meta">
          {gift.relation_tags.map((tag) => (
            <View key={tag} className="gp-pill gp-pill--apricot">
              <Text>{tag}</Text>
            </View>
          ))}
          <View className="gp-pill gp-pill--ink">
            <Text>{gift.category}</Text>
          </View>
        </View>
        <Text className="gp-gift__reason">{gift.reason}</Text>
        <View className="gp-gift__bar">
          <View className="gp-gift__bar-fill" style={{ width: `${gift.match_score}%` }} />
        </View>
        <Text className="gp-gift__score">匹配度 {gift.match_score}%</Text>
      </View>
    </View>
  );
}

export default GiftCard;
