import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    pool: 'threads',
    include: ['src/**/*.test.ts', 'api/**/*.test.ts', 'server/**/*.test.ts'],
  },
});
