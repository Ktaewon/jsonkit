import { getTranslations } from 'next-intl/server';

interface PageSeoContentProps {
  namespace: string;
  locale: string;
}

interface FaqItem {
  q: string;
  a: string;
}

export async function PageSeoContent({ namespace, locale }: PageSeoContentProps) {
  const t = await getTranslations({ locale, namespace });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });

  if (!t.has('seoContent.heading') || !t.has('seoContent.paragraph')) {
    return null;
  }

  const howTo: string[] = t.has('seoContent.howTo') ? t.raw('seoContent.howTo') : [];
  const features: string[] = t.has('seoContent.features') ? t.raw('seoContent.features') : [];
  const faq: FaqItem[] = t.has('seoContent.faq') ? t.raw('seoContent.faq') : [];

  return (
    <section className="container py-8 border-t mt-8 max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-3">{t('seoContent.heading')}</h2>
        <p className="text-muted-foreground leading-relaxed">{t('seoContent.paragraph')}</p>
      </div>

      {howTo.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">{tCommon('seoHowToTitle')}</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            {howTo.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {features.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">{tCommon('seoFeaturesTitle')}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {faq.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">{tCommon('seoFaqTitle')}</h2>
          <dl className="space-y-4">
            {faq.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-medium">{q}</dt>
                <dd className="mt-1 text-muted-foreground leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
