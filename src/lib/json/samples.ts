// Starter inputs shown to first-time visitors so each tool demonstrates itself
// instead of opening on an empty editor. Stored input (localStorage) takes precedence.

const SAMPLE_OBJECT = {
  id: 1024,
  name: 'JSONKit',
  active: true,
  tags: ['json', 'developer-tools', 'open-source'],
  owner: { login: 'ktaewon', type: 'User' },
  stats: { stars: 128, forks: 12, rating: 4.8 },
  updatedAt: '2026-10-18T09:30:00Z',
};

/** Minified, so pressing Beautify shows an obvious change. */
export const BEAUTIFY_SAMPLE = JSON.stringify(SAMPLE_OBJECT);

export const VALIDATE_SAMPLE = JSON.stringify(SAMPLE_OBJECT, null, 2);

export const ESCAPE_SAMPLE = JSON.stringify(
  { message: 'Hello, "JSONKit"!', path: 'C:\\Users\\dev', lines: 'first\nsecond' },
  null,
  2
);

/** Deliberately broken: comments, single quotes, unquoted keys and trailing commas. */
export const REPAIR_SAMPLE = `{
  // copied from a JavaScript config
  name: 'JSONKit',
  version: '2.0.0',
  features: ['format', 'validate', 'repair',],
  enabled: true,
}`;

export const QUERY_SAMPLE = JSON.stringify(
  {
    store: {
      book: [
        {
          category: 'reference',
          author: 'Nigel Rees',
          title: 'Sayings of the Century',
          price: 8.95,
        },
        { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
        { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
      ],
      bicycle: { color: 'red', price: 19.95 },
    },
  },
  null,
  2
);

export const QUERY_SAMPLE_PATH = '$.store.book[*].author';
