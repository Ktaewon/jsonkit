import { getPostBySlug } from '@/lib/blog/posts';
import { Link } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BlogPostContent } from './content';
import { TableOfContents } from '@/components/blog/TableOfContents';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !post.locales.includes(locale)) notFound();

  return (
    <div className="container py-8 max-w-5xl">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Blog
      </Link>
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <BlogPostContent slug={slug} locale={locale} />
          </article>
          <div className="mt-12 pt-6 border-t">
            <Link
              href={post.relatedToolPath}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try {post.relatedTool} tool
            </Link>
          </div>
        </div>
        <aside className="hidden xl:block xl:w-64 xl:shrink-0">
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}
