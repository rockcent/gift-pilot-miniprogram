import { aiMock } from '../../src/services/ai/mock';

describe('services/ai/mock', () => {
  test('ask greeting when empty', async () => {
    const r = await aiMock.ask('');
    expect(r.ok).toBe(true);
    expect(r.data?.type).toBe('greeting');
  });

  test('ask recommend when query matches relation/budget', async () => {
    const r = await aiMock.ask('想送同事生日礼物 200 元');
    expect(r.ok).toBe(true);
    if (r.data?.type === 'recommend') {
      expect(r.data.recommendation.gifts.length).toBeGreaterThan(0);
      expect(r.data.recommendation.query.relation).toBe('同事');
      expect(r.data.recommendation.query.budget_fen).toBe(20000);
    } else {
      throw new Error('expected recommend');
    }
  });

  test('recommend enforces integer budget_fen', async () => {
    const r = await aiMock.recommend({
      relation: '长辈',
      budget_fen: 26800,
      scene: '母亲节',
      tone: 'warm',
      raw_query: ''
    });
    expect(r.ok).toBe(true);
    expect(Number.isInteger(r.data!.query.budget_fen)).toBe(true);
  });

  test('review returns highlights + suggestions', async () => {
    const r = await aiMock.review('u_local');
    expect(r.ok).toBe(true);
    expect(r.data!.highlights.length).toBeGreaterThan(0);
    expect(r.data!.next_suggestions.length).toBeGreaterThan(0);
    expect(Number.isInteger(r.data!.expected_commission_fen)).toBe(true);
  });
});
