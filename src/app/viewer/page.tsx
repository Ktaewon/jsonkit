"use client";

import { useState, useMemo } from "react";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { JsonTreeView } from "@/components/editor/TreeView";
import { Button } from "@/components/ui/button";
import { Network, Trash2, ArrowRight } from "lucide-react";

export default function ViewerPage() {
    const [input, setInput] = useState('{\n  "demo": "Try pasting some JSON here!",\n  "features": ["Tree View", "Copy Path", "Expand/Collapse"]\n}');

    // Derive parsed data and error from input
    const { parsedData, error } = useMemo(() => {
        if (!input.trim()) {
            return { parsedData: null, error: null };
        }
        try {
            const parsed = JSON.parse(input);
            return { parsedData: parsed, error: null };
        } catch {
            // Keep previous data? No, simpler to just show error or nothing.
            return { parsedData: null, error: "Invalid JSON" };
        }
    }, [input]);

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Network className="h-6 w-6" /> JSON Tree Viewer
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">JSON Input</h2>
                        <Button variant="ghost" size="sm" onClick={() => setInput("")}>
                            <Trash2 className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
                        <JsonEditor value={input} onChange={(v) => setInput(v || "")} />
                        {error && (
                            <div className="absolute bottom-2 right-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">Tree View</h2>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-auto p-4 bg-background">
                        {parsedData ? (
                            <JsonTreeView data={parsedData} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <ArrowRight className="h-8 w-8 mb-2 opacity-20" />
                                <p>Enter valid JSON to view tree</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
