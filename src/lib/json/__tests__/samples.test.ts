import { describe, it, expect } from 'vitest';
import {
  BEAUTIFY_SAMPLE,
  VALIDATE_SAMPLE,
  ESCAPE_SAMPLE,
  REPAIR_SAMPLE,
  QUERY_SAMPLE,
  QUERY_SAMPLE_PATH,
  SCHEMA_SAMPLE_DATA,
  SCHEMA_SAMPLE_SCHEMA,
} from '../samples';
import { repairJson } from '../repair';
import { queryJson } from '../query';
import { escapeJson, unescapeJson } from '../escape';
import { validateJson } from '../validate';
import { validateJsonSchema } from '../schema';

describe('tool samples', () => {
  it('beautify sample is valid, minified JSON', () => {
    expect(() => JSON.parse(BEAUTIFY_SAMPLE)).not.toThrow();
    expect(BEAUTIFY_SAMPLE).not.toContain('\n');
  });

  it('validate sample passes the validator and query sample is valid JSON', () => {
    expect(validateJson(VALIDATE_SAMPLE).isValid).toBe(true);
    expect(() => JSON.parse(QUERY_SAMPLE)).not.toThrow();
  });

  it('schema sample data is valid against the sample schema', () => {
    expect(validateJsonSchema(SCHEMA_SAMPLE_DATA, SCHEMA_SAMPLE_SCHEMA).isValid).toBe(true);
  });

  it('escape sample needs escaping and round-trips through unescape', () => {
    const escaped = escapeJson(ESCAPE_SAMPLE);
    expect(escaped.success).toBe(true);
    expect(escaped.result).not.toBe(ESCAPE_SAMPLE);
    const unescaped = unescapeJson(escaped.result);
    expect(unescaped.success).toBe(true);
    expect(JSON.parse(unescaped.result)).toEqual(JSON.parse(ESCAPE_SAMPLE));
  });

  it('repair sample is broken but repairable', () => {
    expect(() => JSON.parse(REPAIR_SAMPLE)).toThrow();
    const result = repairJson(REPAIR_SAMPLE);
    expect(result.success).toBe(true);
    expect(result.wasRepaired).toBe(true);
    expect(JSON.parse(result.result)).toMatchObject({ name: 'JSONKit', enabled: true });
  });

  it('default query path matches every author in the query sample', () => {
    const result = queryJson(QUERY_SAMPLE, QUERY_SAMPLE_PATH);
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);
  });
});
