import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during SSR and hydration, true afterwards. Controlled inputs whose value comes
 * from localStorage must show the server value until then: React doesn't patch a
 * mismatched `value`/`checked` while hydrating, so the control would contradict the state.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
