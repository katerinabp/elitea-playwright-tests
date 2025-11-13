import { test as base, Page } from '@playwright/test';
import { BASE_URL, USER_EMAIL, USER_PASSWORD } from '../test-constants';

/**
 * Performs login to the Elitea platform
 * @param page - Playwright Page object
 */
export async function login(page: Page) {
  console.log('Logging in...');
  await page.goto(BASE_URL);
  
  const emailSelector = 'input[name="email"], input[type="email"], input#username, input[name="username"]';
  const passwordSelector = 'input[name="password"], input[type="password"], input#password';

  await page.waitForSelector(emailSelector, { timeout: 20000 });
  await page.fill(emailSelector, USER_EMAIL);
  await page.waitForSelector(passwordSelector, { timeout: 10000 });
  await page.fill(passwordSelector, USER_PASSWORD);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {}),
    page.click('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]'),
  ]);
  
  await page.waitForTimeout(3000);
  console.log(`✓ Logged in successfully, current URL: ${page.url()}`);
}

/**
 * Extended test fixture that automatically logs in before each test
 * Usage: import { test, expect } from './fixtures/auth.fixture';
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
