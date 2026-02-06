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

export interface GenerateCodeOptions {
  language: SupportedLanguage;
  typeName?: string;
}
