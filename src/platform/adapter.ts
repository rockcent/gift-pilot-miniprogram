/* 礼有方小程序 · V1.0 + 阶段二 平台适配层 */
import {
  createAIGateway,
  createInMemoryTraceSink,
  type AiTraceEvent,
  type AiTraceSink
} from '@rockcent/platform/ai-gateway';
import {
  estimateTokens,
  type AIUsage
} from '@rockcent/platform/ai';
import {
  createTokenUsageFact,
  createInMemoryMeterSink,
  recordAIUsage,
  calculateTokenCost,
  type TokenUsageFact,
  type MeterEvent
} from '@rockcent/platform/ai-metering';
import {
  USER_STATUS,
  ORGANIZATION_STATUS,
  type UserStatus,
  type OrganizationStatus,
  type OrganizationType
} from '@rockcent/platform/identity';
import {
  USAGE_METRICS,
  type UsageMetric,
  type UsageEventInput
} from '@rockcent/platform/usage';
import {
  createStorage,
  safeJsonParse,
  getClientDeviceId,
  getClientDeviceLabel
} from '@rockcent/platform/web-client';

export interface ProviderCallResult<T> {
  ok: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  usage?: AIUsage;
  cost?: { amount: number; currency: string };
  traceId: string;
}

/* ---------- 1. AI Gateway ---------- */

const traceSink = createInMemoryTraceSink();

export const gateway = createAIGateway({
  providers: [],
  defaultProviderNames: ['mock-ark', 'mock-deepseek'],
  traceSink,
  metadata: { appId: 'gift_pilot_miniprogram', feature: 'gift_recommendation' }
});

export function recentTraceEvents(limit = 20): AiTraceEvent[] {
  const sink = traceSink as AiTraceSink & { events?: AiTraceEvent[] };
  if (!sink.events) return [];
  return sink.events.slice(-limit);
}

/* ---------- 2. AI Metering ---------- */

const meterSink = createInMemoryMeterSink();

export function recentMeterEvents(limit = 20): MeterEvent[] {
  return meterSink.events.slice(-limit);
}

export function recordTokenUsage(input: {
  provider: string;
  model: string;
  feature: string;
  usage: AIUsage;
  promptKey?: string;
}): TokenUsageFact {
  const fact = createTokenUsageFact({
    usage: input.usage,
    provider: input.provider,
    model: input.model,
    appId: 'gift_pilot_miniprogram',
    userId: getCurrentIdentity().userId,
    organizationId: getCurrentIdentity().organizationId,
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    traceId: `trace_${Date.now()}`,
    feature: input.feature,
    occurredAt: new Date().toISOString(),
    metadata: input.promptKey ? { promptKey: input.promptKey, source: 'mock' } : { source: 'mock' }
  });
  void recordAIUsage(fact, { sink: meterSink });
  return fact;
}

export function estimateCostUsd(usage: AIUsage, model = 'doubao-1-5-pro-32k-250115'): number {
  const cost = calculateTokenCost({
    usage,
    provider: 'mock',
    model,
    appId: 'gift_pilot_miniprogram',
    feature: 'gift_pilot_call'
  });
  // TokenCost 用 micros (1e-6 USD)；转 USD
  return (cost.inputCostMicros + cost.outputCostMicros + cost.cachedInputCostMicros) / 1_000_000;
}

/* ---------- 3. Identity ---------- */

export interface UserIdentity {
  userId: string;
  organizationId: string;
  organizationType: OrganizationType;
  organizationStatus: OrganizationStatus;
  userStatus: UserStatus;
  role: 'founder' | 'operator' | 'viewer';
  deviceId: string;
  deviceLabel: string;
}

let _identity: UserIdentity | null = null;
export function getCurrentIdentity(): UserIdentity {
  if (_identity) return _identity;
  _identity = {
    userId: 'u_local',
    organizationId: 'org_local',
    organizationType: 'INTERNAL' as OrganizationType,
    organizationStatus: ORGANIZATION_STATUS.ACTIVE,
    userStatus: USER_STATUS.ACTIVE,
    role: 'founder',
    deviceId: getClientDeviceId(),
    deviceLabel: getClientDeviceLabel()
  };
  return _identity;
}

/* ---------- 4. Usage Events ---------- */

const _usageEvents: UsageEventInput[] = [];
export function recordUsageEvent(input: {
  metric: keyof typeof USAGE_METRICS;
  quantity: number;
  unit?: string;
  metadata?: Record<string, unknown>;
}): UsageEventInput {
  const id = getCurrentIdentity();
  const ev: UsageEventInput = {
    metric: USAGE_METRICS[input.metric],
    quantity: input.quantity,
    unit: input.unit ?? 'count',
    occurredAt: new Date().toISOString(),
    organizationId: id.organizationId,
    userId: id.userId,
    applicationId: 'gift_pilot_miniprogram',
    source: 'gift-pilot-miniprogram',
    detail: input.metadata ?? {}
  };
  _usageEvents.push(ev);
  return ev;
}

export function getRecentUsageEvents(limit = 50): UsageEventInput[] {
  return _usageEvents.slice(-limit);
}

export function usageMetricName(m: UsageMetric): keyof typeof USAGE_METRICS {
  for (const k of Object.keys(USAGE_METRICS) as Array<keyof typeof USAGE_METRICS>) {
    if (USAGE_METRICS[k] === m) return k;
  }
  return 'AI_REQUEST_COUNT';
}

/* ---------- 5. Storage ---------- */

const storage = typeof window !== 'undefined' ? createStorage('gift_pilot:') : null;

export function persistLocal<T>(key: string, value: T): boolean {
  if (!storage) return false;
  try {
    storage.set(key, value);
    return true;
  } catch {
    return false;
  }
}

export function loadLocal<T>(key: string, fallback: T): T {
  if (!storage) return fallback;
  try {
    /* createStorage.get 内部已 safeJsonParse，无需 String()+二次 parse */
    const raw = storage.get<T | null>(key, null);
    return raw == null ? fallback : (raw as T);
  } catch {
    return fallback;
  }
}

/* ---------- 6. ProviderCallResult helper ---------- */

export function okResult<T>(data: T, usage?: AIUsage, cost?: number): ProviderCallResult<T> {
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  if (usage) {
    recordTokenUsage({
      provider: 'mock-ark',
      model: 'doubao-1-5-pro-32k-250115',
      feature: 'gift_pilot_call',
      usage
    });
  }
  return {
    ok: true,
    data,
    error: null,
    usage,
    cost: cost != null ? { amount: cost, currency: 'USD' } : undefined,
    traceId
  };
}

export function errResult<T>(code: string, message: string): ProviderCallResult<T> {
  return {
    ok: false,
    data: null,
    error: { code, message },
    traceId: `trace_err_${Date.now()}`
  };
}

/* ---------- 7. Token estimator ---------- */

export function tokensFor(text: string): number {
  return estimateTokens([{ role: 'user', content: text }]);
}
