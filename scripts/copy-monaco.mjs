// Copies the Monaco editor build from node_modules into public/ so the editor is served
// from our own domain instead of the jsDelivr CDN, which is slow or blocked in China.
//
// Output: public/monaco/<version>/vs. The version is part of the path so the files can be
// cached as immutable, and an upgrade never mixes old cached files with new ones.
// Runs automatically before `dev` and `build` (see package.json); the output is gitignored.

import { cpSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgDir = join(root, 'node_modules', 'monaco-editor');
const { version } = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));

const outRoot = join(root, 'public', 'monaco');
const target = join(outRoot, version, 'vs');

// Drop builds of other versions so stale copies don't pile up.
if (existsSync(outRoot)) {
  for (const entry of readdirSync(outRoot)) {
    if (entry !== version) rmSync(join(outRoot, entry), { recursive: true, force: true });
  }
}

if (existsSync(join(target, 'loader.js'))) {
  console.log(`[copy-monaco] monaco-editor ${version} already in public/monaco`);
} else {
  cpSync(join(pkgDir, 'min', 'vs'), target, { recursive: true });
  console.log(`[copy-monaco] copied monaco-editor ${version} to public/monaco/${version}/vs`);
}
