import { View, Text, Image } from '@tarojs/components';
import type { CoverTemplate } from '../../types';
import './cover-card.scss';

export interface CoverCardProps {
  cover: CoverTemplate;
  style: CoverTemplate['style'];
  active?: boolean;
  onClick?: () => void;
}

const STYLE_LABEL: Record<CoverTemplate['style'], string> = {
  minimal: '简约高级',
  warm: '温柔治愈',
  fresh: '清新自然',
  vintage: '复古轻奢'
};

export function CoverCard({ cover, style, active = false, onClick }: CoverCardProps) {
  return (
    <View className={`gp-cvr ${active ? 'gp-cvr--active' : ''}`} onClick={onClick}>
      <View className="gp-cvr__art">
        <Text className="gp-cvr__title">{cover.title}</Text>
        <Text className="gp-cvr__sub">{cover.subtitle}</Text>
        {cover.image_placeholder ? (
          <Image className="gp-cvr__img" src={cover.image_placeholder} mode="aspectFill" />
        ) : (
          <View className="gp-cvr__placeholder">🎁</View>
        )}
      </View>
      <View className="gp-cvr__foot">
        <Text>{STYLE_LABEL[style]}</Text>
        {active && <Text className="gp-cvr__check">✓</Text>}
      </View>
    </View>
  );
}

export default CoverCard;
