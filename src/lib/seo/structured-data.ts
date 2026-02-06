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
    sameAs: ['https://github.com/AntigravityProjects/jsonkit'],
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
