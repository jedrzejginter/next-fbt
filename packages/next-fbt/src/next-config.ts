import type { NextConfig } from 'next';
import type { Config } from 'next-fbt-core';

export function withNextFbtConfig(nextConfig: NextConfig & Config): NextConfig {
  if (!('i18n' in nextConfig) || !('nextFbt' in nextConfig.i18n)) {
    throw new Error('Missing required configuration for `i18n` property on NextConfig');
  }

  const { nextFbt, ...i18n } = nextConfig.i18n;

  const overwrite: Partial<NextConfig> = {
    i18n,
    publicRuntimeConfig: {
      ...nextConfig.publicRuntimeConfig,
      __NEXT_FBT__: {
        ...nextConfig.i18n,
        nextFbt: {
          ...{ rootDir: process.cwd() },
          ...nextFbt,
        },
      },
    },
  };

  return Object.assign({}, nextConfig, overwrite);
}
