import * as path from 'path';

import type { Config, FbtLocale, NextFbtInternalConfig, NextLocale } from './types';

export function toFbtLocale(locale: string): FbtLocale {
  return locale.replace('-', '_') as FbtLocale;
}

export function toNextLocale(locale: string): NextLocale {
  return locale.replace('_', '-') as NextLocale;
}

export function getGroups(
  item: string | { filepath: string },
  config: NextFbtInternalConfig,
): string[] {
  const filepath = typeof item === 'string' ? new URL(item).pathname : item.filepath;
  const relativeFilepath = path.relative(config.rootDir, filepath);
  const calculatedGroups: string[] = [];

  for (const [pattern, group] of config.groups) {
    const regExp = new RegExp(`^${pattern.replace('*', '(.*)')}$`, 'i');
    const match = relativeFilepath.match(regExp);

    if (match !== null) {
      calculatedGroups.push(group);
    }
  }

  return calculatedGroups;
}

export function getGroup(
  item: string | { filepath: string },
  config: NextFbtInternalConfig,
): string {
  return getGroups(item, config)[0] || config.defaultGroup;
}

export function configToInternalConfig(config: Config): NextFbtInternalConfig {
  const groups: [string, string][] = config.nextFbt.groups.flatMap(([group, groupPatterns]) => {
    return groupPatterns.map((groupPatterns) => [groupPatterns, group] as [string, string]);
  });

  const publicDir = new URL(config.nextFbt.publicUrl).pathname;

  return {
    ...{
      defaultGroup: 'main',
      rootDir: process.cwd(),
    },
    ...config.i18n,
    ...config.nextFbt,
    publicDir,
    groups,
  };
}
