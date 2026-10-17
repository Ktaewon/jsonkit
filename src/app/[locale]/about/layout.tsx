import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({ translationNamespace: 'About', path: '/about', locale });
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
