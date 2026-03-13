import type { MDXComponents } from 'mdx/types';
import React from 'react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龥а-яё\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getTextContent).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return getTextContent(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props.children
    );
  }
  return '';
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold tracking-tight mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2
        id={slugify(getTextContent(children))}
        className="text-2xl font-semibold tracking-tight mt-8 mb-3"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slugify(getTextContent(children))} className="text-xl font-semibold mt-6 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }) => <p className="leading-7 mb-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="leading-7">{children}</li>,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{children}</code>
    ),
    pre: ({ children }) => (
      <pre className="rounded-lg bg-muted p-4 overflow-x-auto mb-4 text-sm">{children}</pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-primary underline underline-offset-4 hover:text-primary/80">
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="border border-border px-4 py-2">{children}</td>,
    ...components,
  };
}
