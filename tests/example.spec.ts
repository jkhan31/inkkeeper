import { test, expect } from '@playwright/test';

test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /inkkeeper/i })).toBeVisible();
});

test('forgot password flow is reachable', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /forgot password/i }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
});
