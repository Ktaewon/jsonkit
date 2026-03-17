const BLOB_BASE = 'https://pdohaq5b0usqo1wk.public.blob.vercel-storage.com/blog';

export interface BlogPost {
  slug: string;
  locales: string[];
  date: string;
  relatedTool: string;
  relatedToolPath: string;
  image?: string;
}

const posts: BlogPost[] = [
  {
    slug: 'json-format-guide',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'beautify',
    relatedToolPath: '/beautify',
  },
  {
    slug: 'json-vs-yaml',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'convert',
    relatedToolPath: '/convert',
  },
  {
    slug: 'jsonpath-tutorial',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'query',
    relatedToolPath: '/query',
  },
  {
    slug: 'json-validation-guide',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'validate',
    relatedToolPath: '/validate',
  },
  {
    slug: 'json-tree-viewer',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'viewer',
    relatedToolPath: '/viewer',
  },
  {
    slug: 'json-diff-comparison',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'compare',
    relatedToolPath: '/compare',
  },
  {
    slug: 'json-escape-unescape',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'escape',
    relatedToolPath: '/escape',
  },
  {
    slug: 'json-repair-guide',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'repair',
    relatedToolPath: '/repair',
  },
  {
    slug: 'json-schema-intro',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'schema',
    relatedToolPath: '/schema',
  },
  {
    slug: 'json-to-type-codegen',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'json-to-code',
    relatedToolPath: '/json-to-code',
  },
  {
    slug: 'json-visualization',
    locales: ['ko', 'en', 'ja', 'zh', 'ru'],
    date: '2025-03-14',
    relatedTool: 'graph',
    relatedToolPath: '/graph',
  },
];

export function getAllPosts(): BlogPost[] {
  return posts.map((post) => ({
    ...post,
    image: `${BLOB_BASE}/${post.slug}.png`,
  }));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const post = posts.find((p) => p.slug === slug);
  if (!post) return undefined;
  return {
    ...post,
    image: `${BLOB_BASE}/${post.slug}.png`,
  };
}

export function getPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}
