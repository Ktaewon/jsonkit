import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/common/JsonLd';
import { BASE_URL } from '@/lib/constants';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generatePageMetadata({
    translationNamespace: 'Blog',
    path: '/blog',
    locale,
  });
}

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'JSONKit Blog',
    url: `${BASE_URL}/en/blog`,
    description: 'JSON tutorials, guides, and best practices',
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      {children}
    </>
  );
}
