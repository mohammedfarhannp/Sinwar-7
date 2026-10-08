import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface NavigationPanelProps {
  onNavigate?: () => void;
}

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `navigation-link${isActive ? ' navigation-link-active' : ''}`;

export function NavigationPanel({ onNavigate }: NavigationPanelProps) {
  return (
    <div className="navigation-content">
      <p className="navigation-label">Explore</p>
      <nav aria-label="Main navigation" className="navigation-links">
        <NavLink to="/" end className={linkClassName} onClick={onNavigate}>
          <span aria-hidden="true">⌂</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={linkClassName} onClick={onNavigate}>
          <span aria-hidden="true">⌕</span>
          <span>Search</span>
        </NavLink>
        <NavLink to="/blocked" className={linkClassName} onClick={onNavigate}>
          <span aria-hidden="true">✓</span>
          <span>Blocked list</span>
        </NavLink>
        <NavLink to="/story" className={linkClassName} onClick={onNavigate}>
          <span aria-hidden="true">◷</span>
          <span>Palestinian story</span>
        </NavLink>
        <NavLink to="/about" className={linkClassName} onClick={onNavigate}>
          <span aria-hidden="true">ⓘ</span>
          <span>About & methodology</span>
        </NavLink>
      </nav>

      <div className="navigation-divider" />
      <p className="navigation-label">More</p>
      <div className="navigation-links">
        <button className="navigation-link navigation-disabled" disabled>
          <span aria-hidden="true">♡</span>
          <span>Donate · coming soon</span>
        </button>
        <button className="navigation-link navigation-disabled" disabled>
          <span aria-hidden="true">▦</span>
          <span>Stores & apps · coming soon</span>
        </button>
      </div>

      <div className="navigation-divider" />
      <p className="navigation-label">Settings</p>
      <ThemeToggle />
    </div>
  );
}
