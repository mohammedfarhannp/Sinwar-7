import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ThemeProvider } from './hooks/useTheme';
import { AboutPage } from './pages/AboutPage';
import { BlockedPage } from './pages/BlockedPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/search"
              element={
                <PlaceholderPage
                  title="Search"
                  description="Search and profile cards are planned for Phase 2."
                />
              }
            />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/blocked" element={<BlockedPage />} />
            <Route
              path="/story"
              element={
                <PlaceholderPage
                  title="Palestinian story"
                  description="The educational timeline is planned for Phase 5."
                />
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
