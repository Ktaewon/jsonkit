'use server';

import { InputData, jsonInputForTargetLanguage, quicktype } from 'quicktype-core';
import type { GenerateCodeOptions, SupportedLanguage } from '@/lib/json/code-generator';

const SUPPORTED_LANGUAGE_SET: ReadonlySet<SupportedLanguage> = new Set([
  'typescript',
  'go',
  'python',
  'csharp',
  'rust',
  'swift',
  'java',
  'cpp',
  'kotlin',
]);

export async function generateCode(
  jsonString: string,
  options: GenerateCodeOptions
): Promise<string> {
  const language = options.language;
  const typeName = options.typeName?.trim() || 'Root';

  if (!SUPPORTED_LANGUAGE_SET.has(language)) {
    throw new Error('Unsupported language');
  }

  const jsonInput = jsonInputForTargetLanguage(language);
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const result = await quicktype({
    inputData,
    lang: language,
    rendererOptions:
      language === 'typescript'
        ? {
            'just-types': 'true',
          }
        : undefined,
  });

  return result.lines.join('\n');
}
