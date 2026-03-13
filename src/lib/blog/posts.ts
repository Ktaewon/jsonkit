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
