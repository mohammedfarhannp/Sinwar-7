import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationPanel } from './NavigationPanel';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
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
      previousFocus?.focus();
    };
  }, [isMenuOpen]);

  return (
    <div className="app-root">
      <SiteHeader
        onMenuOpen={() => setIsMenuOpen(true)}
        menuButtonRef={menuButtonRef}
      />
      <div className="app-frame">
        <main className="main-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <aside className="desktop-sidebar" aria-label="Sidebar">
          <NavigationPanel />
        </aside>
      </div>
      <SiteFooter />

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
