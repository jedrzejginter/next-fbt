import { NextResponse } from 'next/server';
import { v4 } from 'uuid';

/** Make sure CSP header content is a single line. */
function formatCSPHeader(arg: string): string {
  return arg.replace(/[\n ]+/g, ' ').trim();
}

/** Sets security headers. */
export function middleware() {
  const response = NextResponse.next();

  const nonce = v4();

  /*
    Consumed by our custom NextDocument.
    Setting this via http header seems to be the only option to pass this value between
    middleware and document component.
  */
  response.headers.set('x-nonce', nonce);

  /*
    Set security headers.
    We could set most of them inside next.config.js via 'headers()' property,
    but having them here is more convenient for development since changing the middleware
    does not require us to reload the development server.
  */
  response.headers.set('referrer-policy', 'no-referrer');
  response.headers.set('strict-transport-security', 'max-age=15552000; includeSubDomains');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-dns-prefetch-control', 'off');
  response.headers.set('x-download-options', 'noopen');
  response.headers.set('x-frame-options', 'SAMEORIGIN');
  response.headers.set('x-permitted-cross-domain-policies', 'none');
  response.headers.set('x-xss-protection', '1; mode=block');

  /*
    Set Content-Security-Policy header to allow only trusted resources.
    Extend this configuration whenever you and some 3rd party service to the stack.
  */
  response.headers.set(
    'content-security-policy',
    formatCSPHeader(`
      base-uri 'self';
      default-src 'self';
      connect-src 'self' https://*.ingest.sentry.io ${process.env['API_URL_OR_PATHNAME']};
      img-src 'self' data:;
      font-src 'self';
      frame-src 'self';
      object-src 'none';
      report-uri https://*.ingest.sentry.io;
      script-src 'self' 'unsafe-eval' 'nonce-${nonce}';
      style-src 'self' 'unsafe-inline';
    `),
  );

  return response;
}
