'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

export const DynamicJsonEditor = dynamic(
  () => import('@/components/editor/JsonEditor').then((mod) => mod.JsonEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[300px] items-center justify-center border rounded-md bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);
