/* 礼有方小程序 H5 · 隐私同意管理服务
 *
 * 基于 PRD §5.3 + §11 R-02：
 *   - 与 web 端语义一致（同一份 CONSENT_VERSION）
 *   - 走 mp adapter 的 persistLocal/loadLocal/removeLocal
 *   - audit 通过 console.log 暂存（H5 无 admin 鉴权，阶段二接 server-side）
 */
import { persistLocal, loadLocal, removeLocal } from './adapter';
import { getClientDeviceId, getClientDeviceLabel } from '@rockcent/platform/web-client';

export const CONSENT_KEY = 'consent:v1';
export const CONSENT_VERSION = '1.0.0';

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface ConsentRecord {
  version: string;
  acceptedAt: number;
  deviceId: string;
  choices: Record<ConsentCategory, boolean>;
  source: 'banner' | 'settings';
}

const FALLBACK: ConsentRecord | null = null;

export function loadConsent(): ConsentRecord | null {
  return loadLocal<ConsentRecord | null>(CONSENT_KEY, FALLBACK);
}

export function hasConsented(): boolean {
  const c = loadConsent();
  if (!c) return false;
  return c.version === CONSENT_VERSION;
}

export function acceptConsent(input: { choices: Record<ConsentCategory, boolean>; source: 'banner' | 'settings' }): ConsentRecord {
  const deviceId = getClientDeviceId();
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    acceptedAt: Date.now(),
    deviceId,
    choices: { necessary: true, analytics: !!input.choices.analytics, marketing: !!input.choices.marketing },
    source: input.source
  };
  persistLocal(CONSENT_KEY, record);
  /* H5 暂用 console 留痕；阶段二接服务端 audit */
  // eslint-disable-next-line no-console
  console.info('[consent.accept]', { version: record.version, choices: record.choices, source: record.source });
  return record;
}

export function withdrawConsent(): void {
  const previous = loadConsent();
  removeLocal(CONSENT_KEY);
  // eslint-disable-next-line no-console
  console.info('[consent.withdraw]', { previousVersion: previous?.version });
}

export interface ExportedData {
  exportedAt: number;
  exportedAtIso: string;
  exportVersion: '1.0.0';
  dataSubject: string;
  consent: ConsentRecord | null;
  memory: unknown;
  styleProfile: unknown;
  device: { deviceId: string; deviceLabel: string };
  source: 'mp_h5';
}

export function exportAllData(): ExportedData {
  const memory = loadLocal('memory', null);
  const styleProfile = loadLocal('style-profile', null);
  const consent = loadConsent();
  const deviceId = getClientDeviceId();
  const deviceLabel = getClientDeviceLabel();
  return {
    exportedAt: Date.now(),
    exportedAtIso: new Date().toISOString(),
    exportVersion: '1.0.0',
    dataSubject: deviceId,
    consent,
    memory,
    styleProfile,
    device: { deviceId, deviceLabel },
    source: 'mp_h5'
  };
}
