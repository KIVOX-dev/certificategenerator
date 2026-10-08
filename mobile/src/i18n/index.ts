import en from './en.json';
import ta from './ta.json';

// To add a language: create <code>.json here and register it. Missing keys fall back to English.
const catalogs: Record<string, Record<string, string>> = { en, ta };
export const locale = process.env.EXPO_PUBLIC_LOCALE || 'en';

export function t(key: string, lang: string = locale): string {
  return catalogs[lang]?.[key] ?? catalogs.en[key] ?? key;
}
