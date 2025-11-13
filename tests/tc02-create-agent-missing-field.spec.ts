import { test, expect } from '@playwright/test';
import { BASE_URL, USER_EMAIL, USER_PASSWORD } from './test-constants';

// Test data - intentionally leaving Name empty
const AGENT_NAME = ''; // Empty to test validation
const AGENT_DESCRIPTION = 'Test Description';
const AGENT_CONTEXT = 'Test Context';

test.setTimeout(90000);

test('TC02 — Create Agent Skipping Mandatory Field (Name)', async ({ page }) => {
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

  // 2. Click the + Agent button
  console.log('Step 1: Looking for + Agent button...');
  const createAgentButton = page.locator(
    'button:has-text("+ Agent"), button:has-text("Create Agent"), button:has-text("Add Agent"), button:has-text("New Agent"), [aria-label*="Create"], [aria-label*="Add"]'
  );
  
  await expect(createAgentButton.first()).toBeVisible({ timeout: 10000 });
  console.log('+ Agent button found, clicking...');
  await createAgentButton.first().click();
  await page.waitForTimeout(2000);

  // Take screenshot of opened form
  await page.screenshot({ path: 'test-results/tc02-form-opened.png', fullPage: true });

  // 3. Leave Name field empty (intentionally skip filling it)
  console.log('Step 2: Leaving Name field empty...');
  
  // 4. Fill Description field
  console.log('Step 3: Filling Description field...');
  const allTextareas = page.locator('textarea, input[type="text"]');
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
  
  if (descriptionField) {
    await descriptionField.fill(AGENT_DESCRIPTION);
    console.log('✓ Description field filled');
  }

  // 5. Fill Context field
  console.log('Step 4: Filling Context field...');
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
  
  if (contextField) {
    await contextField.fill(AGENT_CONTEXT);
    console.log('✓ Context field filled');
  }

  // Take screenshot before attempting save
  await page.screenshot({ path: 'test-results/tc02-before-save.png', fullPage: true });

  // 6. Try to click Save button
  console.log('Step 5: Attempting to click Save button...');
  const saveButton = page.locator(
    'button:has-text("Save"), button:has-text("Create"), button:has-text("Submit"), button[type="submit"]'
  );

  // Check if Save button is disabled
  const isDisabled = await saveButton.first().isDisabled();
  console.log(`Save button disabled: ${isDisabled}`);

  if (!isDisabled) {
    await saveButton.first().click();
    console.log('Save button clicked');
    await page.waitForTimeout(2000);
  } else {
    console.log('✓ Save button is disabled (validation working)');
  }

  // 7. Verify error message or validation feedback
  console.log('Step 6: Checking for validation error messages...');
  
  const errorIndicators = [
    'text=required',
    'text=Required',
    'text=mandatory',
    'text=Mandatory',
    'text=cannot be empty',
    'text=must not be empty',
    'text=is required',
    '[role="alert"]',
    '.error',
    '.validation-error',
    '[aria-invalid="true"]',
  ];

  let errorFound = false;
  let errorMessage = '';
  
  for (const indicator of errorIndicators) {
    const count = await page.locator(indicator).count();
    if (count > 0) {
      const text = await page.locator(indicator).first().textContent();
      console.log(`✓ Validation error found: "${indicator}" - "${text}"`);
      errorMessage = text || indicator;
      errorFound = true;
      break;
    }
  }

  // Check if Name field has error styling or validation attribute
  const nameField = page.locator('input[name="name"], input[placeholder*="Name" i]').first();
  const hasErrorAttribute = await nameField.evaluate((el) => {
    return el.hasAttribute('aria-invalid') || el.classList.contains('error') || el.classList.contains('invalid');
  }).catch(() => false);
  
  if (hasErrorAttribute) {
    console.log('✓ Name field has error styling/attribute');
    errorFound = true;
  }

  // Take screenshot after validation
  await page.screenshot({ path: 'test-results/tc02-validation-error.png', fullPage: true });

  // 8. Verify Save button is disabled OR error message is shown
  console.log('Step 7: Verifying validation behavior...');
  const validationWorking = isDisabled || errorFound;
  
  if (validationWorking) {
    console.log('✓ Validation is working correctly');
    console.log(`  - Save button disabled: ${isDisabled}`);
    console.log(`  - Error message shown: ${errorFound}`);
    if (errorMessage) {
      console.log(`  - Error message: "${errorMessage}"`);
    }
  } else {
    console.log('⚠ No obvious validation detected, checking if agent was created...');
  }

  // 9. Verify agent was NOT created by checking URL hasn't changed
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  const agentNotCreated = !currentUrl.match(/\/agents\/all\/\d+/);
  console.log(`Agent not created (URL check): ${agentNotCreated}`);

  // Final assertion: Either validation prevented save OR agent wasn't created
  expect(validationWorking || agentNotCreated).toBe(true);
  
  console.log('✓ TC02 PASSED: Mandatory field validation is working');
  console.log('=== TC02 TEST COMPLETE ===');
});
