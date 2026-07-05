import { View, Text, ScrollView } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { MetricCard } from '../../components/metric-card/metric-card';
import { useOrdersStore } from '../../stores/orders-store';
import { formatYuan } from '../../utils/money';
import type { OrderStatus } from '../../types';
import './index.scss';

type Filter = 'all' | 'pending' | 'settled' | 'withdrawn';
const FILTER_LABEL: Record<Filter, string> = {
  all: '全部',
  pending: '待结算',
  settled: '已结算',
  withdrawn: '已提现'
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED: '待付款',
  PAID: '已付款',
  CLOSED: '已关闭',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
  FAILED: '失败'
};

export default function OrdersPage() {
  const [active, setActive] = useState<Filter>('all');
  const orders = useOrdersStore((s) => s.orders);
  const summary = useOrdersStore((s) => s.summary);
  const loadMock = useOrdersStore((s) => s.loadMock);

  useEffect(() => {
    loadMock();
  }, [loadMock]);

  const filtered = orders.filter((o) => {
    if (active === 'all') return true;
    if (active === 'pending') return o.status === 'CREATED';
    if (active === 'settled') return o.status === 'PAID' || o.status === 'CLOSED';
    return false;
  });

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__metrics">
          <MetricCard label="今日预计佣金" valueFen={summary.today_fen} tone="green" />
          <MetricCard label="本月预计佣金" valueFen={summary.month_fen} tone="apricot" />
          <MetricCard label="预计订单佣金" valueFen={summary.expected_fen} tone="coral" hint="折算完整月" />
        </View>

        <View className="gp-page__tabs">
          <View className={`gp-page__tab gp-page__tab--active`}>
            <Text>全部订单</Text>
          </View>
          {(Object.keys(FILTER_LABEL) as Filter[]).map((k) => (
            <View
              key={k}
              className={`gp-page__tab ${active === k ? 'gp-page__tab--active' : ''}`}
              onClick={() => setActive(k)}
            >
              <Text>{FILTER_LABEL[k]}</Text>
            </View>
          ))}
        </View>

        <View className="gp-page__list">
          <Text className="gp-page__list-title">最新订单</Text>
          {filtered.map((o) => (
            <View key={o.id} className="gp-page__order">
              <View className="gp-page__order-top">
                <Text className="gp-page__order-id">订单号：{o.id}</Text>
                <View className={`gp-page__order-status gp-page__order-status--${o.status}`}>
                  <Text>{STATUS_LABEL[o.status]}</Text>
                </View>
              </View>
              <View className="gp-page__order-meta">
                <View className="gp-page__order-meta-row">
                  <Text className="gp-caption">订单金额</Text>
                  <Text>{formatYuan(o.amount_fen)}</Text>
                </View>
                <View className="gp-page__order-meta-row">
                  <Text className="gp-caption">订单佣金</Text>
                  <Text className="gp-page__order-commission">{formatYuan(o.commission_fen)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="gp-page__bottom">
          <View className="gp-btn gp-btn--ghost gp-btn--block">
            <Text>查看全部订单 →</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
