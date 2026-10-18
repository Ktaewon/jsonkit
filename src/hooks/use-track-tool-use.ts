import { useEffect, useRef, useState } from 'react';
import { trackToolUse, type ToolEventParams } from '@/lib/analytics';

const DEBOUNCE_MS = 1500;
const SWITCH_TTL_MS = 5000;

// Tools that switch route on a user action (e.g. /convert/json-to-yaml -> /convert/yaml-to-json)
// remount, so the new instance would otherwise treat its first state as "unchanged".
const pendingSwitches = new Map<string, number>();

/** Call right before navigating to another variant of a tool because of a user action. */
export function markToolSwitch(switchId: string, now = Date.now()): void {
  pendingSwitches.set(switchId, now);
}

/** Whether `switchId` was marked by a user action within the last few seconds. */
export function isToolSwitch(switchId: string, now = Date.now()): boolean {
  const markedAt = pendingSwitches.get(switchId);
  return markedAt !== undefined && now - markedAt < SWITCH_TTL_MS;
}

export function clearToolSwitch(switchId: string): void {
  pendingSwitches.delete(switchId);
}

/**
 * For tools that recompute live as the user types (convert, viewer, graph, ...).
 * Sends `event` once the user has changed something since mount and paused typing,
 * at most once per distinct event per page visit. `trigger` is only compared locally
 * to detect changes and is never sent.
 *
 * Pass `switchId` (the id given to `markToolSwitch`) to count a mount reached through a
 * user-initiated switch as a change, so the switched-to state is tracked once.
 * Returns `switchTo(nextSwitchId)`: call it right before such a navigation. It marks the
 * target and stops this (outgoing) instance from tracking, so the event fires only once.
 */
export function useTrackToolUse(trigger: string, event: ToolEventParams | null, switchId?: string) {
  const [switchedIn] = useState(() => switchId !== undefined && isToolSwitch(switchId));
  const initialTrigger = useRef<string | null>(switchedIn ? null : trigger);
  const sent = useRef(new Set<string>());
  const switchedOut = useRef(false);
  const key = event ? JSON.stringify(event) : null;

  useEffect(() => {
    if (switchId !== undefined) clearToolSwitch(switchId);
  }, [switchId]);

  useEffect(() => {
    if (!key || switchedOut.current || trigger === initialTrigger.current || sent.current.has(key))
      return;
    const timer = setTimeout(() => {
      sent.current.add(key);
      trackToolUse(JSON.parse(key) as ToolEventParams);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trigger, key]);

  return (nextSwitchId: string) => {
    switchedOut.current = true;
    markToolSwitch(nextSwitchId);
  };
}
