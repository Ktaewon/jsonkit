import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_EXAMPLES,
  isSupportedLanguage,
} from '@/lib/json/code-generator';
import { routing } from '@/i18n/routing';

describe('isSupportedLanguage', () => {
  it('accepts every supported language slug', () => {
    for (const { value } of SUPPORTED_LANGUAGES) {
      expect(isSupportedLanguage(value)).toBe(true);
    }
  });

  it('rejects unknown slugs', () => {
    expect(isSupportedLanguage('foo')).toBe(false);
    expect(isSupportedLanguage('TypeScript')).toBe(false);
    expect(isSupportedLanguage('')).toBe(false);
  });
});

describe('language landing pages', () => {
  it('has a valid example JSON for every language', () => {
    for (const { value } of SUPPORTED_LANGUAGES) {
      expect(() => JSON.parse(LANGUAGE_EXAMPLES[value].json)).not.toThrow();
    }
  });

  it.each(routing.locales)('has landing page content for every language in %s', async (locale) => {
    const messages = (await import(`@/messages/${locale}.json`)).default;
    const languages = messages.JsonToCodeLanguage.languages;
    for (const { value } of SUPPORTED_LANGUAGES) {
      const page = languages[value];
      expect(page.title, `${locale}.${value}.title`).toBeTruthy();
      expect(page.metaTitle, `${locale}.${value}.metaTitle`).toBeTruthy();
      expect(page.metaDescription, `${locale}.${value}.metaDescription`).toBeTruthy();
      expect(page.seoContent.heading).toBeTruthy();
      expect(page.seoContent.paragraph).toBeTruthy();
      expect(page.seoContent.howTo.length).toBeGreaterThan(0);
      expect(page.seoContent.faq).toHaveLength(3);
    }
  });
});
