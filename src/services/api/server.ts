/* 阶段二-E · 后端 API client（mock）
 *
 * 真实接入：微信云开发 / 自建 Node 22 + Express
 * 当前 mock：所有路由返回本地 mock 数据
 */
import type { Gift } from '../../types';
import mockGifts from '../../data/mock-gifts.json';
import { okResult, errResult } from '../../platform/adapter';
import type { ProviderCallResult } from '../../platform/adapter';

const BASE = '/api';

async function mockFetch<T>(path: string): Promise<ProviderCallResult<T>> {
  try {
    await new Promise((r) => setTimeout(r, 120));
    if (path === '/gifts') {
      return okResult<T>(mockGifts as unknown as T);
    }
    if (path.startsWith('/gifts/')) {
      const id = path.split('/').pop();
      const g = (mockGifts as Gift[]).find((x) => x.id === id);
      return g ? okResult<T>(g as unknown as T) : errResult<T>('NOT_FOUND', path);
    }
    if (path === '/health') {
      return okResult<T>({ status: 'ok', ts: Date.now() } as unknown as T);
    }
    return errResult<T>('NO_ROUTE', path);
  } catch (e) {
    return errResult<T>('FETCH_FAIL', String(e));
  }
}

export const apiClient = {
  get<T>(path: string): Promise<ProviderCallResult<T>> {
    return mockFetch<T>(path);
  },
  base(): string {
    return BASE;
  }
};

export default apiClient;
