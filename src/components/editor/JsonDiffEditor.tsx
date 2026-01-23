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

    const diffEditorRef = React.useRef<any>(null);

    const handleDiffEditorDidMount = (editor: any, monaco: any) => {
        diffEditorRef.current = editor;
        const options = {
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
            readOnly,
            originalEditable: !readOnly,
            renderSideBySide: true,
            wordWrap: "on",
            diffWordWrap: "on",
            glyphMargin: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            folding: false,
            ...props.options,
        };

        // Apply options directly on mount
        updateEditorOptions(editor, options);
    };

    const updateEditorOptions = (editor: any, options: any) => {
        if (!editor) return;
        editor.updateOptions(options);
        editor.getOriginalEditor().updateOptions(options);
        editor.getModifiedEditor().updateOptions(options);
    };

    React.useEffect(() => {
        if (diffEditorRef.current && props.options) {
            const options = {
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                readOnly,
                originalEditable: !readOnly,
                renderSideBySide: true,
                wordWrap: "on",
                diffWordWrap: "on",
                glyphMargin: false,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                folding: false,
                ...props.options,
            };
            updateEditorOptions(diffEditorRef.current, options);
        }
    }, [props.options, readOnly]);

    return (
        <div className="h-full w-full min-h-[400px] border rounded-md overflow-hidden bg-background">
            <DiffEditor
                height="100%"
                language="json"
                original={original}
                modified={modified}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                onMount={handleDiffEditorDidMount}
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
                    glyphMargin: false,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 4,
                    folding: false,
                    ...props.options,
                }}
                {...props}
            />
        </div>
    );
}
