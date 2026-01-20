import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'ko', 'ja', 'zh', 'ru'],

    // Used when no locale matches
    defaultLocale: 'en'
});
