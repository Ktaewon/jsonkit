'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { toolbarButtonClass, toolbarGroupClass } from './EditorFontSize';

/** Larger files make the editor and the tools themselves very slow. */
export const MAX_OPEN_FILE_MB = 20;

const EXTENSIONS: Record<string, string> = {
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
  csv: 'csv',
  typescript: 'ts',
  javascript: 'js',
  python: 'py',
  go: 'go',
  rust: 'rs',
  java: 'java',
  kotlin: 'kt',
  swift: 'swift',
  csharp: 'cs',
  cpp: 'cpp',
};

const MIME_TYPES: Record<string, string> = {
  json: 'application/json',
  yaml: 'application/yaml',
  xml: 'application/xml',
  csv: 'text/csv',
};

export function getDownloadFileName(language: string | undefined, baseName = 'jsonkit'): string {
  return `${baseName}.${EXTENSIONS[language ?? 'json'] ?? 'txt'}`;
}

/** Reads a dropped or picked file as text, rejecting files too large to edit. */
export async function readTextFile(
  file: File,
  messages: { tooLarge: string; failed: string }
): Promise<string | null> {
  if (file.size > MAX_OPEN_FILE_MB * 1024 * 1024) {
    toast.error(messages.tooLarge);
    return null;
  }
  try {
    return await file.text();
  } catch {
    toast.error(messages.failed);
    return null;
  }
}

export function downloadText(text: string, fileName: string, language?: string): void {
  const type = `${MIME_TYPES[language ?? ''] ?? 'text/plain'};charset=utf-8`;
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before releasing the blob
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface EditorFileActionsProps {
  value: string;
  language?: string;
  /** Called with the file's text; omit to hide the open button (read-only editors). */
  onOpen?: (text: string) => void;
  fileName?: string;
}

/** Open-file and download buttons for the editor toolbar. */
export function EditorFileActions({ value, language, onOpen, fileName }: EditorFileActionsProps) {
  const t = useTranslations('Common');
  const inputRef = useRef<HTMLInputElement>(null);
  const canDownload = value.length > 0;

  const handleFile = async (file: File | undefined) => {
    if (!file || !onOpen) return;
    const text = await readTextFile(file, {
      tooLarge: t('fileTooLarge', { size: MAX_OPEN_FILE_MB }),
      failed: t('fileReadFailed'),
    });
    if (text !== null) onOpen(text);
  };

  return (
    <div role="group" aria-label={t('fileActions')} className={toolbarGroupClass}>
      {onOpen && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={t('openFile')}
            title={t('openFile')}
            className={cn(toolbarButtonClass, 'w-7')}
          >
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              // Allow picking the same file again
              e.target.value = '';
            }}
          />
        </>
      )}
      <button
        type="button"
        onClick={() =>
          canDownload && downloadText(value, fileName ?? getDownloadFileName(language), language)
        }
        aria-disabled={!canDownload}
        aria-label={t('downloadFile')}
        title={t('downloadFile')}
        className={cn(toolbarButtonClass, 'w-7', onOpen && 'border-l')}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
