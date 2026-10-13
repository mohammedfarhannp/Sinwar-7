import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function SiteFooter() {
  return (
    <footer className="site-footer motif">
      <div className="site-footer-inner">
        <div className="footer-brand-group">
          <Link className="footer-brand" to="/">
            <Logo size={28} />
          </Link>
          <Link to="/about">About the campaign</Link>
        </div>
        <p>
          Operation Blockout is a community-led boycott campaign responding to
          the genocide in Gaza. Directory entries are usernames, not proof of an
          individual’s position or silence; check public statements yourself.
        </p>
        <p>
          This site is not affiliated with Instagram or Meta. Your Blockout list
          stays in this browser and does not change your Instagram account.
          Avatars are provided by <a href="https://unavatar.io">Unavatar</a>{' '}
          when available.
        </p>
        <span>Don’t reward silence with your attention.</span>
      </div>
    </footer>
  );
}
