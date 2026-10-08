import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="content-page" aria-labelledby="not-found-title">
      <p className="eyebrow">404 · Page not found</p>
      <h1 id="not-found-title">We couldn’t find that page.</h1>
      <p className="page-description">
        Check the address or return to the home page.
      </p>
      <Link className="primary-button inline-button" to="/">
        Go home
      </Link>
    </section>
  );
}
