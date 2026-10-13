import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function NotFoundPage() {
  return (
    <section className="content-page" aria-labelledby="not-found-title">
      <Logo size={40} withWordmark={false} />
      <p className="eyebrow">404 · Lost in the blockout</p>
      <h1 id="not-found-title">This page isn’t in the directory.</h1>
      <p className="page-description">
        Check the address or head back to Operation Blockout.
      </p>
      <Link className="primary-button inline-button" to="/">
        Go home
      </Link>
    </section>
  );
}
