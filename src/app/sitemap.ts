import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/constants';
import { getAllPosts } from '@/lib/blog/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/beautify',
    '/validate',
    '/viewer',
    '/compare',
    '/convert',
    '/query',
    '/escape',
    '/repair',
    '/schema',
    '/graph',
    '/json-to-code',
    '/privacy',
    '/blog',
  ];

  const locales = ['en', 'ko', 'ja', 'zh', 'ru'];

  const sitemap: MetadataRoute.Sitemap = [];

  routes.forEach((route) => {
    locales.forEach((locale) => {
      sitemap.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : route === '/privacy' ? 0.5 : route === '/blog' ? 0.7 : 0.8,
      });
    });
  });

  const posts = getAllPosts();
  posts.forEach((post) => {
    post.locales.forEach((locale) => {
      sitemap.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });
  });

  return sitemap;
}
