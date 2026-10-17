'use client';

import NextError from 'next/error';

// Rendered for requests outside any valid locale (e.g. /foo), where the
// [locale] layout cannot render. Must provide its own <html>/<body>.
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={404} />
      </body>
    </html>
  );
}
