import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import GoogleAdsense from '@/components/common/GoogleAdsense';
import { Toaster } from 'sonner';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/common/JsonLd';
import { getWebsiteSchema, getOrganizationSchema } from '@/lib/seo/structured-data';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const metadata = await generatePageMetadata({ translationNamespace: 'Metadata', path: '', locale });
  return {
    ...metadata,
    verification: {
      other: {
        'naver-site-verification': '187890350fe5651feb3073524c2b1ab610469222',
      },
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
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <JsonLd data={getWebsiteSchema()} />
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
              <Footer />
            </div>
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
