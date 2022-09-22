import getConfig from 'next/config';
import { Config, toFbtLocale } from 'next-fbt-core';

const { publicRuntimeConfig } = getConfig();

const nextFbt: Config['i18n'] = publicRuntimeConfig.__NEXT_FBT__;

export const config = {
  ...nextFbt,
  defaultLocale: toFbtLocale(nextFbt.defaultLocale),
};
