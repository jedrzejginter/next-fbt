# next-fbt

Easily integrate FBT with Next.js apps.

## Useful links

- [`facebook/fbt` - a JavaScript internationalization framework](https://github.com/facebook/fbt)
- [`import.meta` - metadata of a JavaScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta#using_import.meta)

## Setup

1. Install.

   ```shell
   npm install next-fbt
   npm install -D next-fbt-cli next-fbt-babel
   ```

2. Create `next-fbt.config.js`.

   ```js
   /** @type {import('next-fbt').Config} */
   module.exports = {
     // Regular configuration for `i18n` key for Next's config.
     i18n: {
       // These are all the locales you want to support in
       // your application.
       locales: ['en-US', 'pl-PL', 'es-ES'],
       // This is the default locale you want to be used when visiting
       // a non-locale prefixed path e.g. `/hello`.
       defaultLocale: 'en-US',
       // Always use the locale that is specified in url
       // without redirecting to the one detected by the browser.
       localeDetection: false,
     },

     // Configuration for 'next-fbt' and 'next-fbt-cli'.
     nextFbt: {
       // The root url your want your translation
       // files to be served from.
       // The pathname of `publicUrl` (here `i18n`) determines
       // the directory name (inside ./public) where files with translations
       // will be put.
       publicUrl: 'http://localhost:3000/i18n',
       // Split translations by file path (relative to the CWD).
       // Must be array of [string, string[]].
       groups: [
         // Example:
         ['components', ['src/components/*']],
         ['home-page', ['pages/index.tsx']],
         ['other-pages', ['pages/*', 'src/pages/*']],

         // Above configuration will result in:
         // - all translations under "src/components" directory will land
         //   in 'public/i18n/<locale>/components.json
         // - all translations from "pages/index.tsx" file will land
         //   in 'public/i18n/<locale>/home-page.json
         // - all translations from "pages" directory (but not from "pages/index.tsx" file)
         //   will land in 'public/i18n/<locale>/other-pages.json
         // - translations from files that don't match any of above
         //   patterns will be extracted to 'public/i18n/<locale>/main.json'
       ],
     },
   };
   ```

3. Update Babel config.

```diff
module.exports = {
-  presets: ['next/babel'],
+  presets: ['next-fbt-babel/preset'],
+  plugins: ['next-fbt-babel/plugin'],
};
```

4. Wrap next config and pass options.

   ```js
   // next-config.js
   const { withNextFbtConfig } = require('next-fbt/config');
   const nextFbtConfig = require('./next-fbt.config');

   module.exports = withNextFbtConfig({
     i18n: nextFbtConfig.i18n,
     nextFbt: nextFbtConfig.nextFbt,

     // ^ you can also just `...nextFbtConfig`

     /* the rest of the config */
   });
   ```

   <details>
    <summary>I prefer `next.config` as ESM (native ES Module)</summary>

   > `next-fbt.config` still has to be a CommonJS

   ```tsx
   // next-config.mjs
   import { withNextFbtConfig } from 'next-fbt/config';
   import nextFbtConfig from './next-fbt.config.js';

   export default withNextFbtConfig({
     i18n: nextFbtConfig.i18n,
     nextFbt: nextFbtConfig.nextFbt,

     /* the rest of the config */
   });
   ```

   </details>

5. Wrap app with provider.

   ```tsx
   // pages/_app.tsx
   import { appWithNextFbt } from 'next-fbt';

   function App({ Component, pageProps }) {
     return <Component {...pageProps} />;
   }

   export default appWithNextFbt(App);
   ```

   <details>
    <summary>I don't have a custom app</summary>

   ```tsx
   // pages/_app.tsx
   import NextApp from 'next/app';

   export default appWithNextFbt(NextApp);
   ```

   </details>

   <details>
    <summary>I don't want to use higher-order component</summary>

   ```tsx
   // pages/_app.tsx
   import { NextFbtProvider } from 'next-fbt';

   function App({ Component, pageProps }) {
     // This is basically the same what `appWithNextFbt` does.
     return (
       <NextFbtProvider __NEXT_FBT_PROPS__={pageProps.__NEXT_FBT_PROPS__}>
         <Component {...pageProps} />
       </NextFbtProvider>
     );
   }

   export default App;
   ```

   </details>

6. Fetch translations for your page.

   _Notice, that for the translations to be fetched, the file you declare the fetching logic has to match any group from the config file._

   ```tsx
   import { getPropsFetcher } from 'next-fbt';

   export default function Page() {
     // your regular page component
   }

   export const { getServerSideProps } = getPropsFetcher(import.meta.url);
   ```

   <details>
    <summary>I don't want to use `getServerSideProps`</summary>

   ```diff
   // same as above

   - export const { getServerSideProps } = getPropsFetcher(import.meta.url);
   + export const { getStaticProps } = getPropsFetcher(import.meta.url);
   ```

   </details>

   <details>
    <summary>I already have my own `getServerSideProps` defined</summary>

   ```tsx
   import { getProps } from 'next-fbt';

   export function getServerSideProps(ctx) {
     // your logic for `yourProps`...

     const fbtProps = await getProps(ctx, import.meta.url);

     return {
       props: {
         ...fbtProps,
         ...yourProps,
       },
     };
   }
   ```

   </details>

## Lazy-loading for dynamic components

The library has first-class support for lazy loading of translations for dynamic components (via `next/dynamic`).

1. Replace `next/dynamic` with `next-fbt/dynamic`.

   This is a little wrapper around `next/dynamic` that fetches required translations for components that is going to be rendered.

   ```tsx
   // Notice that difference in the import source (`next/dynamic` => `next-fbt/dynamic`).
   import dynamic from 'next-fbt/dynamic';

   // Limitation: the wrapper can be used only with components that are rendered on the client.
   // If you wish to have SSR-rendered component, use regular `next/dynamic` and fetch translations
   // via `getServerSideProps` / `getStaticProps`.
   const Component = dynamic(() => import('/path/to/component'), { ssr: false });

   export function Page() {
     return (
       // The component will be rendered after translations are fetched.
       <Component />
     );
   }
   ```

2. Add a property on a component so `next-fbt/dynamic` knows what to fetch.

   _If you use `memo` or `forwardRef` the `assignTranslations` has to wrap the memoized/ forwarded component, since `memo` and `forwadRef` loose non-React properties on a component_.

   ```tsx
   import { assignTranslations } from 'next-fbt';

   export default function DynamicComponent() {
     return (/* some jsx */)
   }

   assignTranslations(DynamicComponent, import.meta.url);
   ```

## Collecting FBT's for translations

```shell
npx next-fbt-collect
```

This will output `.cache/next-fbt/source-strings.json` file which you can upload to translations service that supports translating FBT's (like Crowdin).

## Creating translation files

After you translate the source string to other languages, download the translations to `/path/to/downloaded` and run

```shell
npx next-fbt-translate /path/to/downloaded
```

This will create `public/i18n` directory with translation files.
