"use client";

import { useState, useMemo } from "react";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { Button } from "@/components/ui/button";
import { convertJson, ConversionFormat } from "@/lib/json/converter";
import { ArrowRightLeft, Copy, Trash2 } from "lucide-react";

// Simple Label component if not in ui folder
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
        {children}
    </label>
);

export default function ConverterPage() {
    const [input, setInput] = useState('{\n  "name": "JSONKit",\n  "version": "1.0.0",\n  "features": ["Beautify", "Validate", "Converter"]\n}');
    const [format, setFormat] = useState<ConversionFormat>("yaml");

    // Derive output and error from input and format
    const { output, error } = useMemo(() => {
        if (!input.trim()) {
            return { output: "", error: null };
        }

        const { success, result, error } = convertJson(input, format);
        if (success) {
            return { output: result, error: null };
        } else {
            return { output: "", error: error || "Conversion failed" };
        }
    }, [input, format]);

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6" /> JSON Converter
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <Label>JSON Input</Label>
                        <Button variant="ghost" size="sm" onClick={() => setInput("")}>
                            <Trash2 className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
                        <JsonEditor value={input} onChange={(v) => setInput(v || "")} />
                        {error && (
                            <div className="absolute bottom-2 left-2 right-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Label>Output Format:</Label>
                            <select
                                className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={format}
                                onChange={(e) => setFormat(e.target.value as ConversionFormat)}
                            >
                                <option value="yaml">YAML</option>
                                <option value="xml">XML</option>
                                <option value="csv">CSV</option>
                            </select>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy Output">
                            <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative bg-muted/30">
                        {/* We reuse JsonEditor for output, but language might need to adjust based on format. 
                             Monaco supports 'yaml', 'xml' (maybe basic), 'plaintext' */}
                        <JsonEditor
                            value={output}
                            readOnly
                            language={format === 'csv' ? 'plaintext' : format}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
