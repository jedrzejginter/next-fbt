import { isErrorProps } from '@monteway/nextjs/error';
import type { AppProps } from '@monteway/nextjs/types';

import ErrorPage from './error';

function NextApp({ Component, pageProps }: AppProps) {
  /*
    Whenever we get an error we want to render error page instead of target page.
    To return error props from `getInitialProps` or `getServerSideProps`
    use `errorPropsResponse` from `@monteway/nextjs/error`.
  */
  if (isErrorProps(pageProps)) {
    return <ErrorPage statusCode={pageProps.statusCode} title={pageProps.error} />;
  }

  return <Component {...pageProps} />;
}

export default NextApp;
