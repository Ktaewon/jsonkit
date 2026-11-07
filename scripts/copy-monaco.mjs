// Copies the Monaco editor build from node_modules into public/ so the editor is served
// from our own domain instead of the jsDelivr CDN, which is slow or blocked in China.
//
// Output: public/monaco/<version>/vs. The version is part of the path so the files can be
// cached as immutable, and an upgrade never mixes old cached files with new ones.
// Runs as part of `npm run dev` and `npm run build` (see package.json); the output is
// gitignored. next.config.ts reads the same version for the client-side loader path.

import { cpSync, existsSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgDir = join(root, 'node_modules', 'monaco-editor');

if (!existsSync(join(pkgDir, 'min', 'vs'))) {
  console.error(
    '[copy-monaco] node_modules/monaco-editor/min/vs not found. Run `npm install` first.'
  );
  process.exit(1);
}

const { version } = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
const outRoot = join(root, 'public', 'monaco');
const versionDir = join(outRoot, version);

// Drop builds of other versions, and any leftover partial copy, so they don't pile up.
if (existsSync(outRoot)) {
  for (const entry of readdirSync(outRoot)) {
    if (entry !== version) rmSync(join(outRoot, entry), { recursive: true, force: true });
  }
}

// The version directory only appears via the rename below, so if it exists the copy
// finished; an interrupted copy leaves just the .tmp directory, which is removed above.
if (existsSync(versionDir)) {
  console.log(`[copy-monaco] monaco-editor ${version} already in public/monaco`);
} else {
  const tmpDir = join(outRoot, `${version}.tmp`);
  cpSync(join(pkgDir, 'min', 'vs'), join(tmpDir, 'vs'), { recursive: true });
  renameSync(tmpDir, versionDir);
  console.log(`[copy-monaco] copied monaco-editor ${version} to public/monaco/${version}/vs`);
}
