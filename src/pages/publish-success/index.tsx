import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function PublishSuccessPage() {
  const onContinue = () => {
    Taro.reLaunch({ url: '/pages/index/index' });
  };
  const onView = () => Taro.showToast({ title: 'MVP mock · 内容已生成', icon: 'none' });
  const onShare = () => Taro.showToast({ title: 'MVP mock · 请复制分享', icon: 'none' });

  return (
    <View className="gp-page gp-page--center">
      <View className="gp-success">
        <View className="gp-success__check">
          <Text>✓</Text>
        </View>
        <Text className="gp-success__title">发布成功！</Text>
        <Text className="gp-success__sub">你的内容已成功发布到朋友圈</Text>
      </View>

      <View className="gp-success__cta">
        <View className="gp-btn gp-btn--ghost gp-btn--block" onClick={onView}>
          <Text>查看发布内容</Text>
        </View>
        <View className="gp-success__share-row">
          <View className="gp-btn gp-btn--ink" onClick={onShare}>
            <Text>分享给好友</Text>
          </View>
          <View className="gp-btn gp-btn--primary" onClick={onContinue}>
            <Text>继续生成</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
