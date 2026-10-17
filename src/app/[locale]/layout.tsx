import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import GoogleAdsense from '@/components/common/GoogleAdsense';
import { Toaster } from 'sonner';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebsiteSchema, getOrganizationSchema } from '@/lib/seo/structured-data';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { FloatingContactButton } from '@/components/common/FloatingContactButton';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const metadata = await generatePageMetadata({
    translationNamespace: 'Metadata',
    path: '',
    locale,
  });
  return {
    ...metadata,
    verification: {
      other: {
        'naver-site-verification': '187890350fe5651feb3073524c2b1ab610469222',
      },
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Unknown segments (e.g. /foo, /ads.txt) must 404 instead of rendering a duplicate home page
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <JsonLd data={getWebsiteSchema(t('metaDescription'))} />
        <JsonLd data={getOrganizationSchema()} />
        <GoogleAdsense pId={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || ''} />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <MobileNav />
              <Header />
              <main className="flex-1">{children}</main>
              <FloatingContactButton />
              <Footer />
            </div>
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
