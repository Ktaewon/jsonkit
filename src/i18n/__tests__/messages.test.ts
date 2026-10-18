import { describe, it, expect } from 'vitest';
import { routing } from '../routing';
import en from '@/messages/en.json';
import ko from '@/messages/ko.json';
import ja from '@/messages/ja.json';
import zh from '@/messages/zh.json';
import ru from '@/messages/ru.json';

const messages: Record<string, unknown> = { en, ko, ja, zh, ru };

function leafKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe('locale messages', () => {
  it('모든 로케일의 메시지 파일이 있어야 함', () => {
    expect(Object.keys(messages).sort()).toEqual([...routing.locales].sort());
  });

  it.each(routing.locales.filter((locale) => locale !== 'en'))(
    '%s는 en과 같은 키 집합을 가져야 함',
    (locale) => {
      const expected = new Set(leafKeys(en));
      const actual = new Set(leafKeys(messages[locale]));
      expect({
        missing: [...expected].filter((key) => !actual.has(key)),
        extra: [...actual].filter((key) => !expected.has(key)),
      }).toEqual({ missing: [], extra: [] });
    }
  );
});
