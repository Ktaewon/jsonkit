import { InputData, jsonInputForTargetLanguage, quicktype } from 'quicktype-core';
import { isSupportedLanguage, type GenerateCodeOptions } from './code-generator';

/**
 * Generates type definitions from a JSON sample with quicktype.
 *
 * Runs in two places and never on the server at request time:
 * - in the browser, lazily imported by JsonToCodeTool (`await import(...)`) so the
 *   quicktype bundle is only downloaded when the tool is used;
 * - at build time, in the statically rendered LanguageExample.
 * Keeping it off the request path matters on Cloudflare Workers, where a request
 * gets 10 ms of CPU on the free plan (see DEPLOY_CLOUDFLARE.md).
 */
export async function generateCode(
  jsonString: string,
  options: GenerateCodeOptions
): Promise<string> {
  const { language } = options;
  const typeName = options.typeName?.trim() || 'Root';

  if (!isSupportedLanguage(language)) {
    throw new Error('Unsupported language');
  }

  const jsonInput = jsonInputForTargetLanguage(language);
  await jsonInput.addSource({ name: typeName, samples: [jsonString] });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const result = await quicktype({
    inputData,
    lang: language,
    rendererOptions: language === 'typescript' ? { 'just-types': 'true' } : undefined,
  });

  return result.lines.join('\n');
}
