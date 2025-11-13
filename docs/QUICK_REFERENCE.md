# Quick Reference - Playwright Test Commands

## Running Tests

```bash
# All tests (headless)
npm test

# With visible browser
npm run test:headed

# Interactive UI mode (BEST for development)
npm run test:ui

# Debug mode with Inspector
npm run test:debug

# Specific test file
npx playwright test tests/tc05-edit-agent-pom.spec.ts

# Only POM tests
npm run test:pom

# Specific browser
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

## Filtering Tests

```bash
# By name pattern
npx playwright test --grep "Create agent"

# Exclude pattern
npx playwright test --grep-invert "legacy"

# By file pattern
npx playwright test tests/tc0*

# Failed tests only
npx playwright test --last-failed
```

## Debugging

```bash
# Show last HTML report
npm run report

# Show specific trace
npx playwright show-trace test-results/[test-name]/trace.zip

# Generate code by recording actions
npm run codegen

# Run with console logs
npx playwright test --debug

# Pause on failure
npx playwright test --headed --debug
```

## Configuration Overrides

```bash
# More retries
npx playwright test --retries=3

# More workers (parallel)
npx playwright test --workers=4

# Single worker (sequential)
npx playwright test --workers=1

# Specific timeout
npx playwright test --timeout=120000

# Different base URL
SET BASE_URL=https://staging.elitea.ai && npm test
```

## Reporting

```bash
# View HTML report
npm run report

# Generate report after test
npx playwright show-report

# View specific reporter output
cat test-results/results.json
cat test-results/junit.xml
```

## Maintenance

```bash
# Clean test results
npm run clean

# Update Playwright
npm install @playwright/test@latest

# Install/update browsers
npm run install:browsers

# Check Playwright version
npx playwright --version
```

## Test Files

```bash
# Legacy tests (old style)
tests/tc*.spec.ts

# POM tests (new style - preferred)
tests/*-pom.spec.ts

# All tests
tests/*.spec.ts
```

## Environment Variables

```bash
# Windows CMD
SET BASE_URL=https://staging.elitea.ai
SET HEADED=true
SET CI=true

# Windows PowerShell
$env:BASE_URL='https://staging.elitea.ai'
$env:HEADED='true'
$env:CI='true'

# Linux/Mac
export BASE_URL=https://staging.elitea.ai
export HEADED=true
export CI=true
```

## Common Workflows

### Write New Test
```bash
# 1. Use POM template in tests/tc*-pom.spec.ts
# 2. Run in UI mode for development
npm run test:ui

# 3. Run final check
npm test -- tests/your-new-test.spec.ts
```

### Debug Failing Test
```bash
# 1. View last report
npm run report

# 2. Check video/trace in test-results/

# 3. Run with Inspector
npm run test:debug -- tests/failing-test.spec.ts

# 4. Fix and verify
npm run test:headed -- tests/failing-test.spec.ts
```

### Run in CI
```bash
# CI automatically:
# - Uses 1 worker (sequential)
# - Retries 2 times
# - Generates JUnit XML
# - Runs headless
npm test
```

## Keyboard Shortcuts (UI Mode)

- `Space` - Run/pause test
- `F10` - Step over
- `F11` - Step into
- `F5` - Continue
- `Ctrl+/` - Toggle source
- `Ctrl+F` - Find

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Test timeout | Increase in test: `test.setTimeout(120000)` |
| Flaky test | Check trace, add explicit waits |
| Can't find element | Use codegen to get selector |
| Out of memory | Reduce workers: `--workers=1` |
| Slow execution | Disable video: config `video: 'off'` |

## File Locations

```
playwright.config.ts          # Main configuration
test-results/                 # Test output (videos, traces, screenshots)
playwright-report/            # HTML report
tests/fixtures/               # Reusable test fixtures
src/pages/                    # Page Object Models
docs/                         # Documentation
```

## Documentation Files

- `docs/PAGE_OBJECTS.md` - Page Object Model guide
- `docs/CONFIGURATION.md` - Detailed config reference
- `docs/ARCHITECTURE.md` - System architecture
- `docs/IMPROVEMENTS_SUMMARY.md` - v2.0 changes
- `.github/copilot-instructions.md` - AI coding guide

## Help

```bash
# Playwright help
npx playwright test --help

# List all tests
npx playwright test --list

# Show config
npx playwright show-config
```
