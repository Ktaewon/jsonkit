// The real root layout (with <html>/<body>) lives in [locale]/layout.tsx.
// This pass-through exists so that app/not-found.tsx can handle unknown locales.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
