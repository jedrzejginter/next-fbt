import { withFbtIntlComponent } from './lib';

export default function Component() {
  return (
    <div style={{ border: '1px solid black', padding: '2em' }}>
      <fbt desc="hello from lazy component">hi from lazy component</fbt>
    </div>
  );
}

export const { translationsToFetch } = withFbtIntlComponent(import.meta.url);
