import { okResult, errResult, getCurrentIdentity, tokensFor, recordUsageEvent, getRecentUsageEvents } from '../../src/platform/adapter';

describe('platform/adapter (V1.0 + 阶段二)', () => {
  test('okResult wraps data + traceId', () => {
    const r = okResult({ x: 1 });
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ x: 1 });
    expect(typeof r.traceId).toBe('string');
    expect(r.traceId.length).toBeGreaterThan(0);
    expect(r.error).toBeNull();
  });

  test('errResult returns error envelope', () => {
    const r = errResult('TEST_FAIL', 'boom');
    expect(r.ok).toBe(false);
    expect(r.data).toBeNull();
    expect(r.error?.code).toBe('TEST_FAIL');
    expect(r.error?.message).toBe('boom');
  });

  test('getCurrentIdentity returns valid UserIdentity', () => {
    const id = getCurrentIdentity();
    expect(typeof id.userId).toBe('string');
    expect(typeof id.organizationId).toBe('string');
    expect(['founder', 'operator', 'viewer']).toContain(id.role);
    expect(id.deviceId.length).toBeGreaterThan(0);
  });

  test('tokensFor returns positive integer', () => {
    const t = tokensFor('hello world');
    expect(typeof t).toBe('number');
    expect(t).toBeGreaterThan(0);
  });

  test('recordUsageEvent appends to ring buffer', () => {
    const before = getRecentUsageEvents().length;
    recordUsageEvent({ metric: 'AI_REQUEST_COUNT', quantity: 1 });
    const after = getRecentUsageEvents().length;
    expect(after).toBe(before + 1);
  });
});
