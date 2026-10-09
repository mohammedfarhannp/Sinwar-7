import { Link, NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { features } from '../config/features';

interface NavigationPanelProps {
  onNavigate?: () => void;
}

function linkClassName(isActive: boolean): string {
  return `navigation-link${isActive ? ' navigation-link-active' : ''}`;
}

export function NavigationPanel({ onNavigate }: NavigationPanelProps) {
  const { pathname } = useLocation();
  const isProfileRoute = pathname.startsWith('/profile/');
  const isSearchContext = pathname === '/search' || isProfileRoute;

  return (
    <div className="navigation-content">
      <p className="navigation-label">Explore</p>
      <nav aria-label="Main navigation" className="navigation-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) => linkClassName(isActive)}
          onClick={onNavigate}
        >
          <span aria-hidden="true">⌂</span>
          <span>Home</span>
        </NavLink>
        <Link
          to="/search"
          className={linkClassName(isSearchContext)}
          aria-current={isSearchContext ? 'page' : undefined}
          onClick={onNavigate}
        >
          <span aria-hidden="true">⌕</span>
          <span>Search</span>
        </Link>
        <NavLink
          to="/blocked"
          className={({ isActive }) => linkClassName(isActive)}
          onClick={onNavigate}
        >
          <span aria-hidden="true">✓</span>
          <span>Blocked list</span>
        </NavLink>
        <NavLink
          to="/story"
          className={({ isActive }) => linkClassName(isActive)}
          onClick={onNavigate}
        >
          <span aria-hidden="true">◷</span>
          <span>Palestinian story</span>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => linkClassName(isActive)}
          onClick={onNavigate}
        >
          <span aria-hidden="true">ⓘ</span>
          <span>About & methodology</span>
        </NavLink>
      </nav>

      {(features.donate || features.storesApps) && (
        <>
          <div className="navigation-divider" />
          <p className="navigation-label">More</p>
          <nav aria-label="More" className="navigation-links">
            {features.donate && (
              <NavLink
                to="/donate"
                className={({ isActive }) => linkClassName(isActive)}
                onClick={onNavigate}
              >
                <span aria-hidden="true">♡</span>
                <span>Donate</span>
              </NavLink>
            )}
            {features.storesApps && (
              <NavLink
                to="/stores-apps"
                className={({ isActive }) => linkClassName(isActive)}
                onClick={onNavigate}
              >
                <span aria-hidden="true">▦</span>
                <span>Stores & apps</span>
              </NavLink>
            )}
          </nav>
        </>
      )}

      <div className="navigation-divider" />
      <p className="navigation-label">Settings</p>
      <ThemeToggle />
    </div>
  );
}
