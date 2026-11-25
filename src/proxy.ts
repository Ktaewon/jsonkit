import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API routes, Next.js/Vercel internals and files with an extension
  // (e.g. robots.txt, sitemap.xml, ads.txt). Unprefixed paths like /beautify get redirected to
  // a locale, and anything that is not a real page ends up as a 404.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
