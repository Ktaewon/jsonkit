import { describe, it, expect, vi, afterEach } from 'vitest';
import { getSizeBucket, trackEvent } from '../analytics';

describe('getSizeBucket', () => {
  it('입력 길이를 대략적인 구간으로만 변환해야 함', () => {
    expect(getSizeBucket('')).toBe('empty');
    expect(getSizeBucket(undefined)).toBe('empty');
    expect(getSizeBucket('{}')).toBe('lt_1kb');
    expect(getSizeBucket('a'.repeat(1_000))).toBe('1_10kb');
    expect(getSizeBucket('a'.repeat(10_000))).toBe('10_100kb');
    expect(getSizeBucket('a'.repeat(100_000))).toBe('100kb_1mb');
    expect(getSizeBucket('a'.repeat(1_000_000))).toBe('gt_1mb');
  });
});

describe('trackEvent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('window가 없으면 아무것도 하지 않아야 함', () => {
    expect(() => trackEvent('tool_use', { tool: 'beautify', action: 'format' })).not.toThrow();
  });

  it('gtag가 로드되지 않았으면 아무것도 하지 않아야 함', () => {
    vi.stubGlobal('window', {});
    expect(() => trackEvent('tool_use', { tool: 'beautify', action: 'format' })).not.toThrow();
  });

  it('gtag가 있으면 이벤트를 전달해야 함', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    trackEvent('tool_use', { tool: 'convert', action: 'convert', from_format: 'json' });
    expect(gtag).toHaveBeenCalledWith('event', 'tool_use', {
      tool: 'convert',
      action: 'convert',
      from_format: 'json',
    });
  });

  it('gtag가 예외를 던져도 전파하지 않아야 함', () => {
    vi.stubGlobal('window', {
      gtag: () => {
        throw new Error('blocked');
      },
    });
    expect(() => trackEvent('tool_use', { tool: 'query', action: 'execute' })).not.toThrow();
  });
});
