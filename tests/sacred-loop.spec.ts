import { test, expect } from '@playwright/test';

// Explicitly use the authenticated storage state for this spec
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('The Sacred Loop Skeleton', () => {
    test('Standard Ritual Flow', async ({ page }) => {
        // 1. Dashboard — wait for hydration to settle before interacting
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Sanity check: confirm we are NOT on the login page
        console.log('Current URL:', page.url());
        await expect(page).toHaveURL(/.*dashboard/);

        const startBtn = page.getByRole('button', { name: /start/i });
        await expect(startBtn).toBeVisible();

        // ── Aesthetic Assertions: Brand compliance for btn-primary ──
        // Color: seal-rust (#8F270D = rgb(143, 39, 13))
        await expect(startBtn).toHaveCSS('background-color', 'rgb(143, 39, 13)');
        // Typography: Libre Baskerville (our serif font, applied via font-serif class)
        await expect(startBtn).toHaveCSS('font-family', /Libre Baskerville/);
        // Size: text-xl applied inline on dashboard btn = 20px
        await expect(startBtn).toHaveCSS('font-size', '20px');
        // Layout: full-width class applied
        await expect(startBtn).toHaveClass(/w-full/);

        await startBtn.click();

        // 2. Active Session — log URL to catch unexpected redirects
        await page.waitForTimeout(1000);
        console.log('URL after Start click:', page.url());
        await expect(page).toHaveURL(/\/session\/active/);
        await page.waitForLoadState('networkidle');

        const endBtn = page.getByRole('button', { name: /end session/i });
        await expect(endBtn).toBeVisible();
        await endBtn.click();

        // 3. Reflection — session data must be present in sessionStorage
        await expect(page).toHaveURL(/\/session\/reflection/);
        await page.waitForLoadState('networkidle');

        await page.locator('textarea').first().fill('[Test Ritual] - Rebuilding from scratch.');
        const saveBtn = page.getByRole('button', { name: /save/i });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        // 4. Return to Dashboard
        await expect(page).toHaveURL('/dashboard');
    });
});
