import { describe, it, expect } from 'vitest';
import { resolveDonationUrl, sanitizeDonationUrl } from '../donation';

const GLOBAL = 'https://buymeacoffee.com/jsonkit';
const ZH = 'https://afdian.com/a/jsonkit';

describe('sanitizeDonationUrl', () => {
  it('https URL만 허용해야 함', () => {
    expect(sanitizeDonationUrl(GLOBAL)).toBe(GLOBAL);
    expect(sanitizeDonationUrl(`  ${GLOBAL}  `)).toBe(GLOBAL);
  });

  it('비어 있거나 잘못된 값은 빈 문자열을 반환해야 함', () => {
    expect(sanitizeDonationUrl(undefined)).toBe('');
    expect(sanitizeDonationUrl(null)).toBe('');
    expect(sanitizeDonationUrl('   ')).toBe('');
    expect(sanitizeDonationUrl('not a url')).toBe('');
    expect(sanitizeDonationUrl('http://example.com')).toBe('');
    expect(sanitizeDonationUrl('javascript:alert(1)')).toBe('');
  });
});

describe('resolveDonationUrl', () => {
  it('zh 로케일은 zh 링크를 우선해야 함', () => {
    expect(resolveDonationUrl('zh', { global: GLOBAL, zh: ZH })).toBe(ZH);
  });

  it('zh 링크가 없으면 zh 로케일도 글로벌 링크로 대체해야 함', () => {
    expect(resolveDonationUrl('zh', { global: GLOBAL })).toBe(GLOBAL);
    expect(resolveDonationUrl('zh', { global: GLOBAL, zh: 'bad' })).toBe(GLOBAL);
  });

  it('다른 로케일은 글로벌 링크만 사용해야 함', () => {
    expect(resolveDonationUrl('en', { global: GLOBAL, zh: ZH })).toBe(GLOBAL);
    expect(resolveDonationUrl('ko', { zh: ZH })).toBe('');
  });

  it('아무 것도 설정되지 않으면 빈 문자열을 반환해야 함', () => {
    expect(resolveDonationUrl('en', {})).toBe('');
    expect(resolveDonationUrl('zh', {})).toBe('');
  });
});
