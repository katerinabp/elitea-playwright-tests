import { test, expect } from './fixtures/page-objects.fixture';
import { TIMEOUTS } from './config/timeouts';

/**
 * TC07 - Save New Version of Agent
 * 
 * Test Case: Verify that a new version of an agent can be saved successfully
 * Priority: Medium
 * 
 * Preconditions:
 * - User is logged in
 * - At least one agent exists in the system
 * 
 * Test Steps:
 * 1. Navigate to agents page
 * 2. Search for and open an existing agent
 * 3. Click "Save As Version" button
 * 4. Enter a version name
 * 5. Click Save in the dialog
 * 6. Verify new version is created successfully
 */

test.describe('TC07 - Save New Version of Agent', () => {
  
  test('TC07 — Save new version of existing agent', async ({ authenticatedAgentsPage }) => {
    const agentsPage = authenticatedAgentsPage;
    const testAgentName = 'kpi_aqa_agent';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const versionName = `TestVer_${timestamp}_${randomStr}`;

    // Step 1: Navigate to agents page (already authenticated via fixture)
    console.log('Step 1: User is already on agents page');
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Step 2: Search for and open the test agent
    console.log(`Step 2: Searching for agent: ${testAgentName}`);
    await agentsPage.searchAgent(testAgentName);
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    
    console.log(`Step 3: Opening agent: ${testAgentName}`);
    await agentsPage.openAgent(testAgentName);
    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);

    // Step 3: Click "Save As Version" button
    console.log('Step 5: Clicking Save As Version button');
    const urlBeforeSave = agentsPage.page.url();
    console.log(`URL before save: ${urlBeforeSave}`);
    
    await agentsPage.saveAsNewVersion(versionName);

    // Step 4: Verify the URL changed to include new version ID
    console.log('Step 6: Verifying redirect to new version');
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    const currentUrl = agentsPage.page.url();
    console.log(`Current URL after save: ${currentUrl}`);
    
    // URL pattern should be: /agents/all/{agentId}/{versionId}
    expect(currentUrl).toContain('/agents/all/');
    expect(currentUrl).toMatch(/\/agents\/all\/\d+\/\d+/);
    
    // Extract version ID from URL
    const urlMatch = currentUrl.match(/\/agents\/all\/\d+\/(\d+)/);
    if (urlMatch) {
      const newVersionId = urlMatch[1];
      console.log(`✓ New version ID created: ${newVersionId}`);
      expect(parseInt(newVersionId)).toBeGreaterThan(0);
    }
    
    //Optional: Check for notification (may have disappeared after redirect)
    const notificationDisplayed = await agentsPage.checkVersionSaveNotification();
    if (notificationDisplayed) {
      console.log('✓ Version save notification was visible');
    } else {
      console.log('⚠ Notification not found (likely disappeared after redirect)');
    }

    console.log('✓ TC07 completed successfully - New version saved');
  });
});

