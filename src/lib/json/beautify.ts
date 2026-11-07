export interface FormatResult {
  success: boolean;
  result: string;
  error?: string;
}

/** Indentation for formatted output: a number of spaces, or 'tab'. */
export type IndentOption = 2 | 4 | 'tab';

export const INDENT_OPTIONS: readonly IndentOption[] = [2, 4, 'tab'];

export interface FormatOptions {
  /** Sort object keys alphabetically at every depth (array order is kept). */
  sortKeys?: boolean;
}

/** Recursively sorts object keys; arrays keep their order but their items are sorted too. */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

function toSpace(indent: IndentOption | number): string | number {
  return indent === 'tab' ? '\t' : indent;
}

export function formatJson(
  input: string,
  indent: IndentOption | number = 2,
  options: FormatOptions = {}
): FormatResult {
  if (!input.trim()) {
    return { success: true, result: '' };
  }
  try {
    const parsed = JSON.parse(input);
    const value = options.sortKeys ? sortKeysDeep(parsed) : parsed;
    return {
      success: true,
      result: JSON.stringify(value, null, toSpace(indent)),
    };
  } catch (e) {
    return {
      success: false,
      result: input,
      error: (e as Error).message,
    };
  }
}

export function minifyJson(input: string, options: FormatOptions = {}): FormatResult {
  if (!input.trim()) {
    return { success: true, result: '' };
  }
  try {
    const parsed = JSON.parse(input);
    const value = options.sortKeys ? sortKeysDeep(parsed) : parsed;
    return {
      success: true,
      result: JSON.stringify(value),
    };
  } catch (e) {
    return {
      success: false,
      result: input,
      error: (e as Error).message,
    };
  }
}

/**
 * Minifies JSON and wraps it as an escaped string literal ("压缩转义"), e.g. for pasting
 * into code, a config value or a request body field.
 */
export function minifyAndEscapeJson(input: string): FormatResult {
  const minified = minifyJson(input);
  if (!minified.success) return minified;
  return { success: true, result: minified.result ? JSON.stringify(minified.result) : '' };
}

export interface ErrorLocation {
  line: number;
  column: number;
}

/**
 * Finds where a JSON.parse error happened, from the engine's message: Chrome/Node
 * ("... at position 25 (line 3 column 5)"), older V8 ("... at position 25") and Firefox
 * ("... at line 3 column 5 of the JSON data"). Returns null when there's no position.
 */
export function getJsonErrorLocation(input: string, message: string): ErrorLocation | null {
  const lineColumn = message.match(/line (\d+) column (\d+)/);
  if (lineColumn) {
    return { line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  }
  const position = message.match(/position (\d+)/);
  if (!position) return null;
  const offset = Math.min(Number(position[1]), input.length);
  const before = input.slice(0, offset);
  const line = before.split('\n').length;
  const column = offset - before.lastIndexOf('\n');
  return { line, column };
}
