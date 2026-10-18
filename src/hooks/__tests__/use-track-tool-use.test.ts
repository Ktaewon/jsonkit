import { describe, it, expect, afterEach } from 'vitest';
import { clearToolSwitch, isToolSwitch, markToolSwitch } from '../use-track-tool-use';

describe('tool switch markers', () => {
  afterEach(() => {
    clearToolSwitch('convert:yaml-to-json');
  });

  it('표시하지 않은 전환은 사용자 전환으로 보지 않아야 함', () => {
    expect(isToolSwitch('convert:yaml-to-json')).toBe(false);
  });

  it('표시한 전환은 짧은 시간 안에만 인정해야 함', () => {
    markToolSwitch('convert:yaml-to-json', 1_000);
    expect(isToolSwitch('convert:yaml-to-json', 2_000)).toBe(true);
    expect(isToolSwitch('convert:json-to-yaml', 2_000)).toBe(false);
    expect(isToolSwitch('convert:yaml-to-json', 7_000)).toBe(false);
  });

  it('소비한 전환은 다시 인정하지 않아야 함', () => {
    markToolSwitch('convert:yaml-to-json');
    clearToolSwitch('convert:yaml-to-json');
    expect(isToolSwitch('convert:yaml-to-json')).toBe(false);
  });
});
