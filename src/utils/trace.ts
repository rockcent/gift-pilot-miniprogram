/* ai-gateway trace 包装（MVP mock） */
import type { ProviderCallResult } from '../types';
import { traceId } from './id';

export function okResult<T>(data: T, usage?: { prompt_tokens: number; completion_tokens: number }): ProviderCallResult<T> {
  return {
    ok: true,
    data,
    error: null,
    usage,
    trace_id: traceId()
  };
}

export function errResult<T = null>(code: string, message: string): ProviderCallResult<T> {
  return {
    ok: false,
    data: null,
    error: { code, message },
    trace_id: traceId()
  };
}
