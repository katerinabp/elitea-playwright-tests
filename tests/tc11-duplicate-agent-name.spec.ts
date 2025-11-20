import { test, expect } from './fixtures/page-objects.fixture';
import { TIMEOUTS } from './config/timeouts';
import { createTestAgent } from './fixtures/test-data.fixture';

/**
 * TC11 - Duplicate Agent Name Validation
 * 
 * Test Case: Verify that the system prevents creating agents with duplicate names
 * Priority: Critical
 * Type: Negative Scenario - Validation
 * 
 * Preconditions:
 * - User is logged in
 * 
 * Test Steps:
 * 1. Create a new agent with a unique name
 * 2. Navigate back to agents list
 * 3. Attempt to create another agent with the same name
 * 4. Verify error message is displayed
 * 5. Verify Save button is disabled or creation is prevented
 * 6. Cleanup: Delete the test agent
 */

test.describe('TC11 - Duplicate Agent Name Validation', () => {
  
  test('TC11 — Duplicate Agent Name Validation', async ({ authenticatedAgentsPage }) => {
    test.setTimeout(180000); // 3 minutes timeout
    
    const agentsPage = authenticatedAgentsPage;
    const testAgent = createTestAgent();

    console.log('\n=== TC11: Duplicate Agent Name Validation ===\n');
    
    // Step 1: Create the first agent
    console.log(`Step 1: Creating agent with name "${testAgent.name}"...`);
    await agentsPage.createAgent(testAgent);
    console.log(`✓ First agent created: ${testAgent.name}`);
    await agentsPage.screenshot('tc11-first-agent-created.png');
    
    // Wait for page to fully stabilize before navigating
    await agentsPage.page.waitForTimeout(TIMEOUTS.LONG);
    
    // Step 2: Navigate back to agents list
    console.log('Step 2: Navigating back to agents list...');
    await agentsPage.navigateToAgentsList();
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    console.log('✓ Back to agents list');
    
    // Step 3: Attempt to create another agent with the same name
    console.log(`Step 3: Attempting to create duplicate agent with name "${testAgent.name}"...`);
    await agentsPage.clickCreateAgent();
    await agentsPage.screenshot('tc11-create-form-opened.png');
    
    // Fill the same name
    await agentsPage.fillName(testAgent.name);
    if (testAgent.description) {
      await agentsPage.fillDescription(testAgent.description);
    }
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await agentsPage.screenshot('tc11-duplicate-name-entered.png');
    
    // Step 4: Verify error message or validation
    console.log('Step 4: Verifying validation error...');
    
    // Check if Save button is disabled
    const saveDisabled = await agentsPage.isSaveButtonDisabled();
    console.log(`Save button disabled: ${saveDisabled}`);
    
    // Check for validation error message
    const hasError = await agentsPage.checkValidationError();
    console.log(`Validation error shown: ${hasError}`);
    
    await agentsPage.screenshot('tc11-validation-error.png');
    
    // Step 5: Verify creation is prevented
    console.log('Step 5: Verifying duplicate creation is prevented...');
    
    if (!saveDisabled && !hasError) {
      // If no explicit error, try to save and check for error
      await agentsPage.saveButton.click().catch(() => {});
      await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
      
      const errorAfterSave = await agentsPage.checkValidationError();
      console.log(`Error after save attempt: ${errorAfterSave}`);
      expect(errorAfterSave).toBe(true);
    } else {
      // Save button should be disabled OR error should be shown
      const preventionWorking = saveDisabled || hasError;
      expect(preventionWorking).toBe(true);
      console.log('✓ Duplicate prevention working correctly');
    }
    
    await agentsPage.screenshot('tc11-prevention-verified.png');
    
    // Cancel the duplicate creation attempt
    console.log('Canceling duplicate creation...');
    await agentsPage.cancelButton.click().catch(() => {});
    await agentsPage.page.waitForTimeout(TIMEOUTS.SHORT);
    
    // Step 6: Cleanup - Delete the original agent
    console.log('Step 6: Cleanup - Deleting test agent...');
    await agentsPage.navigateToAgentsList();
    await agentsPage.searchAgent(testAgent.name);
    await agentsPage.deleteAgent(testAgent.name);
    console.log('✓ Test agent deleted');
    
    console.log('✓ TC11 PASSED: Duplicate agent name validation working correctly');
    console.log('=== TC11 TEST COMPLETE ===\n');
  });
});
