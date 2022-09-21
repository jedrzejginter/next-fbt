import { FbtTranslations } from 'fbt';
import type { GetServerSideProps } from 'next';
import { getGroups } from './lib-utils';

export const DEFAULT_LOCALE = process.env['NEXT_PUBLIC_FBT_DEFAULT_LOCALE'] || 'en_US';

type FbtLocale = string & { __FBT_LOCALE__: never };
type NextLocale = string & { __NEXT_LOCALE__: never };

export function toFbtLocale(locale: string): FbtLocale {
  return locale.replace('-', '_') as FbtLocale;
}

export function toNextLocale(locale: string): NextLocale {
  return locale.replace('_', '-') as NextLocale;
}

async function fetchTranslations({
  locale,
  namespaces,
}: {
  locale: FbtLocale;
  namespaces: string[];
}) {
  const results = await Promise.allSettled(
    (DEFAULT_LOCALE === locale ? [] : namespaces).map(async (namespace) => {
      const res = await fetch(
        `${process.env['NEXT_PUBLIC_FBT_INTL_URL']}/intl/` + locale + `/${namespace}.json`,
        { method: 'GET' },
      );

      return await res.json();
    }),
  );

  const translations: Record<FbtLocale, any> = {};

  for (const result of results) {
    if (result.status === 'fulfilled') {
      translations[locale] = {
        ...translations[locale],
        ...result.value,
      };
    }
  }

  return translations;
}

export type FbtProps = {
  __FBT_PROPS__: {
    namespaces: string[];
    locale: string;
    translations: Record<string, Record<string, unknown>>;
  };
};

async function getProps(
  ctx: {
    defaultLocale?: string | undefined;
    locale?: string | undefined;
  },
  input: { filepath: string },
): Promise<FbtProps> {
  const locale = toFbtLocale(ctx.locale || ctx.defaultLocale || DEFAULT_LOCALE);
  const namespaces = getGroups(input.filepath);

  const translations = await fetchTranslations({ locale, namespaces });

  return {
    __FBT_PROPS__: {
      namespaces,
      locale,
      translations,
    },
  };
}

export function withFbtIntl(input: string | { filepath: string }) {
  const getServerSideProps: GetServerSideProps = async (ctx) => ({
    props: await getProps(ctx, typeof input === 'string' ? { filepath: input } : input),
  });

  return { getServerSideProps };
}

export function withFbtIntlComponent(input: string | { filepath: string }) {
  async function fetchTranslations(locale: string) {
    const props = await getProps(
      { locale },
      typeof input === 'string' ? { filepath: input } : input,
    );

    return props.__FBT_PROPS__.translations;
  }

  function translationsToFetch() {
    const namespaces = getGroups(
      (typeof input === 'string' ? { filepath: input } : input).filepath,
    );
    return namespaces;
  }

  return { fetchTranslations, translationsToFetch: translationsToFetch() };
}

const dynamicComponentsTranslationsFetchers: string[] = [];

export async function fetchForDynamicComponenents(locale: FbtLocale) {
  const ns = Array.from(new Set(dynamicComponentsTranslationsFetchers));

  const translations = await fetchTranslations({ locale, namespaces: ns });

  FbtTranslations.mergeTranslations(translations);
}

export async function getFbts<ResolvedModule extends { default: unknown }>(
  mod: ResolvedModule & {
    fetchTranslations?: Function;
    translationsToFetch?: string[];
    default: { fetchTranslations?: Function; translationsToFetch?: string[] };
  },
): Promise<ResolvedModule['default']> {
  // const translationsFetcher = mod.default?.fetchTranslations || mod.fetchTranslations;
  const translationsToFetch = mod.default?.translationsToFetch || mod.translationsToFetch;

  const { default: router } =
    typeof window === 'undefined' ? { default: undefined } : await import('next/router');

  // If we don't have router (when this is run on the server)
  // we don't fetch translations, since for server-rendered components
  // we should fetch translations within a page component.
  if (translationsToFetch && router) {
    // if (translationsFetcher && router) {

    // Translations from dynamic components won't be refetched when we change
    // the locale. So we want to save namespaces required by the dynamic component
    // and fetch those translations manually when changing the locale.
    dynamicComponentsTranslationsFetchers.push(...translationsToFetch);

    const translations = await fetchTranslations({
      namespaces: translationsToFetch,
      locale: toFbtLocale(router.locale || router.defaultLocale || DEFAULT_LOCALE),
    });

    FbtTranslations.mergeTranslations(translations);
  }

  return mod;
}
