"use client";

import { useState } from "react";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { Button } from "@/components/ui/button";
import { formatJson, minifyJson } from "@/lib/json/beautify";
import { Copy, Trash2, FileJson } from "lucide-react";

export default function BeautifyPage() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleFormat = () => {
        const { success, result, error } = formatJson(input);
        if (success) {
            setOutput(result);
            setError(null);
        } else {
            setError(error || "Invalid JSON");
        }
    };

    const handleMinify = () => {
        const { success, result, error } = minifyJson(input);
        if (success) {
            setOutput(result);
            setError(null);
        } else {
            setError(error || "Invalid JSON");
        }
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        // toast("Copied to clipboard"); // Need Toaster
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileJson className="h-6 w-6" /> JSON Beautifier & Minifier
                </h1>
                <div className="flex items-center gap-2">
                    {/* Actions */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">Input</h2>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={handleClear} title="Clear">
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
                        <h2 className="text-sm font-medium text-muted-foreground">Output</h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleFormat}>
                                Beautify
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleMinify}>
                                Minify
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
                        <JsonEditor value={output} readOnly />
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                Error: {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
