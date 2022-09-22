import { toFbtLocale } from 'next-fbt-core';
import { config } from './config';
import { useNextFbt } from './context';

const locales = (config.locales || [config.defaultLocale]).map(toFbtLocale);

// This component is just for easy testing the integration.
// Consumers of next-fbt should implement their own select.
export function NextFbtLocaleSwitcher() {
  const { locale, setLocale } = useNextFbt();

  return (
    <select onChange={(evt) => setLocale(evt.target.value)} value={locale}>
      {locales.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
