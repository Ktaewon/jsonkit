'use client';

import React, { useRef } from 'react';
import Editor, { OnMount, EditorProps } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';

interface JsonEditorProps extends EditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
}

export function JsonEditor({ value, onChange, readOnly = false, ...props }: JsonEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Auto-format on load if needed, or just set options
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [],
      enableSchemaRequest: true,
    });
  };

  return (
    <div className="h-full w-full min-h-[300px] border rounded-md overflow-hidden bg-background">
      <Editor
        height="100%"
        language={props.language ?? 'json'}
        value={value}
        onChange={onChange}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          readOnly,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          folding: true,
          ...props.options,
        }}
        {...props}
      />
    </div>
  );
}
