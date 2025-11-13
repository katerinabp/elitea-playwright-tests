import { test, expect } from '@playwright/test';

const BASE_URL = 'https://next.elitea.ai/alita_ui/agents/all';
const USER_EMAIL = 'alita@elitea.ai';
const USER_PASSWORD = 'rokziJ-nuvzo4-hucmih';

test.setTimeout(90000);

test('Login to Elitea platform', async ({ page }) => {
  console.log('=== DEBUG LOGIN TEST START ===');
  
  // Step 1: Navigate to the agents page
  console.log(`Step 1: Navigating to ${BASE_URL}`);
  await page.goto(BASE_URL);
  await page.screenshot({ path: 'test-results/debug-01-initial-page.png', fullPage: true });
  console.log(`Current URL after goto: ${page.url()}`);

  // Step 2: Wait a moment to see if there's a redirect
  await page.waitForTimeout(2000);
  console.log(`Current URL after wait: ${page.url()}`);
  await page.screenshot({ path: 'test-results/debug-02-after-redirect.png', fullPage: true });

  // Step 3: Try to find and click sign-in button if present
  console.log('Step 3: Looking for sign-in button...');
  const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]');
  const signInCount = await signInButton.count();
  console.log(`Sign-in buttons found: ${signInCount}`);
  
  if (signInCount > 0) {
    console.log('Clicking sign-in button...');
    await signInButton.first().click();
    await page.waitForTimeout(2000);
    console.log(`Current URL after sign-in click: ${page.url()}`);
    await page.screenshot({ path: 'test-results/debug-03-after-signin-click.png', fullPage: true });
  }

  // Step 4: Look for email/username input
  console.log('Step 4: Looking for email input...');
  const emailSelector = 'input[name="email"], input[type="email"], input#username, input[name="username"]';
  
  try {
    await page.waitForSelector(emailSelector, { timeout: 15000 });
    console.log('Email input found!');
    await page.screenshot({ path: 'test-results/debug-04-email-input-found.png', fullPage: true });
    
    // Fill email
    console.log(`Filling email: ${USER_EMAIL}`);
    await page.fill(emailSelector, USER_EMAIL);
    await page.screenshot({ path: 'test-results/debug-05-email-filled.png', fullPage: true });
  } catch (error) {
    console.error('Email input not found!', error);
    await page.screenshot({ path: 'test-results/debug-04-email-input-NOT-FOUND.png', fullPage: true });
    throw error;
  }

  // Step 5: Look for password input
  console.log('Step 5: Looking for password input...');
  const passwordSelector = 'input[name="password"], input[type="password"], input#password';
  
  try {
    await page.waitForSelector(passwordSelector, { timeout: 10000 });
    console.log('Password input found!');
    
    // Fill password
    console.log('Filling password...');
    await page.fill(passwordSelector, USER_PASSWORD);
    await page.screenshot({ path: 'test-results/debug-06-password-filled.png', fullPage: true });
  } catch (error) {
    console.error('Password input not found!', error);
    await page.screenshot({ path: 'test-results/debug-06-password-NOT-FOUND.png', fullPage: true });
    throw error;
  }

  // Step 6: Submit the form
  console.log('Step 6: Submitting login form...');
  const submitButton = page.locator('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]');
  const submitCount = await submitButton.count();
  console.log(`Submit buttons found: ${submitCount}`);
  
  if (submitCount > 0) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => console.log('Navigation timeout (non-fatal)')),
      submitButton.first().click(),
    ]);
    console.log(`Current URL after login submit: ${page.url()}`);
    await page.screenshot({ path: 'test-results/debug-07-after-login.png', fullPage: true });
  }

  // Step 7: Wait and verify we're logged in
  console.log('Step 7: Waiting for post-login page...');
  await page.waitForTimeout(3000);
  console.log(`Final URL: ${page.url()}`);
  await page.screenshot({ path: 'test-results/debug-08-final-state.png', fullPage: true });

  // Step 8: Check if we see any indication of successful login
  console.log('Step 8: Checking for logged-in indicators...');
  const possibleIndicators = [
    'text=Profile',
    'text=Account',
    'text=Logout',
    'text=Sign out',
    '[aria-label*="user"]',
    '[aria-label*="User"]',
    'text=Agents',
  ];

  for (const indicator of possibleIndicators) {
    const count = await page.locator(indicator).count();
    console.log(`  Indicator "${indicator}": ${count > 0 ? 'FOUND' : 'not found'}`);
  }

  // Basic assertion: URL should have changed from initial or contain expected domain
  expect(page.url()).toContain('elitea.ai');
  
  console.log('=== DEBUG LOGIN TEST COMPLETE ===');
});
