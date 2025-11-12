import { test, expect } from '@playwright/test';

test('playwright site has Playwright in title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
