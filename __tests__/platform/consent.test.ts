/* mp H5 consent service 单测 */
import {
  acceptConsent,
  hasConsented,
  loadConsent,
  withdrawConsent,
  exportAllData,
  CONSENT_KEY,
  CONSENT_VERSION
} from '../../src/platform/consent';
import { persistLocal } from '../../src/platform/adapter';

describe('platform/consent (mp H5)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.clear(); } catch { /* noop */ }
    }
  });

  test('hasConsented: false initially', () => {
    expect(hasConsented()).toBe(false);
    expect(loadConsent()).toBeNull();
  });

  test('acceptConsent: necessary=true, version 一致', () => {
    const rec = acceptConsent({
      choices: { necessary: true, analytics: true, marketing: false },
      source: 'banner'
    });
    expect(rec.version).toBe(CONSENT_VERSION);
    expect(rec.choices.necessary).toBe(true);
    expect(rec.choices.analytics).toBe(true);
    expect(rec.choices.marketing).toBe(false);
    expect(rec.source).toBe('banner');
    expect(rec.deviceId).toBeTruthy();
    expect(hasConsented()).toBe(true);
  });

  test('withdrawConsent: clears key', () => {
    acceptConsent({
      choices: { necessary: true, analytics: false, marketing: false },
      source: 'banner'
    });
    withdrawConsent();
    expect(hasConsented()).toBe(false);
  });

  test('exportAllData: 包含 memory + styleProfile + consent + device', () => {
    acceptConsent({
      choices: { necessary: true, analytics: false, marketing: false },
      source: 'settings'
    });
    persistLocal('memory', { primary_relations: ['mp_test'] });
    persistLocal('style-profile', { totalEdits: 5 });

    const data = exportAllData();
    expect(data.exportVersion).toBe('1.0.0');
    expect(data.source).toBe('mp_h5');
    expect(data.consent).not.toBeNull();
    expect(data.memory).toEqual({ primary_relations: ['mp_test'] });
    expect(data.styleProfile).toEqual({ totalEdits: 5 });
    expect(data.device.deviceId).toBeTruthy();
  });
});
