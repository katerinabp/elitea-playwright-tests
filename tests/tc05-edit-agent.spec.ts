import { test, expect } from '@playwright/test';

const APP_URL = 'https://next.elitea.ai/alita_ui/agents/latest';
const USERNAME = 'alita@elitea.ai';
const PASSWORD = 'rokziJ-nuvzo4-hucmih';
const AGENT_NAME = 'kpi_aqa_agent';

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
  test('should update agent context and show success message', async ({ page, context }) => {
    // Go to application
    await page.goto(APP_URL);

    // Handle Nexus auth login
    await page.getByLabel('Username or email').fill(USERNAME);
    await page.getByLabel('Password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for Agents page
    await expect(page.getByRole('heading', { name: /Agents/i })).toBeVisible({ timeout: 15000 });

    // Search agent by name and open
    await page.getByRole('textbox', { name: /search/i }).fill(AGENT_NAME);
    await page.getByRole('link', { name: AGENT_NAME }).click();

    // Navigate to Configuration
    await page.getByRole('tab', { name: /Configuration/i }).click();

    // Fill Guidelines/Context text area
    const newContext = 'Updated Test Context';
    await page.getByLabel(/Guidelines for the AI agent/i).fill(newContext);

    // Save changes
    await page.getByRole('button', { name: /Save/i }).click();

    // Validate success message
    await expect(page.getByText('The agent has been updated')).toBeVisible();

    // Validate the field reflects new value
    await expect(page.getByLabel(/Guidelines for the AI agent/i)).toHaveValue(newContext);

    // Logout
    await page.getByRole('button', { name: /User profile/i }).click();
    await page.getByRole('menuitem', { name: /Logout/i }).click();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
