import type { NextConfig } from 'next';

export type Config = {
  i18n: NextConfig['i18n'] & {
    defaultLocale: string;
    nextFbt: {
      publicUrl: string;
      patterns: [string, string][];
    };
  };
};

export function withNextFbt(nextConfig: NextConfig & Config): NextConfig {
  const { nextFbt, ...i18n } = nextConfig.i18n;

  return Object.assign({}, nextConfig, {
    // Clean up 'i18n' from our custom properties.
    i18n,
    env: {
      ...nextConfig.env,
      ['NEXT_PUBLIC_FBT_ROOT_DIR']: process.cwd(),
      ['NEXT_PUBLIC_FBT_DEFAULT_LOCALE']: nextConfig.i18n.defaultLocale,
      ['NEXT_PUBLIC_FBT_PUBLIC_URL']: nextFbt.publicUrl,
      ['NEXT_PUBLIC_FBT_PATTERNS']: JSON.stringify(nextFbt.patterns),
    },
  });
}
