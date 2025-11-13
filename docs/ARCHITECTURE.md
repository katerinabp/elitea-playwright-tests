# Test Framework Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ tc01.spec.ts │  │ tc05.spec.ts │  │ tc03.spec.ts │ ...  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  FIXTURE LAYER                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  page-objects.fixture.ts                               │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │ │
│  │  │ authenticatedAg  │  │ loginPage                │   │ │
│  │  │ entsPage         │  │ agentsPage               │   │ │
│  │  └────────┬─────────┘  └──────────────────────────┘   │ │
│  └───────────┼──────────────────────────────────────────── │ │
│              │                                              │ │
│  ┌───────────┼──────────────────────────────────────────┐  │
│  │  auth.fixture.ts   │                                 │  │
│  │  ┌─────────────────▼──────┐                          │  │
│  │  │ login(page)             │                          │  │
│  │  └─────────────────────────┘                          │  │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 PAGE OBJECT LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BasePage (base.page.ts)                             │   │
│  │    - waitForStable()                                 │   │
│  │    - screenshot()                                    │   │
│  │    - safeClick()                                     │   │
│  │    - safeFill()                                      │   │
│  └───────┬─────────────────────────────┬────────────────┘   │
│          │                             │                    │
│  ┌───────▼───────────┐         ┌───────▼────────────┐       │
│  │ LoginPage         │         │ AgentsPage         │       │
│  │  - login()        │         │  - createAgent()   │       │
│  │  - isLoginPage()  │         │  - editAgent()     │       │
│  └───────────────────┘         │  - searchAgent()   │       │
│                                │  - openAgent()     │       │
│                                │  - fillContext()   │       │
│                                │  - saveWithRedirect() │     │
│                                │  - checkSuccess()  │       │
│                                └────────────────────┘       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  HELPER LAYER                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  safe-actions.ts                                       │ │
│  │    - safeClick()                                       │ │
│  │    - safeFill()                                        │ │
│  │    - safeSaveWithRedirect()                            │ │
│  │    - waitForPageStable()                               │ │
│  │    - checkSuccessNotification()                        │ │
│  │    - safeNavigateToTab()                               │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               PLAYWRIGHT CORE                                │
│                  (Browser Automation)                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Test Execution Flow

```
User runs test
    │
    ├─> Test imports fixture
    │       │
    │       ├─> Fixture runs login() 
    │       │       │
    │       │       └─> LoginPage.login() navigates and fills form
    │       │
    │       └─> Fixture creates AgentsPage instance
    │
    ├─> Test uses AgentsPage methods
    │       │
    │       ├─> AgentsPage.createAgent()
    │       │       │
    │       │       ├─> Uses locators (centralized)
    │       │       ├─> Uses BasePage.safeClick()
    │       │       └─> Uses safe-actions helpers
    │       │
    │       └─> AgentsPage.checkSuccess()
    │
    └─> Test asserts results
```

### Example: Create Agent Flow

```
┌─────────────────────────────────────────────────┐
│ tc01-create-agent-pom.spec.ts                   │
│                                                 │
│  test('Create', async ({ authenticatedAgents   │
│                          Page }) => {            │
│    await authenticatedAgentsPage.createAgent({  │
│      name: 'Test',                              │
│      description: 'Desc'                        │
│    });                                          │
│  });                                            │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ page-objects.fixture.ts                         │
│                                                 │
│  authenticatedAgentsPage: async ({ page }) => { │
│    await login(page);      ◄───┐               │
│    return new AgentsPage(page); │               │
│  }                              │               │
└────────────────────────────┬────┼───────────────┘
                             │    │
                ┌────────────┘    │
                │                 │
                ▼                 │
┌─────────────────────────────────┼───────────────┐
│ agents.page.ts                  │               │
│                                 │               │
│  async createAgent(data) {      │               │
│    await this.clickCreateAgent(); │             │
│    await this.fillName(data.name); │            │
│    await this.fillDescription(data.desc); │     │
│    await this.clickSave();      │               │
│  }                              │               │
└────────────────────────────┬────┘               │
                             │                    │
                             ▼                    │
┌─────────────────────────────────────────────────┼─┐
│ base.page.ts                │                   │ │
│                             │                   │ │
│  async safeClick(locator) { │                   │ │
│    try {                    │                   │ │
│      await locator.click(); │                   │ │
│    } catch { ... }          │                   │ │
│  }                          │                   │ │
└────────────────────────────┬┘                   │ │
                             │                    │ │
                             ▼                    ▼ │
                    ┌────────────────────────────────┤
                    │ Playwright Browser Automation  │
                    └────────────────────────────────┘
```

## Component Responsibilities

### Tests (`tests/*.spec.ts`)
- **What**: Business logic and assertions
- **Responsibility**: Define WHAT to test
- **Should NOT**: Contain locators or direct page interactions

### Fixtures (`tests/fixtures/*.ts`)
- **What**: Setup and teardown
- **Responsibility**: Provide ready-to-use page instances
- **Should NOT**: Contain business logic

### Page Objects (`src/pages/*.ts`)
- **What**: Page-specific actions and locators
- **Responsibility**: Define HOW to interact with pages
- **Should NOT**: Contain test assertions

### Helpers (`tests/helpers/*.ts`)
- **What**: Reusable utilities
- **Responsibility**: Common operations across pages
- **Should NOT**: Be page-specific

### Config (`playwright.config.ts`)
- **What**: Global test settings
- **Responsibility**: Timeouts, browsers, reporters
- **Should NOT**: Contain test logic

## Benefits of This Architecture

| Layer | Before | After |
|-------|--------|-------|
| **Tests** | 50 lines, mixed concerns | 15 lines, pure logic |
| **Locators** | Duplicated everywhere | Centralized in Page Objects |
| **Login** | Copy-paste in each test | One fixture, auto-applied |
| **Errors** | Tests crash | Graceful handling |
| **Maintenance** | Update N files | Update 1 file |

## Example: Locator Maintenance

### Before (No POM)
```
Change "Save" button selector

Files to update:
✗ tc01-create-agent.spec.ts
✗ tc02-create-agent-missing.spec.ts  
✗ tc05-edit-agent.spec.ts
✗ ... 5 more files

Risk: Miss one, tests break
```

### After (With POM)
```
Change "Save" button selector

Files to update:
✓ agents.page.ts (1 line)

Risk: Zero - all tests use same locator
```

## Migration Example

### Old Style Test
```typescript
// ❌ Everything mixed together
test('Edit agent', async ({ page }) => {
  // Login (30 lines duplicated)
  await page.goto('https://...');
  await page.fill('input[name="email"]', 'user@email.com');
  // ... login code ...
  
  // Search (locators inline)
  await page.fill('input[placeholder="Search"]', 'AgentName');
  
  // Edit (fragile selectors)
  await page.click('text=AgentName');
  await page.click('text=Configuration');
  await page.fill('textarea', 'New context');
  await page.click('button:has-text("Save")');
  
  // Crashes if page redirects!
  await page.waitForTimeout(2000);
});
```

### New Style Test
```typescript
// ✅ Clean, maintainable, resilient
test('Edit agent', async ({ authenticatedAgentsPage }) => {
  await authenticatedAgentsPage.editAgentContext(
    'AgentName',
    'New context'
  );
  
  expect(
    await authenticatedAgentsPage.checkSuccessNotification()
  ).toBe(true);
});
```

**Result**: 40 lines → 7 lines (82% reduction)
