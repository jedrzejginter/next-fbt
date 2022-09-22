import ErrorPage from './error';

export default function NotFoundPage() {
  return <ErrorPage statusCode={404} />;
}
