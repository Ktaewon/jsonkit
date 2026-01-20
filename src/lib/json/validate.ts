import jsonlint from "jsonlint-mod";

export interface ValidationResult {
    isValid: boolean;
    error?: {
        message: string;
        line?: number;
    };
    formatted?: string;
}

export function validateJson(input: string): ValidationResult {
    if (!input.trim()) {
        return { isValid: true };
    }
    try {
        const parsed = jsonlint.parse(input);
        return {
            isValid: true,
            formatted: JSON.stringify(parsed, null, 2),
        };
    } catch (e: any) {
        // Determine line number from error message if possible
        // jsonlint-mod usually provides a message like "Parse error on line 1: ..."
        const message = e.message || "Unknown error";
        const lineMatch = message.match(/line (\d+)/);
        const line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

        return {
            isValid: false,
            error: {
                message: message,
                line: line,
            },
        };
    }
}
