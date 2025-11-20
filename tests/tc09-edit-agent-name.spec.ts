import { test, expect } from './fixtures/page-objects.fixture';
import { TIMEOUTS } from './config/timeouts';
import { KNOWN_AGENTS } from './fixtures/test-data.fixture';

/**
 * TC09 - Edit Agent Name
 * 
 * Test Case: Verify that an existing agent's name can be successfully edited
 * Priority: Critical
 * Type: Positive Scenario - Edit Agent
 * 
 * Preconditions:
 * - User is logged in
 * - Agent "EPMXYZ-6010_Test_Edit" exists in the system
 * 
 * Test Steps:
 * 1. Search for existing agent
 * 2. Open the agent for editing
 * 3. Navigate to Configuration tab
 * 4. Update the agent name with timestamp
 * 5. Save changes
 * 6. Verify the updated name is displayed
 */

test.describe('TC09 - Edit Agent Name', () => {
  
  test('TC09 — Edit Agent Name', async ({ authenticatedAgentsPage }) => {
    test.setTimeout(120000); // 2 minutes timeout
    
    const agentsPage = authenticatedAgentsPage;
    const originalName = KNOWN_AGENTS.EDIT_TARGET; // "EPMXYZ-6010_Test_Edit"
    const timestamp = Date.now();
    const updatedName = `${originalName}_${timestamp}`;

    console.log('\n=== TC09: Edit Agent Name ===\n');
    
    // Step 1: Search for the agent
    console.log(`Step 1: Searching for agent "${originalName}"...`);
    await agentsPage.searchAgent(originalName);
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    console.log(`✓ Search completed for: ${originalName}`);
    
    // Step 2: Open the agent for editing
    console.log(`Step 2: Opening agent "${originalName}" for editing...`);
    await agentsPage.openAgent(originalName);
    console.log('✓ Agent opened');
    await agentsPage.screenshot('tc09-agent-opened.png');
    
    // Step 3: Navigate to Configuration tab
    console.log('Step 3: Navigating to Configuration tab...');
    await agentsPage.goToConfigurationTab();
    console.log('✓ Configuration tab opened');
    await agentsPage.screenshot('tc09-config-tab.png');
    
    // Step 4: Update the agent name
    console.log(`Step 4: Updating agent name to "${updatedName}"...`);
    await agentsPage.fillName(updatedName);
    console.log('✓ Name updated');
    await agentsPage.screenshot('tc09-name-updated.png');
    
    // Step 5: Save changes
    console.log('Step 5: Saving changes...');
    const saveSuccess = await agentsPage.saveWithRedirect();
    expect(saveSuccess).toBe(true);
    console.log('✓ Changes saved');
    await agentsPage.screenshot('tc09-after-save.png');
    
    // Step 6: Verify the updated name is displayed
    console.log('Step 6: Verifying updated name...');
    
    // Check success notification
    const notification = await agentsPage.checkSuccessNotification();
    if (notification) {
      console.log('✓ Success notification displayed');
    }
    
    // Navigate back to agents list to verify name change
    await agentsPage.navigateToAgentsList();
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    
    // Search for the agent with updated name
    await agentsPage.searchAgent(updatedName);
    const agentExists = await agentsPage.isAgentInList(updatedName);
    expect(agentExists).toBe(true);
    console.log(`✓ Agent found with updated name: ${updatedName}`);
    await agentsPage.screenshot('tc09-verification.png');
    
    // Cleanup: Delete the agent with updated name
    console.log('Cleanup: Deleting test agent...');
    await agentsPage.deleteAgent(updatedName);
    console.log('✓ Test agent deleted');
    
    console.log('✓ TC09 PASSED: Agent name successfully updated');
    console.log('=== TC09 TEST COMPLETE ===\n');
  });
});
