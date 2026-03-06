import { test as setup, expect } from '@playwright/test';

// This matches the storageState path in your config
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    const password = process.env.TEST_USER_PASSWORD;
    if (!password) {
        throw new Error('Missing TEST_USER_PASSWORD environment variable for Playwright auth setup');
    }

    // 1. Visit Login
    await page.goto('/login');

    // 2. Perform Handshake
    // Using your dev email: jasonkhanani+inkdev@gmail.com
    await page.locator('input[type="email"]').fill('jasonkhanani+inkdev@gmail.com');

    // Ensure TEST_USER_PASSWORD is in your .env.local
    await page.locator('input[type="password"]').fill(password);

    await page.getByRole('button', { name: /sign in/i }).click();

    // 3. Verify Landing
    // We wait for the dashboard to ensure the session is fully active before saving
    await expect(page).toHaveURL('/dashboard');

    // 4. Freeze the Session
    // This saves cookies and localStorage to the JSON file
    await page.context().storageState({ path: authFile });
});