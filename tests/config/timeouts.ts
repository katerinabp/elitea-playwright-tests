/**
 * Centralized timeout configuration for Playwright tests
 * 
 * Use these constants instead of magic numbers throughout the test suite.
 * This makes timeouts consistent and easier to adjust globally.
 */

export const TIMEOUTS = {
  /**
   * Short wait - Quick UI updates, animations
   * Use for: Button state changes, dropdown animations
   */
  SHORT: 500,

  /**
   * Medium wait - Standard UI interactions
   * Use for: Form submissions, tab switches, search results
   */
  MEDIUM: 1000,

  /**
   * Long wait - Complex operations
   * Use for: Page transitions, agent creation, saving
   */
  LONG: 2000,

  /**
   * Navigation wait - Page navigation and redirects
   * Use for: Opening agents, navigating between pages
   */
  NAVIGATION: 3000,

  /**
   * Element visibility - Wait for elements to appear
   * Use for: expect().toBeVisible() timeout parameter
   */
  ELEMENT_VISIBLE: 5000,

  /**
   * Element enabled - Wait for buttons to become enabled
   * Use for: expect().toBeEnabled() timeout parameter
   */
  ELEMENT_ENABLED: 5000,

  /**
   * Page load - Full page load including network
   * Use for: Initial navigation, heavy page loads
   */
  PAGE_LOAD: 10000,

  /**
   * API response - Wait for API calls to complete
   * Use for: waitForResponse() timeout parameter
   */
  API_RESPONSE: 15000,

  /**
   * Test timeout - Maximum time for entire test
   * Use for: test.setTimeout()
   */
  TEST: 90000,

  /**
   * Action timeout - Default timeout for all Playwright actions
   * Use for: playwright.config.ts actionTimeout
   */
  ACTION: 15000,
} as const;

/**
 * Helper function to create custom timeout
 * @param multiplier - Multiply base timeout by this value
 * @param base - Base timeout to multiply (default: MEDIUM)
 */
export const customTimeout = (multiplier: number, base: number = TIMEOUTS.MEDIUM): number => {
  return base * multiplier;
};

/**
 * Network wait conditions
 */
export const NETWORK_WAIT = {
  /**
   * Wait until no network connections for at least 500ms
   */
  IDLE: 'networkidle' as const,

  /**
   * Wait until the load event is fired
   */
  LOAD: 'load' as const,

  /**
   * Wait until the DOMContentLoaded event is fired
   */
  DOM_LOADED: 'domcontentloaded' as const,
} as const;
