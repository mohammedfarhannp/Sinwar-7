import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer motif">
      <div className="site-footer-inner">
        <Link to="/about">About this list</Link>
        <p>
          This is a community-maintained list. It is not affiliated with
          Instagram or Meta. Verify information independently.
        </p>
        <span>Make your own choices, at your own pace.</span>
      </div>
    </footer>
  );
}
