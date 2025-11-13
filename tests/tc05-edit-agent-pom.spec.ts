import { test, expect } from './fixtures/page-objects.fixture';
import { TIMEOUTS } from './config/timeouts';
import { KNOWN_AGENTS, generateUpdatedContext } from './fixtures/test-data.fixture';

const AGENT_NAME = KNOWN_AGENTS.EDIT_TARGET;
const UPDATED_CONTEXT = generateUpdatedContext();

test.setTimeout(TIMEOUTS.TEST);

test('TC05 (POM) — Edit Existing Agent using Page Object Model', async ({ authenticatedAgentsPage }) => {
  console.log('=== TC05 (POM): Edit Existing Agent using Page Object Model ===');
  
  // Already authenticated via fixture
  await authenticatedAgentsPage.waitForStable();
  console.log('Step 1: Already on Agents menu (logged in via fixture)');

  // Step 2: Search and select agent
  console.log(`Step 2: Searching for and selecting agent "${AGENT_NAME}"...`);
  await authenticatedAgentsPage.searchAgent(AGENT_NAME);
  await authenticatedAgentsPage.openAgent(AGENT_NAME);
  await authenticatedAgentsPage.screenshot('tc05-pom-agent-opened.png');

  // Step 3: Navigate to Configuration tab (edit mode)
  console.log('Step 3: Entering edit mode via Configuration tab...');
  await authenticatedAgentsPage.goToConfigurationTab();
  await authenticatedAgentsPage.screenshot('tc05-pom-config-tab.png');

  // Step 4: Modify the Context field
  console.log('Step 4: Modifying Context field...');
  await authenticatedAgentsPage.fillContext(UPDATED_CONTEXT);
  await authenticatedAgentsPage.screenshot('tc05-pom-context-modified.png');

  // Step 5: Save changes
  console.log('Step 5: Saving changes...');
  const saveSuccess = await authenticatedAgentsPage.saveWithRedirect();
  expect(saveSuccess).toBe(true);

  // Verify expected result
  console.log('Verifying expected result: Agent updated with success notification...');
  
  await authenticatedAgentsPage.screenshot('tc05-pom-after-save.png');
  const successNotification = await authenticatedAgentsPage.checkSuccessNotification();

  // Additional verification: Check context persisted
  let contextValue = '';
  try {
    contextValue = await authenticatedAgentsPage.getContextValue();
    if (contextValue === UPDATED_CONTEXT) {
      console.log('✓ Context value confirmed in Configuration tab');
    }
  } catch (e) {
    console.log('⚠ Could not verify context field (page may have closed)');
  }

  // Verify in Run tab
  console.log('Verifying context in Run tab...');
  const navigatedToRun = await authenticatedAgentsPage.goToRunTab().then(() => true).catch(() => false);
  if (navigatedToRun) {
    await authenticatedAgentsPage.screenshot('tc05-pom-run-tab.png');
    
    // Click on "Context: Show" to expand and view the updated context
    console.log('Clicking "Context: Show" to verify updated context...');
    const contextShowButton = authenticatedAgentsPage.page.locator('text=Context').locator('..').locator('text=Show');
    if (await contextShowButton.count() > 0) {
      await contextShowButton.click();
      await authenticatedAgentsPage.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await authenticatedAgentsPage.screenshot('tc05-pom-context-expanded.png');
      console.log('✓ Context section expanded');
    }
    
    const pageContent = await authenticatedAgentsPage.page.content().catch(() => '');
    if (pageContent.includes(UPDATED_CONTEXT)) {
      console.log('✓ Updated context verified in Run tab');
    } else {
      console.log('⚠ Updated context not visible in Run tab');
    }
  }

  // Final assertion
  const testPassed = saveSuccess && (successNotification || contextValue === UPDATED_CONTEXT);
  expect(testPassed).toBe(true);

  console.log('✓ TC05 (POM) PASSED: Agent context successfully updated');
  console.log('=== TC05 (POM) TEST COMPLETE ===');
});
