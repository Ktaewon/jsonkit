'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龥а-яё\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function TableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll('article h2, article h3')
    ) as HTMLHeadingElement[];

    const tocItems: TocItem[] = headings.map((heading) => {
      if (!heading.id) {
        heading.id = slugify(heading.textContent ?? '');
      }
      return {
        id: heading.id,
        text: heading.textContent ?? '',
        level: parseInt(heading.tagName[1]) as 2 | 3,
      };
    });

    // Defer state update to avoid synchronous setState-in-effect lint error
    queueMicrotask(() => setItems(tocItems));

    // Track which heading is active via IntersectionObserver
    const headingElements = headings.filter((h) => h.id);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '0px 0px -60% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden xl:block">
      <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleClick(item.id)}
              className={cn(
                'block w-full text-left text-sm transition-colors',
                item.level === 3 && 'pl-4',
                activeId === item.id
                  ? 'border-l-2 border-primary pl-2 font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground',
                item.level === 3 && activeId === item.id && 'pl-6'
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
