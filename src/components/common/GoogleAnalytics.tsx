import Script from 'next/script';

type Props = {
  measurementId: string;
};

// Loads gtag.js only when a GA4 measurement ID is configured. If the script is blocked
// (ad blockers, regions where Google is unreachable) the inline stub just queues events
// in dataLayer, so nothing on the page breaks.
const GoogleAnalytics = ({ measurementId }: Props) => {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
