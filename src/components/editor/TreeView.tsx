'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonTreeViewProps {
  data: unknown;
  level?: number;
  path?: string;
}

const getType = (value: unknown) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const ValueDisplay = ({ value, type }: { value: unknown; type: string }) => {
  if (type === 'string')
    return (
      <span className="text-green-600 dark:text-green-400">&quot;{value as string}&quot;</span>
    );
  if (type === 'number')
    return <span className="text-blue-600 dark:text-blue-400">{value as number}</span>;
  if (type === 'boolean')
    return <span className="text-purple-600 dark:text-purple-400">{String(value)}</span>;
  if (type === 'null') return <span className="text-gray-500">null</span>;
  return <span>{String(value)}</span>;
};

export function JsonTreeView({ data, level = 0, path = '$' }: JsonTreeViewProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(level < 2); // Default expand first 2 levels
  const [copied, setCopied] = useState(false);

  const type = getType(data);
  const isObject = type === 'object' || type === 'array';
  const keys = isObject ? Object.keys(data as object) : [];
  const isEmpty = isObject && keys.length === 0;

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isObject) {
    return (
      <div className="flex items-center group font-mono text-sm leading-6">
        <ValueDisplay value={data} type={type} />
      </div>
    );
  }

  return (
    <div className="font-mono text-sm leading-6 select-text">
      <div
        className="flex items-center hover:bg-muted/50 rounded cursor-pointer group"
        onClick={() => !isEmpty && setIsExpanded(!isExpanded)}
      >
        <span className="w-4 h-4 mr-1 flex items-center justify-center text-muted-foreground">
          {!isEmpty &&
            (isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            ))}
        </span>

        <span className="text-muted-foreground mr-1">{type === 'array' ? '[' : '{'}</span>

        {!isExpanded && !isEmpty && (
          <button className="text-xs text-muted-foreground px-1 hover:text-foreground">...</button>
        )}

        {!isExpanded && (
          <span className="text-muted-foreground">
            {type === 'array' ? ']' : '}'}
            <span className="ml-2 text-xs text-muted-foreground/50">
              {keys.length} {keys.length === 1 ? 'item' : 'items'}
            </span>
          </span>
        )}

        {/* Hidden copy path button */}
        <button
          onClick={handleCopyPath}
          className={cn(
            'ml-auto mr-2 p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity',
            copied && 'opacity-100 text-green-500'
          )}
          title="Copy JSONPath"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {isExpanded && !isEmpty && (
        <div className="pl-4 border-l border-muted/50 ml-2">
          {keys.map((key, index) => {
            const value = (data as Record<string, unknown>)[key];
            /* For arrays, path is path[index], for objects path.key (simplified) */
            const nextPath = type === 'array' ? `${path}[${key}]` : `${path}.${key}`;

            return (
              <div key={key} className="flex items-start">
                {type !== 'array' && (
                  <span className={cn('mr-1 text-sky-700 dark:text-sky-300', 'shrink-0')}>
                    &quot;{key}&quot;:
                  </span>
                )}
                <JsonTreeView data={value} level={level + 1} path={nextPath} />
                {index < keys.length - 1 && <span className="text-muted-foreground">,</span>}
              </div>
            );
          })}
        </div>
      )}

      {isExpanded && (
        <div className="pl-6">
          <span className="text-muted-foreground">{type === 'array' ? ']' : '}'}</span>
        </div>
      )}
    </div>
  );
}
