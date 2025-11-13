# elitea-playwright-tests

This repository contains a Playwright + TypeScript test suite for the Elitea AI agent management platform.

## Features

- ✅ **Page Object Model** - Maintainable test architecture
- ✅ **Authentication Fixtures** - Automatic login for tests
- ✅ **Error Handling** - Robust safe actions and retry logic
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Visual Debugging** - Screenshots, videos, and traces on failure
- ✅ **Multi-Browser** - Chrome, Firefox, WebKit support
- ✅ **CI Ready** - JUnit reports, retry strategy, parallel execution

## Quick Start

### Installation
```powershell
# Install dependencies
npm install

# Install browsers Playwright needs
npm run install:browsers
```

### Running Tests

```powershell
# Run all tests (headless)
npm test

# Run with visible browser
npm run test:headed

# Run in interactive UI mode (recommended for development)
npm run test:ui

# Run with Playwright Inspector (step-through debugging)
npm run test:debug

# Run specific test
npx playwright test tests/tc05-edit-agent-pom.spec.ts

# View test report
npm run report
```

See [Quick Reference](docs/QUICK_REFERENCE.md) for all commands.

## Writing Tests

### Simple Example (Recommended - Page Object Model)

```typescript
import { test, expect } from './fixtures/page-objects.fixture';

test('Create agent', async ({ authenticatedAgentsPage }) => {
  // Already logged in!
  await authenticatedAgentsPage.createAgent({
    name: `Agent_${Date.now()}`,
    description: 'My test agent',
    context: 'Test context',
  });
  
  const success = await authenticatedAgentsPage.checkSuccessNotification();
  expect(success).toBe(true);
});
```

See [Page Object Guide](docs/PAGE_OBJECTS.md) for complete documentation.

## Project Structure

```
elitea-playwright-tests/
├── src/pages/              # Page Object Models
│   ├── base.page.ts        # Base page class
│   ├── login.page.ts       # Login operations
│   └── agents.page.ts      # Agent management (main POM)
├── tests/
│   ├── fixtures/           # Test fixtures
│   │   ├── auth.fixture.ts              # Auto-login
│   │   └── page-objects.fixture.ts      # POM + auth
│   ├── helpers/            # Utility functions
│   │   └── safe-actions.ts              # Error handling
│   ├── *-pom.spec.ts       # POM tests (recommended)
│   └── *.spec.ts           # Legacy tests
├── docs/                   # Documentation
│   ├── QUICK_REFERENCE.md  # Command cheat sheet
│   ├── PAGE_OBJECTS.md     # POM guide
│   ├── CONFIGURATION.md    # Config details
│   ├── ARCHITECTURE.md     # System design
│   └── IMPROVEMENTS_SUMMARY.md  # v2.0 changes
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # NPM scripts
```

## Available NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run test:headed` | Run with visible browser |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:debug` | Debug with Inspector |
| `npm run test:pom` | Run only POM tests |
| `npm run test:chrome` | Run in Chrome only |
| `npm run report` | View HTML report |
| `npm run codegen` | Record actions to generate code |
| `npm run clean` | Clean test results |

See complete list in [Quick Reference](docs/QUICK_REFERENCE.md).

## Configuration

**Current Settings:**
- Test timeout: 90 seconds
- Expect timeout: 10 seconds
- Action timeout: 15 seconds
- Retries: 1 (locally), 2 (CI)
- Video: On failure
- Trace: On failure
- Workers: 2 (locally), 1 (CI)

Edit `playwright.config.ts` to modify. See [Configuration Guide](docs/CONFIGURATION.md) for details.

## Documentation

| Document | Description |
|----------|-------------|
| [Quick Reference](docs/QUICK_REFERENCE.md) | Common commands and workflows |
| [Page Objects](docs/PAGE_OBJECTS.md) | POM pattern and usage |
| [Configuration](docs/CONFIGURATION.md) | Detailed config reference |
| [Architecture](docs/ARCHITECTURE.md) | System design and structure |
| [Improvements](docs/IMPROVEMENTS_SUMMARY.md) | v2.0 changelog |
| [Copilot Instructions](.github/copilot-instructions.md) | AI coding guidance |

## Environment Variables

Create a `.env` file or set environment variables:

```bash
BASE_URL=https://next.elitea.ai    # Application URL
HEADED=true                         # Run with visible browser
CI=true                            # Enable CI mode
```

## Debugging Failures

1. **View HTML Report**: `npm run report`
2. **Watch Video**: Check `test-results/[test-name]/video.webm`
3. **View Trace**: `npx playwright show-trace test-results/[test-name]/trace.zip`
4. **Run Inspector**: `npm run test:debug`

## Best Practices

1. ✅ Use Page Object Model (`*-pom.spec.ts` tests)
2. ✅ Use `authenticatedAgentsPage` fixture to avoid login code
3. ✅ Generate unique test data with timestamps
4. ✅ Let config handle retries (don't add manual retries)
5. ✅ Use `saveWithRedirect()` for save actions that may close page
6. ✅ Check `checkSuccessNotification()` after mutations

## Contributing

When adding new tests:
1. Follow `tcXX-description-pom.spec.ts` naming
2. Use Page Object Model pattern
3. Import from `./fixtures/page-objects.fixture`
4. Include `test.setTimeout(90000)` if test is slow
5. Add descriptive console logs
6. See existing POM tests as examples

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Test timeout | Check logs, increase timeout in test |
| Flaky test | Review trace, add explicit waits |
| Can't find element | Use `npm run codegen` to get selector |
| Out of memory | Reduce workers to 1 in config |
| Slow execution | Disable video/trace in config |

See [Configuration Guide](docs/CONFIGURATION.md) for detailed troubleshooting.

## Framework Version

**Version**: 2.0  
**Release Date**: November 13, 2025  
**Breaking Changes**: None (v1.0 tests still work)

See [Improvements Summary](docs/IMPROVEMENTS_SUMMARY.md) for details.
