import { create } from 'zustand';
import type { Order, OrderSummary } from '../types';
import ordersMock from '../data/mock-orders.json';
import { fenToYuan, yuanToFen } from '../utils/money';

interface OrdersState {
  orders: Order[];
  summary: OrderSummary;

  loadMock: () => void;
  summaryFrom: (orders: Order[]) => OrderSummary;
}

function todayStartTs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function monthStartTs(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: ordersMock as Order[],
  summary: { today_fen: 8630, month_fen: 86030, expected_fen: 18800 },

  loadMock: () => {
    const orders = ordersMock as Order[];
    set({ orders, summary: { today_fen: 8630, month_fen: 86030, expected_fen: 18800 } });
  },

  summaryFrom: (orders) => {
    const today = todayStartTs();
    const month = monthStartTs();
    let today_fen = 0;
    let month_fen = 0;
    let expected_fen = 0;
    for (const o of orders) {
      if (o.status === 'PAID' || o.status === 'CLOSED') {
        if (o.created_at >= today) today_fen += o.commission_fen;
        if (o.created_at >= month) month_fen += o.commission_fen;
        expected_fen += o.commission_fen;
      }
    }
    return { today_fen, month_fen, expected_fen };
  }
}));

// 阶段二真实接入示例（占位）：fetch('/api/orders?user=...')
// 使用 fenToYuan / yuanToFen 做单位转换，避免在 store 里出现浮点金额
export const __demo = { fenToYuan, yuanToFen };
