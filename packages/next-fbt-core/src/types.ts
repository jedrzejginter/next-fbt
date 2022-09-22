import type { NextConfig } from 'next';

export type FbtLocale = string & { __FBT_LOCALE__: never };
export type NextLocale = string & { __NEXT_LOCALE__: never };

export type NextFbtConfig = {
  publicUrl: string;
  patterns: [string, string][];
  rootDir: string;
};

export type Config = {
  i18n: NextConfig['i18n'] & {
    // Default locale must be specified.
    defaultLocale: string;
    // Additional object for this library.
    nextFbt: NextFbtConfig;
  };
};
