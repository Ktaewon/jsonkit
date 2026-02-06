import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson } from '../beautify';

describe('formatJson', () => {
  it('빈 문자열을 처리해야 함', () => {
    const result = formatJson('');
    expect(result.success).toBe(true);
    expect(result.result).toBe('');
  });

  it('공백만 있는 문자열을 처리해야 함', () => {
    const result = formatJson('   ');
    expect(result.success).toBe(true);
    expect(result.result).toBe('');
  });

  it('유효한 JSON을 포맷해야 함', () => {
    const result = formatJson('{"name":"test","value":123}');
    expect(result.success).toBe(true);
    expect(result.result).toBe('{\n  "name": "test",\n  "value": 123\n}');
  });

  it('커스텀 스페이스로 포맷해야 함', () => {
    const result = formatJson('{"a":1}', 4);
    expect(result.success).toBe(true);
    expect(result.result).toBe('{\n    "a": 1\n}');
  });

  it('배열을 포맷해야 함', () => {
    const result = formatJson('[1,2,3]');
    expect(result.success).toBe(true);
    expect(result.result).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('중첩된 객체를 포맷해야 함', () => {
    const result = formatJson('{"outer":{"inner":"value"}}');
    expect(result.success).toBe(true);
    expect(result.result).toContain('"outer"');
    expect(result.result).toContain('"inner"');
  });

  it('유효하지 않은 JSON에 대해 에러를 반환해야 함', () => {
    const result = formatJson('{invalid}');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.result).toBe('{invalid}');
  });

  it('trailing comma가 있는 JSON에 대해 에러를 반환해야 함', () => {
    const result = formatJson('{"a":1,}');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('minifyJson', () => {
  it('빈 문자열을 처리해야 함', () => {
    const result = minifyJson('');
    expect(result.success).toBe(true);
    expect(result.result).toBe('');
  });

  it('포맷된 JSON을 압축해야 함', () => {
    const input = `{
  "name": "test",
  "value": 123
}`;
    const result = minifyJson(input);
    expect(result.success).toBe(true);
    expect(result.result).toBe('{"name":"test","value":123}');
  });

  it('배열을 압축해야 함', () => {
    const input = `[
  1,
  2,
  3
]`;
    const result = minifyJson(input);
    expect(result.success).toBe(true);
    expect(result.result).toBe('[1,2,3]');
  });

  it('유효하지 않은 JSON에 대해 에러를 반환해야 함', () => {
    const result = minifyJson('not valid json');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
