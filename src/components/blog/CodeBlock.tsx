'use client';

import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  children: string;
  language?: string;
}

export function CodeBlock({ children, language = '' }: CodeBlockProps) {
  return (
    <Highlight theme={themes.nightOwl} code={children.trim()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={{
            ...style,
            borderRadius: '0.5rem',
            padding: '1rem',
            overflowX: 'auto',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.7',
          }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
