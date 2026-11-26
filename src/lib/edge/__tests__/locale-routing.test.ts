import { describe, it, expect } from 'vitest';
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import {
  getCookie,
  getUnprefixedPathname,
  normalizeSearch,
  resolveLocaleRouting,
} from '../locale-routing';

const nextIntl = createMiddleware(routing);

const PATHS = [
  '/',
  '/beautify',
  '/beautify?a=1&b=2',
  '/blog/json-format-guide',
  '/this-does-not-exist',
  '/zh-TW',
  '/english',
  '/%EC%95%88',
  '/a%20b',
  '/a%2Fb',
  '/en',
  '/en/beautify',
  '/en/beautify?x=1',
  '/ko',
  '/ko/blog/json-format-guide',
  '/ja/convert/json-to-yaml',
  '/ru/this-does-not-exist',
  '/EN',
  '/EN/beautify',
  '/Ko/beautify?q=1',
  '/zh/%E7%B4%84',
  '/en/\\evil.com',
];

const HEADERS: Array<Record<string, string>> = [
  {},
  { 'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8' },
  { 'accept-language': 'ja' },
  { 'accept-language': 'zh-TW,zh;q=0.9' },
  { 'accept-language': 'ru-RU' },
  { 'accept-language': 'fr-FR,fr;q=0.9' },
  { 'accept-language': 'fr-FR,de;q=0.9,ko;q=0.5' },
  { 'accept-language': '*' },
  { 'accept-language': 'en-US,en;q=0.9,ko;q=0.8' },
  { 'accept-language': 'KO' },
  { 'accept-language': 'zh-Hant-HK' },
  { 'accept-language': 'pt-BR, es;q=0.3' },
  { 'accept-language': ';;;garbage' },
  { cookie: 'NEXT_LOCALE=ja', 'accept-language': 'ko' },
  { cookie: 'NEXT_LOCALE=xx', 'accept-language': 'ko' },
  { cookie: 'foo=1; NEXT_LOCALE=ru' },
  { cookie: 'NEXT_LOCALE=en' },
  { cookie: 'NEXT_LOCALE=' },
  { cookie: 'NEXT_LOCALE' },
  { cookie: 'NEXT_LOCALE=ko; NEXT_LOCALE=ja' },
  { cookie: 'NEXT_LOCALE=%6Ao' },
  { host: 'jsonkit.org', 'x-forwarded-proto': 'https' },
  { 'x-forwarded-host': 'www.jsonkit.org' },
];

function viaNextIntl(url: string, headers: Record<string, string>) {
  const res = nextIntl(new NextRequest(url, { headers }));
  const redirect = res.headers.get('location');
  return {
    redirect,
    setCookie: res.headers.get('set-cookie') ?? undefined,
    link: redirect ? undefined : (res.headers.get('link') ?? undefined),
  };
}

function viaEdge(url: string, headers: Record<string, string>) {
  const parsed = new URL(url);
  const result = resolveLocaleRouting({
    url: parsed,
    cookie: headers.cookie ?? null,
    acceptLanguage: headers['accept-language'] ?? null,
    host: headers.host ?? parsed.host,
    forwardedHost: headers['x-forwarded-host'] ?? null,
    forwardedProto: headers['x-forwarded-proto'] ?? null,
  });
  if (result.type === 'passthrough') throw new Error('unexpected passthrough');
  return {
    redirect: result.type === 'redirect' ? result.location : null,
    setCookie: result.setCookie,
    link: result.type === 'next' ? result.link : undefined,
  };
}

describe('resolveLocaleRouting는 next-intl 미들웨어와 같은 결과를 내야 함', () => {
  for (const path of PATHS) {
    it(path, () => {
      for (const headers of HEADERS) {
        const url = `http://localhost:8787${path}`;
        expect(viaEdge(url, headers), JSON.stringify(headers)).toEqual(viaNextIntl(url, headers));
      }
    });
  }

  it('잘못된 퍼센트 인코딩은 Next로 넘겨야 함', () => {
    const result = resolveLocaleRouting({
      url: new URL('http://localhost/%E0%A4%A'),
      cookie: null,
      acceptLanguage: null,
      host: 'localhost',
    });
    expect(result.type).toBe('passthrough');
  });
});

describe('helpers', () => {
  it('getCookie', () => {
    expect(getCookie('a=1; NEXT_LOCALE=ko', 'NEXT_LOCALE')).toBe('ko');
    expect(getCookie('NEXT_LOCALEX=ko', 'NEXT_LOCALE')).toBeUndefined();
    expect(getCookie(null, 'NEXT_LOCALE')).toBeUndefined();
  });

  it('getUnprefixedPathname', () => {
    expect(getUnprefixedPathname('/en')).toBe('/');
    expect(getUnprefixedPathname('/en/beautify')).toBe('/beautify');
    expect(getUnprefixedPathname('/beautify')).toBe('/beautify');
    expect(getUnprefixedPathname('/')).toBe('/');
  });

  it('normalizeSearch', () => {
    expect(normalizeSearch('')).toBe('');
    expect(normalizeSearch('?')).toBe('');
    expect(normalizeSearch('?x=%20y')).toBe('?x=+y');
  });
});
