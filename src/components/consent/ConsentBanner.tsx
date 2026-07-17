/* 礼有方小程序 H5 · 隐私同意横幅 */
import { useEffect, useState } from 'react';
import { View, Text, Checkbox, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { acceptConsent, hasConsented, type ConsentCategory } from '../../platform/consent';
import './consent-banner.scss';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setVisible(!hasConsented());
  }, []);

  if (!visible) return null;

  const onAccept = (choices: Record<ConsentCategory, boolean>) => {
    acceptConsent({ choices, source: 'banner' });
    setVisible(false);
  };

  return (
    <View className="gp-consent" catchMove>
      <View className="gp-consent__panel">
        <Text className="gp-consent__title">🍪 我们重视您的隐私</Text>
        <Text className="gp-consent__desc">
          礼有方使用本地存储记录您的 AI 记忆（关系画像 / 偏好 / 预算）和匿名设备标识符，用于个性化推荐与服务。
        </Text>
        <View className="gp-consent__list">
          <View className="gp-consent__item">
            <Checkbox value="necessary" checked disabled />
            <Text>必要（核心服务）</Text>
          </View>
          <View className="gp-consent__item" onClick={() => setAnalytics(!analytics)}>
            <Checkbox value="analytics" checked={analytics} />
            <Text>分析（匿名行为分析）</Text>
          </View>
          <View className="gp-consent__item" onClick={() => setMarketing(!marketing)}>
            <Checkbox value="marketing" checked={marketing} />
            <Text>营销（个性化推荐）</Text>
          </View>
        </View>
        <View className="gp-consent__actions">
          <Button className="gp-btn gp-btn--ghost" onClick={() => onAccept({ necessary: true, analytics: false, marketing: false })}>仅必要</Button>
          <Button className="gp-btn gp-btn--primary" onClick={() => onAccept({ necessary: true, analytics: true, marketing: true })}>接受全部</Button>
        </View>
        <Text className="gp-consent__legal" onClick={() => Taro.openUrl({ url: 'https://gift.rockcent.com/legal/privacy.html' })}>
          详见隐私政策 →
        </Text>
      </View>
    </View>
  );
}
