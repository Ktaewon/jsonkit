import { BASE_URL } from '@/lib/constants';

export function getWebsiteSchema(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JSONKit',
    url: BASE_URL,
    description,
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JSONKit',
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    sameAs: ['https://github.com/Ktaewon/jsonkit'],
  };
}

export function getArticleSchema({
  title,
  description,
  slug,
  date,
  locale,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  locale: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: {
      '@type': 'Organization',
      name: 'JSONKit',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'JSONKit',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${locale}/blog/${slug}`,
    },
  };
}

export function getWebApplicationSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}
