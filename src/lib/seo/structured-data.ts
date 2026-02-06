const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://jsonkit.org';

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JSONKit',
    url: BASE_URL,
    description: 'Free online JSON tools - beautify, validate, compare, convert and more.',
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
