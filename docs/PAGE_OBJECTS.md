# Page Object Model (POM) Documentation

## Overview

This project uses the Page Object Model pattern to organize test code and make it more maintainable. Page Objects encapsulate page-specific locators and actions, making tests cleaner and easier to update.

## Structure

```
src/pages/
├── base.page.ts       # Base class with common functionality
├── login.page.ts      # Login page operations
├── agents.page.ts     # Agent management operations
└── home.page.ts       # (Legacy - to be updated)
```

## Base Page

`BasePage` provides common functionality for all page objects:

- Navigation helpers
- Screenshot utilities
- Safe click/fill operations
- Wait helpers

**Example:**
```typescript
export class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  
  async doSomething() {
    await this.waitForStable();
    await this.screenshot('my-action.png');
  }
}
```

## Login Page

Handles authentication flows:

```typescript
import { LoginPage } from '../src/pages/login.page';

const loginPage = new LoginPage(page);
await loginPage.goto('https://app.url');
await loginPage.login('user@email.com', 'password');
```

## Agents Page

Comprehensive agent management operations:

### Creating an Agent

```typescript
import { AgentsPage } from '../src/pages/agents.page';

const agentsPage = new AgentsPage(page);
await agentsPage.createAgent({
  name: 'My Agent',
  description: 'Agent description',
  context: 'Agent context/guidelines',
});
```

### Editing an Agent

```typescript
await agentsPage.editAgentContext('AgentName', 'New context value');
```

### Individual Operations

```typescript
// Search
await agentsPage.searchAgent('AgentName');

// Open agent
await agentsPage.openAgent('AgentName');

// Navigate tabs
await agentsPage.goToConfigurationTab();
await agentsPage.goToRunTab();

// Fill fields
await agentsPage.fillName('Agent Name');
await agentsPage.fillDescription('Description');
await agentsPage.fillContext('Context');

// Save
await agentsPage.clickSave();
// or with redirect handling
await agentsPage.saveWithRedirect();

// Verification
const hasNotification = await agentsPage.checkSuccessNotification();
const isInList = await agentsPage.verifyAgentInList('AgentName');
const isSaveDisabled = await agentsPage.isSaveButtonDisabled();
```

## Using Page Objects in Tests

### Option 1: With Page Object Fixture (Recommended)

```typescript
import { test, expect } from './fixtures/page-objects.fixture';

test('My test', async ({ authenticatedAgentsPage }) => {
  // Page is already authenticated
  await authenticatedAgentsPage.createAgent({
    name: 'Test Agent',
    description: 'Test',
  });
  
  const success = await authenticatedAgentsPage.checkSuccessNotification();
  expect(success).toBe(true);
});
```

### Option 2: Manual Instantiation

```typescript
import { test, expect } from '@playwright/test';
import { AgentsPage } from '../src/pages/agents.page';
import { login } from './fixtures/auth.fixture';

test('My test', async ({ page }) => {
  await login(page);
  
  const agentsPage = new AgentsPage(page);
  await agentsPage.createAgent({ name: 'Test' });
});
```

## Available Fixtures

### `loginPage`
LoginPage instance without authentication

### `agentsPage`
AgentsPage instance without authentication

### `authenticatedAgentsPage`
AgentsPage instance with automatic login (recommended)

## Benefits

1. **Centralized Locators**: Update selectors in one place
2. **Reusable Methods**: Common actions defined once
3. **Cleaner Tests**: Tests read like user stories
4. **Type Safety**: TypeScript provides autocomplete and type checking
5. **Error Handling**: Built-in safe operations
6. **Maintainability**: Changes to UI require updates in one file

## Example: Before vs After

### Before (Without POM)

```typescript
test('Create agent', async ({ page }) => {
  await page.click('button:has-text("+ Agent")');
  await page.fill('input[name="name"]', 'Test Agent');
  await page.fill('textarea[name="description"]', 'Description');
  await page.click('button:has-text("Save")');
  
  const notification = page.locator('.toast, [role="alert"]');
  await expect(notification).toBeVisible();
});
```

### After (With POM)

```typescript
test('Create agent', async ({ authenticatedAgentsPage }) => {
  await authenticatedAgentsPage.createAgent({
    name: 'Test Agent',
    description: 'Description',
  });
  
  const success = await authenticatedAgentsPage.checkSuccessNotification();
  expect(success).toBe(true);
});
```

## Migration Guide

To migrate existing tests to use Page Objects:

1. Import the page object fixture:
   ```typescript
   import { test, expect } from './fixtures/page-objects.fixture';
   ```

2. Use `authenticatedAgentsPage` fixture parameter

3. Replace direct page interactions with page object methods

4. See `tc01-create-agent-pom.spec.ts` and `tc05-edit-agent-pom.spec.ts` for examples

## Adding New Page Objects

1. Create new file in `src/pages/`
2. Extend `BasePage`
3. Define locators in constructor
4. Create action methods
5. Add to fixtures if needed

Example:
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class MyNewPage extends BasePage {
  readonly someButton: Locator;
  
  constructor(page: Page) {
    super(page);
    this.someButton = page.locator('button#myButton');
  }
  
  async clickSomeButton(): Promise<void> {
    await this.someButton.click();
  }
}
```
