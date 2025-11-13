# Copilot Instructions for elitea-playwright-tests

## Project Overview
End-to-end test suite for the Elitea AI agent management platform using Playwright with TypeScript. Tests verify CRUD operations, validation, and filtering for AI agents.

**Framework Version**: 2.0 (November 2025)  
**Key Features**: Page Object Model, Authentication Fixtures, Safe Error Handling

## Architecture & Structure
- **`src/pages/`** - Page Object Models (POM) - **USE THESE**
  - `base.page.ts` - Common functionality for all pages
  - `login.page.ts` - Authentication operations
  - `agents.page.ts` - Agent CRUD operations (primary POM)
- **`tests/fixtures/`** - Test fixtures
  - `auth.fixture.ts` - Auto-login for tests
  - `page-objects.fixture.ts` - POM with authentication
- **`tests/helpers/`** - Utility functions
  - `safe-actions.ts` - Error-resilient operations
- **`tests/`** - Test specifications
  - `tc*-pom.spec.ts` - **NEW STYLE** (use Page Objects)
  - `tc*.spec.ts` - Legacy style (being migrated)
- **`docs/`** - Documentation
  - `PAGE_OBJECTS.md` - POM usage guide
  - `ARCHITECTURE.md` - System architecture
  - `IMPROVEMENTS_SUMMARY.md` - Framework v2.0 changes

## Critical Patterns

### Writing New Tests - USE PAGE OBJECT MODEL
**Always start new tests with this pattern:**
```typescript
import { test, expect } from './fixtures/page-objects.fixture';

test('TC## — Description', async ({ authenticatedAgentsPage }) => {
  // Already logged in, ready to test!
  await authenticatedAgentsPage.createAgent({
    name: `Agent_${Date.now()}`,
    description: 'Description',
    context: 'Context',
  });
  
  const success = await authenticatedAgentsPage.checkSuccessNotification();
  expect(success).toBe(true);
});
```

### Page Object Methods (AgentsPage)
- `createAgent(data)` - Full agent creation flow
- `editAgentContext(name, context)` - Edit existing agent
- `searchAgent(name)` - Search functionality
- `openAgent(name)` - Open agent details
- `goToConfigurationTab()` - Navigate to edit mode
- `fillContext(text)` - Update context field
- `saveWithRedirect()` - **Handles page close/redirect**
- `checkSuccessNotification()` - Verify success
- `verifyAgentInList(name)` - Verify in list

### Page Object Methods (AgentsPage)
- `createAgent(data)` - Full agent creation flow
- `editAgentContext(name, context)` - Edit existing agent
- `searchAgent(name)` - Search functionality
- `openAgent(name)` - Open agent details
- `goToConfigurationTab()` - Navigate to edit mode
- `fillContext(text)` - Update context field
- `saveWithRedirect()` - **Handles page close/redirect**
- `checkSuccessNotification()` - Verify success
- `verifyAgentInList(name)` - Verify in list

### DON'T Use Inline Locators Anymore
**❌ Old pattern (deprecated):**
```typescript
await page.click('button:has-text("+ Agent")');
await page.fill('input[name="name"]', 'Test');
```

**✅ New pattern (use Page Objects):**
```typescript
await authenticatedAgentsPage.clickCreateAgent();
await authenticatedAgentsPage.fillName('Test');
```

### Authentication - NO MANUAL LOGIN
Tests should **never** include manual login code. Use fixtures:
```typescript
// ❌ DON'T do this
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button:has-text("Sign in")');

// ✅ DO this instead
import { test } from './fixtures/page-objects.fixture';
test('My test', async ({ authenticatedAgentsPage }) => {
  // Already logged in!
});
```

### Error Handling - Safe Operations
Page redirects/closes after save don't crash tests:
```typescript
// ✅ Handles page close gracefully
const saved = await agentsPage.saveWithRedirect();
expect(saved).toBe(true);
```

### Legacy Patterns (Avoid in New Code)

#### Old Login Flow (Being Removed)
```typescript
// ❌ Don't copy this pattern
const emailSelector = 'input[name="email"], input[type="email"]...';
await page.waitForSelector(emailSelector, { timeout: 20000 });
await page.fill(emailSelector, USER_EMAIL);
// ... 20 more lines
```

#### Old Locator Discovery (Replaced by Page Objects)
#### Old Locator Discovery (Replaced by Page Objects)
```typescript
// ❌ Don't iterate through selectors anymore
for (const selector of selectors) {
  if (await page.locator(selector).count() > 0) {
    contextField = page.locator(selector).first();
    break;
  }
}

// ✅ Use Page Object method instead
await agentsPage.fillContext('New context');
```

## Test Structure

### Naming Convention
- **POM tests**: `tcXX-description-pom.spec.ts` (preferred)
- **Legacy tests**: `tcXX-description.spec.ts` (being migrated)

### Test Template
```typescript
import { test, expect } from './fixtures/page-objects.fixture';

const UNIQUE_DATA = `Test_${Date.now()}`;

test.setTimeout(90000);

test('TC## — Test Description', async ({ authenticatedAgentsPage }) => {
  console.log('=== TC##: Test Description ===');
  
  // Step 1: Use page object methods
  await authenticatedAgentsPage.createAgent({
    name: UNIQUE_DATA,
    description: 'Description',
  });
  
  // Step 2: Verify results
  const success = await authenticatedAgentsPage.checkSuccessNotification();
  expect(success).toBe(true);
  
  console.log('✓ TC## PASSED');
});
```

## Configuration (playwright.config.ts)

**Updated Settings (v2.0):**
- Test timeout: 90s (matches long login flows)
- Expect timeout: 10s (accommodates slow UI)
- Action timeout: 15s (prevents infinite hangs)
- Retries: 1 (flaky test recovery)
- Video: `retain-on-failure`
- Trace: `retain-on-failure`
- Workers: 1 (sequential for data stability)

## Running Tests
```powershell
npm test              # Headless run
npm run test:headed   # With browser UI
npm run test:debug    # Step-through debugging
```

## Common Gotchas
1. **Save buttons**: May be disabled for validation - check `.isDisabled()` before clicking
2. **URL changes**: Agents created get `/agents/all/{id}` URL - use `waitForURL()` with regex
3. **Search fields**: Often multiple inputs exist - prefer last visible input for filters
4. **Tab navigation**: "Configuration" and "Run" tabs require explicit clicks and waits
5. **Error messages**: Check both `[role="alert"]` and field-level `[aria-invalid="true"]`

## Extending Tests
- Add new tests as `tests/tcXX-description.spec.ts`
- Import credentials from `test-constants.ts`
- Include `test.setTimeout(90000)` for login overhead
- Follow the screenshot naming: `tc{number}-{action}.png`
- Verify both optimistic UI updates AND backend state when possible

## MCP Server Integration

### Playwright MCP Server
Configured via `.vscode/mcp.json` to provide browser automation tools:
- Use `mcp_playwright_browser_*` tools for interactive debugging
- `browser_snapshot` captures accessibility tree (better than screenshots for actions)
- `browser_navigate`, `browser_click`, `browser_type` for live test development
- Useful for exploring UI structure before writing locators

### Elitea MCP Server
SSE connection to `https://next.elitea.ai/mcp_sse` provides:
- `mcp_elitea_next_kpi_epam_jira_*` tools for Jira integration
- Requires Bearer token (prompted as `next-elitea-token`)
- Restricted to `copilot/claude-sonnet-4.5` model via settings.json
- Use for test case management and bug reporting workflows

**Pattern**: Develop tests interactively with Playwright MCP, then codify as `.spec.ts` files.

## Critical Files
- **`tests/tc01-create-agent.spec.ts`** - Reference implementation for form handling and verification
- **`tests/test-constants.ts`** - Update BASE_URL here for different environments
- **`playwright.config.ts`** - Modify `testDir`, `timeout`, or browser configs here
- **`.vscode/mcp.json`** - MCP server configurations (Playwright + Elitea integration)
