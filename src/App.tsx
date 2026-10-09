import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AppShell } from './components/AppShell';
import { ThemeProvider } from './hooks/useTheme';
import { AboutPage } from './pages/AboutPage';
import { BlockedPage } from './pages/BlockedPage';
import { DonatePage } from './pages/DonatePage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { StoryPage } from './pages/StoryPage';
import { StoresAppsPage } from './pages/StoresAppsPage';
import { features } from './config/features';

export default function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </ThemeProvider>
  );
}
