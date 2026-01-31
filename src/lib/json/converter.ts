import yaml from 'js-yaml';
import { js2xml, xml2js } from 'xml-js';
import { Parser } from 'json2csv';
import Papa from 'papaparse';

export type ConversionFormat = 'yaml' | 'xml' | 'csv';
export type ConversionDirection = 'json-to-format' | 'format-to-json';

export interface ConversionResult {
  success: boolean;
  result: string;
  error?: string;
}

// JSON -> Format
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
    const result = js2xml(obj, { compact: true, spaces: 2 });
    return { success: true, result };
  } catch (e) {
    return { success: false, result: '', error: (e as Error).message };
  }
}

export function jsonToCsv(jsonStr: string): ConversionResult {
  try {
    const obj = JSON.parse(jsonStr);
    const data = Array.isArray(obj) ? obj : [obj];

    const parser = new Parser();
    const result = parser.parse(data);
    return { success: true, result };
  } catch (e) {
    return { success: false, result: '', error: (e as Error).message };
  }
}

// Format -> JSON
export function yamlToJson(yamlStr: string): ConversionResult {
  try {
    const obj = yaml.load(yamlStr);
    return { success: true, result: JSON.stringify(obj, null, 2) };
  } catch (e) {
    return { success: false, result: '', error: (e as Error).message };
  }
}

export function xmlToJson(xmlStr: string): ConversionResult {
  try {
    const obj = xml2js(xmlStr, { compact: true });
    return { success: true, result: JSON.stringify(obj, null, 2) };
  } catch (e) {
    return { success: false, result: '', error: (e as Error).message };
  }
}

export function csvToJson(csvStr: string): ConversionResult {
  try {
    const result = Papa.parse(csvStr, { header: true, skipEmptyLines: true });
    if (result.errors && result.errors.length > 0) {
      return { success: false, result: '', error: result.errors[0].message };
    }
    return { success: true, result: JSON.stringify(result.data, null, 2) };
  } catch (e) {
    return { success: false, result: '', error: (e as Error).message };
  }
}

export function convert(
  content: string,
  format: ConversionFormat,
  direction: ConversionDirection
): ConversionResult {
  if (!content.trim()) return { success: true, result: '' };

  if (direction === 'json-to-format') {
    switch (format) {
      case 'yaml':
        return jsonToYaml(content);
      case 'xml':
        return jsonToXml(content);
      case 'csv':
        return jsonToCsv(content);
    }
  } else {
    switch (format) {
      case 'yaml':
        return yamlToJson(content);
      case 'xml':
        return xmlToJson(content);
      case 'csv':
        return csvToJson(content);
    }
  }
  return { success: false, result: '', error: 'Unsupported format or direction' };
}
