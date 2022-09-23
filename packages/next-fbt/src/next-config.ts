import type { NextConfig } from 'next';
import { Config, configToInternalConfig, NextFbtInternalConfig } from 'next-fbt-core';

export function withNextFbtConfig(nextConfigWithFbt: NextConfig & Config): NextConfig {
  if (!('i18n' in nextConfigWithFbt) || !('nextFbt' in nextConfigWithFbt)) {
    throw new Error(
      'Missing required configuration for `i18n` or/and `nextFbt` property on NextConfig',
    );
  }

  // Remove `nextFbt` from next config, so we don't get warning
  // about invalid property (Next started reporting it from some 12.x version).
  const { nextFbt: _, ...nextConfig } = nextConfigWithFbt;

  const runtimeConfig: NextFbtInternalConfig = configToInternalConfig(nextConfigWithFbt);

  const nextConfigOverride: Partial<NextConfig> = {
    publicRuntimeConfig: {
      ...nextConfig.publicRuntimeConfig,
      __NEXT_FBT__: runtimeConfig,
    },
  };

  return Object.assign({}, nextConfig, nextConfigOverride);
}
