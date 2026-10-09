import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PageMetadata } from './PageMetadata';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { NavigationPanel } from './NavigationPanel';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function AppShell() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if (
        isMenuOpen ||
        (!event.metaKey && !event.ctrlKey) ||
        event.altKey ||
        event.key.toLowerCase() !== 'k'
      ) {
        return;
      }

      event.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>(
        '[data-account-search]',
      );

      if (searchInput) {
        searchInput.focus();
        searchInput.select();
        return;
      }

      navigate('/search');
      window.requestAnimationFrame(() => {
        const nextSearchInput = document.querySelector<HTMLInputElement>(
          '[data-account-search]',
        );
        nextSearchInput?.focus();
      });
    }

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [isMenuOpen, navigate]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousFocus = menuButtonRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) {
        return;
      }

      const focusableItems = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled)',
        ),
      );
      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (!firstItem || !lastItem) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previousFocus?.focus();
    };
  }, [isMenuOpen]);

  return (
    <div className="app-root">
      <PageMetadata />
      <div className="app-shell-content" aria-hidden={isMenuOpen}>
        <SiteHeader
          isMenuOpen={isMenuOpen}
          onMenuOpen={() => setIsMenuOpen(true)}
          menuButtonRef={menuButtonRef}
        />
        <div className="app-frame">
          <main className="main-content" id="main-content" tabIndex={-1}>
            <RouteErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback />}>
                <Outlet />
              </Suspense>
            </RouteErrorBoundary>
          </main>
          <aside className="desktop-sidebar" aria-label="Sidebar">
            <NavigationPanel />
          </aside>
        </div>
        <SiteFooter />
      </div>

      {isMenuOpen && (
        <div className="drawer-layer">
          <button
            type="button"
            className="drawer-scrim"
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside
            ref={drawerRef}
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            id="mobile-navigation"
          >
            <div className="drawer-header">
              <h2 id="mobile-menu-title">Menu</h2>
              <button
                ref={closeButtonRef}
                type="button"
                className="icon-button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <NavigationPanel onNavigate={() => setIsMenuOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
