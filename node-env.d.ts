import type { FunctionComponent, SVGProps } from 'react';

declare namespace NodeJS {
  // For explanation of env variables check out '.env.example'.
  interface ProcessEnv {
    API_URL_OR_PATHNAME: string;
    SENTRY_DSN?: string;
  }
}

declare module '*.svg' {
  const content: FunctionComponent<SVGProps<SVGElement>>;
  export default content;
}
