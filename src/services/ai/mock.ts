/* AI 服务 Mock · 接口形态严格按宪法 §6 + plan §6（ProviderCallResult） */
import type {
  AskResult,
  ContentPiece,
  CoverTemplate,
  Gift,
  GiftQuery,
  PlanItem,
  ProviderCallResult,
  RecommendationSnapshot,
  ReviewResult
} from '../../types';
import gifts from '../../data/mock-gifts.json';
import contents from '../../data/mock-content.json';
import { nextId } from '../../utils/id';
import { errResult, okResult } from '../../utils/trace';

function simulate(ms = 220): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* 关键词分类（mock LLM） */
function parseQuery(raw: string): GiftQuery {
  const lower = raw.toLowerCase();
  let relation = '同事';
  if (/长辈|妈妈|爸|妈|父|母亲|领导/.test(raw)) relation = '长辈';
  else if (/闺蜜|朋友|死党/.test(raw)) relation = '闺蜜';
  else if (/同事|上司|老板/.test(raw)) relation = '同事';

  let scene = '生日';
  if (/母亲节/.test(raw)) scene = '母亲节';
  else if (/乔迁|搬家/.test(raw)) scene = '乔迁';
  else if (/客户|拜访|商务/.test(raw)) scene = '客户拜访';
  else if (/生日|生日礼物/.test(raw)) scene = '生日';

  const m = raw.match(/(\d{2,4})\s*元/);
  const budget_fen = m ? Number(m[1]) * 100 : 20000;

  return { relation, budget_fen, scene, tone: 'warm', raw_query: raw };
}

export const aiMock = {
  async ask(raw: string): Promise<ProviderCallResult<AskResult>> {
    await simulate();
    if (!raw.trim()) {
      return okResult<AskResult>({
        type: 'greeting',
        message: '你好，我是小礼。告诉我准备送给谁、预算多少，我帮你选礼物、做内容。'
      });
    }
    const query = parseQuery(raw);
    const gifts = pickGifts(query);
    if (gifts.length === 0) {
      return okResult<AskResult>({
        type: 'clarify',
        questions: ['方便多说一点吗？比如对方是同事还是长辈？预算大约多少？']
      });
    }
    const recommendation: RecommendationSnapshot = {
      id: nextId('rec'),
      user_id: 'u_local',
      created_at: Date.now(),
      query,
      gifts,
      match_label: `为你推荐 ${gifts.length} 份合适的礼物`
    };
    return okResult<AskResult>({ type: 'recommend', recommendation });
  },

  async recommend(q: GiftQuery): Promise<ProviderCallResult<RecommendationSnapshot>> {
    await simulate();
    const gifts = pickGifts(q);
    if (gifts.length === 0) {
      return errResult('NO_GIFT', '没有匹配的礼物，建议放宽预算或调整关系标签');
    }
    const snap: RecommendationSnapshot = {
      id: nextId('rec'),
      user_id: 'u_local',
      created_at: Date.now(),
      query: q,
      gifts,
      match_label: `为你推荐 ${gifts.length} 份合适的礼物`
    };
    return okResult(snap);
  },

  async generateContent(_giftId: string, _style: string): Promise<ProviderCallResult<ContentPiece[]>> {
    await simulate();
    return okResult(contents as ContentPiece[]);
  },

  async generateCover(giftId: string, style: CoverTemplate['style']): Promise<ProviderCallResult<CoverTemplate>> {
    await simulate();
    const gift = (gifts as Gift[]).find((g) => g.id === giftId) ?? (gifts as Gift[])[0];
    const styleMap: Record<CoverTemplate['style'], { title: string; subtitle: string }> = {
      minimal: { title: '送同事生日礼物', subtitle: gift.title },
      warm: { title: '把心意包装一下', subtitle: gift.title },
      fresh: { title: '一份清新小礼', subtitle: gift.title },
      vintage: { title: '复古精致呈现', subtitle: gift.title }
    };
    const tpl: CoverTemplate = {
      id: nextId('cvr'),
      style,
      title: styleMap[style].title,
      subtitle: styleMap[style].subtitle,
      image_placeholder: gift.image
    };
    return okResult(tpl);
  },

  async review(_userId: string): Promise<ProviderCallResult<ReviewResult>> {
    await simulate();
    const r: ReviewResult = {
      range: { from_ts: Date.now() - 7 * 86400000, to_ts: Date.now() },
      total_publish: 6,
      total_orders: 3,
      expected_commission_fen: 18800,
      click_count: 1268,
      click_rate: 0.0311,
      aov_fen: 19630,
      highlights: [
        '全国分享内容点击率最高区，建议继续使用',
        '晚上 20:00 后发布的礼物推荐单率最高',
        '200 元以内的礼物更复购单义'
      ],
      next_suggestions: [
        '增加观察期，同宣传色的礼物推荐',
        '继续提高分享图文案流畅度',
        '精确时间：20:00 - 22:00'
      ]
    };
    return okResult(r);
  },

  async nextPlan(_userId: string): Promise<ProviderCallResult<PlanItem[]>> {
    await simulate();
    const plan: PlanItem[] = [
      { id: 'p1', week_date: '5/12', scene: '送长辈健康礼物', relation: '母亲节', budget_text: '¥200R', suggested_time: '21:00', status: 'PLANNED' },
      { id: 'p2', week_date: '5/14', scene: '女生生日礼物', relation: '闺蜜', budget_text: '¥200-300', suggested_time: '20:30', status: 'PLANNED' },
      { id: 'p3', week_date: '5/16', scene: '送同学度重礼物', relation: '同学', budget_text: '¥100-200', suggested_time: '20:00', status: 'PLANNED' },
      { id: 'p4', week_date: '5/18', scene: '送同事升职礼物', relation: '同事', budget_text: '¥200-400', suggested_time: '20:30', status: 'PLANNED' }
    ];
    return okResult(plan);
  }
};

function pickGifts(q: GiftQuery): Gift[] {
  const all = gifts as Gift[];
  const lower = q.budget_fen;
  const upper = q.budget_fen * 1.8;
  const byRelation = all.filter((g) => g.relation_tags.includes(q.relation) || g.relation_tags.includes('同事'));
  const byBudget = byRelation.filter((g) => g.price_fen >= lower * 0.4 && g.price_fen <= upper);
  const pool = byBudget.length > 0 ? byBudget : byRelation.length > 0 ? byRelation : all;
  // 取前 3，按匹配度排序
  return [...pool]
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);
}
