import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generatePageMetadata({ translationNamespace: 'Privacy', path: '/privacy', locale });
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
