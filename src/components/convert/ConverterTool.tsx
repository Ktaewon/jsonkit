'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DynamicJsonEditor as JsonEditor } from '@/components/editor/DynamicJsonEditor';
import { Button } from '@/components/ui/button';
import { CONVERSION_EXAMPLES, convert, getConversionPair } from '@/lib/json/converter';
import type { ConversionDirection, ConversionFormat, ConversionPair } from '@/lib/json/converter';
import { ArrowRightLeft, Copy, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTrackToolUse } from '@/hooks/use-track-tool-use';
import { getSizeBucket, trackToolUse } from '@/lib/analytics';
import { useRouter } from '@/i18n/navigation';

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

const inputStorageKey = (pair: ConversionPair) => `jsonkit-converter-input:${pair}`;

interface ConverterToolProps {
  /** Direction preselected by the route (/convert or /convert/<pair>). */
  initialFormat: ConversionFormat;
  initialDirection: ConversionDirection;
  title: string;
  description: string;
}

export function ConverterTool({
  initialFormat,
  initialDirection,
  title,
  description,
}: ConverterToolProps) {
  const t = useTranslations('Convert');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  // The URL is the source of truth for the direction so shared links open in it.
  const [format, setFormat] = useState<ConversionFormat>(initialFormat);
  const [direction, setDirection] = useState<ConversionDirection>(initialDirection);
  const pair = getConversionPair(format, direction);

  // Input is stored per pair, so each page opens on input in its own source format
  // (first-time visitors get the pair's sample instead of a parse error).
  const [input, setInput] = useLocalStorage<string>(
    inputStorageKey(pair),
    CONVERSION_EXAMPLES[pair]
  );

  // Derive output and error from input, format, and direction
  const { output, error } = useMemo(() => {
    if (!input.trim()) {
      return { output: '', error: null };
    }

    const { success, result, error } = convert(input, format, direction);
    if (success) {
      return { output: result, error: null };
    } else {
      return { output: '', error: error || 'Conversion failed' };
    }
  }, [input, format, direction]);

  const fromFormat = direction === 'json-to-format' ? 'json' : format;
  const toFormat = direction === 'json-to-format' ? format : 'json';
  const switchTracking = useTrackToolUse(
    `${direction}|${format}|${input}`,
    {
      tool: 'convert',
      action: 'convert',
      result: error ? 'error' : 'success',
      from_format: fromFormat,
      to_format: toFormat,
      size_bucket: getSizeBucket(input),
    },
    // Fixed per mount: the page remounts on every pair change.
    `convert:${getConversionPair(initialFormat, initialDirection)}`
  );

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      trackToolUse({
        tool: 'convert',
        action: 'copy',
        from_format: fromFormat,
        to_format: toFormat,
      });
      toast.success(tCommon('copied'));
    } catch {
      toast.error(tCommon('copyFailed'));
    }
  };

  /** Switches to another pair; `carriedInput` replaces that pair's stored input. */
  const changeDirection = (
    nextFormat: ConversionFormat,
    nextDirection: ConversionDirection,
    carriedInput?: string
  ) => {
    const nextPair = getConversionPair(nextFormat, nextDirection);
    if (carriedInput !== undefined) {
      try {
        window.localStorage.setItem(inputStorageKey(nextPair), JSON.stringify(carriedInput));
      } catch {
        // Storage unavailable: the next pair opens on its stored input or sample.
      }
    }
    setFormat(nextFormat);
    setDirection(nextDirection);
    switchTracking(`convert:${nextPair}`);
    router.replace(`/convert/${nextPair}`, { scroll: false });
  };

  // JSON input stays valid when only the target format changes; a different source
  // format would not parse, so that pair keeps its own stored input.
  const handleFormatChange = (nextFormat: ConversionFormat) =>
    changeDirection(nextFormat, direction, direction === 'json-to-format' ? input : undefined);

  const toggleDirection = () =>
    changeDirection(
      format,
      direction === 'json-to-format' ? 'format-to-json' : 'json-to-format',
      output && !error ? output : undefined
    );

  const isJsonInput = direction === 'json-to-format';
  const inputLanguage = isJsonInput ? 'json' : format === 'csv' ? 'plaintext' : format;
  const outputLanguage = isJsonInput ? (format === 'csv' ? 'plaintext' : format) : 'json';

  return (
    <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArrowRightLeft className="h-6 w-6" /> {title}
        </h1>
      </div>
      <p className="text-muted-foreground">{description}</p>

      <div className="flex items-center justify-center gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isJsonInput ? 'text-primary font-bold' : 'text-muted-foreground'
            )}
          >
            JSON
          </span>
          {isJsonInput ? (
            <ArrowRight className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4 rotate-180" />
          )}
          <select
            className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={format}
            onChange={(e) => handleFormatChange(e.target.value as ConversionFormat)}
          >
            <option value="yaml">YAML</option>
            <option value="xml">XML</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        <Button variant="outline" onClick={toggleDirection} title="Swap Direction">
          <ArrowRightLeft className="h-4 w-4 mr-2" /> {t('swap')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <Label>
              {isJsonInput ? t('jsonInput') : t('formatInput', { format: format.toUpperCase() })}
            </Label>
            <Button variant="outline" onClick={() => setInput('')}>
              <Trash2 className="h-4 w-4 mr-2" /> {tCommon('clear')}
            </Button>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
            <JsonEditor
              value={input}
              onChange={(v) => setInput(v || '')}
              language={inputLanguage}
            />
            {error && <ErrorBanner message={tCommon('error')} details={error} />}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <Label>
              {isJsonInput ? t('formatOutput', { format: format.toUpperCase() }) : t('jsonOutput')}
            </Label>
            <Button variant="outline" onClick={handleCopy} title={tCommon('copy')}>
              <Copy className="h-4 w-4 mr-2" /> {tCommon('copy')}
            </Button>
          </div>
          <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative bg-muted/30">
            <JsonEditor value={output} readOnly language={outputLanguage} />
          </div>
        </div>
      </div>
    </div>
  );
}
