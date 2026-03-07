import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill in the login form — inputs use placeholder text, not labels
    await page.getByPlaceholder('Email').fill(process.env.TEST_USER_EMAIL!);
    await page.getByPlaceholder('Password').fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for redirect to dashboard, confirming successful authentication
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // Save the authenticated browser state (cookies + localStorage)
    await page.context().storageState({ path: authFile });
});
