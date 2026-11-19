import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    viewport: { width: 1366, height: 850 },
    launchOptions: {
      ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
});
