import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ThemeProvider } from './hooks/useTheme';
import { features } from './config/features';

const HomePage = lazy(() =>
  import('./pages/HomePage').then(({ HomePage: page }) => ({ default: page })),
);
const SearchPage = lazy(() =>
  import('./pages/SearchPage').then(({ SearchPage: page }) => ({
    default: page,
  })),
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(({ ProfilePage: page }) => ({
    default: page,
  })),
);
const BlockedPage = lazy(() =>
  import('./pages/BlockedPage').then(({ BlockedPage: page }) => ({
    default: page,
  })),
);
const StoryPage = lazy(() =>
  import('./pages/StoryPage').then(({ StoryPage: page }) => ({
    default: page,
  })),
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then(({ AboutPage: page }) => ({
    default: page,
  })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then(({ NotFoundPage: page }) => ({
    default: page,
  })),
);
const DonatePage = lazy(() =>
  import('./pages/DonatePage').then(({ DonatePage: page }) => ({
    default: page,
  })),
);
const StoresAppsPage = lazy(() =>
  import('./pages/StoresAppsPage').then(({ StoresAppsPage: page }) => ({
    default: page,
  })),
);

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/blocked" element={<BlockedPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            {features.donate && (
              <Route path="/donate" element={<DonatePage />} />
            )}
            {features.storesApps && (
              <Route path="/stores-apps" element={<StoresAppsPage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
