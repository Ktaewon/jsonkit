// Unicode escape helpers. API responses and logs often carry non-ASCII text as \uXXXX
// escapes (e.g. "中文" for 中文); these convert in both directions without
// touching other escapes such as \n or \".

// An escaped surrogate pair, a single \uXXXX, or any other escape (\\, \", \n ...). Other
// escapes are matched so that the "\u" in "\\u4e2d" (an escaped backslash) is left alone.
const ESCAPE = /\\u(d[89ab][0-9a-f]{2})\\u(d[c-f][0-9a-f]{2})|\\u([0-9a-f]{4})|\\[\s\S]/gi;

/**
 * Turns \uXXXX escapes into the characters they stand for; surrogate pairs combine.
 * Characters that must stay escaped inside a JSON string (quote, backslash, control
 * characters) and lone surrogates are kept as escapes, so valid JSON stays valid.
 */
export function unicodeToText(input: string): string {
  return input.replace(ESCAPE, (match, high?: string, low?: string, single?: string) => {
    if (high && low) {
      return String.fromCharCode(parseInt(high, 16), parseInt(low, 16));
    }
    if (!single) return match;
    const code = parseInt(single, 16);
    const isLoneSurrogate = code >= 0xd800 && code <= 0xdfff;
    const mustStayEscaped = code < 0x20 || code === 0x22 || code === 0x5c;
    return isLoneSurrogate || mustStayEscaped ? match : String.fromCharCode(code);
  });
}

/** Turns every non-ASCII character into a \uXXXX escape (per UTF-16 code unit). */
export function textToUnicode(input: string): string {
  return input.replace(
    /[^\x00-\x7f]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
  );
}
