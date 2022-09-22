import { Provider, FbtProps } from 'next-fbt';
import { AppProps } from 'next/app';

function NextApp({ Component, pageProps }: AppProps & { pageProps: FbtProps }) {
  return (
    <Provider {...pageProps}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default NextApp;
