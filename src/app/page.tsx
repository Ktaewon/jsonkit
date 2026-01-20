import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileJson,
  FileCheck,
  Network,
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32 lg:py-40">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium">
            The Ultimate JSON Toolkit for Developers
          </div>
          <h1 className="font-heading text-4xl font-extrabold sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-primary">
            All-in-one JSON Utility
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Beautify, validate, and visualize your JSON data instantly.
            100% client-side processing for maximum privacy locally.
          </p>
          <div className="space-x-4">
            <Link href="/beautify">
              <Button size="lg" className="h-12 px-8">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/Ktaewon/jsonkit" target="_blank">
              <Button variant="outline" size="lg" className="h-12 px-8">
                GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container space-y-6 bg-slate-50 py-12 dark:bg-transparent md:py-24 lg:py-32 border-t">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Everything you need to handle JSON files efficiently.
          </p>
        </div>

        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">

          <Link href="/beautify" className="group">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <FileJson className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div className="space-y-2">
                  <h3 className="font-bold">Beautify & Minify</h3>
                  <p className="text-sm text-muted-foreground">
                    Format JSON with perfect indentation or minify it to save space.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/validate" className="group">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <FileCheck className="h-12 w-12 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <div className="space-y-2">
                  <h3 className="font-bold">JSON Validator</h3>
                  <p className="text-sm text-muted-foreground">
                    Validate your JSON data and find errors instantly with line numbers.
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/viewer" className="group">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Network className="h-12 w-12 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                <div className="space-y-2">
                  <h3 className="font-bold">Tree Viewer</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize complex JSON structures in an interactive tree view.
                  </p>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* Value Proposition */}
      <section className="container py-12 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Clean Interface</h3>
            <p className="text-muted-foreground">
              No distractions. Just the tools you need in a modern, clean UI.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Fast & Reactive</h3>
            <p className="text-muted-foreground">
              Instant results as you type. No waiting for server roundtrips.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Privacy First</h3>
            <p className="text-muted-foreground">
              All processing happens in your browser. Your data never leaves your device.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
