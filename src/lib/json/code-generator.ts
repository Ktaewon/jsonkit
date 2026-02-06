import {
    quicktype,
    InputData,
    jsonInputForTargetLanguage,
    JSONSchemaInput,
    FetchingJSONSchemaStore,
} from 'quicktype-core';

export type SupportedLanguage = 'typescript' | 'go' | 'python' | 'csharp' | 'rust' | 'swift' | 'java' | 'cpp';

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
        rendererOptions: {
            'just-types': 'true', // For TypeScript, mainly generate interfaces
        },
    });

    return result.lines.join('\n');
}
