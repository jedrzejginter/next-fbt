import getConfig from 'next/config';
import { NextFbtInternalConfig, toFbtLocale } from 'next-fbt-core';

const { publicRuntimeConfig } = getConfig();

const nextFbt: NextFbtInternalConfig = publicRuntimeConfig.__NEXT_FBT__;

export const config = {
  ...nextFbt,
  defaultLocale: toFbtLocale(nextFbt.defaultLocale),
};
