import { describe, it, expect } from 'vitest';
import { generateCode } from '@/lib/json/quicktype';
import { LANGUAGE_EXAMPLES, SUPPORTED_LANGUAGES } from '@/lib/json/code-generator';
import type { SupportedLanguage } from '@/lib/json/code-generator';

describe('generateCode (quicktype)', () => {
  it.each(SUPPORTED_LANGUAGES.map(({ value }) => value))(
    'generates code containing the type name for %s',
    async (language) => {
      const { json, typeName } = LANGUAGE_EXAMPLES[language];
      const code = await generateCode(json, { language, typeName });
      expect(code).toContain(typeName);
    }
  );

  it('emits plain TypeScript interfaces without runtime converters', async () => {
    const code = await generateCode('{"id":1,"name":"x"}', { language: 'typescript' });
    expect(code).toContain('export interface Root');
    expect(code).not.toContain('class Convert');
  });

  it('falls back to Root for a blank type name', async () => {
    const code = await generateCode('{"a":1}', { language: 'go', typeName: '   ' });
    expect(code).toContain('type Root struct');
  });

  it('rejects unsupported languages', async () => {
    await expect(generateCode('{}', { language: 'cobol' as SupportedLanguage })).rejects.toThrow(
      'Unsupported language'
    );
  });
});
