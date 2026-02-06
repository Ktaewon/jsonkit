import { jsonrepair } from 'jsonrepair';

export interface RepairResult {
  success: boolean;
  result: string;
  wasRepaired: boolean;
  error?: string;
}

/**
 * Repair malformed JSON strings
 * Handles: trailing commas, missing quotes, single quotes, comments, etc.
 */
export function repairJson(input: string): RepairResult {
  if (!input.trim()) {
    return { success: true, result: '', wasRepaired: false };
  }
  try {
    // First check if it's already valid JSON
    try {
      const parsed = JSON.parse(input);
      // Already valid, just format it
      return {
        success: true,
        result: JSON.stringify(parsed, null, 2),
        wasRepaired: false,
      };
    } catch {
      // Not valid, try to repair
    }

    // Attempt to repair
    const repaired = jsonrepair(input);

    // Verify the repaired result is valid JSON
    const parsed = JSON.parse(repaired);

    return {
      success: true,
      result: JSON.stringify(parsed, null, 2),
      wasRepaired: true,
    };
  } catch (e) {
    return {
      success: false,
      result: input,
      wasRepaired: false,
      error: (e as Error).message,
    };
  }
}
