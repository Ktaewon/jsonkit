import Link from "next/link";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { FileJson } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <FileJson className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">
                            JSONKit
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/beautify"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Beautify
                        </Link>
                        <Link
                            href="/validate"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Validate
                        </Link>
                        <Link
                            href="/viewer"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Viewer
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search or other items can go here */}
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
