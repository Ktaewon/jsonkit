"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const t = useTranslations("Navigation");
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
            </Button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-[75%] max-w-sm border-r bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="flex items-center space-x-2 font-bold">
                        <FileJson className="h-6 w-6" />
                        <span>JSONKit</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <nav className="flex flex-col space-y-4">
                    <Link
                        href="/beautify"
                        className={cn(
                            "text-lg font-medium transition-colors hover:text-primary",
                            pathname === "/beautify" ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {t('beautify')}
                    </Link>
                    <Link
                        href="/validate"
                        className={cn(
                            "text-lg font-medium transition-colors hover:text-primary",
                            pathname === "/validate" ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {t('validate')}
                    </Link>
                    <Link
                        href="/viewer"
                        className={cn(
                            "text-lg font-medium transition-colors hover:text-primary",
                            pathname === "/viewer" ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {t('viewer')}
                    </Link>
                    <Link
                        href="/compare"
                        className={cn(
                            "text-lg font-medium transition-colors hover:text-primary",
                            pathname === "/compare" ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {t('compare')}
                    </Link>
                    <Link
                        href="/convert"
                        className={cn(
                            "text-lg font-medium transition-colors hover:text-primary",
                            pathname === "/convert" ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        {t('convert')}
                    </Link>
                </nav>

                <div className="absolute bottom-8 left-6 right-6 text-sm text-muted-foreground">
                    <p>© 2024 JSONKit</p>
                </div>
            </div>
        </div>
    );
}
