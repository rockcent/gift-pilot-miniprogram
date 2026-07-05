/* 礼有方小程序领域类型 · 来自宪法 §4 数据不变量 */

export interface Gift {
  id: string;
  title: string;
  brand: string;
  image: string;
  price_fen: number;        // 内部用分（宪法 §4.1）
  price_text: string;       // 展示用 "¥199 起 ¥23.8"
  match_score: number;      // 0-100
  relation_tags: string[];
  reason: string;
  category: string;
}

export interface GiftQuery {
  relation: string;
  budget_fen: number;
  scene: string;
  tone: string;
  raw_query: string;
}

export interface RecommendationSnapshot {
  id: string;
  user_id: string;
  created_at: number;
  query: GiftQuery;
  gifts: Gift[];
  match_label: string;
}

export interface ContentPiece {
  id: string;
  type: 'share' | 'review' | 'emotion';
  style_label: string;
  body: string;
  tags: string[];
  quality_score: number;
}

export interface CoverTemplate {
  id: string;
  style: 'minimal' | 'warm' | 'fresh' | 'vintage';
  title: string;
  subtitle: string;
  image_placeholder: string;
}

export type PublishChannel = 'timeline' | 'channels' | 'article';

export type PublishStatus = 'CREATED' | 'PENDING' | 'PAID' | 'CLOSED' | 'FAILED';

export interface Publish {
  id: string;
  recommendation_id: string;
  content_id: string;
  cover_id: string;
  channels: PublishChannel[];
  scheduled_at: number | null;
  status: PublishStatus;
  quality_score: number;
  created_at: number;
  published_at: number | null;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'CLOSED' | 'REFUNDING' | 'REFUNDED' | 'FAILED';

export interface Order {
  id: string;
  publish_id: string | null;       // 归因（宪法 §4.5）
  gift_id: string;
  amount_fen: number;              // 内部用分
  commission_fen: number;          // 佣金（分）
  status: OrderStatus;
  created_at: number;
  paid_at: number | null;
  closed_at: number | null;
  buyer_note?: string;
}

export interface OrderSummary {
  today_fen: number;
  month_fen: number;
  expected_fen: number;
}

export interface PlanItem {
  id: string;
  week_date: string;
  scene: string;
  relation: string;
  budget_text: string;
  suggested_time: string;
  status: 'PLANNED' | 'GENERATED' | 'DONE';
}

export interface ReviewResult {
  range: { from_ts: number; to_ts: number };
  total_publish: number;
  total_orders: number;
  expected_commission_fen: number;
  click_count: number;
  click_rate: number;
  aov_fen: number;
  highlights: string[];
  next_suggestions: string[];
}

export interface AIMemory {
  id: string;
  user_id: string;
  primary_relations: string[];
  budget_range_fen: [number, number];
  preferred_styles: string[];
  favorite_categories: string[];
  best_publish_window: string;
  goal_text: string;
  updated_at: number;
}

/* ProviderCallResult（必须与 @rockcent/platform/ai 对齐，便于阶段二切换） */
export interface ProviderCallResult<T> {
  ok: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  usage?: { prompt_tokens: number; completion_tokens: number };
  trace_id: string;
}

export type AskResult =
  | { type: 'recommend'; recommendation: RecommendationSnapshot }
  | { type: 'clarify'; questions: string[] }
  | { type: 'greeting'; message: string };
