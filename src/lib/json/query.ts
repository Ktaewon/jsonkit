import { JSONPath } from "jsonpath-plus";

export interface QueryResult {
    success: boolean;
    result: string;
    count: number;
    error?: string;
}

export interface ExampleQuery {
    label: string;
    query: string;
}

/**
 * Query JSON data using JSONPath expressions
 */
export function queryJson(json: string, path: string): QueryResult {
    if (!json.trim()) {
        return { success: true, result: "", count: 0 };
    }
    try {
        const parsed = JSON.parse(json);
        const results = JSONPath({ path, json: parsed, wrap: true });

        return {
            success: true,
            result: JSON.stringify(results, null, 2),
            count: results.length,
        };
    } catch (e) {
        return {
            success: false,
            result: "",
            count: 0,
            error: (e as Error).message,
        };
    }
}

/**
 * Get example JSONPath queries for common use cases
 */
export function getExampleQueries(): ExampleQuery[] {
    return [
        { label: "$..*", query: "$..*" },
        { label: "$[*]", query: "$[*]" },
        { label: "$.store.book[*]", query: "$.store.book[*]" },
        { label: "$..name", query: "$..name" },
        { label: "$[0]", query: "$[0]" },
        { label: "$[-1:]", query: "$[-1:]" },
    ];
}
