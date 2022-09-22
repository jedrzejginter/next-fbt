import * as path from 'path';
import micromatch from 'micromatch';
import { env } from './lib-env.js';
import type { NextFbtConfig } from './types.js';

export type FbtLocale = string & { __FBT_LOCALE__: never };
type NextLocale = string & { __NEXT_LOCALE__: never };

export function toFbtLocale(locale: string): FbtLocale {
  return locale.replace('-', '_') as FbtLocale;
}

export function toNextLocale(locale: string): NextLocale {
  return locale.replace('_', '-') as NextLocale;
}

export function getGroups(
  item: string | { filepath: string },
  runtimeConfig?: NextFbtConfig & { rootDir: string },
): string[] {
  const filepath = typeof item === 'string' ? new URL(item).pathname : item.filepath;
  const relativeFilepath = path.relative(runtimeConfig?.rootDir ?? env.ROOT_DIR, filepath);
  const calculatedGroups: string[] = [];

  for (const [pattern, group] of runtimeConfig?.patterns ?? env.FBT_PATTERNS) {
    const captured = micromatch.capture(pattern, relativeFilepath);

    if (captured) {
      const delim: string = (group.includes('-') && '-') || '_';

      calculatedGroups.push(
        captured
          .reduce((final, item, index) => {
            return final
              .replaceAll(`\$${index + 1}`, item.replaceAll('/', delim))
              .replaceAll(`\${${index + 1}}`, item.replaceAll('/', delim));
          }, group)
          .replaceAll('$@', captured.join(delim))
          .replaceAll('${@}', captured.join(delim))
          .replace(/\$\{?[\d@]+\}?/g, ''),
      );
    }
  }

  return calculatedGroups;
}

export function getGroup(
  item: string | { filepath: string },
  runtimeConfig?: NextFbtConfig & { rootDir: string },
): string {
  return getGroups(item, runtimeConfig)[0] || 'main';
}
