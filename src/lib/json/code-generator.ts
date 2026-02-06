import {
    quicktype,
    InputData,
    jsonInputForTargetLanguage,
    JSONSchemaInput,
    FetchingJSONSchemaStore,
} from 'quicktype-core';

export type SupportedLanguage = 'typescript' | 'go' | 'python' | 'csharp' | 'rust' | 'swift' | 'java' | 'cpp';

export const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string }[] = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
    { value: 'python', label: 'Python' },
    { value: 'csharp', label: 'C#' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
];

export interface GenerateCodeOptions {
    language: SupportedLanguage;
    typeName?: string;
}

export async function generateCode(
    jsonString: string,
    options: GenerateCodeOptions
): Promise<string> {
    const { language, typeName = 'Root' } = options;

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
                    'just-types': 'true', // For TypeScript, mainly generate interfaces
                }
                : undefined,
    });

    return result.lines.join('\n');
}
