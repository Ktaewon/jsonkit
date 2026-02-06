import React from 'react';

type Props = {
  pId: string;
};

const GoogleAdsense = ({ pId }: Props) => {
  if (!pId) {
    return null;
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
      crossOrigin="anonymous"
    />
  );
};

export default GoogleAdsense;
