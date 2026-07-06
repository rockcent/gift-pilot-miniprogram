import { create } from 'zustand';
import type {
  Gift,
  GiftQuery,
  RecommendationSnapshot,
  ContentPiece,
  CoverTemplate,
  PlanItem,
  ReviewResult,
  Publish,
  PublishChannel,
  ProviderCallResult,
  AskResult,
  FestivalOpportunity,
  WeekPlan
} from '../types';
import { aiMock } from '../services/ai/mock';
import { planMock } from '../services/ai/plan';
import { festivalMock } from '../services/ai/festival';

interface AIState {
  /* 推荐 */
  lastQuery: GiftQuery | null;
  recommendation: RecommendationSnapshot | null;
  askHistory: Array<{ role: 'user' | 'assistant'; text: string; ts: number }>;

  /* 内容 */
  contents: ContentPiece[];
  cover: CoverTemplate | null;

  /* 发布 */
  publish: Publish | null;

  /* 复盘 / 计划 */
  review: ReviewResult | null;
  plan: PlanItem[];

  /* Actions */
  ask: (raw: string) => Promise<ProviderCallResult<AskResult>>;
  recommend: (q: GiftQuery) => Promise<ProviderCallResult<RecommendationSnapshot>>;
  generateContent: (giftId: string, style: ContentPiece['type']) => Promise<ProviderCallResult<ContentPiece[]>>;
  generateCover: (giftId: string, style: CoverTemplate['style']) => Promise<ProviderCallResult<CoverTemplate>>;
  buildPublish: (recId: string, contentId: string, coverId: string, channels: PublishChannel[]) => Publish;
  confirmPublish: () => void;
  loadReview: () => Promise<ProviderCallResult<ReviewResult>>;
  loadPlan: () => Promise<ProviderCallResult<PlanItem[]>>;

  /* V0.8 PR-1 */
  weekPlan: WeekPlan | null;
  festivalOpportunities: FestivalOpportunity[];
  loadWeekPlan: () => Promise<ProviderCallResult<WeekPlan>>;
  loadFestivalOpportunities: () => Promise<ProviderCallResult<FestivalOpportunity[]>>;
  reset: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  lastQuery: null,
  recommendation: null,
  askHistory: [],
  contents: [],
  cover: null,
  publish: null,
  review: null,
  plan: [],
  weekPlan: null,
  festivalOpportunities: [],

  ask: async (raw) => {
    const res = await aiMock.ask(raw);
    if (res.ok && res.data) {
      set((s) => ({ askHistory: [...s.askHistory, { role: 'user', text: raw, ts: Date.now() }] }));
      if (res.data.type === 'recommend') {
        set({ recommendation: res.data.recommendation, lastQuery: res.data.recommendation.query });
        set((s) => ({ askHistory: [...s.askHistory, { role: 'assistant', text: `为你推荐 ${res.data!.recommendation.gifts.length} 份合适的礼物`, ts: Date.now() }] }));
      } else if (res.data.type === 'greeting') {
        set((s) => ({ askHistory: [...s.askHistory, { role: 'assistant', text: res.data!.message, ts: Date.now() }] }));
      }
    }
    return res;
  },

  recommend: async (q) => {
    const res = await aiMock.recommend(q);
    if (res.ok && res.data) set({ recommendation: res.data, lastQuery: q });
    return res;
  },

  generateContent: async (giftId, style) => {
    const res = await aiMock.generateContent(giftId, style);
    if (res.ok && res.data) set({ contents: res.data });
    return res;
  },

  generateCover: async (giftId, style) => {
    const res = await aiMock.generateCover(giftId, style);
    if (res.ok && res.data) set({ cover: res.data });
    return res;
  },

  buildPublish: (recId, contentId, coverId, channels) => {
    const publish: Publish = {
      id: `pub_${Date.now()}`,
      recommendation_id: recId,
      content_id: contentId,
      cover_id: coverId,
      channels,
      scheduled_at: null,
      status: 'CREATED',
      quality_score: 92,
      created_at: Date.now(),
      published_at: null
    };
    set({ publish });
    return publish;
  },

  confirmPublish: () => {
    const p = get().publish;
    if (!p) return;
    set({ publish: { ...p, status: 'PAID', published_at: Date.now() } });
  },

  loadReview: async () => {
    const res = await aiMock.review('u_local');
    if (res.ok && res.data) set({ review: res.data });
    return res;
  },

  loadPlan: async () => {
    const res = await aiMock.nextPlan('u_local');
    if (res.ok && res.data) set({ plan: res.data });
    return res;
  },


  /* V0.8 PR-1 */
  loadWeekPlan: async () => {
    const res = await planMock.fetchWeekPlan();
    if (res.ok && res.data) set({ weekPlan: res.data });
    return res;
  },

  loadFestivalOpportunities: async () => {
    const res = await festivalMock.fetchFestivalOpportunities();
    if (res.ok && res.data) set({ festivalOpportunities: res.data });
    return res;
  },

  reset: () => set({
    lastQuery: null,
    recommendation: null,
    askHistory: [],
    contents: [],
    cover: null,
    publish: null,
    review: null,
    plan: [],
    weekPlan: null,
    festivalOpportunities: []
  })
}));
