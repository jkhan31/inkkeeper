import { test, expect } from '@playwright/test';

test('debug buttons', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    console.log('Current URL:', page.url());

    const localStorageData = await page.evaluate(() => JSON.stringify(Object.keys(localStorage)));
    console.log('LocalStorage keys:', localStorageData);

    const sessionData = await page.evaluate(async () => {
        // We need to access the supabase client from the window or import it
        // Since it's a Next.js app, it might be tricky to access the exact same instance
        // but we can try to find it or check if it's on window
        return (window as any).supabase?.auth?.getSession?.() || "Supabase not on window";
    });
    console.log('Session from window.supabase:', JSON.stringify(sessionData));

    const bodyText = await page.innerText('body');
    console.log('Body includes "Start Reading":', bodyText.includes('Start Reading'));

    const buttons = await page.getByRole('button').all();
    console.log('Number of buttons:', buttons.length);
    for (const btn of buttons) {
        const text = await btn.innerText();
        console.log('Button text:', JSON.stringify(text));
    }
});
