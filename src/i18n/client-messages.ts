// Namespaces that only server components read (via getTranslations): SEO metadata, blog,
// and the long per-page copy of /convert/<pair> and /json-to-code/<language>.
export const SERVER_ONLY_NAMESPACES = ['Metadata', 'Blog', 'ConvertPair', 'JsonToCodeLanguage'];

// Keys inside a namespace that only server components read (PageSeoContent).
export const SERVER_ONLY_KEYS = ['seoContent'];

/**
 * Returns the messages that client components need.
 *
 * NextIntlClientProvider serializes its messages into every page's HTML, RSC payload and
 * prefetch segments. Sending the whole locale file (78–128 KB) roughly doubled the size of
 * each prerendered page, and with it the CPU the Worker spends reading every cached page.
 * Server components still get the full messages from `getTranslations`.
 */
type Messages = Record<string, unknown>;

export function pickClientMessages(messages: Messages): Messages {
  const result: Messages = {};
  for (const [namespace, value] of Object.entries(messages)) {
    if (SERVER_ONLY_NAMESPACES.includes(namespace)) continue;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const filtered: Messages = {};
      for (const [key, nested] of Object.entries(value)) {
        if (!SERVER_ONLY_KEYS.includes(key)) filtered[key] = nested;
      }
      result[namespace] = filtered;
    } else {
      result[namespace] = value;
    }
  }
  return result;
}
