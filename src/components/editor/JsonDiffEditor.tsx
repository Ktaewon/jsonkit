'use client';

import React from 'react';
import { DiffEditor, DiffEditorProps, DiffOnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import type { editor } from 'monaco-editor';
import { configureMonacoLoader } from '@/lib/monaco-loader';
import { EditorFontSizeControl, addFontSizeShortcuts, useEditorFontSize } from './EditorFontSize';

configureMonacoLoader();

type DiffEditorInstance = editor.IStandaloneDiffEditor;
type EditorOptions = editor.IDiffEditorOptions;

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
  options: userOptions,
  ...props
}: JsonDiffEditorProps) {
  const { resolvedTheme } = useTheme();
  const fontSize = useEditorFontSize();

  const diffEditorRef = React.useRef<DiffEditorInstance | null>(null);

  const handleDiffEditorDidMount: DiffOnMount = (editor, monaco) => {
    diffEditorRef.current = editor;
    addFontSizeShortcuts(editor.getOriginalEditor(), monaco);
    addFontSizeShortcuts(editor.getModifiedEditor(), monaco);
    const options: EditorOptions = {
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly,
      originalEditable: !readOnly,
      renderSideBySide: true,
      wordWrap: 'on' as const,
      diffWordWrap: 'on' as const,
      glyphMargin: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
      folding: true,
      ...userOptions,
      fontSize,
    };

    // Apply options directly on mount
    updateEditorOptions(editor, options);
  };

  const updateEditorOptions = (editor: DiffEditorInstance, options: EditorOptions) => {
    if (!editor) return;
    editor.updateOptions(options);
    editor.getOriginalEditor().updateOptions(options);
    editor.getModifiedEditor().updateOptions(options);
  };

  React.useEffect(() => {
    if (diffEditorRef.current) {
      const options: EditorOptions = {
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        readOnly,
        originalEditable: !readOnly,
        renderSideBySide: true,
        wordWrap: 'on' as const,
        diffWordWrap: 'on' as const,
        glyphMargin: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        folding: false,
        ...userOptions,
        fontSize,
      };
      updateEditorOptions(diffEditorRef.current, options);
    }
  }, [userOptions, readOnly, fontSize]);

  return (
    <div className="relative h-full w-full min-h-[400px] border rounded-md overflow-hidden bg-background">
      <DiffEditor
        height="100%"
        language="json"
        original={original}
        modified={modified}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        onMount={handleDiffEditorDidMount}
        loading={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly,
          originalEditable: !readOnly,
          renderSideBySide: true,
          wordWrap: 'on',
          diffWordWrap: 'on',
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 4,
          folding: false,
          ...userOptions,
          fontSize,
        }}
        {...props}
      />
      <EditorFontSizeControl />
    </div>
  );
}
