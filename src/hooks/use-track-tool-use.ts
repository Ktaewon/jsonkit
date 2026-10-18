import { useEffect, useRef } from 'react';
import { trackToolUse, type ToolEventParams } from '@/lib/analytics';

const DEBOUNCE_MS = 1500;

/**
 * For tools that recompute live as the user types (convert, viewer, graph, ...).
 * Sends `event` once the user has changed something since mount and paused typing,
 * at most once per distinct event per page visit. `trigger` is only compared locally
 * to detect changes and is never sent.
 */
export function useTrackToolUse(trigger: string, event: ToolEventParams | null) {
  const initialTrigger = useRef(trigger);
  const sent = useRef(new Set<string>());
  const key = event ? JSON.stringify(event) : null;

  useEffect(() => {
    if (!key || trigger === initialTrigger.current || sent.current.has(key)) return;
    const timer = setTimeout(() => {
      sent.current.add(key);
      trackToolUse(JSON.parse(key) as ToolEventParams);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trigger, key]);
}
