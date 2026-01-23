"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { MobileNav } from "@/components/layout/MobileNav";
import { FileJson } from "lucide-react";
import { useLocale } from "next-intl";
import { ChangeEvent, useTransition } from "react";

export function Header() {
    const t = useTranslations("Navigation");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <MobileNav />
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <FileJson className="h-6 w-6" />
                        <span className="font-bold inline-block">
                            JSONKit
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/beautify" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {t('beautify')}
                        </Link>
                        <Link href="/validate" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {t('validate')}
                        </Link>
                        <Link href="/viewer" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {t('viewer')}
                        </Link>
                        <Link href="/compare" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {t('compare')}
                        </Link>
                        <Link href="/convert" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            {t('convert')}
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                onChange={onSelectChange}
                                defaultValue={locale}
                                disabled={isPending}
                                className="h-9 w-[100px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="en">English</option>
                                <option value="ko">한국어</option>
                                <option value="ja">日本語</option>
                                <option value="zh">中文</option>
                                <option value="ru">Русский</option>
                            </select>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}
