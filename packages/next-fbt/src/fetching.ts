import type { GetServerSideProps, GetStaticProps } from 'next';
import { FbtLocale, toFbtLocale, getGroups } from 'next-fbt-core';
import { config } from './config';

export async function fetchTranslations({
  locale,
  namespaces,
}: {
  locale: FbtLocale;
  namespaces: string[];
}) {
  const results = await Promise.allSettled(
    (config.defaultLocale === locale ? [] : namespaces).map(async (namespace) => {
      const res = await fetch(`${config.nextFbt.publicUrl}/i18n/` + locale + `/${namespace}.json`, {
        method: 'GET',
      });

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

export type NextFbtProps = {
  __NEXT_FBT_PROPS__: {
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
): Promise<NextFbtProps> {
  const locale = toFbtLocale(ctx.locale || ctx.defaultLocale || config.defaultLocale);
  const namespaces = getGroups(input.filepath, config.nextFbt);

  const translations = await fetchTranslations({ locale, namespaces });

  return {
    __NEXT_FBT_PROPS__: {
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

  const getStaticProps: GetStaticProps = async (ctx) => ({
    props: await getProps(ctx, typeof input === 'string' ? { filepath: input } : input),
  });

  return { getStaticProps, getServerSideProps };
}

export function getTranslationsForComponent(input: string | { filepath: string }) {
  const translationsToFetch = getGroups(
    (typeof input === 'string' ? { filepath: input } : input).filepath,
    config.nextFbt,
  );

  return { translationsToFetch };
}

export function assignTranslations<TypeOfComponent extends object>(
  Component: TypeOfComponent,
  input: string | { filepath: string },
) {
  return Object.assign(Component, getTranslationsForComponent(input));
}
