import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BASE_URL } from '@/lib/constants';
import { JsonLd } from '@/components/common/JsonLd';
import { getPostBySlug } from '@/lib/blog/posts';
import { getArticleSchema } from '@/lib/seo/structured-data';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const t = await getTranslations({ locale, namespace: 'Blog' });
  const title = t(`posts.${slug}.title`);
  const description = t(`posts.${slug}.summary`);
  const url = `${BASE_URL}/${locale}/blog/${slug}`;

  return {
    title: `${title} | JSONKit Blog`,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        post.locales.map((loc) => [loc, `${BASE_URL}/${loc}/blog/${slug}`])
      ),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'JSONKit',
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'Blog' });
  const title = t(`posts.${slug}.title`);
  const description = t(`posts.${slug}.summary`);

  const articleSchema = getArticleSchema({
    title,
    description,
    slug,
    date: post.date,
    locale,
  });

  return (
    <>
      <JsonLd data={articleSchema} />
      {children}
    </>
  );
}
