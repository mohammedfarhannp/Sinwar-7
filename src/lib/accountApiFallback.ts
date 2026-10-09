let hasLoggedFallback = false;

export function logAccountApiFallback(): void {
  if (hasLoggedFallback) {
    return;
  }

  hasLoggedFallback = true;
  console.info('account_api_fallback');
}
