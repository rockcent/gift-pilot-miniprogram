/* V1.0 PR-18 · 平台管理后台 (mini 端简化版)
 * 商品供给策略 + 阶段二 usage 监控
 */
import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { productSupplyMock } from '../../services/ai/product-supply';
import { cpsMock } from '../../services/product/cps';
import { wechatPayMock } from '../../services/payment/wechat-pay';
import { getCurrentIdentity, getRecentUsageEvents, recentMeterEvents, recentTraceEvents } from '../../platform/adapter';
import type { SupplyScore } from '../../services/ai/product-supply';
import './index.scss';

interface CpsProductView {
  id: string;
  title: string;
  source: string;
  priceFen: number;
  commissionFen: number;
  stock: number;
  riskLevel: string;
}

export default function AdminPage() {
  const [scores, setScores] = useState<SupplyScore[]>([]);
  const [products, setProducts] = useState<CpsProductView[]>([]);
  const [orders, setOrders] = useState(wechatPayMock.list());
  const id = getCurrentIdentity();

  useEffect(() => {
    (async () => {
      const s = await productSupplyMock.scoreGifts([
        { id: 'gft_001', title: '香氛礼盒', brand: 'X', image: '', price_fen: 19900, price_text: '¥199', match_score: 85, relation_tags: ['同事'], reason: '', category: '香氛' },
        { id: 'gft_002', title: '永生花', brand: 'Y', image: '', price_fen: 16800, price_text: '¥168', match_score: 78, relation_tags: ['闺蜜'], reason: '', category: '永生花' },
        { id: 'gft_003', title: '小众香水', brand: 'Z', image: '', price_fen: 18900, price_text: '¥189', match_score: 80, relation_tags: ['朋友'], reason: '', category: '香氛' },
        { id: 'gft_004', title: '健康礼盒', brand: 'W', image: '', price_fen: 26800, price_text: '¥268', match_score: 82, relation_tags: ['妈妈'], reason: '', category: '健康' },
        { id: 'gft_005', title: '生日礼盒', brand: 'V', image: '', price_fen: 86030, price_text: '¥860', match_score: 88, relation_tags: ['同事'], reason: '', category: '礼盒' }
      ]);
      setScores(s.data ?? []);
      const p = await cpsMock.search({});
      setProducts((p.data ?? []).map((x) => ({
        id: x.id, title: x.title, source: x.source, priceFen: x.price_fen, commissionFen: x.commission_fen, stock: x.stock, riskLevel: x.riskLevel
      })));
    })();
  }, []);

  const usage = getRecentUsageEvents(10);
  const meters = recentMeterEvents(10);
  const traces = recentTraceEvents(10);

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">⚙️ 平台管理后台</Text>
          <Text className="gp-caption">V1.0 PR-18 商品供给 + 阶段二 usage 监控</Text>
        </View>

        <View className="gp-page__section gp-admin__id">
          <Text className="gp-h2">👤 身份</Text>
          <Text className="gp-caption">user: {id.userId}</Text>
          <Text className="gp-caption">org: {id.organizationId} ({id.organizationStatus})</Text>
          <Text className="gp-caption">role: {id.role} · device: {id.deviceLabel}</Text>
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">📊 商品供给策略（PR-18）</Text>
          {scores.length === 0 ? (
            <Text className="gp-caption">加载中...</Text>
          ) : (
            scores.map((s) => (
              <View key={s.giftId} className="gp-admin__row">
                <View className="gp-admin__row-head">
                  <Text className="gp-admin__row-title">{s.giftId}</Text>
                  <View className={`gp-pill gp-pill--${s.recommendation === 'promote' ? 'green' : s.recommendation === 'maintain' ? 'apricot' : 'coral'}`}>
                    <Text>{s.recommendation}</Text>
                  </View>
                </View>
                <Text className="gp-caption">综合分 {s.composite} · 库存 {s.inventory.toFixed(2)} · 佣金 {s.commissionYield.toFixed(2)} · 风险 {s.riskScore.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">🛒 CPS 商品库（阶段二-C）</Text>
          {products.map((p) => (
            <View key={p.id} className="gp-admin__row">
              <Text className="gp-admin__row-title">{p.title}</Text>
              <Text className="gp-caption">{p.source} · ¥{(p.priceFen / 100).toFixed(0)} · 佣金 ¥{(p.commissionFen / 100).toFixed(0)} · 库存 {p.stock} · 风险 {p.riskLevel}</Text>
            </View>
          ))}
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">💳 微信支付订单（阶段二-D）</Text>
          {orders.length === 0 ? (
            <Text className="gp-caption">暂无订单（先在小程序下单）</Text>
          ) : (
            orders.map((o) => (
              <View key={o.id} className="gp-admin__row">
                <View className="gp-admin__row-head">
                  <Text className="gp-admin__row-title">{o.id}</Text>
                  <View className="gp-pill gp-pill--green"><Text>{o.status}</Text></View>
                </View>
                <Text className="gp-caption">¥{(o.amount_fen / 100).toFixed(0)} · 佣金 ¥{(o.commission_fen / 100).toFixed(0)} · 幂等键 {o.idempotencyKey.slice(0, 16)}...</Text>
              </View>
            ))
          )}
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">📈 阶段二 usage / trace 监控</Text>
          <Text className="gp-caption">usage events: {usage.length} · meter facts: {meters.length} · trace events: {traces.length}</Text>
          {usage.slice(0, 5).map((u, i) => (
            <Text key={i} className="gp-caption">• {u.metric} × {u.quantity}</Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
