// Points @monaco-editor/react at the Monaco build we serve ourselves (copied into
// public/monaco by scripts/copy-monaco.mjs) instead of its default jsDelivr CDN, which is
// slow or blocked in mainland China and would leave the editor stuck on its spinner.

import { loader } from '@monaco-editor/react';

// Set in next.config.ts from node_modules/monaco-editor/package.json.
export const MONACO_VS_PATH = `/monaco/${process.env.NEXT_PUBLIC_MONACO_VERSION}/vs`;

let configured = false;

/** Must run before the first editor mounts; safe to call more than once. */
export function configureMonacoLoader(): void {
  if (configured) return;
  loader.config({ paths: { vs: MONACO_VS_PATH } });
  configured = true;
}
