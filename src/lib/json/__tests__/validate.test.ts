import { describe, it, expect } from 'vitest';
import { validateJson } from '../validate';

describe('validateJson', () => {
  it('빈 문자열은 유효함', () => {
    const result = validateJson('');
    expect(result.isValid).toBe(true);
  });

  it('공백만 있는 문자열은 유효함', () => {
    const result = validateJson('   ');
    expect(result.isValid).toBe(true);
  });

  it('유효한 JSON 객체를 검증해야 함', () => {
    const result = validateJson('{"name": "test"}');
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBeDefined();
  });

  it('유효한 JSON 배열을 검증해야 함', () => {
    const result = validateJson('[1, 2, 3]');
    expect(result.isValid).toBe(true);
  });

  it('유효한 프리미티브 값을 검증해야 함', () => {
    expect(validateJson('"string"').isValid).toBe(true);
    expect(validateJson('123').isValid).toBe(true);
    expect(validateJson('true').isValid).toBe(true);
    expect(validateJson('false').isValid).toBe(true);
    expect(validateJson('null').isValid).toBe(true);
  });

  it('유효하지 않은 JSON에 대해 에러를 반환해야 함', () => {
    const result = validateJson('{invalid}');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toBeDefined();
  });

  it('trailing comma에 대해 에러를 반환해야 함', () => {
    const result = validateJson('{"a": 1,}');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('작은따옴표에 대해 에러를 반환해야 함', () => {
    const result = validateJson("{'key': 'value'}");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('에러 메시지에서 줄 번호를 추출해야 함', () => {
    const multiLineInvalid = `{
  "valid": true,
  invalid
}`;
    const result = validateJson(multiLineInvalid);
    expect(result.isValid).toBe(false);
    expect(result.error?.line).toBeDefined();
  });
});
