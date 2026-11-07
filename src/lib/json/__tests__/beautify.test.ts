import { describe, it, expect } from 'vitest';
import { formatJson, getJsonErrorLocation, minifyAndEscapeJson, minifyJson } from '../beautify';

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

describe('formatJson 옵션', () => {
  it('탭 들여쓰기를 지원해야 함', () => {
    expect(formatJson('{"a":1}', 'tab').result).toBe('{\n\t"a": 1\n}');
  });

  it('키를 모든 깊이에서 정렬하고 배열 순서는 유지해야 함', () => {
    const result = formatJson('{"b":1,"a":{"d":[{"z":1,"y":2}],"c":2}}', 2, { sortKeys: true });
    expect(JSON.parse(result.result)).toEqual({ a: { c: 2, d: [{ y: 2, z: 1 }] }, b: 1 });
    expect(result.result.indexOf('"a"')).toBeLessThan(result.result.indexOf('"b"'));
    expect(result.result.indexOf('"y"')).toBeLessThan(result.result.indexOf('"z"'));
  });

  it('압축할 때도 키를 정렬할 수 있어야 함', () => {
    expect(minifyJson('{"b":1,"a":2}', { sortKeys: true }).result).toBe('{"a":2,"b":1}');
  });
});

describe('minifyAndEscapeJson', () => {
  it('압축한 JSON을 이스케이프된 문자열로 감싸야 함', () => {
    expect(minifyAndEscapeJson('{ "a": "x" }').result).toBe('"{\\"a\\":\\"x\\"}"');
  });

  it('잘못된 JSON이면 실패해야 함', () => {
    expect(minifyAndEscapeJson('{a}').success).toBe(false);
  });
});

describe('getJsonErrorLocation', () => {
  it('줄/열이 있는 메시지를 해석해야 함', () => {
    const msg = "Expected ',' or '}' after property value in JSON at position 12 (line 2 column 3)";
    expect(getJsonErrorLocation('', msg)).toEqual({ line: 2, column: 3 });
  });

  it('위치만 있는 메시지는 입력에서 줄/열을 계산해야 함', () => {
    const input = '{\n  "a": 1,\n}';
    expect(getJsonErrorLocation(input, 'Unexpected token } in JSON at position 12')).toEqual({
      line: 3,
      column: 1,
    });
  });

  it('실제 JSON.parse 오류에서 위치를 찾아야 함', () => {
    const input = '{\n  "a": 1,\n}';
    try {
      JSON.parse(input);
    } catch (e) {
      const loc = getJsonErrorLocation(input, (e as Error).message);
      expect(loc?.line).toBe(3);
    }
  });

  it('위치 정보가 없으면 null이어야 함', () => {
    expect(getJsonErrorLocation('x', 'Unexpected end of JSON input')).toBeNull();
  });
});
