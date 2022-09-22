/** @type {import('next-fbt').Config} */
export default {
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ['en-US', 'pl-PL', 'es-ES'],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: 'en-US',
    localeDetection: false,

    nextFbt: {
      publicUrl: 'http://localhost:3000',
      patterns: [
        ['src/pages/home/comp.tsx', 'pages-comp'],
        ['src/pages/**/*', 'pages-$1'],
      ],
    },
  },
};
