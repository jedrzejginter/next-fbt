import type { NextConfig } from 'next';
import type { Config } from './types';

export function withNextFbt(nextConfig: NextConfig & Config): NextConfig {
  const { nextFbt, ...i18n } = nextConfig.i18n;

  return Object.assign({}, nextConfig, {
    i18n,
    env: {
      ...nextConfig.env,
      ['NEXT_PUBLIC_NEXT_FBT_ROOT_DIR']: process.cwd(),
      ['NEXT_PUBLIC_NEXT_FBT_DEFAULT_LOCALE']: nextConfig.i18n.defaultLocale,
      ['NEXT_PUBLIC_NEXT_FBT_PUBLIC_URL']: nextFbt.publicUrl,
      ['NEXT_PUBLIC_NEXT_FBT_PATTERNS']: JSON.stringify(nextFbt.patterns),
    },
  });
}
