import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { TIMEOUTS, NETWORK_WAIT } from '../../tests/config/timeouts';

/**
 * Login Page Object
 */
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators with multiple fallback selectors
    this.emailInput = page.locator(
      'input[name="email"], input[type="email"], input#username, input[name="username"]'
    );
    
    this.passwordInput = page.locator(
      'input[name="password"], input[type="password"], input#password'
    );
    
    this.signInButton = page.locator(
      'button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]'
    );
  }

  /**
   * Perform login action
   * @param email - User email
   * @param password - User password
   */
  async login(email: string, password: string): Promise<void> {
    console.log('Logging in...');
    
    await this.emailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PAGE_LOAD * 2 });
    await this.emailInput.fill(email);
    console.log(`✓ Email filled: ${email}`);
    
    await this.passwordInput.waitFor({ state: 'visible', timeout: TIMEOUTS.PAGE_LOAD });
    await this.passwordInput.fill(password);
    console.log('✓ Password filled');
    
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: NETWORK_WAIT.IDLE, timeout: TIMEOUTS.PAGE_LOAD * 2 }).catch(() => {}),
      this.signInButton.click(),
    ]);
    
    await this.waitForStable(TIMEOUTS.NAVIGATION);
    console.log(`✓ Logged in successfully, current URL: ${this.getUrl()}`);
  }

  /**
   * Check if login page is displayed
   */
  async isLoginPage(): Promise<boolean> {
    return await this.exists(this.emailInput) && await this.exists(this.passwordInput);
  }
}
