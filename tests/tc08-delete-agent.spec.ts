import { test, expect } from './fixtures/page-objects.fixture';
import { BASE_URL } from './test-constants';
import { TIMEOUTS } from './config/timeouts';
import { createAgentForDeletion, createTestAgent } from './fixtures/test-data.fixture';

/**
 * TC08 - Delete Existing Agent
 * 
 * Test Case: Verify that a user can successfully delete an existing agent
 * Priority: High
 * Type: Positive Scenario
 * Related: EPMXYZ-6010
 * 
 * Test Steps:
 * 1. Navigate to the Agents menu
 * 2. Select an agent
 * 3. Click the Delete button (via menu)
 * 4. Confirm deletion by entering agent name
 * 5. Verify success notification (optional)
 * 6. Verify agent is removed from the list
 */

test.describe('TC08 - Delete Existing Agent', () => {
  test('TC08 — Delete an existing agent and verify removal', async ({ authenticatedAgentsPage }) => {
    const agentsPage = authenticatedAgentsPage;
    
    // Test data - using test data factory
    const agentToDelete = createAgentForDeletion();

    console.log('\n=== TC08: Delete Existing Agent ===\n');

    // Step 1: Navigate to Agents menu (already handled by fixture)
    console.log('Step 1: Navigate to Agents menu');
    await expect(agentsPage.page).toHaveURL(BASE_URL);
    console.log('✓ On Agents page');

    // Pre-condition: Create an agent to delete
    console.log('\nPre-condition: Creating agent to delete...');
    await agentsPage.createAgent(agentToDelete);
    await agentsPage.page.waitForTimeout(TIMEOUTS.NAVIGATION);
    
    // Navigate back to agents list
    await agentsPage.goto(BASE_URL);
    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);
    
    // Verify agent was created
    const agentExists = await agentsPage.verifyAgentInList(agentToDelete.name);
    expect(agentExists).toBeTruthy();
    console.log(`✓ Agent created: ${agentToDelete.name}`);

    await agentsPage.screenshot('agent-created-before-delete.png');

    // Step 2 & 3 & 4: Select agent, click Delete, and confirm
    console.log('\nStep 2-4: Select agent, open delete dialog, and confirm deletion');
    await agentsPage.deleteAgent(agentToDelete.name);
    await agentsPage.screenshot('after-delete-confirmation.png');

    // Step 5: Check for success notification (optional - may redirect immediately)
    console.log('\nStep 5: Check for success notification');
    const hasNotification = await agentsPage.checkDeleteNotification();
    
    if (hasNotification) {
      console.log('✓ Delete notification displayed');
    } else {
      console.log('⚠ No delete notification found (may redirect immediately)');
    }

    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);

    // Navigate back to agents list if needed
    const currentUrl = agentsPage.page.url();
    if (!currentUrl.includes('/agents/all')) {
      console.log('Navigating back to agents list...');
      await agentsPage.goto(BASE_URL);
      await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);
    }

    await agentsPage.screenshot('agents-list-after-delete.png');

    // Step 6: Verify agent is removed from list
    console.log('\nStep 6: Verify agent removed from list');
    
    // Clear search if any
    const searchInput = agentsPage.searchInput;
    if (await searchInput.count() > 0) {
      await searchInput.first().clear();
      await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    }

    const agentRemoved = await agentsPage.verifyAgentNotInList(agentToDelete.name);
    expect(agentRemoved).toBeTruthy();
    console.log(`✓ Agent successfully removed: ${agentToDelete.name}`);

    console.log('\n=== TC08 Test Completed Successfully ===\n');
  });

  test('TC08 — Cancel agent deletion and verify agent remains', async ({ authenticatedAgentsPage }) => {
    const agentsPage = authenticatedAgentsPage;
    
    // Test data - using test data factory
    const agentToKeep = createTestAgent('CancelDeleteTest');

    console.log('\n=== TC08: Cancel Agent Deletion ===\n');

    // Pre-condition: Create an agent
    console.log('Pre-condition: Creating agent...');
    await agentsPage.createAgent(agentToKeep);
    await agentsPage.page.waitForTimeout(TIMEOUTS.NAVIGATION);
    
    // Navigate back to list
    await agentsPage.goto(BASE_URL);
    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);
    
    const agentExists = await agentsPage.verifyAgentInList(agentToKeep.name);
    expect(agentExists).toBeTruthy();
    console.log(`✓ Agent created: ${agentToKeep.name}`);

    // Step: Try to delete but cancel
    console.log('\nAttempting to delete agent (will cancel)...');
    await agentsPage.searchAgent(agentToKeep.name);
    await agentsPage.openAgent(agentToKeep.name);
    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);
    
    // Click menu and delete
    await agentsPage.menuButton.click();
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await agentsPage.deleteMenuItem.click();
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    
    // Cancel the deletion
    await agentsPage.cancelDeletion();
    await agentsPage.screenshot('after-cancel-delete.png');

    // Navigate back to agents list
    await agentsPage.goto(BASE_URL);
    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);

    // Verify agent still exists
    console.log('\nVerifying agent still exists...');
    const agentStillExists = await agentsPage.verifyAgentInList(agentToKeep.name);
    expect(agentStillExists).toBeTruthy();
    console.log(`✓ Agent still exists after cancel: ${agentToKeep.name}`);

    // Cleanup: Delete the agent for real
    console.log('\nCleanup: Deleting agent...');
    await agentsPage.deleteAgent(agentToKeep.name);
    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);

    console.log('\n=== TC08 Cancel Test Completed Successfully ===\n');
  });
});
