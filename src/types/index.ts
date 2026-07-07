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

/* V0.8 PR-1: 一周经营计划 + 节日机会 */

export type SceneKind = 'birthday' | 'festival' | 'campaign' | 'routine';
export type DayTaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped';

export interface DayTask {
  id: string;
  title: string;
  scene: SceneKind;
  expectedSlots: number;
  status: DayTaskStatus;
}

export interface WeekPlanDay {
  date: string;            // YYYY-MM-DD
  tasks: DayTask[];
}

export interface WeeklyKpi {
  publishTarget: number;
  commissionTargetFen: number;
}

export interface WeekPlan {
  weekId: string;          // '2026-W27'
  startDate: string;       // ISO
  days: WeekPlanDay[];
  weeklyKpi: WeeklyKpi;
}

export type FestivalRelation = 'mother' | 'wife' | 'grandma' | 'father' | 'friend' | 'colleague' | 'kids' | 'partner';

export interface FestivalOpportunity {
  id: string;              // 'mother-day-2026'
  name: string;            // '母亲节'
  emoji: string;           // '💐'
  startDate: string;       // ISO
  endDate: string;
  daysAway: number;        // computed at fetch time
  recommendedRelations: FestivalRelation[];
  hotGifts: string[];      // mock gift IDs
  aiPitch: string;         // one-line AI 语气
}

export function computeDaysAway(targetISO: string, today: Date = new Date()): number {
  const target = new Date(targetISO);
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((b - a) / 86_400_000);
}

/* V0.8 PR-2: 6 风格 chip + 风格档案 */

export type StyleId = 'share' | 'review' | 'emotion' | 'personal' | 'professional' | 'funny';
export type SentenceLen = 'short' | 'medium' | 'long';

export interface StyleChipMeta {
  id: StyleId;
  label: string;            // '自然分享'
  emoji: string;            // '✨'
  description: string;      // '温暖随性，像发朋友圈'
  presetStyle: 'share' | 'review' | 'emotion';  // 复制 v0.6 已有 3 种之一
  isPersonalized: boolean;
}

export interface StyleUsageStat {
  used: number;
  lastUsedAt: number | null;
}

export interface StyleProfile {
  weights: Record<StyleId, StyleUsageStat>;
  sentenceLen: SentenceLen;
  emojiRate: number;        // 0..1，默认 0.3
  totalEdits: number;
  learnedAt: number | null;
}

export const STYLE_IDS: StyleId[] = ['share', 'review', 'emotion', 'personal', 'professional', 'funny'];

export function blankStyleProfile(): StyleProfile {
  const weights = {} as Record<StyleId, StyleUsageStat>;
  for (const id of STYLE_IDS) weights[id] = { used: 0, lastUsedAt: null };
  return { weights, sentenceLen: 'medium', emojiRate: 0.3, totalEdits: 0, learnedAt: null };
}

/* V0.8 PR-3: 发布时间 + 多平台内容 */

export type PublishTimeSlotId = 'tomorrow-morning' | 'tonight-evening' | 'day-after-noon';

export interface PublishTimeSlot {
  id: PublishTimeSlotId;
  label: string;            // '明早 8:30'
  scheduledAt: string;      // ISO 'YYYY-MM-DDTHH:mm:ss.sssZ'
  reason: string;           // '上班路上刷手机高峰'
  expectedCtr: number;      // 0..1
}

export type PlatformId = 'moments' | 'xiaohongshu' | 'shipinhao';

export interface PlatformContent {
  platformId: PlatformId;
  title: string;
  body: string;
  hashtags: string[];
  charLimit: number;
  emojiRate: number;
}

export interface MultiPlatformBundle {
  sourceText: string;
  giftName: string;
  variants: PlatformContent[];   // 3 platforms
  generatedAt: number;
}

export const PLATFORM_IDS: PlatformId[] = ['moments', 'xiaohongshu', 'shipinhao'];
export const PUBLISH_TIME_SLOT_IDS: PublishTimeSlotId[] = ['tomorrow-morning', 'tonight-evening', 'day-after-noon'];
