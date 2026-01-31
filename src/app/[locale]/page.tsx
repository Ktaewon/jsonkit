"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  FileJson,
  FileCheck,
  Network,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  ArrowRightLeft,
  ArrowLeftRight,
  Search,
  Quote,
  Wrench,
  FileCode
} from "lucide-react";

export default function Home() {
  const t = useTranslations("Landing");

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32 lg:py-40">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium">
            The Ultimate JSON Toolkit for Developers
          </div>
          <h1 className="font-heading text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-primary">
            {t('heroTitle')}
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            {t('heroSubtitle')}
          </p>
          <div className="space-x-4">
            <Link href="/beautify">
              <Button size="lg" className="h-12 px-8">
                {t('getStarted')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="https://github.com/Ktaewon/jsonkit" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="h-12 px-8">
                GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container space-y-6 bg-slate-50 py-12 dark:bg-transparent md:py-24 lg:py-32 border-t">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
            {t('featuresSection.title')}
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {t('featuresSection.subtitle')}
          </p>
        </div>

        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {[
            { href: "/beautify", Icon: FileJson, colorClass: "text-primary", titleKey: "features.beautifyTitle", descKey: "features.beautifyDesc" },
            { href: "/validate", Icon: FileCheck, colorClass: "text-green-500", titleKey: "features.validateTitle", descKey: "features.validateDesc" },
            { href: "/viewer", Icon: Network, colorClass: "text-purple-500", titleKey: "features.viewerTitle", descKey: "features.viewerDesc" },
            { href: "/compare", Icon: ArrowRightLeft, colorClass: "text-orange-500", titleKey: "features.compareTitle", descKey: "features.compareDesc" },
            { href: "/convert", Icon: ArrowLeftRight, colorClass: "text-pink-500", titleKey: "features.convertTitle", descKey: "features.convertDesc" },
            { href: "/query", Icon: Search, colorClass: "text-cyan-500", titleKey: "features.queryTitle", descKey: "features.queryDesc" },
            { href: "/escape", Icon: Quote, colorClass: "text-indigo-500", titleKey: "features.escapeTitle", descKey: "features.escapeDesc" },
            { href: "/repair", Icon: Wrench, colorClass: "text-amber-500", titleKey: "features.repairTitle", descKey: "features.repairDesc" },
            { href: "/schema", Icon: FileCode, colorClass: "text-teal-500", titleKey: "features.schemaTitle", descKey: "features.schemaDesc" },
          ].map(({ href, Icon, colorClass, titleKey, descKey }) => (
            <Link key={href} href={href} className="group">
              <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <Icon className={`h-12 w-12 ${colorClass} group-hover:scale-110 transition-transform duration-300`} />
                  <div className="space-y-2">
                    <h3 className="font-bold">{t(titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t(descKey)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="container py-12 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">{t('valueProps.cleanInterfaceTitle')}</h3>
            <p className="text-muted-foreground">
              {t('valueProps.cleanInterfaceDesc')}
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">{t('valueProps.fastReactiveTitle')}</h3>
            <p className="text-muted-foreground">
              {t('valueProps.fastReactiveDesc')}
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">{t('valueProps.privacyFirstTitle')}</h3>
            <p className="text-muted-foreground">
              {t('valueProps.privacyFirstDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
