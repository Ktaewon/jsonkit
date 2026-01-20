"use client";

import { useState } from "react";
import { JsonDiffEditor } from "@/components/editor/JsonDiffEditor";
import { Button } from "@/components/ui/button";
import { GitCompare, Trash2 } from "lucide-react";

export default function ComparePage() {
    const [original, setOriginal] = useState('{\n  "name": "JSONKit",\n  "version": "1.0.0",\n  "features": ["Beautify", "Validate"]\n}');
    const [modified, setModified] = useState('{\n  "name": "JSONKit",\n  "version": "1.1.0",\n  "features": ["Beautify", "Validate", "Compare"]\n}');

    // Monaco DiffEditor handles changes internally mostly, but if we need to track state 
    // for separate inputs later we can. For now, we initialize with state and let users type.
    // Note: onChange in DiffEditor is a bit tricky to sync back to state bilaterally for controlled inputs 
    // without re-triggering diffs.
    // However, `originalEditable: true` in JsonDiffEditor allows direct editing.

    const handleClear = () => {
        // Force reset by key change or just empty strings
        setOriginal("");
        setModified("");
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <GitCompare className="h-6 w-6" /> JSON Diff & Compare
                </h1>
                {/* Actions could go here */}
            </div>

            <div className="flex flex-col gap-2 flex-1 min-h-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground hidden md:block">
                        Edit directly in the left (Original) and right (Modified) panels to compare.
                    </p>
                    <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" size="sm" onClick={handleClear}>
                            <Trash2 className="h-4 w-4 mr-2" /> Clear All
                        </Button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 relative">
                    <JsonDiffEditor
                        original={original}
                        modified={modified}
                    />
                </div>
            </div>
        </div>
    );
}
