import React from 'react';

type Props = {
    pId: string;
};

const GoogleAdsense = ({ pId }: Props) => {
    if (process.env.NODE_ENV !== 'production') {
        return null;
    }

    return (
    return (
        <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
            crossOrigin="anonymous"
        />
    );
    );
};

export default GoogleAdsense;
