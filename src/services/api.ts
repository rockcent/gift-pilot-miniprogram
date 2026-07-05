/* API 客户端 · 基于 @rockcent/platform/web-client 形态（阶段二接通真实后端时直接替换 import）
 *
 * MVP mock 阶段我们直接返回 mock 数据，但调用入口已经统一为 ApiClient 接口形态，
 * 便于阶段二把 impl 换成：
 *   import { createApiClient } from '@rockcent/platform/web-client';
 *   export const api = createApiClient({ baseUrl: process.env.API_BASE });
 */

export interface ApiResult<T> {
  ok: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

export interface ApiClient {
  ai: {
    ask: (query: string) => Promise<ApiResult<any>>;
    recommend: (relation: string, budgetFen: number, scene: string) => Promise<ApiResult<any>>;
    generateContent: (giftId: string, style: string) => Promise<ApiResult<any>>;
    generateCover: (giftId: string, style: string) => Promise<ApiResult<any>>;
    review: (userId: string) => Promise<ApiResult<any>>;
    nextPlan: (userId: string) => Promise<ApiResult<any>>;
  };
  orders: {
    list: (userId: string) => Promise<ApiResult<any>>;
  };
  memory: {
    get: (userId: string) => Promise<ApiResult<any>>;
    put: (userId: string, memory: any) => Promise<ApiResult<any>>;
  };
}

import { aiMock } from './ai/mock';
import ordersMockService from './orders/mock';
import memoryMockService from './memory/mock';

export const api: ApiClient = {
  ai: {
    ask: (query) => aiMock.ask(query) as any,
    recommend: (relation, budgetFen, scene) => aiMock.recommend({
      relation,
      budget_fen: budgetFen,
      scene,
      tone: 'warm',
      raw_query: ''
    }) as any,
    generateContent: (giftId, style) => aiMock.generateContent(giftId, style as any) as any,
    generateCover: (giftId, style) => aiMock.generateCover(giftId, style as any) as any,
    review: (userId) => aiMock.review(userId) as any,
    nextPlan: (userId) => aiMock.nextPlan(userId) as any
  },
  orders: { list: ordersMockService.list },
  memory: { get: memoryMockService.get, put: memoryMockService.put }
};
