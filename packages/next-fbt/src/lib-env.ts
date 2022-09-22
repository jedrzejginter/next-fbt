import { toFbtLocale } from './lib-utils.js';

export const env = {
  ROOT_DIR: String(process.env['NEXT_PUBLIC_NEXT_FBT_ROOT_DIR']),
  DEFAULT_LOCALE: toFbtLocale(String(process.env['NEXT_PUBLIC_NEXT_FBT_DEFAULT_LOCALE'])),
  PUBLIC_URL: String(process.env['NEXT_PUBLIC_NEXT_FBT_PUBLIC_URL']),
  FBT_PATTERNS: (function parseNextFbtPatternsFromEnv() {
    try {
      return JSON.parse(process.env['NEXT_PUBLIC_NEXT_FBT_PATTERNS'] || '[]') as [string, string][];
    } catch {
      return [];
    }
  })(),
};
