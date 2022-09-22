import { FbtTranslations } from 'fbt';
import { FbtLocale, toFbtLocale } from 'next-fbt-core';
import nextDynamic, { DynamicOptions, LoaderComponent } from 'next/dynamic';
import { config } from './config';
import { fetchTranslations } from './fetching';

const translationFilesFromDynamicComponents: string[] = [];

export async function fetchTranslationsForDynamicComponenents(locale: FbtLocale) {
  const files = Array.from(new Set(translationFilesFromDynamicComponents));

  const translations = await fetchTranslations({ locale, namespaces: files });

  FbtTranslations.mergeTranslations(translations);
}

export async function fetchTranslationsFromDynamicComponent<P>(mod: Awaited<LoaderComponent<P>>) {
  // I know, but pretty careful below :)
  const anyModule = mod as any;

  const translationsToFetch: string[] =
    anyModule?.default?.translationsToFetch ?? anyModule?.translationsToFetch ?? [];

  console.log(anyModule, translationsToFetch);

  const { default: router } =
    typeof window === 'undefined' ? { default: undefined } : await import('next/router');

  // If we don't have router (server-side)
  // we don't fetch translations, since for the server-rendered components
  // we should fetch translations via getServerSideProps/getStaticProps.
  if (translationsToFetch && router) {
    // Translations from dynamic components won't be refetched when we change
    // the locale. So we want to save namespaces required by the dynamic component
    // and fetch those translations manually when changing the locale.
    translationFilesFromDynamicComponents.push(...translationsToFetch);

    const translations = await fetchTranslations({
      namespaces: translationsToFetch,
      locale: toFbtLocale(router.locale || router.defaultLocale || config.defaultLocale),
    });

    FbtTranslations.mergeTranslations(translations);
  }

  return mod;
}

const dynamic = <Props>(loader: () => LoaderComponent<Props>, o: DynamicOptions<Props>) => {
  return nextDynamic<Props>(() => loader().then(fetchTranslationsFromDynamicComponent), o);
};

export default dynamic;
