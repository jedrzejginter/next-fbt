import { compose } from '@monteway/nextjs/config.js';
import * as envalid from 'envalid';
import { withNextFbt } from 'next-fbt/next';

import nextFbtConfig from './next-fbt.config.js';

import 'dotenv/config';

/**
 * @typedef {import('next').NextConfig} NextConfig
 */

const env = envalid.cleanEnv(process.env, {
  API_URL_OR_PATHNAME: envalid.str(),
});

/**
 * @type {NextConfig}
 */
const nextConfig = withNextFbt({
  reactStrictMode: true,

  // Don't expose information what server are we running.
  poweredByHeader: false,

  // Set some environment variables that will be inlined during build phase.
  env: {
    API_URL_OR_PATHNAME: env.API_URL_OR_PATHNAME,
  },

  // ESLint does not feel like something that should run as part of the build.
  // Instead we should run it before the build is done.
  eslint: {
    ignoreDuringBuilds: true,
  },

  i18n: nextFbtConfig.i18n,

  // Extend webpack config to add @svgr/webpack to be able to import svg files.
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});

console.log(nextConfig);

export default nextConfig;
