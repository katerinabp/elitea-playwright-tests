import { Page, Locator } from '@playwright/test';
import { TIMEOUTS, NETWORK_WAIT } from '../../tests/config/timeouts';

/**
 * Base Page class with common functionality for all page objects
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for page to be stable after navigation or dynamic content
   */
  async waitForStable(timeout: number = TIMEOUTS.LONG): Promise<void> {
    await this.page.waitForLoadState(NETWORK_WAIT.IDLE, { timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async screenshot(filename: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/${filename}`, 
      fullPage: true 
    }).catch((error) => {
      console.log(`⚠ Could not capture screenshot: ${error.message}`);
    });
  }

  /**
   * Get current page URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for an element to be visible
   */
  async waitForVisible(locator: Locator, timeout: number = TIMEOUTS.PAGE_LOAD): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Check if element exists
   */
  async exists(locator: Locator): Promise<boolean> {
    return (await locator.count()) > 0;
  }

  /**
   * Safe click with error handling
   */
  async safeClick(locator: Locator, description: string): Promise<boolean> {
    try {
      await locator.click({ timeout: TIMEOUTS.PAGE_LOAD });
      console.log(`✓ ${description}`);
      return true;
    } catch (error) {
      console.log(`⚠ ${description} failed:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Safe fill with error handling
   */
  async safeFill(locator: Locator, value: string, description: string): Promise<boolean> {
    try {
      await locator.fill(value);
      console.log(`✓ ${description}`);
      return true;
    } catch (error) {
      console.log(`⚠ ${description} failed:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}
