import { compose } from '@monteway/nextjs/config.js';
import { withSentryConfig } from '@sentry/nextjs';
import * as envalid from 'envalid';

import 'dotenv/config';

/**
 * @typedef {import('next').NextConfig} NextConfig
 * @typedef {import('@sentry/nextjs/types/config/types').WebpackConfigFunction} WebpackConfigFunction
 */

const env = envalid.cleanEnv(process.env, {
  API_URL_OR_PATHNAME: envalid.str(),
  SENTRY_DSN: envalid.str({ default: undefined }),

  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-environment-variables
  SENTRY_AUTH_TOKEN: envalid.str({ default: undefined }),
  SENTRY_ORG: envalid.str({ default: 'monterail' }),
  SENTRY_PROJECT: envalid.str({ default: undefined }),
  SENTRY_URL: envalid.str({ default: undefined }),
});

/** @type {boolean} */
const hasAllSentryCliEnvs = [
  env.SENTRY_DSN,
  env.SENTRY_URL,
  env.SENTRY_ORG,
  env.SENTRY_PROJECT,
  env.SENTRY_AUTH_TOKEN,
].every((sentryEnvVar) => typeof sentryEnvVar === 'string');

/**
 * @type {NextConfig & { webpack: WebpackConfigFunction }}
 */
const nextConfig = {
  reactStrictMode: true,

  // Don't expose information what server are we running.
  poweredByHeader: false,

  // Set some environment variables that will be inlined during build phase.
  env: {
    API_URL_OR_PATHNAME: env.API_URL_OR_PATHNAME,
    SENTRY_DSN: env.SENTRY_DSN,
  },

  // ESLint does not feel like something that should run as part of the build.
  // Instead we should run it before the build is done.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Extend webpack config to add @svgr/webpack to be able to import svg files.
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Conditionally disable uploading source maps to Sentry on build.
  sentry: {
    disableServerWebpackPlugin: !hasAllSentryCliEnvs,
    disableClientWebpackPlugin: !hasAllSentryCliEnvs,
    hideSourceMaps: true,
  },
};

export default compose(nextConfig, [
  (config) => {
    if (env.SENTRY_DSN) {
      return withSentryConfig(nextConfig, { silent: true });
    }

    return config;
  },
]);
