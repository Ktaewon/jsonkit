// Tool routes paired with the translation namespace that holds their title/description.
export const TOOLS = [
  { href: '/beautify', namespace: 'Beautify' },
  { href: '/validate', namespace: 'Validate' },
  { href: '/viewer', namespace: 'Viewer' },
  { href: '/compare', namespace: 'Compare' },
  { href: '/convert', namespace: 'Convert' },
  { href: '/query', namespace: 'Query' },
  { href: '/escape', namespace: 'Escape' },
  { href: '/repair', namespace: 'Repair' },
  { href: '/schema', namespace: 'Schema' },
  { href: '/graph', namespace: 'Graph' },
  { href: '/json-to-code', namespace: 'Type' },
] as const;
