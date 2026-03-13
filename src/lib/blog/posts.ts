export interface BlogPost {
  slug: string;
  locales: string[];
  date: string;
  relatedTool: string;
  relatedToolPath: string;
}

const posts: BlogPost[] = [
  {
    slug: 'json-format-guide',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'beautify',
    relatedToolPath: '/beautify',
  },
  {
    slug: 'json-vs-yaml',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'convert',
    relatedToolPath: '/convert',
  },
  {
    slug: 'jsonpath-tutorial',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'query',
    relatedToolPath: '/query',
  },
  {
    slug: 'json-validation-guide',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'validate',
    relatedToolPath: '/validate',
  },
  {
    slug: 'json-tree-viewer',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'viewer',
    relatedToolPath: '/viewer',
  },
  {
    slug: 'json-diff-comparison',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'compare',
    relatedToolPath: '/compare',
  },
  {
    slug: 'json-escape-unescape',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'escape',
    relatedToolPath: '/escape',
  },
  {
    slug: 'json-repair-guide',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'repair',
    relatedToolPath: '/repair',
  },
  {
    slug: 'json-schema-intro',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'schema',
    relatedToolPath: '/schema',
  },
  {
    slug: 'json-to-type-codegen',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'json-to-code',
    relatedToolPath: '/json-to-code',
  },
  {
    slug: 'json-visualization',
    locales: ['ko', 'en'],
    date: '2025-03-14',
    relatedTool: 'graph',
    relatedToolPath: '/graph',
  },
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}
