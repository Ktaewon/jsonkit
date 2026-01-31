"use client";

import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
    const t = useTranslations("Privacy");

    return (
        <div className="container py-8 max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="h-8 w-8" />
                <h1 className="text-3xl font-bold">{t("title")}</h1>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg mb-8">
                    {t("lastUpdated")}: {t("lastUpdatedDate")}
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t("sections.dataCollection.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("sections.dataCollection.content")}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t("sections.localStorage.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("sections.localStorage.content")}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t("sections.cookies.title")}</h2>
                    <p className="text-muted-foreground mb-4">
                        {t("sections.cookies.content")}
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li>{t("sections.cookies.googleAdsense")}</li>
                        <li>{t("sections.cookies.googleAnalytics")}</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t("sections.thirdParty.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("sections.thirdParty.content")}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{t("sections.contact.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("sections.contact.content")}
                    </p>
                </section>
            </div>
        </div>
    );
}
