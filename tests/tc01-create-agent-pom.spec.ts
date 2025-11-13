import { test, expect } from './fixtures/page-objects.fixture';
import { TIMEOUTS } from './config/timeouts';
import { createAgentForCreation } from './fixtures/test-data.fixture';

// Test data using factory
const testAgent = createAgentForCreation();

test.setTimeout(TIMEOUTS.TEST);

test('TC01 (POM) — Create Agent using Page Object Model', async ({ authenticatedAgentsPage }) => {
  console.log('=== TC01 (POM): Create Agent using Page Object Model ===');
  
  // The page is already authenticated via fixture
  await authenticatedAgentsPage.waitForStable();
  
  // Create agent using page object methods
  await authenticatedAgentsPage.createAgent(testAgent);

  // Wait for creation
  await authenticatedAgentsPage.waitForStable(TIMEOUTS.NAVIGATION);
  await authenticatedAgentsPage.screenshot('agent-created.png');

  // Verify success notification
  const hasNotification = await authenticatedAgentsPage.checkSuccessNotification();
  console.log(`Success notification shown: ${hasNotification}`);

  // Navigate back to agents list
  await authenticatedAgentsPage.goto(authenticatedAgentsPage.getUrl().split('/agents/all')[0] + '/agents/all');
  await authenticatedAgentsPage.waitForStable();

  // Search and verify agent appears in list
  await authenticatedAgentsPage.searchAgent(testAgent.name);
  await authenticatedAgentsPage.screenshot('agents-list.png');

  const agentInList = await authenticatedAgentsPage.verifyAgentInList(testAgent.name);
  expect(agentInList).toBe(true);

  console.log('✓ TC01 (POM) PASSED: Agent created successfully using Page Object Model');
  console.log('=== TC01 (POM) TEST COMPLETE ===');
});
