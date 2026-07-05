import orders from '../../data/mock-orders.json';
import type { Order } from '../../types';

export default {
  async list(_userId: string) {
    await new Promise((r) => setTimeout(r, 100));
    return { ok: true, data: orders as Order[], error: null };
  }
};
