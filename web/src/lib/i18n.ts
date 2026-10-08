import en from '@/locales/en.json';
import ta from '@/locales/ta.json';

// To add a language: create src/locales/<code>.json and register it here.
const catalogs: Record<string, Record<string, string>> = { en, ta };
export const locale = process.env.NEXT_PUBLIC_LOCALE || 'en';

/** Translate a key; falls back to English, then to the key itself. */
export function t(key: string, lang: string = locale): string {
  return catalogs[lang]?.[key] ?? catalogs.en[key] ?? key;
}
