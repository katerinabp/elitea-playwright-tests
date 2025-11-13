import { test, expect } from '@playwright/test';

const BASE_URL = 'https://next.elitea.ai/alita_ui/agents/latest';
const USER_EMAIL = 'alita@elitea.ai';
const USER_PASSWORD = 'rokziJ-nuvzo4-hucmih';
const AGENT_NAME = 'kpi_aqa_agent';
const UPDATED_CONTEXT = 'Updated Test Context';

test('TC05 — Edit Existing Agent: update Context / Guidelines', async ({ page }) => {
  // 1. Go to agents page
  await page.goto(BASE_URL);

  // 2. Log in
  await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
  await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]'),
  ]);

  // 3. Search for agent
  // Try common search selectors; adjust if app uses different attributes
  const searchLocator = page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[aria-label*="Search"]');
  if (await searchLocator.count()) {
    await searchLocator.fill(AGENT_NAME);
    await page.keyboard.press('Enter');
  } else {
    // fallback: find agent by visible text
  }
  await page.waitForTimeout(1000); // small wait for list to update

  // 4. Open the agent
  await page.click(`text=${AGENT_NAME}`);

  // 5. Go to Configuration tab (or equivalent)
  const configTab = page.locator('text=Configuration, text=Config, role=tab[name="Configuration"]');
  if (await configTab.count()) {
    await configTab.first().click();
  } else {
    // try a common nav approach
    await page.click('text=Configuration').catch(() => {});
  }

  // 6. Edit Guidelines / Context
  // Try label or placeholder text; adjust selector if needed
  const contextField =
    page.getByLabel('Guidelines for the AI agent')
    || page.getByLabel('Context')
    || page.locator('textarea[placeholder*="Guidelines"], textarea[placeholder*="Context"], textarea');

  await expect(contextField.first()).toBeVisible({ timeout: 5000 });
  await contextField.first().fill(UPDATED_CONTEXT);

  // 7. Click Save
  await Promise.all([
    page.waitForResponse(resp => resp.status() === 200 && resp.request().url().includes('/agents/')),
    page.click('button:has-text("Save"), button:has-text("Update")'),
  ]).catch(() => {
    // if waitForResponse didn't capture expected request, still proceed to wait for UI confirmation
  });

  // 8. Validate success alert
  const successToast = page.locator('text=The agent has been updated, text=updated, .toast, .notification');
  await expect(successToast.first()).toBeVisible({ timeout: 7000 });

  // 9. Validate that field now contains updated text
  await expect(contextField.first()).toHaveValue(UPDATED_CONTEXT);

  // 10. Log out
  // open profile menu and click logout; adjust selectors if app differs
  await page.click('button[aria-label="Open user menu"], text=Profile, text=Account').catch(() => {});
  await page.click('text=Sign out, text=Logout, text=Log out').catch(() => {});
  await page.waitForNavigation({ waitUntil: 'networkidle' });
});
