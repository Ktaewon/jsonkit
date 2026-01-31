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

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JSONKit - All-in-one JSON Utility',
  description: 'Free online JSON beautifier, validator, viewer and more.',
  verification: {
    other: {
      'naver-site-verification': '187890350fe5651feb3073524c2b1ab610469222',
    },
  },
  openGraph: {
    title: 'JSONKit - All-in-one JSON Utility',
    description: 'Free online JSON beautifier, validator, viewer and more.',
    url: 'https://jsonkit.org',
    siteName: 'JSONKit',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png', // We should probably verify if this exists or just add a placeholder
        width: 1200,
        height: 630,
        alt: 'JSONKit Preview',
      },
    ],
  },
};

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
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
