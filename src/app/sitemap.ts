import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/constants';

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
    '/privacy',
  ];

  const locales = ['en', 'ko', 'ja', 'zh', 'ru'];

  const sitemap: MetadataRoute.Sitemap = [];

  routes.forEach((route) => {
    locales.forEach((locale) => {
      sitemap.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  // Also add root redirect (optional, but good for completeness if we want to show it exists)
  // But usually sitemap lists the direct accessible pages.
  // We'll stick to the localized pages.

  return sitemap;
}
