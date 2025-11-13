# Playwright Configuration Guide

## Overview

The `playwright.config.ts` file controls all aspects of test execution, from timeouts to browser selection to failure handling.

**Current Version:** 2.0  
**Last Updated:** November 2025

## Key Configuration Areas

### 1. Timeouts

```typescript
timeout: 90_000,              // Global test timeout (90 seconds)
expect: { timeout: 10_000 },  // Assertion timeout (10 seconds)
actionTimeout: 15_000,        // Individual action timeout (15 seconds)
navigationTimeout: 30_000,    // Page navigation timeout (30 seconds)
```

**Why these values?**
- **90s global**: Accommodates login flow + test execution
- **10s expect**: Elitea UI can be slow to update
- **15s action**: Prevents infinite hangs on clicks/fills
- **30s navigation**: Allows for slow page loads

**Adjusting timeouts:**
```typescript
// In test file
test.setTimeout(120000); // Override for specific slow test

// In test
await page.click('button', { timeout: 20000 }); // Override specific action
```

---

### 2. Retry Strategy

```typescript
retries: process.env.CI ? 2 : 1,  // Retry flaky tests
```

**Behavior:**
- **Locally**: 1 retry on failure
- **CI**: 2 retries on failure

**Why?**
- Network flakiness in CI environments
- Occasional timing issues with dynamic UI
- Balances reliability vs. execution time

**Disable retries for debugging:**
```bash
npm test -- --retries=0
```

---

### 3. Parallel Execution

```typescript
fullyParallel: false,         // Run sequentially
workers: process.env.CI ? 1 : 2,  // Worker threads
```

**Why sequential?**
- Tests create/modify agents with potentially conflicting names
- Avoids race conditions on shared data
- More predictable for debugging

**Enable parallel locally (if needed):**
```typescript
fullyParallel: true,
workers: 4,  // Use 4 parallel workers
```

---

### 4. Failure Debugging

```typescript
trace: 'retain-on-failure',      // Trace on failure
video: 'retain-on-failure',      // Video on failure
screenshot: 'only-on-failure',   // Screenshot on failure
```

**What you get on failure:**

1. **Trace file** - Step-by-step replay
   - View: `npx playwright show-trace trace.zip`
   - Shows: Network, console, DOM snapshots
   
2. **Video** - Full test execution recording
   - Location: `test-results/[test-name]/video.webm`
   - Can slow down playback to see details
   
3. **Screenshot** - Final state before failure
   - Location: `test-results/[test-name]/screenshot.png`

**Other trace options:**
- `'on'` - Always record (slow, large files)
- `'off'` - Never record
- `'on-first-retry'` - Only on first retry
- `'retain-on-failure'` - Keep only if test fails (recommended)

---

### 5. Reporters

```typescript
reporter: [
  ['list'],                                           // Console
  ['html', { open: 'never' }],                       // HTML report
  ['json', { outputFile: 'test-results/results.json' }],  // JSON
  ['junit', { outputFile: 'test-results/junit.xml' }],    // JUnit
],
```

**Reporter types:**

| Reporter | Purpose | Output |
|----------|---------|--------|
| `list` | Console progress | Real-time in terminal |
| `html` | Interactive report | `playwright-report/index.html` |
| `json` | Machine-readable | `test-results/results.json` |
| `junit` | CI integration | `test-results/junit.xml` |

**View reports:**
```bash
npm run report              # Open HTML report
npx playwright show-report  # Alternative
```

**Other reporter options:**
```typescript
['dot'],                    // Simple dots (minimal output)
['line'],                   // One line per test
['github'],                 // GitHub Actions annotations
```

---

### 6. Browser Projects

```typescript
projects: [
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      channel: 'chrome',  // Use installed Chrome
    },
  },
  // Firefox, WebKit commented out by default
],
```

**Enable multi-browser testing:**

Uncomment in config:
```typescript
{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
{ name: 'webkit', use: { ...devices['Desktop Safari'] } },
```

Run specific browser:
```bash
npm run test:chrome   # Only Chrome
npm run test:firefox  # Only Firefox
npm run test:webkit   # Only WebKit
```

**Mobile testing:**
```typescript
{
  name: 'mobile-chrome',
  use: { ...devices['Pixel 5'] },
},
{
  name: 'mobile-safari',
  use: { ...devices['iPhone 13'] },
},
```

---

### 7. Environment Variables

**Supported variables:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `https://next.elitea.ai` | Application URL |
| `CI` | `undefined` | Enables CI-specific settings |
| `HEADED` | `undefined` | Run with visible browser |
| `PWDEBUG` | `undefined` | Enable Playwright Inspector |

**Usage:**

```bash
# Windows
SET BASE_URL=https://staging.elitea.ai && npm test
SET HEADED=true && npm test

# PowerShell
$env:BASE_URL='https://staging.elitea.ai'; npm test
$env:HEADED='true'; npm test

# Linux/Mac
BASE_URL=https://staging.elitea.ai npm test
HEADED=true npm test
```

**In config:**
```typescript
use: {
  baseURL: process.env.BASE_URL || 'https://next.elitea.ai',
  headless: process.env.HEADED ? false : true,
}
```

---

### 8. Additional Options

```typescript
use: {
  ignoreHTTPSErrors: true,     // Ignore SSL errors (dev/staging)
  locale: 'en-US',             // Browser locale
  timezoneId: 'America/New_York',  // Browser timezone
  colorScheme: 'light',        // Light/dark mode
  acceptDownloads: true,       // Allow file downloads
}
```

**Viewport size:**
```typescript
viewport: { width: 1280, height: 720 },  // Desktop size
```

Common sizes:
- Desktop: `{ width: 1920, height: 1080 }`
- Tablet: `{ width: 768, height: 1024 }`
- Mobile: `{ width: 375, height: 667 }`

---

## Common Scenarios

### Debugging a Failing Test

```bash
# 1. Run with UI mode (recommended)
npm run test:ui

# 2. Run with Playwright Inspector
npm run test:debug

# 3. Run with visible browser
npm run test:headed

# 4. View last failure trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Running Subset of Tests

```bash
# Only POM tests
npm run test:pom

# Only legacy tests
npm run test:legacy

# Specific test file
npx playwright test tests/tc05-edit-agent-pom.spec.ts

# Tests matching pattern
npx playwright test --grep "Create.*agent"
```

### Performance Testing

```bash
# Disable retries for accurate timing
npx playwright test --retries=0

# Run in parallel (use with caution)
npx playwright test --workers=4

# Shard tests across machines (CI)
npx playwright test --shard=1/3  # Run 1st third
npx playwright test --shard=2/3  # Run 2nd third
npx playwright test --shard=3/3  # Run 3rd third
```

### CI/CD Integration

```bash
# Set CI environment variable
export CI=true

# This enables:
# - 2 retries instead of 1
# - 1 worker (sequential)
# - JUnit reporter
# - Strict mode (no .only())
```

---

## Troubleshooting

### Tests Timeout

**Problem:** Tests exceed 90s limit

**Solutions:**
```typescript
// Option 1: Increase global timeout
timeout: 120_000,

// Option 2: Increase for specific test
test.setTimeout(120000);

// Option 3: Check for slow actions
actionTimeout: 30_000,  // Increase action timeout
```

### Flaky Tests

**Problem:** Tests fail intermittently

**Solutions:**
```typescript
// Increase retries
retries: 3,

// Increase expect timeout
expect: { timeout: 15_000 },

// Use explicit waits in test
await page.waitForLoadState('networkidle');
```

### Out of Memory

**Problem:** Node heap out of memory

**Solutions:**
```bash
# Increase Node memory
$env:NODE_OPTIONS='--max-old-space-size=4096'
npm test

# Reduce workers
workers: 1,

# Disable video (uses lots of memory)
video: 'off',
```

### Slow Test Execution

**Problem:** Tests take too long

**Solutions:**
```typescript
// Enable parallel execution (if safe)
fullyParallel: true,
workers: 4,

// Disable trace/video locally
trace: 'off',
video: 'off',

// Use headless mode
headless: true,
```

---

## Best Practices

### ✅ DO
- Keep global timeout at 90s (accommodates login)
- Use `retain-on-failure` for trace/video
- Enable retries (at least 1)
- Use meaningful reporter combinations
- Set appropriate action timeouts

### ❌ DON'T
- Set `actionTimeout: 0` (causes hangs)
- Use `trace: 'on'` (creates huge files)
- Run fully parallel without testing conflicts
- Disable retries in CI
- Set timeout too low for login flows

---

## NPM Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `npm test` | `playwright test` | Run all tests |
| `npm run test:headed` | With visible browser | Debug visually |
| `npm run test:debug` | Playwright Inspector | Step through test |
| `npm run test:ui` | UI mode | Interactive test runner |
| `npm run test:chrome` | Chrome only | Browser-specific |
| `npm run test:pom` | POM tests only | New architecture |
| `npm run report` | Show report | View last results |
| `npm run codegen` | Record test | Generate test code |
| `npm run clean` | Delete results | Clean workspace |

---

## Migration Notes

### From v1.0 to v2.0

**Changed:**
- ✅ Timeout: 30s → 90s
- ✅ Expect timeout: 5s → 10s
- ✅ Action timeout: 0 → 15s
- ✅ Workers: 1 → 2 (locally)
- ✅ Added: JUnit reporter
- ✅ Added: Video on failure
- ✅ Added: Trace on failure
- ✅ Added: Environment variable support

**Compatible:** All existing tests work without changes

---

## Further Reading

- [Playwright Config API](https://playwright.dev/docs/test-configuration)
- [Test Retry](https://playwright.dev/docs/test-retries)
- [Reporters](https://playwright.dev/docs/test-reporters)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
