import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import en from '@/messages/en.json';
import { TOOLS } from '@/lib/tools';
import { pickClientMessages, SERVER_ONLY_KEYS, SERVER_ONLY_NAMESPACES } from '../client-messages';

const SRC = path.resolve(__dirname, '../..');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const files = sourceFiles(SRC).map((file) => ({
  file: path.relative(SRC, file),
  code: fs.readFileSync(file, 'utf8'),
}));

describe('pickClientMessages', () => {
  const client = pickClientMessages(en) as Record<string, Record<string, unknown>>;

  it('서버 전용 네임스페이스와 seoContent를 제외해야 함', () => {
    for (const ns of SERVER_ONLY_NAMESPACES) expect(client).not.toHaveProperty(ns);
    for (const value of Object.values(client)) {
      for (const key of SERVER_ONLY_KEYS) expect(value).not.toHaveProperty(key);
    }
    expect(JSON.stringify(client).length).toBeLessThan(JSON.stringify(en).length * 0.5);
  });

  it('클라이언트 컴포넌트가 쓰는 네임스페이스는 남겨야 함', () => {
    // useTranslations() runs in client components and reads NextIntlClientProvider messages
    const used = new Set<string>();
    for (const { code } of files) {
      for (const m of code.matchAll(/useTranslations\(\s*'([^']+)'\s*\)/g)) used.add(m[1]);
    }
    expect(used.size).toBeGreaterThan(5);
    for (const ns of used) {
      expect(SERVER_ONLY_NAMESPACES, ns).not.toContain(ns);
      expect(client, ns).toHaveProperty(ns);
    }
    // About page reads `${namespace}.title/description` through a root useTranslations()
    for (const { namespace } of TOOLS) {
      expect(client[namespace]).toHaveProperty('title');
      expect(client[namespace]).toHaveProperty('description');
    }
  });

  it('서버 전용 키는 서버 컴포넌트(getTranslations)에서만 읽어야 함', () => {
    const pattern = new RegExp(
      `['"\`](?:${[...SERVER_ONLY_NAMESPACES, ...SERVER_ONLY_KEYS].join('|')})[.'"\`]`
    );
    const offenders = files
      .filter(({ code }) => pattern.test(code) && !code.includes('getTranslations'))
      .map(({ file }) => file)
      .filter((file) => !file.startsWith('i18n/client-messages'));
    expect(offenders).toEqual([]);
  });
});
