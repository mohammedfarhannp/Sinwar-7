function isFeatureEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true';
}

export const features = {
  donate: isFeatureEnabled(import.meta.env.VITE_ENABLE_DONATE),
  storesApps: isFeatureEnabled(import.meta.env.VITE_ENABLE_STORES_APPS),
} as const;
