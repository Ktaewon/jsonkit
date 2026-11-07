'use client';

import React from 'react';
import { DiffEditor, DiffEditorProps, DiffOnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import type { editor } from 'monaco-editor';
import { configureMonacoLoader } from '@/lib/monaco-loader';
import {
  EditorFontSizeControl,
  EditorToolbar,
  FONT_SIZE_CONTROL_CLEARANCE,
  addFontSizeShortcuts,
  useEditorFontSize,
} from './EditorFontSize';

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
  onOriginalChange,
  onModifiedChange,
  ...props
}: JsonDiffEditorProps) {
  const { resolvedTheme } = useTheme();
  const fontSize = useEditorFontSize();

  const diffEditorRef = React.useRef<DiffEditorInstance | null>(null);

  // The editor owns its text while the user types. Values from props are only written into
  // it when they differ from what it already holds (e.g. Clear, or another tab on mobile),
  // because @monaco-editor/react resets the original side on every prop change, which
  // would jump the cursor to the start on each keystroke.
  const [initialOriginal] = React.useState(original);
  const [initialModified] = React.useState(modified);
  const latest = React.useRef({ original, modified, onOriginalChange, onModifiedChange });
  React.useEffect(() => {
    latest.current = { original, modified, onOriginalChange, onModifiedChange };
  });

  const syncValues = (editor: DiffEditorInstance) => {
    const model = editor.getModel();
    if (!model) return;
    const { original: nextOriginal, modified: nextModified } = latest.current;
    if (model.original.getValue() !== nextOriginal) model.original.setValue(nextOriginal);
    if (model.modified.getValue() !== nextModified) model.modified.setValue(nextModified);
  };

  React.useEffect(() => {
    if (diffEditorRef.current) syncValues(diffEditorRef.current);
  }, [original, modified]);

  // One set of options for creation, mount and later updates, so they can't drift apart.
  const options = React.useMemo<EditorOptions>(
    () => ({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly,
      originalEditable: !readOnly,
      renderSideBySide: true,
      wordWrap: 'on',
      diffWordWrap: 'on',
      glyphMargin: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
      folding: false,
      padding: { bottom: FONT_SIZE_CONTROL_CLEARANCE },
      ...userOptions,
      fontSize,
    }),
    [userOptions, readOnly, fontSize]
  );
  // @monaco-editor/react calls onMount with the handler from the first render, so it reads
  // the latest options from this ref (e.g. if the size changed while Monaco was loading).
  const optionsRef = React.useRef(options);

  const updateEditorOptions = (editor: DiffEditorInstance, next: EditorOptions) => {
    editor.updateOptions(next);
    editor.getOriginalEditor().updateOptions(next);
    editor.getModifiedEditor().updateOptions(next);
  };

  const handleDiffEditorDidMount: DiffOnMount = (editor, monaco) => {
    diffEditorRef.current = editor;
    addFontSizeShortcuts(editor.getOriginalEditor(), monaco);
    addFontSizeShortcuts(editor.getModifiedEditor(), monaco);
    // Values may have changed while Monaco was loading
    syncValues(editor);
    const originalEditor = editor.getOriginalEditor();
    const modifiedEditor = editor.getModifiedEditor();
    originalEditor.onDidChangeModelContent(() =>
      latest.current.onOriginalChange?.(originalEditor.getValue())
    );
    modifiedEditor.onDidChangeModelContent(() =>
      latest.current.onModifiedChange?.(modifiedEditor.getValue())
    );
    updateEditorOptions(editor, optionsRef.current);
  };

  React.useEffect(() => {
    optionsRef.current = options;
    if (diffEditorRef.current) updateEditorOptions(diffEditorRef.current, options);
  }, [options]);

  return (
    <div className="relative h-full w-full min-h-[400px] border rounded-md overflow-hidden bg-background">
      <DiffEditor
        height="100%"
        language="json"
        original={initialOriginal}
        modified={initialModified}
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        onMount={handleDiffEditorDidMount}
        loading={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
        options={options}
        {...props}
      />
      <EditorToolbar>
        <EditorFontSizeControl />
      </EditorToolbar>
    </div>
  );
}
