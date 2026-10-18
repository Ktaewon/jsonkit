export type SupportedLanguage =
  | 'typescript'
  | 'go'
  | 'python'
  | 'csharp'
  | 'rust'
  | 'swift'
  | 'java'
  | 'cpp'
  | 'kotlin';

export const SUPPORTED_LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'python', label: 'Python' },
  { value: 'csharp', label: 'C#' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'kotlin', label: 'Kotlin' },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'typescript';

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some((lang) => lang.value === value);
}

export function getLanguageLabel(language: SupportedLanguage): string {
  return SUPPORTED_LANGUAGES.find((lang) => lang.value === language)?.label ?? language;
}

/**
 * Sample JSON shown on each /json-to-code/<language> landing page. The generated
 * output is produced from it at build time, so the snippet always matches what
 * the tool actually generates.
 */
export const LANGUAGE_EXAMPLES: Record<SupportedLanguage, { typeName: string; json: string }> = {
  typescript: {
    typeName: 'User',
    json: '{\n  "id": 42,\n  "name": "Ada Lovelace",\n  "email": "ada@example.com",\n  "roles": ["admin", "editor"],\n  "profile": { "bio": "Mathematician", "website": "https://example.com" }\n}',
  },
  go: {
    typeName: 'ServerConfig',
    json: '{\n  "host": "0.0.0.0",\n  "port": 8080,\n  "debug": false,\n  "allowed_origins": ["https://jsonkit.org"],\n  "database": { "dsn": "postgres://localhost/app", "max_conns": 20 }\n}',
  },
  python: {
    typeName: 'Order',
    json: '{\n  "order_id": "A-1001",\n  "total": 59.9,\n  "paid": true,\n  "items": [{ "sku": "BOOK-1", "quantity": 2 }]\n}',
  },
  csharp: {
    typeName: 'Product',
    json: '{\n  "productId": 7,\n  "title": "Mechanical Keyboard",\n  "price": 129.99,\n  "inStock": true,\n  "tags": ["hardware", "usb-c"]\n}',
  },
  rust: {
    typeName: 'Event',
    json: '{\n  "event_type": "page_view",\n  "timestamp": 1735689600,\n  "user_id": "u_123",\n  "properties": { "path": "/pricing", "referrer": "google" }\n}',
  },
  swift: {
    typeName: 'Article',
    json: '{\n  "id": 3,\n  "title": "Hello Swift",\n  "author": { "name": "Taylor", "followers": 1200 },\n  "is_featured": true\n}',
  },
  java: {
    typeName: 'Customer',
    json: '{\n  "customerId": 501,\n  "fullName": "Grace Hopper",\n  "vip": true,\n  "addresses": [{ "city": "Arlington", "zip": "22201" }]\n}',
  },
  cpp: {
    typeName: 'SensorReading',
    json: '{\n  "sensor_id": "temp-01",\n  "value": 21.5,\n  "unit": "C",\n  "battery": 87,\n  "ok": true\n}',
  },
  kotlin: {
    typeName: 'Movie',
    json: '{\n  "id": 12,\n  "title": "Arrival",\n  "year": 2016,\n  "genres": ["sci-fi", "drama"],\n  "rating": 7.9\n}',
  },
};

export interface GenerateCodeOptions {
  language: SupportedLanguage;
  typeName?: string;
}
