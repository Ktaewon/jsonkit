export interface EscapeResult {
    success: boolean;
    result: string;
    error?: string;
}

/**
 * Escape a JSON string - converts special characters to escape sequences
 * Useful for embedding JSON as a string value inside another JSON
 */
export function escapeJson(input: string): EscapeResult {
    if (!input.trim()) {
        return { success: true, result: "" };
    }
    // Escape the string: use JSON.stringify to escape, then remove outer quotes
    const escaped = JSON.stringify(input);
    // Remove the surrounding quotes added by stringify
    const result = escaped.slice(1, -1);

    return {
        success: true,
        result: result,
    };
}

/**
 * Unescape a JSON string - converts escape sequences back to actual characters
 * Reverses the escape operation
 */
export function unescapeJson(input: string): EscapeResult {
    if (!input.trim()) {
        return { success: true, result: "" };
    }
    try {
        // Add quotes back and parse to unescape
        const unescaped = JSON.parse(`"${input}"`);

        return {
            success: true,
            result: unescaped,
        };
    } catch (e) {
        return {
            success: false,
            result: input,
            error: (e as Error).message,
        };
    }
}
