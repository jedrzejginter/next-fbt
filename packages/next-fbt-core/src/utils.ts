import * as path from 'path';

import type { FbtLocale, NextFbtConfig, NextLocale } from './types';

export function toFbtLocale(locale: string): FbtLocale {
  return locale.replace('-', '_') as FbtLocale;
}

export function toNextLocale(locale: string): NextLocale {
  return locale.replace('_', '-') as NextLocale;
}

export function getGroups(item: string | { filepath: string }, config: NextFbtConfig): string[] {
  const filepath = typeof item === 'string' ? new URL(item).pathname : item.filepath;
  const relativeFilepath = path.relative(config.rootDir, filepath);
  const calculatedGroups: string[] = [];

  for (const [pattern, group] of config.patterns) {
    const re = new RegExp(`^${pattern.replace('*', '(.*)')}$`, 'i');
    const captured = relativeFilepath.match(re);

    if (captured !== null) {
      const delim: string = (group.includes('-') && '-') || '_';

      calculatedGroups.push(group.replaceAll('/', delim));
    }
  }

  return calculatedGroups;
}

export function getGroup(item: string | { filepath: string }, config: NextFbtConfig): string {
  return getGroups(item, config)[0] || 'main';
}
