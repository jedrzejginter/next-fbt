import type { NextConfig } from 'next';

export type FbtLocale = string & { __FBT_LOCALE__: never };
export type NextLocale = string & { __NEXT_LOCALE__: never };

export type NextFbtConfig = {
  publicUrl: string;
  groups: [/* group */ string, /* patterns */ string[]][];
  rootDir?: string;
};

export type NextFbtInternalConfig = Required<Omit<NextFbtConfig, 'groups'>> & {
  groups: [/* group */ string, /* pattern */ string][];
  defaultLocale: string;
  locales?: string[];
  defaultGroup: string;
  publicDir: string;
};

export type Config = {
  nextFbt: NextFbtConfig;
  i18n: NextConfig['i18n'] & {
    // Default locale must be specified.
    defaultLocale: string;
  };
};
