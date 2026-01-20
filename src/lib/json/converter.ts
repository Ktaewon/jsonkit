import yaml from 'js-yaml';
import { js2xml } from 'xml-js';
import { Parser } from 'json2csv';

export type ConversionFormat = 'yaml' | 'xml' | 'csv';

export interface ConversionResult {
    success: boolean;
    result: string;
    error?: string;
}

export function jsonToYaml(jsonStr: string): ConversionResult {
    try {
        const obj = JSON.parse(jsonStr);
        const result = yaml.dump(obj);
        return { success: true, result };
    } catch (e) {
        return { success: false, result: '', error: (e as Error).message };
    }
}

export function jsonToXml(jsonStr: string): ConversionResult {
    try {
        const obj = JSON.parse(jsonStr);
        // xml-js expects an object wrapping the content if it's not a single root element?
        // Let's assume standard behavior: we wrap in <root> if it's an array or complex object if needed,
        // but js2xml usually handles it. strict mode might complain about multiple roots.
        // Let's wrap in a root object for safety if it's not already wrapped or if it's an array.

        // Simple approach:
        const result = js2xml(obj, { compact: true, spaces: 2 });
        return { success: true, result };
    } catch (e) {
        return { success: false, result: '', error: (e as Error).message };
    }
}

export function jsonToCsv(jsonStr: string): ConversionResult {
    try {
        const obj = JSON.parse(jsonStr);
        // json2csv expects an array of objects usually.
        // If it's a single object, we can wrap it.
        const data = Array.isArray(obj) ? obj : [obj];

        const parser = new Parser();
        const result = parser.parse(data);
        return { success: true, result };
    } catch (e) {
        return { success: false, result: '', error: (e as Error).message };
    }
}

export function convertJson(jsonStr: string, format: ConversionFormat): ConversionResult {
    if (!jsonStr.trim()) return { success: true, result: '' };

    switch (format) {
        case 'yaml': return jsonToYaml(jsonStr);
        case 'xml': return jsonToXml(jsonStr);
        case 'csv': return jsonToCsv(jsonStr);
        default: return { success: false, result: '', error: 'Unsupported format' };
    }
}
