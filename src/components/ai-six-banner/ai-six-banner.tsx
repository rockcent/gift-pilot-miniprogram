import { View, Text } from '@tarojs/components';
import './ai-six-banner.scss';

const ITEMS: Array<{ dot: string; label: string }> = [
  { dot: '选', label: '选对礼' },
  { dot: '谈', label: '谈得好' },
  { dot: '做', label: '做得美' },
  { dot: '发', label: '发得准' },
  { dot: '看', label: '看得清' },
  { dot: '改', label: '改得好' }
];

export function AISixBanner() {
  return (
    <View className="gp-ai6-banner">
      {ITEMS.map((it) => (
        <View key={it.label} className="gp-ai6-banner__item">
          <View className="gp-ai6-banner__dot">
            <Text>{it.dot}</Text>
          </View>
          <Text className="gp-ai6-banner__label">{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default AISixBanner;
