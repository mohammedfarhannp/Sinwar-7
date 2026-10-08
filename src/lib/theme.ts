export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'sinwar7:theme';

export function resolveInitialTheme(
  storedTheme: string | null,
  prefersDark: boolean,
): Theme {
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return prefersDark ? 'dark' : 'light';
}
