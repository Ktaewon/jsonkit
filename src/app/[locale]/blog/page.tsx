import { useTranslations } from 'next-intl';
import { getAllPosts } from '@/lib/blog/posts';
import { Link } from '@/i18n/navigation';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const t = useTranslations('Blog');
  const posts = getAllPosts();

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-8 w-8" />
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>
      <p className="text-muted-foreground text-lg mb-8">{t('description')}</p>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-lg border overflow-hidden transition-colors hover:bg-muted/50"
          >
            {post.image && (
              <div className="aspect-[3/1] overflow-hidden">
                <img
                  src={post.image}
                  alt={t(`posts.${post.slug}.title`)}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex items-start justify-between gap-4 p-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                  {t(`posts.${post.slug}.title`)}
                </h2>
                <p className="text-muted-foreground mb-3">{t(`posts.${post.slug}.summary`)}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <time dateTime={post.date}>{post.date}</time>
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-primary text-xs font-medium">
                    {post.relatedTool}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
