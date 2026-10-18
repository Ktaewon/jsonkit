import { describe, it, expect } from 'vitest';
import {
  BEAUTIFY_SAMPLE,
  VALIDATE_SAMPLE,
  ESCAPE_SAMPLE,
  REPAIR_SAMPLE,
  QUERY_SAMPLE,
  QUERY_SAMPLE_PATH,
} from '../samples';
import { repairJson } from '../repair';
import { queryJson } from '../query';
import { escapeJson } from '../escape';

describe('tool samples', () => {
  it('beautify sample is valid, minified JSON', () => {
    expect(() => JSON.parse(BEAUTIFY_SAMPLE)).not.toThrow();
    expect(BEAUTIFY_SAMPLE).not.toContain('\n');
  });

  it('validate and query samples are valid JSON', () => {
    expect(() => JSON.parse(VALIDATE_SAMPLE)).not.toThrow();
    expect(() => JSON.parse(QUERY_SAMPLE)).not.toThrow();
  });

  it('escape sample contains characters that need escaping', () => {
    const result = escapeJson(ESCAPE_SAMPLE);
    expect(result.success).toBe(true);
    expect(result.result).toContain('\\"');
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
