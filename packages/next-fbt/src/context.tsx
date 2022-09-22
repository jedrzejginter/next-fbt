import {
  ComponentType,
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { IntlVariations, init, FbtTranslations } from 'fbt';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import type { NextFbtProps } from './fetching';
import { FbtLocale, toFbtLocale } from 'next-fbt-core';
import { config } from './config';
import { fetchTranslationsForDynamicComponenents } from './dynamic';

const viewerContext = {
  GENDER: IntlVariations.GENDER_UNKNOWN as const,
  locale: config.defaultLocale,
};

const NextFbtContext = createContext<{
  locale: FbtLocale;
  setLocale: (newLocale: string) => void;
}>({
  locale: viewerContext.locale,
  setLocale: () => {},
});

function NextFbtProvider(
  // Using Partial<..> here, because those props won't exist
  // if page is not using getServerSideProps or is 404 page.
  props: PropsWithChildren<Partial<NextFbtProps>>,
) {
  const router = useRouter();
  const locale = toFbtLocale(router.locale || config.defaultLocale);

  const isInitRef = useRef(false);
  const localeRef = useRef(locale);

  if (locale !== localeRef.current) {
    localeRef.current = locale;

    viewerContext.locale = locale;
    FbtTranslations.mergeTranslations(props.__NEXT_FBT_PROPS__?.translations ?? {});
  }

  if (!isInitRef.current) {
    isInitRef.current = true;
    viewerContext.locale = locale;

    init({
      translations: props.__NEXT_FBT_PROPS__?.translations ?? {},
      hooks: {
        getViewerContext: () => viewerContext,
      },
    });
  }

  const setLocale = useCallback(
    async (newLocale: string) => {
      const { pathname, asPath, query } = router;

      await fetchTranslationsForDynamicComponenents(toFbtLocale(newLocale));

      router.push({ pathname, query }, asPath, { locale: newLocale.replace('_', '-') });
    },
    [router],
  );

  const setLocaleRef = useRef(setLocale);
  setLocaleRef.current = setLocale;

  const memoizedValue = useMemo(() => {
    return {
      locale,
      setLocale: setLocaleRef.current,
    };
  }, [locale]);

  return <NextFbtContext.Provider {...props} value={memoizedValue} />;
}

function useNextFbt() {
  return useContext(NextFbtContext);
}

function appWithNextFbt<AppProps extends { pageProps: Record<string, any> }>(
  AppComponent: ComponentType<AppProps>,
) {
  return (props: AppProps) => {
    const propsForProvider: NextFbtProps['__NEXT_FBT_PROPS__'] | undefined =
      props?.pageProps?.['__NEXT_FBT_PROPS__'];

    return (
      <NextFbtProvider __NEXT_FBT_PROPS__={propsForProvider}>
        <AppComponent {...props} />
      </NextFbtProvider>
    );
  };
}

export { NextFbtProvider, appWithNextFbt, useNextFbt };
