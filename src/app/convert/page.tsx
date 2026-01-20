"use client";

import { useMemo } from "react";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { Button } from "@/components/ui/button";
import { convert, ConversionFormat, ConversionDirection } from "@/lib/json/converter";
import { ArrowRightLeft, Copy, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { useLocalStorage } from "@/hooks/use-local-storage";

// Simple Label component
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
        {children}
    </label>
);

export default function ConverterPage() {
    const [input, setInput] = useLocalStorage<string>("jsonkit-converter-input", '{\n  "name": "JSONKit",\n  "version": "1.0.0",\n  "features": ["Beautify", "Validate", "Converter"]\n}');
    const [format, setFormat] = useLocalStorage<ConversionFormat>("jsonkit-converter-format", "yaml");
    const [direction, setDirection] = useLocalStorage<ConversionDirection>("jsonkit-converter-direction", "json-to-format");

    // Derive output and error from input, format, and direction
    const { output, error } = useMemo(() => {
        if (!input.trim()) {
            return { output: "", error: null };
        }

        const { success, result, error } = convert(input, format, direction);
        if (success) {
            return { output: result, error: null };
        } else {
            return { output: "", error: error || "Conversion failed" };
        }
    }, [input, format, direction]);

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
    };

    const toggleDirection = () => {
        setDirection(prev => prev === "json-to-format" ? "format-to-json" : "json-to-format");
        // We might want to swap input/output content too, but that's tricky if output is invalid or simple state swap?
        // Let's just reset or keep input? Swapping is better UX usually.
        // If conversion was successful, we can set input = output (format) and clear output until re-convert (which happens auto).
        if (output && !error) {
            setInput(output);
        } else {
            setInput("");
        }
    };

    const isJsonInput = direction === "json-to-format";
    const inputLanguage = isJsonInput ? "json" : (format === 'csv' ? 'plaintext' : format);
    const outputLanguage = isJsonInput ? (format === 'csv' ? 'plaintext' : format) : "json";

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6" /> JSON Converter
                </h1>
            </div>

            <div className="flex items-center justify-center gap-4 bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", isJsonInput ? "text-primary font-bold" : "text-muted-foreground")}>JSON</span>
                    {isJsonInput ? <ArrowRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
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
                <Button variant="outline" size="sm" onClick={toggleDirection} title="Swap Direction">
                    <ArrowRightLeft className="h-4 w-4 mr-2" /> Swap
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <Label>
                            {isJsonInput ? "JSON Input" : `${format.toUpperCase()} Input`}
                        </Label>
                        <Button variant="ghost" size="sm" onClick={() => setInput("")}>
                            <Trash2 className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
                        <JsonEditor
                            value={input}
                            onChange={(v) => setInput(v || "")}
                            language={inputLanguage}
                        />
                        {error && (
                            <div className="absolute bottom-2 left-2 right-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <Label>
                            {isJsonInput ? `${format.toUpperCase()} Output` : "JSON Output"}
                        </Label>
                        <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy Output">
                            <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative bg-muted/30">
                        <JsonEditor
                            value={output}
                            readOnly
                            language={outputLanguage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
