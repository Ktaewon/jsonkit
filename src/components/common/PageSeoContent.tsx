import { getTranslations } from 'next-intl/server';

interface PageSeoContentProps {
  namespace: string;
  locale: string;
}

export async function PageSeoContent({ namespace, locale }: PageSeoContentProps) {
  const t = await getTranslations({ locale, namespace });

  let heading: string;
  let paragraph: string;
  try {
    heading = t('seoContent.heading');
    paragraph = t('seoContent.paragraph');
  } catch {
    return null;
  }

  return (
    <section className="container py-8 border-t mt-8">
      <h2 className="text-xl font-semibold mb-3">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed">{paragraph}</p>
    </section>
  );
}
