import { createContext, useCallback, useContext, useMemo } from 'react';
import { IntlVariations, init, FbtTranslations } from 'fbt';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { FbtProps, DEFAULT_LOCALE, fetchForDynamicComponenents, toFbtLocale } from './lib';

const viewerContext = {
  GENDER: IntlVariations.GENDER_UNKNOWN as const,
  locale: DEFAULT_LOCALE,
};

const Context = createContext<{
  locale: string;
  setLocale: (newLocale: string) => void;
}>({
  locale: viewerContext.locale,
  setLocale: () => {},
});

function Provider(
  // Using Partial<..> here, because those props won't exist
  // if page is not using getServerSideProps or is 404 page.
  props: Partial<FbtProps>,
) {
  const router = useRouter();
  const locale = router.locale?.replace('-', '_') || DEFAULT_LOCALE;

  const isInitRef = useRef(false);
  const localeRef = useRef(locale);

  if (locale !== localeRef.current) {
    console.log('Merging', props);
    localeRef.current = locale;

    viewerContext.locale = locale;
    FbtTranslations.mergeTranslations(props.__FBT_PROPS__?.translations ?? {});
  }

  if (!isInitRef.current) {
    isInitRef.current = true;
    viewerContext.locale = locale;

    init({
      translations: props.__FBT_PROPS__?.translations ?? {},
      hooks: {
        getViewerContext: () => viewerContext,
      },
    });
  }

  const setLocale = useCallback(
    async (newLocale: string) => {
      const { pathname, asPath, query } = router;

      await fetchForDynamicComponenents(toFbtLocale(newLocale));

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

  return <Context.Provider {...props} value={memoizedValue} />;
}

function useNextFbt() {
  return useContext(Context);
}

export { Provider, useNextFbt };
