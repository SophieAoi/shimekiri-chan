import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // e.g. PLAYWRIGHT_CHANNEL=chrome reuses an installed Chrome instead of a download.
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 740 }, hasTouch: true },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: true,
  },
});
