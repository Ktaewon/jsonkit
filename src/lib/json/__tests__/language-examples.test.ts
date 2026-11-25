import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { generateCode } from '@/lib/json/quicktype';
import { LANGUAGE_EXAMPLES, SUPPORTED_LANGUAGES } from '@/lib/json/code-generator';
import committed from '@/lib/json/language-examples.generated.json';

// The /json-to-code/<language> pages show quicktype output for a sample JSON. It is
// precomputed into language-examples.generated.json so the server bundle (Cloudflare
// Workers, 3 MiB gzip limit on the free plan) does not have to include quicktype.
// This test fails when the committed output is stale, e.g. after a quicktype upgrade.
// Regenerate with: UPDATE_LANGUAGE_EXAMPLES=1 npx vitest run language-examples
describe('precomputed language examples', () => {
  it('match what quicktype generates', async () => {
    const fresh: Record<string, string> = {};
    for (const { value: language } of SUPPORTED_LANGUAGES) {
      const { json, typeName } = LANGUAGE_EXAMPLES[language];
      fresh[language] = await generateCode(json, { language, typeName });
    }

    if (process.env.UPDATE_LANGUAGE_EXAMPLES) {
      const file = join(process.cwd(), 'src/lib/json/language-examples.generated.json');
      writeFileSync(file, JSON.stringify(fresh, null, 2) + '\n');
      return;
    }

    expect(committed).toEqual(fresh);
  });
});
