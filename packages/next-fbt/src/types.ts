import type { NextConfig } from 'next';

export type NextFbtConfig = {
  publicUrl: string;
  patterns: [string, string][];
};

export type Config = {
  i18n: NextConfig['i18n'] & {
    // Default locale must be specified.
    defaultLocale: string;
    // Additional object for this library.
    nextFbt: NextFbtConfig;
  };
};
