// Unicode escape helpers. API responses and logs often carry non-ASCII text as \uXXXX
// escapes (e.g. "中文" for 中文); these convert in both directions without
// touching other escapes such as \n or \".

/** Turns \uXXXX escapes into the characters they stand for. Surrogate pairs combine. */
export function unicodeToText(input: string): string {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

/** Turns every non-ASCII character into a \uXXXX escape (per UTF-16 code unit). */
export function textToUnicode(input: string): string {
  return input.replace(
    /[^\x00-\x7f]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
  );
}
