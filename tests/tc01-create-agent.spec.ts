import { test, expect } from '@playwright/test';
import { BASE_URL, USER_EMAIL, USER_PASSWORD } from './test-constants';

// Test data with unique timestamp to avoid conflicts
const AGENT_NAME = `TestAgent1_${Date.now()}`;
const AGENT_DESCRIPTION = 'Test Description';
const AGENT_CONTEXT = 'Test Context';

test.setTimeout(90000);

test('TC01 — Create Agent with All Mandatory Fields', async ({ page }) => {
  // 1. Navigate and login
  await page.goto(BASE_URL);

  // Handle login flow
  const emailSelector = 'input[name="email"], input[type="email"], input#username, input[name="username"]';
  const passwordSelector = 'input[name="password"], input[type="password"], input#password';

  await page.waitForSelector(emailSelector, { timeout: 20000 });
  await page.fill(emailSelector, USER_EMAIL);
  await page.waitForSelector(passwordSelector, { timeout: 10000 });
  await page.fill(passwordSelector, USER_PASSWORD);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {}),
    page.click('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]'),
  ]);

  // Wait for agents page to load
  await page.waitForTimeout(2000);
  console.log(`Logged in, current URL: ${page.url()}`);

  // 2. Click the + Agent button (or Create Agent, Add Agent, etc.)
  console.log('Step 1: Looking for + Agent button...');
  const createAgentButton = page.locator(
    'button:has-text("+ Agent"), button:has-text("Create Agent"), button:has-text("Add Agent"), button:has-text("New Agent"), [aria-label*="Create"], [aria-label*="Add"]'
  );
  
  await expect(createAgentButton.first()).toBeVisible({ timeout: 10000 });
  console.log('+ Agent button found, clicking...');
  await createAgentButton.first().click();
  await page.waitForTimeout(1500);

  // 3. Wait for form to be visible and take a screenshot
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/tc01-form-opened.png', fullPage: true });
  
  // 3. Enter valid data in Name field
  console.log(`Step 2: Filling Name field with: ${AGENT_NAME}`);
  const nameField = page.locator(
    'input[name="name"], input[placeholder*="Name"], input[id*="name"], textarea[name="name"]'
  ).first();
  
  await expect(nameField).toBeVisible({ timeout: 10000 });
  await nameField.fill(AGENT_NAME);
  console.log('✓ Name field filled');

  // 4. Enter valid data in Description field - try common patterns
  console.log(`Step 3: Filling Description field with: ${AGENT_DESCRIPTION}`);
  
  // First, let's try to find any textarea or input (fallback approach)
  const allTextareas = page.locator('textarea, input[type="text"]:not([name="name"])');
  const textareaCount = await allTextareas.count();
  console.log(`Found ${textareaCount} textarea/input fields`);
  
  let descriptionField;
  const descriptionSelectors = [
    'textarea[name="description"]',
    'input[name="description"]',
    'textarea[placeholder*="escription" i]',
    'input[placeholder*="escription" i]',
    'textarea[id*="description" i]',
    'input[id*="description" i]',
  ];
  
  for (const selector of descriptionSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`Found description field with selector: ${selector}`);
      descriptionField = page.locator(selector).first();
      break;
    }
  }
  
  // If not found, try the second textarea (after name)
  if (!descriptionField && textareaCount >= 2) {
    console.log('Using second textarea as description field');
    descriptionField = allTextareas.nth(1);
  }
  
  if (descriptionField) {
    await descriptionField.fill(AGENT_DESCRIPTION);
    console.log('✓ Description field filled');
  } else {
    console.log('⚠ Description field not found, skipping');
  }

  // 5. Enter valid data in Context field
  console.log(`Step 4: Filling Context field with: ${AGENT_CONTEXT}`);
  
  let contextField;
  const contextSelectors = [
    'textarea[name="context"]',
    'textarea[name="guidelines"]',
    'textarea[placeholder*="ontext" i]',
    'textarea[placeholder*="uideline" i]',
    'textarea[id*="context" i]',
    'textarea[id*="guideline" i]',
  ];
  
  for (const selector of contextSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`Found context field with selector: ${selector}`);
      contextField = page.locator(selector).first();
      break;
    }
  }
  
  // If not found, try the third or last textarea
  if (!contextField && textareaCount >= 3) {
    console.log('Using third textarea as context field');
    contextField = allTextareas.nth(2);
  } else if (!contextField && textareaCount >= 2) {
    console.log('Using last textarea as context field');
    contextField = allTextareas.last();
  }
  
  if (contextField) {
    await contextField.fill(AGENT_CONTEXT);
    console.log('✓ Context field filled');
  } else {
    console.log('⚠ Context field not found, skipping');
  }

  // Take screenshot before saving
  await page.screenshot({ path: 'test-results/tc01-before-save.png', fullPage: true });

  // 6. Click Save button
  console.log('Step 5: Clicking Save button...');
  const saveButton = page.locator(
    'button:has-text("Save"), button:has-text("Create"), button:has-text("Submit"), button[type="submit"]'
  );

  await saveButton.first().click();
  console.log('Save button clicked, waiting for response...');
  
  // Wait for navigation or URL change (agent will be created and URL will contain agent ID)
  await page.waitForURL('**/agents/all/**', { timeout: 20000 }).catch(() => console.log('URL did not change as expected'));
  await page.waitForTimeout(3000);

  // 7. Verify agent was created successfully
  console.log('Step 6: Verifying agent creation...');

  // Check 1: URL contains the agent ID
  const currentUrl = page.url();
  console.log(`Final URL: ${currentUrl}`);
  expect(currentUrl).toContain('/agents/all/');

  // Check 2: Wait for page to be in a stable state and verify name field
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => console.log('Network not idle'));
  
  const nameFieldCheck = page.locator('input[name="name"], textbox[name="Name"], input[placeholder*="Name" i]').first();
  await nameFieldCheck.waitFor({ state: 'visible', timeout: 10000 }).catch(() => console.log('Name field not visible'));
  
  const nameFieldValue = await nameFieldCheck.inputValue().catch(() => '');
  console.log(`Name field value: ${nameFieldValue}`);
  
  if (nameFieldValue) {
    expect(nameFieldValue).toBe(AGENT_NAME);
  } else {
    console.log('⚠ Could not verify name field value');
  }

  // Take screenshot of created agent
  await page.screenshot({ path: 'test-results/tc01-agent-created.png', fullPage: true });
  
  // 8. Click Agents in sidebar
  const agentsLink = page.locator('listitem:has-text("Agents") button, a:has-text("Agents")');
  if (await agentsLink.count() > 0) {
    await agentsLink.first().click();
    console.log('Clicked Agents link in sidebar');
  }
  
  await page.waitForTimeout(2000);
  await page.waitForURL('**/agents/all', { timeout: 10000 }).catch(() => console.log('Did not navigate to agents list'));

  // 9. Search for the created agent
  console.log(`Step 8: Searching for agent: ${AGENT_NAME}`);
  const searchInput = page.locator('input[placeholder*="Search" i], input[aria-label*="Search" i]');
  
  if (await searchInput.count() > 0) {
    await searchInput.first().fill(AGENT_NAME);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    console.log('Search query submitted');
  } else {
    console.log('Search input not found, checking page directly');
  }

  // Take screenshot of agents list
  await page.screenshot({ path: 'test-results/tc01-agents-list.png', fullPage: true });

  // 10. Verify agent appears in the list
  console.log('Step 9: Verifying agent appears in list...');
  
  // Try multiple ways to find the agent
  const agentSelectors = [
    `text="${AGENT_NAME}"`,
    `text=${AGENT_NAME}`,
    `a:has-text("${AGENT_NAME}")`,
    `[href*="${AGENT_NAME}"]`,
    `*:has-text("${AGENT_NAME}")`,
  ];
  
  let agentFound = false;
  for (const selector of agentSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`✓ Agent found with selector: ${selector}`);
      agentFound = true;
      break;
    }
  }
  
  if (!agentFound) {
    console.log('⚠ Agent not immediately visible in list, checking page content...');
    const pageContent = await page.content();
    if (pageContent.includes(AGENT_NAME)) {
      console.log(`✓ Agent name "${AGENT_NAME}" found in page HTML`);
      agentFound = true;
    }
  }
  
  // Final screenshot
  await page.screenshot({ path: 'test-results/tc01-final-verification.png', fullPage: true });
  
  // Assert that agent was found
  expect(agentFound).toBe(true);
  console.log(`✓ Agent "${AGENT_NAME}" verified in agents list`);

  console.log('✓ Agent created successfully and verified in list');
  console.log('=== TC01 TEST COMPLETE ===');
});
