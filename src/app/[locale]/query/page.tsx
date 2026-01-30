"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { Button } from "@/components/ui/button";
import { queryJson, getExampleQueries } from "@/lib/json/query";
import { Copy, Trash2, Search, Play } from "lucide-react";

import { useLocalStorage } from "@/hooks/use-local-storage";

export default function QueryPage() {
    const t = useTranslations("Query");
    const tCommon = useTranslations("Common");

    const [input, setInput] = useLocalStorage<string>("jsonkit-query-input", "");
    const [queryPath, setQueryPath] = useLocalStorage<string>("jsonkit-query-path", "$");
    const [output, setOutput] = useState("");
    const [resultCount, setResultCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const exampleQueries = getExampleQueries();

    const handleQuery = useCallback(() => {
        const { success, result, count, error } = queryJson(input, queryPath);
        if (success) {
            setOutput(result);
            setResultCount(count);
            setError(null);
        } else {
            setOutput("");
            setResultCount(0);
            setError(error || t("invalidQuery"));
        }
    }, [input, queryPath, t]);

    const handleExampleClick = (query: string) => {
        setQueryPath(query);
    };

    const handleClear = () => {
        setInput("");
        setQueryPath("$");
        setOutput("");
        setResultCount(0);
        setError(null);
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Search className="h-6 w-6" /> {t("title")}
                </h1>
            </div>
            <p className="text-muted-foreground">
                {t("description")}
            </p>

            {/* Query Input Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={queryPath}
                        onChange={(e) => setQueryPath(e.target.value)}
                        placeholder={t("queryPlaceholder")}
                        className="flex-1 font-mono h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                    />
                    <Button onClick={handleQuery}>
                        <Play className="h-4 w-4 mr-2" />
                        {t("execute")}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">{t("examples")}:</span>
                    {exampleQueries.map((eq) => (
                        <Button
                            key={eq.query}
                            variant="outline"
                            size="sm"
                            onClick={() => handleExampleClick(eq.query)}
                            className="font-mono text-xs"
                        >
                            {eq.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">{t("jsonInput")}</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClear} title={tCommon("clear")}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
                        <JsonEditor value={input} onChange={(v) => setInput(v || "")} />
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            {t("queryResult")} {resultCount > 0 && <span className="text-primary">({resultCount} {t("matches")})</span>}
                        </h2>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleCopy} title={tCommon("copy")}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
                        <JsonEditor value={output} readOnly />
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                {tCommon("error")}: {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
