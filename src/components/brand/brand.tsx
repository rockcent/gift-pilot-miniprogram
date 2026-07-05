import { View, Text } from '@tarojs/components';
import './brand.scss';

export interface BrandProps {
  size?: 'sm' | 'md';
  showSlogan?: boolean;
}

export function Brand({ size = 'md', showSlogan = true }: BrandProps) {
  return (
    <View className={`gp-brand gp-brand--${size}`}>
      <View className="gp-brand__logo" />
      <View>
        <Text className="gp-brand__title">礼有方</Text>
        <Text className="gp-brand__sub">GiftPilot</Text>
      </View>
      {showSlogan && <Text className="gp-brand__slogan">送礼有方，推荐有数。</Text>}
    </View>
  );
}

export default Brand;
