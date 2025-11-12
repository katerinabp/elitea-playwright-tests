import { test, expect } from '@playwright/test';
import { HomePage } from '../src/pages/home.page';

test('home page object: title contains Playwright', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  const title = await home.title();
  expect(title).toContain('Playwright');
});
