// Minimal typing for the part of `negotiator` (also used by next-intl) that locale-routing uses.
declare module 'negotiator' {
  export default class Negotiator {
    constructor(request: { headers: Record<string, string | undefined> });
    languages(available?: string[]): string[];
  }
}
