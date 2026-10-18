'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { DynamicJsonEditor as JsonEditor } from '@/components/editor/DynamicJsonEditor';
import { Button } from '@/components/ui/button';
import { Code, Trash2, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTrackToolUse } from '@/hooks/use-track-tool-use';
import { getSizeBucket, trackToolUse } from '@/lib/analytics';
import { generateCode } from '@/app/actions/generate-code';
import { useRouter } from '@/i18n/navigation';
import { SUPPORTED_LANGUAGES } from '@/lib/json/code-generator';
import type { SupportedLanguage } from '@/lib/json/code-generator';

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
  >
    {children}
  </label>
);

interface JsonToCodeToolProps {
  /** Language preselected by the route (/json-to-code or /json-to-code/<language>). */
  initialLanguage: SupportedLanguage;
  title: string;
  description: string;
}

export function JsonToCodeTool({ initialLanguage, title, description }: JsonToCodeToolProps) {
  const t = useTranslations('Type');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const [input, setInput] = useLocalStorage<string>(
    'jsonkit-type-input',
    '{\n  "id": 1,\n  "name": "JSONKit",\n  "features": ["Beautify", "Convert", "Type Generation"],\n  "active": true\n}'
  );
  // The URL is the source of truth for the language so shared links open in it.
  // Input and type name live in localStorage, so they survive the route change.
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [typeName, setTypeName] = useLocalStorage<string>('jsonkit-type-typename', 'Root');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const hasGeneratedRef = useRef(false);

  // Debounced generation
  useEffect(() => {
    let isActive = true;

    const generate = async () => {
      if (!input.trim()) {
        setOutput('');
        setError(null);
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const code = await generateCode(input, { language, typeName });
        if (isActive) {
          setOutput(code);
        }
      } catch (err) {
        console.error('Generation failed:', err);
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Generation failed');
          setOutput('');
        }
      } finally {
        if (isActive) {
          setIsGenerating(false);
        }
      }
    };

    // Generate immediately on first render (e.g. after switching language pages)
    const timer = setTimeout(generate, hasGeneratedRef.current ? 800 : 0);
    hasGeneratedRef.current = true;

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [input, language, typeName]);

  const switchTracking = useTrackToolUse(
    `${language}|${typeName}|${input}`,
    isGenerating
      ? null
      : {
          tool: 'json-to-code',
          action: 'generate',
          result: error ? 'error' : 'success',
          language,
          size_bucket: getSizeBucket(input),
        },
    // Fixed per mount: the page remounts on every language change.
    `json-to-code:${initialLanguage}`
  );

  const handleLanguageChange = (next: SupportedLanguage) => {
    setLanguage(next);
    switchTracking(`json-to-code:${next}`);
    router.replace(`/json-to-code/${next}`, { scroll: false });
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      trackToolUse({ tool: 'json-to-code', action: 'copy', language });
      toast.success(tCommon('copied'));
    } catch {
      toast.error(tCommon('copyFailed'));
    }
  };

  return (
    <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Code className="h-6 w-6" /> {title}
        </h1>
      </div>
      <p className="text-muted-foreground">{description}</p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <Label>{t('language')}:</Label>
          <select
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Label>{t('typeName')}:</Label>
          <input
            type="text"
            className="h-8 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="Root"
          />
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('generating')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Input */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <Label>{tCommon('input')} (JSON)</Label>
            <Button variant="outline" size="sm" onClick={() => setInput('')}>
              <Trash2 className="h-4 w-4 mr-2" /> {tCommon('clear')}
            </Button>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
            <JsonEditor value={input} onChange={(v) => setInput(v || '')} language="json" />
            {error && <ErrorBanner message={tCommon('error')} details={error} />}
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <Label>
              {tCommon('output')} ({language})
            </Label>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output}>
              <Copy className="h-4 w-4 mr-2" /> {tCommon('copy')}
            </Button>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative bg-muted/30">
            <JsonEditor value={output} readOnly language={language} />
          </div>
        </div>
      </div>
    </div>
  );
}
