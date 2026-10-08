import type { RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface SiteHeaderProps {
  onMenuOpen: () => void;
  menuButtonRef: RefObject<HTMLButtonElement>;
}

export function SiteHeader({ onMenuOpen, menuButtonRef }: SiteHeaderProps) {
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
        >
          <span aria-hidden="true">☰</span>
        </button>
        <Link className="brand" to="/" aria-label="Sinwar-7 home">
          <span className="brand-mark" aria-hidden="true">
            S7
          </span>
          <span>Sinwar-7</span>
        </Link>
        <div className="header-actions">
          <span className="header-note">A personal checklist</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
