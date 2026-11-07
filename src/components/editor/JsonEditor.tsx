'use client';

import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount, EditorProps } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { FileUp, Loader2 } from 'lucide-react';
import { configureMonacoLoader } from '@/lib/monaco-loader';
import { cn } from '@/lib/utils';
import {
  EditorFontSizeControl,
  EditorToolbar,
  FONT_SIZE_CONTROL_CLEARANCE,
  addFontSizeShortcuts,
  useEditorFontSize,
} from './EditorFontSize';
import { EditorFileActions, MAX_OPEN_FILE_MB, readTextFile } from './EditorFileActions';

configureMonacoLoader();

type MonacoEditor = Parameters<OnMount>[0];
type Monaco = Parameters<OnMount>[1];

/** A problem to underline in the editor, e.g. where JSON parsing failed. */
export interface EditorErrorMarker {
  line: number;
  column?: number;
  message: string;
}

interface JsonEditorProps extends EditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  /** Underlines this location and scrolls it into view; null clears it. */
  errorMarker?: EditorErrorMarker | null;
  /** Download file name; defaults to jsonkit.<extension for the language>. */
  fileName?: string;
}

const MARKER_OWNER = 'jsonkit';

function hasFiles(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  options,
  errorMarker,
  fileName,
  ...props
}: JsonEditorProps) {
  const t = useTranslations('Common');
  const { resolvedTheme } = useTheme();
  const fontSize = useEditorFontSize();
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const language = props.language ?? 'json';
  const canOpen = !readOnly && Boolean(onChange);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    addFontSizeShortcuts(editor, monaco);

    // Auto-format on load if needed, or just set options
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [],
      enableSchemaRequest: true,
    });
    setReady(true);
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!ready || !editor || !monaco || !model) return;
    if (!errorMarker) {
      monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
      return;
    }
    const line = Math.min(Math.max(errorMarker.line, 1), model.getLineCount());
    const column = errorMarker.column
      ? Math.min(errorMarker.column, model.getLineMaxColumn(line))
      : 1;
    monaco.editor.setModelMarkers(model, MARKER_OWNER, [
      {
        severity: monaco.MarkerSeverity.Error,
        message: errorMarker.message,
        startLineNumber: line,
        startColumn: errorMarker.column ? column : 1,
        endLineNumber: line,
        // Underline one character at the error, or the whole line when there's no column
        endColumn: errorMarker.column ? column + 1 : model.getLineMaxColumn(line),
      },
    ]);
    editor.revealLineInCenterIfOutsideViewport(line);
  }, [errorMarker, ready, value]);

  const openText = (text: string) => onChange?.(text);

  // Capture phase, so a dropped file opens here instead of Monaco inserting its path
  const handleDragOver = (event: React.DragEvent) => {
    if (!canOpen || !hasFiles(event)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    if (!dragging) setDragging(true);
  };

  const handleDrop = async (event: React.DragEvent) => {
    if (!hasFiles(event)) return;
    // Also on read-only editors, where the browser would otherwise open the dropped file
    event.preventDefault();
    event.stopPropagation();
    if (!canOpen) return;
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const text = await readTextFile(file, {
      tooLarge: t('fileTooLarge', { size: MAX_OPEN_FILE_MB }),
      failed: t('fileReadFailed'),
    });
    if (text !== null) openText(text);
  };

  return (
    <div
      className="relative h-full w-full min-h-[300px] border rounded-md overflow-hidden bg-background"
      onDragOverCapture={handleDragOver}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDropCapture={handleDrop}
    >
      <Editor
        height="100%"
        language={language}
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
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          readOnly,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          folding: true,
          padding: { bottom: FONT_SIZE_CONTROL_CLEARANCE },
          ...options,
          fontSize,
        }}
        {...props}
      />
      <EditorToolbar>
        <EditorFileActions
          value={value}
          language={language}
          onOpen={canOpen ? openText : undefined}
          fileName={fileName}
        />
        <EditorFontSizeControl />
      </EditorToolbar>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary bg-background/80 text-sm font-medium text-primary transition-opacity',
          dragging ? 'opacity-100' : 'opacity-0'
        )}
      >
        <FileUp className="h-8 w-8" />
        {t('dropFileHint')}
      </div>
    </div>
  );
}
