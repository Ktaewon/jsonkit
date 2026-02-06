export interface FormatResult {
  success: boolean;
  result: string;
  error?: string;
}

export function formatJson(input: string, spaces: number = 2): FormatResult {
  if (!input.trim()) {
    return { success: true, result: '' };
  }
  try {
    const parsed = JSON.parse(input);
    return {
      success: true,
      result: JSON.stringify(parsed, null, spaces),
    };
  } catch (e) {
    return {
      success: false,
      result: input,
      error: (e as Error).message,
    };
  }
}

export function minifyJson(input: string): FormatResult {
  if (!input.trim()) {
    return { success: true, result: '' };
  }
  try {
    const parsed = JSON.parse(input);
    return {
      success: true,
      result: JSON.stringify(parsed),
    };
  } catch (e) {
    return {
      success: false,
      result: input,
      error: (e as Error).message,
    };
  }
}
