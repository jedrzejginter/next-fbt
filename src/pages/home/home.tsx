import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useState } from 'react';
import { FbtProps, withFbtIntl, getFbts } from './lib';
import { useNextFbt } from './lib-react';

const Component = dynamic(() => import('./comp').then(getFbts), { ssr: false });

function HomePage(p: FbtProps) {
  const [count, setCount] = useState(1);
  const name = 'Adam';

  const { locale, setLocale } = useNextFbt();

  return (
    <>
      <Head>
        <title>{locale + ' | Home'}</title>
      </Head>
      {count > 2 && <Component />}
      <select onChange={(e) => setLocale(e.target.value)} value={locale}>
        {['pl_PL', 'en_US', 'es_ES'].map((localeOption) => (
          <option key={localeOption} value={localeOption}>
            <fbt desc="locale enum">
              <fbt:enum enum-range={['pl_PL', 'en_US', 'es_ES']} value={localeOption} />
            </fbt>
          </option>
        ))}
      </select>
      <fbt desc="dupa">Welcome 1234!</fbt>
      <button onClick={() => setCount((x) => x + 1)}>+</button>
      <fbt desc="siema">
        <fbt:plural count={count} showCount="ifMany">
          pig
        </fbt:plural>
      </fbt>
      <br />
      <fbt desc="say hello">
        hello, dear <fbt:param name="imie">{name}</fbt:param>
      </fbt>
      <p>Hello, world!</p>
    </>
  );
}

export default HomePage;

export const { getServerSideProps } = withFbtIntl({ filepath: import.meta.url });
