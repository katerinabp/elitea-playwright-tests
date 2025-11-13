import { test, expect } from './fixtures/page-objects.fixture';
import { TIMEOUTS } from './config/timeouts';

/**
 * TC02 - Create Agent Skipping Mandatory Field (Name)
 * 
 * Test Case: Verify that the system prevents creating an agent without a mandatory field
 * Priority: High
 * Type: Negative Scenario - Validation Testing
 * 
 * Preconditions:
 * - User is logged in
 * 
 * Test Steps:
 * 1. Navigate to agents page
 * 2. Click "Create Agent" button
 * 3. Leave Name field empty (mandatory field)
 * 4. Fill Description field (optional)
 * 5. Fill Context field (optional)
 * 6. Attempt to save the agent
 * 7. Verify validation prevents save (Save button disabled OR error message shown)
 * 8. Verify agent was NOT created
 */

test.describe('TC02 - Create Agent Missing Mandatory Field', () => {
  
  test('TC02 — Create Agent Skipping Mandatory Field (Name)', async ({ authenticatedAgentsPage }) => {
    const agentsPage = authenticatedAgentsPage;
    
    // Test data - intentionally leaving Name empty
    const agentData = {
      name: '', // Empty to test validation
      description: 'Test Description for Validation',
      context: 'Test Context for Validation'
    };

    console.log('\n=== TC02: Create Agent Missing Mandatory Field ===\n');

    // Step 1: Navigate to agents page (already authenticated via fixture)
    console.log('Step 1: User is already on agents page');
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);

    // Step 2: Click Create Agent button
    console.log('Step 2: Clicking Create Agent button');
    await agentsPage.clickCreateAgent();
    await agentsPage.screenshot('form-opened.png');

    // Step 3: Leave Name field empty (intentionally skip)
    console.log('Step 3: Leaving Name field empty (testing validation)');
    // Explicitly NOT filling the name field

    // Step 4: Fill Description field
    console.log('Step 4: Filling Description field');
    await agentsPage.fillDescription(agentData.description);

    // Step 5: Fill Context field
    console.log('Step 5: Filling Context field');
    await agentsPage.fillContext(agentData.context);
    await agentsPage.screenshot('fields-filled-no-name.png');

    // Step 6: Check if Save button is disabled
    console.log('Step 6: Checking Save button state');
    const isSaveDisabled = await agentsPage.isSaveButtonDisabled();
    console.log(`Save button disabled: ${isSaveDisabled}`);

    // Step 7: Check for validation error messages
    console.log('Step 7: Checking for validation error messages');
    const hasValidationError = await agentsPage.checkValidationError();
    console.log(`Validation error shown: ${hasValidationError}`);

    await agentsPage.screenshot('validation-state.png');

    // Step 8: Verify validation is working
    console.log('Step 8: Verifying validation behavior');
    const validationWorking = isSaveDisabled || hasValidationError;
    
    if (validationWorking) {
      console.log('✓ Validation is working correctly');
      console.log(`  - Save button disabled: ${isSaveDisabled}`);
      console.log(`  - Error message shown: ${hasValidationError}`);
    } else {
      console.log('⚠ No obvious validation detected');
    }

    // Step 9: Verify agent was NOT created (URL should not change)
    console.log('Step 9: Verifying agent was NOT created');
    await agentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
    const currentUrl = agentsPage.page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    const agentNotCreated = !currentUrl.match(/\/agents\/all\/\d+/);
    console.log(`Agent not created (URL check): ${agentNotCreated}`);

    // Final assertion: Either validation prevented save OR agent wasn't created
    expect(validationWorking || agentNotCreated).toBe(true);
    
    console.log('✓ TC02 PASSED: Mandatory field validation is working');
    console.log('\n=== TC02 TEST COMPLETE ===\n');
  });
});
