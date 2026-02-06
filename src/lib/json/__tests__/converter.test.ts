import { describe, it, expect } from 'vitest';
import {
  jsonToYaml,
  yamlToJson,
  jsonToXml,
  xmlToJson,
  jsonToCsv,
  csvToJson,
  convert,
} from '../converter';

describe('JSON to YAML', () => {
  it('간단한 객체를 YAML로 변환해야 함', () => {
    const result = jsonToYaml('{"name": "test", "value": 123}');
    expect(result.success).toBe(true);
    expect(result.result).toContain('name: test');
    expect(result.result).toContain('value: 123');
  });

  it('배열을 YAML로 변환해야 함', () => {
    const result = jsonToYaml('[1, 2, 3]');
    expect(result.success).toBe(true);
    expect(result.result).toContain('- 1');
  });

  it('유효하지 않은 JSON에 대해 에러를 반환해야 함', () => {
    const result = jsonToYaml('{invalid}');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('YAML to JSON', () => {
  it('간단한 YAML을 JSON으로 변환해야 함', () => {
    const yaml = `name: test
value: 123`;
    const result = yamlToJson(yaml);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.result);
    expect(parsed.name).toBe('test');
    expect(parsed.value).toBe(123);
  });

  it('YAML 배열을 JSON으로 변환해야 함', () => {
    const yaml = `- 1
- 2
- 3`;
    const result = yamlToJson(yaml);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.result);
    expect(parsed).toEqual([1, 2, 3]);
  });
});

describe('JSON to XML', () => {
  it('간단한 객체를 XML로 변환해야 함', () => {
    const result = jsonToXml('{"root": {"name": "test"}}');
    expect(result.success).toBe(true);
    expect(result.result).toContain('<name>');
    expect(result.result).toContain('test');
  });

  it('유효하지 않은 JSON에 대해 에러를 반환해야 함', () => {
    const result = jsonToXml('{invalid}');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('XML to JSON', () => {
  it('간단한 XML을 JSON으로 변환해야 함', () => {
    const xml = '<root><name>test</name></root>';
    const result = xmlToJson(xml);
    expect(result.success).toBe(true);
    expect(result.result).toContain('root');
    expect(result.result).toContain('name');
  });
});

describe('JSON to CSV', () => {
  it('객체 배열을 CSV로 변환해야 함', () => {
    const result = jsonToCsv('[{"name": "a", "value": 1}, {"name": "b", "value": 2}]');
    expect(result.success).toBe(true);
    expect(result.result).toContain('name');
    expect(result.result).toContain('value');
  });

  it('단일 객체를 CSV로 변환해야 함', () => {
    const result = jsonToCsv('{"name": "test", "value": 123}');
    expect(result.success).toBe(true);
    expect(result.result).toContain('name');
  });

  it('유효하지 않은 JSON에 대해 에러를 반환해야 함', () => {
    const result = jsonToCsv('{invalid}');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('CSV to JSON', () => {
  it('CSV를 JSON 배열로 변환해야 함', () => {
    const csv = `name,value
a,1
b,2`;
    const result = csvToJson(csv);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('a');
  });
});

describe('convert 함수', () => {
  it('빈 문자열을 처리해야 함', () => {
    const result = convert('', 'yaml', 'json-to-format');
    expect(result.success).toBe(true);
    expect(result.result).toBe('');
  });

  it('JSON을 YAML로 변환해야 함', () => {
    const result = convert('{"a": 1}', 'yaml', 'json-to-format');
    expect(result.success).toBe(true);
    expect(result.result).toContain('a: 1');
  });

  it('YAML을 JSON으로 변환해야 함', () => {
    const result = convert('a: 1', 'yaml', 'format-to-json');
    expect(result.success).toBe(true);
    expect(result.result).toContain('"a"');
  });

  it('JSON을 XML로 변환해야 함', () => {
    const result = convert('{"root": "value"}', 'xml', 'json-to-format');
    expect(result.success).toBe(true);
  });

  it('XML을 JSON으로 변환해야 함', () => {
    const result = convert('<root>value</root>', 'xml', 'format-to-json');
    expect(result.success).toBe(true);
  });

  it('JSON을 CSV로 변환해야 함', () => {
    const result = convert('[{"a": 1}]', 'csv', 'json-to-format');
    expect(result.success).toBe(true);
  });

  it('CSV를 JSON으로 변환해야 함', () => {
    const result = convert('name,value\na,1', 'csv', 'format-to-json');
    expect(result.success).toBe(true);
  });
});
