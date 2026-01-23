"use client";

import React from "react";
import { DiffEditor, DiffEditorProps } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface JsonDiffEditorProps extends DiffEditorProps {
    original: string;
    modified: string;
    onOriginalChange?: (value: string) => void;
    onModifiedChange?: (value: string) => void;
    readOnly?: boolean;
}

export function JsonDiffEditor({
    original,
    modified,
    readOnly = false,
    ...props
}: JsonDiffEditorProps) {
    const { theme, resolvedTheme } = useTheme();

    return (
        <div className="h-full w-full min-h-[400px] border rounded-md overflow-hidden bg-background">
            <DiffEditor
                height="100%"
                language="json"
                original={original}
                modified={modified}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                loading={
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                }
                options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    readOnly,
                    originalEditable: !readOnly,
                    renderSideBySide: true,
                    wordWrap: "on",
                    diffWordWrap: "on",
                    ...props.options,
                }}
                {...props}
            />
        </div>
    );
}
