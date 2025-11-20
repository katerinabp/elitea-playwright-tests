import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  
  // Timeouts
  timeout: 240_000, // Global test timeout (4 minutes for complex multi-step tests with login)
  expect: { timeout: 10_000 }, // Assertion timeout (increased for slow UI)
  
  // Execution strategy
  fullyParallel: false, // Run sequentially to avoid agent data conflicts
  forbidOnly: !!process.env.CI, // Prevent .only() in CI
  retries: process.env.CI ? 2 : 1, // Retry flaky tests (2 in CI, 1 locally)
  workers: process.env.CI ? 1 : 2, // Parallel workers (1 in CI for stability, 2 locally for speed)
  
  // Reporters
  reporter: [
    ['list'], // Console output
    ['html', { open: 'never' }], // HTML report
    ['json', { outputFile: 'test-results/results.json' }], // JSON for CI
    ['junit', { outputFile: 'test-results/junit.xml' }], // JUnit for CI integration
  ],
  
  // Global browser settings
  use: {
    headless: process.env.HEADED ? false : true, // Can override with HEADED=true
    viewport: { width: 1280, height: 720 },
    
    // Timeouts
    actionTimeout: 15_000, // Individual action timeout
    navigationTimeout: 30_000, // Page navigation timeout
    
    // Debugging & failure analysis
    trace: 'retain-on-failure', // Full trace on failure (step-by-step replay)
    video: 'retain-on-failure', // Video recording on failure
    screenshot: 'only-on-failure', // Screenshot on failure
    
    // Network & context
    baseURL: process.env.BASE_URL || 'https://next.elitea.ai',
    ignoreHTTPSErrors: true, // Ignore SSL errors in dev environments
    
    // Additional useful options
    locale: 'en-US',
    timezoneId: 'America/New_York',
    colorScheme: 'light',
    
    // Browser context options
    permissions: [], // No special permissions needed
    geolocation: undefined,
    acceptDownloads: true,
  },
  
  // Multi-browser testing
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome-specific options
        channel: 'chrome', // Use installed Chrome instead of Chromium
      },
    },
    
    // Uncomment to enable Firefox testing
    // {
    //   name: 'firefox',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //   },
    // },
    
    // Uncomment to enable WebKit (Safari) testing
    // {
    //   name: 'webkit',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //   },
    // },
    
    // Uncomment to enable mobile testing
    // {
    //   name: 'mobile-chrome',
    //   use: { 
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { 
    //     ...devices['iPhone 13'],
    //   },
    // },
  ],
  
  // Web server (if you need to start a local dev server)
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  //   timeout: 120_000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
