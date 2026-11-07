import { describe, it, expect } from 'vitest';
import { textToUnicode, unicodeToText } from '../unicode';

// Backslashes are built with BS so the test strings hold literal "中" text, as it
// appears in pasted API responses, rather than characters decoded by the parser.
const BS = String.fromCharCode(92);
const esc = (hex: string) => `${BS}u${hex}`;

describe('unicodeToText', () => {
  it('유니코드 이스케이프를 문자로 바꿔야 함', () => {
    expect(unicodeToText(`{"name":"${esc('4e2d')}${esc('6587')}"}`)).toBe('{"name":"中文"}');
  });

  it('서로게이트 쌍을 이모지로 합쳐야 함', () => {
    expect(unicodeToText(esc('d83d') + esc('de00'))).toBe('😀');
  });

  it('다른 이스케이프는 건드리지 않아야 함', () => {
    const input = `a${BS}nb${BS}"c`;
    expect(unicodeToText(input)).toBe(input);
  });
});

describe('textToUnicode', () => {
  it('ASCII가 아닌 문자만 이스케이프해야 함', () => {
    expect(textToUnicode('{"name":"中文"}')).toBe(`{"name":"${esc('4e2d')}${esc('6587')}"}`);
  });

  it('왕복 변환하면 원래대로 돌아와야 함', () => {
    const text = '{"msg":"안녕 😀 привет"}';
    expect(unicodeToText(textToUnicode(text))).toBe(text);
  });
});
