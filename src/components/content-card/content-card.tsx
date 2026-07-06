import { View, Text } from '@tarojs/components';
import type { ContentPiece } from '../../types';
import './content-card.scss';

export interface ContentCardProps {
  content: ContentPiece;
  active?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onOptimize?: () => void;
  onRemember?: () => void;
}

export function ContentCard({
  content,
  active = false,
  onCopy,
  onRegenerate,
  onOptimize,
  onRemember
}: ContentCardProps) {
  return (
    <View className={`gp-cc ${active ? 'gp-cc--active' : ''}`}>
      <View className="gp-cc__head">
        <View className="gp-pill gp-pill--green">
          <Text>{content.style_label}</Text>
        </View>
        <Text className="gp-cc__score">质量 {content.quality_score}</Text>
      </View>
      <View className="gp-cc__body">
        <Text>{content.body}</Text>
      </View>
      <View className="gp-cc__tags">
        {content.tags.map((t) => (
          <View key={t} className="gp-pill gp-pill--apricot">
            <Text>#{t}</Text>
          </View>
        ))}
      </View>
      <View className="gp-cc__ops">
        {onCopy && (
          <View className="gp-cc__op" onClick={onCopy}>
            <Text>📋 复制</Text>
          </View>
        )}
        {onRegenerate && (
          <View className="gp-cc__op" onClick={onRegenerate}>
            <Text>↻ 换一版</Text>
          </View>
        )}
        {onOptimize && (
          <View className="gp-cc__op" onClick={onOptimize}>
            <Text>✨ 优化</Text>
          </View>
        )}
        {onRemember && (
          <View className="gp-cc__op gp-cc__op--remember" onClick={onRemember}>
            <Text>📌 记住</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default ContentCard;
