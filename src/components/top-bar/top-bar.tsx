import { View, Text } from '@tarojs/components';
import { Brand } from '../brand/brand';
import './top-bar.scss';

export interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
}

export function TopBar({ title, subtitle, showBrand = true }: TopBarProps) {
  return (
    <View className="gp-topbar">
      {showBrand && <Brand size="sm" showSlogan={false} />}
      {!showBrand && (
        <View className="gp-topbar__title-wrap">
          <Text className="gp-topbar__title">{title}</Text>
          {subtitle && <Text className="gp-topbar__sub">{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

export default TopBar;
