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

export type ConversionPair =
  | 'json-to-yaml'
  | 'yaml-to-json'
  | 'json-to-xml'
  | 'xml-to-json'
  | 'json-to-csv'
  | 'csv-to-json';

export const CONVERSION_PAIRS: {
  value: ConversionPair;
  format: ConversionFormat;
  direction: ConversionDirection;
}[] = [
  { value: 'json-to-yaml', format: 'yaml', direction: 'json-to-format' },
  { value: 'yaml-to-json', format: 'yaml', direction: 'format-to-json' },
  { value: 'json-to-xml', format: 'xml', direction: 'json-to-format' },
  { value: 'xml-to-json', format: 'xml', direction: 'format-to-json' },
  { value: 'json-to-csv', format: 'csv', direction: 'json-to-format' },
  { value: 'csv-to-json', format: 'csv', direction: 'format-to-json' },
];

export function isConversionPair(value: string): value is ConversionPair {
  return CONVERSION_PAIRS.some((pair) => pair.value === value);
}

export function getConversionPair(format: ConversionFormat, direction: ConversionDirection) {
  return direction === 'json-to-format'
    ? (`json-to-${format}` as ConversionPair)
    : (`${format}-to-json` as ConversionPair);
}

export function parseConversionPair(pair: ConversionPair) {
  const { format, direction } = CONVERSION_PAIRS.find(({ value }) => value === pair)!;
  return { format, direction };
}

/** Display names for a pair's source and target, e.g. { from: 'JSON', to: 'YAML' }. */
export function getPairLabels(pair: ConversionPair) {
  const { format, direction } = parseConversionPair(pair);
  const label = format.toUpperCase();
  return direction === 'json-to-format' ? { from: 'JSON', to: label } : { from: label, to: 'JSON' };
}

/**
 * Sample input shown on each /convert/<pair> landing page. The output is produced
 * from it at build time, so the snippet always matches what the tool converts.
 */
export const CONVERSION_EXAMPLES: Record<ConversionPair, string> = {
  'json-to-yaml':
    '{\n  "service": "api",\n  "port": 8080,\n  "debug": false,\n  "allowedOrigins": ["https://example.com", "https://app.example.com"],\n  "database": { "host": "localhost", "pool": 10 }\n}',
  'yaml-to-json':
    'name: deploy\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test\n',
  'json-to-xml':
    '{\n  "order": {\n    "_attributes": { "id": "1042" },\n    "customer": "Ada Lovelace",\n    "item": [\n      { "sku": "BK-01", "qty": 2 },\n      { "sku": "PN-07", "qty": 1 }\n    ]\n  }\n}',
  'xml-to-json':
    '<?xml version="1.0" encoding="UTF-8"?>\n<catalog>\n  <book id="bk101">\n    <title>XML Developer\'s Guide</title>\n    <price>44.95</price>\n  </book>\n  <book id="bk102">\n    <title>Midnight Rain</title>\n    <price>5.95</price>\n  </book>\n</catalog>',
  'json-to-csv':
    '[\n  { "id": 1, "name": "Alice", "email": "alice@example.com", "active": true },\n  { "id": 2, "name": "Bob", "email": "bob@example.com", "active": false },\n  { "id": 3, "name": "Carol", "email": "carol@example.com", "active": true }\n]',
  'csv-to-json':
    'id,product,price,in_stock\n1,Keyboard,49.99,yes\n2,Mouse,19.99,no\n3,"Monitor, 27""",229.00,yes\n',
};
