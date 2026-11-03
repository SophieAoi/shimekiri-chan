import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths let the build run from any sub-path, e.g. GitHub Pages.
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    // Node 25's built-in localStorage global would otherwise shadow jsdom's.
    execArgv: ['--no-experimental-webstorage'],
  },
});
