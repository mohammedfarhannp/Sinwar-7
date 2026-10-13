import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface SiteHeaderProps {
  isMenuOpen: boolean;
  onMenuOpen: () => void;
  menuButtonRef: RefObject<HTMLButtonElement>;
}

export function SiteHeader({
  isMenuOpen,
  onMenuOpen,
  menuButtonRef,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button
          ref={menuButtonRef}
          className="menu-button"
          type="button"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          aria-expanded={isMenuOpen}
        >
          <span aria-hidden="true">☰</span>
        </button>
        <Link className="brand" to="/">
          <Logo />
        </Link>
        <div className="header-actions">
          <span className="header-note">
            Boycott silence. Reclaim attention.
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
