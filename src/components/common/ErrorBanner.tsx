'use client';

import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  message: string;
  details?: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, details, onDismiss, className }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{message}</p>
          {details && <pre className="whitespace-pre-wrap mt-1 text-xs opacity-90">{details}</pre>}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
