import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel - set to false to avoid Supabase session conflicts */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. 
       Codespaces often prefer 127.0.0.1 over localhost. */
    baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Capture screenshot on failure to debug visual issues in Codespaces */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // --- 1. SETUP PROJECT ---
    // This runs your auth.setup.ts first to log in and save cookies.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // --- 2. MAIN BROWSER PROJECT ---
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Tell this project to use the signed-in state saved by the setup project
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'], // Ensures setup runs before tests
    },

    // --- 3. MOBILE BROWSER PROJECT ---
    // Useful for testing "Soft Geometry" responsiveness
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});