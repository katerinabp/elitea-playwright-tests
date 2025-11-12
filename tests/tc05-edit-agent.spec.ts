import { test, expect } from '@playwright/test';

// Allow overriding via env vars from CI, fallback to defaults for local run
const APP_URL = process.env.APP_URL || 'https://next.elitea.ai/alita_ui/agents/latest';
const USERNAME = process.env.TEST_USERNAME || 'alita@elitea.ai';
const PASSWORD = process.env.TEST_PASSWORD || 'rokziJ-nuvzo4-hucmih';
const AGENT_NAME = process.env.AGENT_NAME || 'kpi_aqa_agent';

// TC05: Edit Existing Agent Context
// Preconditions: User is logged in and agent exists
// Steps:
// 1) Navigate to the Agents menu
// 2) Select an agent
// 3) Click the Edit button (enter configuration)
// 4) Modify the Context field
// 5) Click Save button
// Expected: Agent is updated with new context and user is notified with a success message

test.describe('TC05 - Edit Existing Agent Context', () => {
  test('should update agent context and show success message', async ({ page }) => {
    // Go to application
    await page.goto(APP_URL);

    // Handle Nexus auth login
    await page.getByLabel('Username or email').fill(USERNAME);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for Agents page
    await expect(page.getByRole('heading', { name: /Agents/i })).toBeVisible({ timeout: 20000 });

    // Search agent by name and open
    await page.getByRole('textbox', { name: /search/i }).fill(AGENT_NAME);
    // Some UIs render list items as buttons or links; try clickable roles in order
    const agentClickable =
      page.getByRole('link', { name: AGENT_NAME })
        .or(page.getByRole('button', { name: AGENT_NAME }))
        .or(page.getByText(AGENT_NAME).first());
    await agentClickable.click();

    // Navigate to Configuration
    await page.getByRole('tab', { name: /Configuration/i }).click();

    // Fill Guidelines/Context text area
    const newContext = 'Updated Test Context';
    await page.getByLabel(/Guidelines for the AI agent/i).fill(newContext);

    // Save changes
    await page.getByRole('button', { name: /Save/i }).click();

    // Validate success message
    await expect(page.getByText(/The agent has been updated/i)).toBeVisible({ timeout: 10000 });

    // Validate the field reflects new value
    await expect(page.getByLabel(/Guidelines for the AI agent/i)).toHaveValue(newContext);

    // Logout
    await page.getByRole('button', { name: /User profile/i }).click();
    await page.getByRole('menuitem', { name: /Logout/i }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
