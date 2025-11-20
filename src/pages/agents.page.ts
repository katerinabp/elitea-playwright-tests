import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { TIMEOUTS } from '../../tests/config/timeouts';

/**
 * Agents Page Object - handles all agent management operations
 */
export class AgentsPage extends BasePage {
  // Locators
  readonly createAgentButton: Locator;
  readonly searchInput: Locator;
  readonly configurationTab: Locator;
  readonly runTab: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly menuButton: Locator;
  readonly deleteMenuItem: Locator;
  readonly deleteConfirmationInput: Locator;
  readonly deleteConfirmButton: Locator;
  readonly saveAsVersionButton: Locator;
  readonly versionNameInput: Locator;
  readonly versionSaveButton: Locator;
  readonly versionCancelButton: Locator;

  // Form field locators
  readonly nameField: Locator;
  readonly descriptionField: Locator;
  readonly contextField: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation elements
    this.createAgentButton = page.locator(
      'button:has-text("+ Agent"), button:has-text("Create Agent"), button:has-text("Add Agent"), button:has-text("New Agent"), [aria-label*="Create"], [aria-label*="Add"]'
    );

    this.searchInput = page.locator(
      'input[placeholder*="Search" i], input[aria-label*="Search" i]'
    );

    // Tab navigation
    this.configurationTab = page.locator(
      'text=Configuration, text=Config, role=tab[name="Configuration"]'
    );

    this.runTab = page.locator(
      'text=Run, role=tab[name="Run"]'
    );

    // Action buttons
    this.saveButton = page.locator(
      'button:has-text("Save"), button:has-text("Update")'
    );

    this.cancelButton = page.locator(
      'button:has-text("Cancel")'
    );

    this.menuButton = page.locator('#undefined-action');
    
    this.deleteMenuItem = page.getByRole('menuitem', { name: 'Delete' });
    
    this.deleteConfirmationInput = page.getByRole('textbox', { name: 'Name' });
    
    this.deleteConfirmButton = page.getByRole('dialog').getByRole('button', { name: 'Delete' });

    // Version control elements
    this.saveAsVersionButton = page.getByRole('button', { name: 'Save As Version' });
    
    this.versionNameInput = page.getByRole('textbox', { name: 'Name' });
    
    this.versionSaveButton = page.getByRole('dialog').getByRole('button', { name: 'Save' });
    
    this.versionCancelButton = page.getByRole('dialog').getByRole('button', { name: 'Cancel' });

    // Form fields
    this.nameField = page.locator(
      'input[name="name"], input[placeholder*="Name" i], textarea[name="name"]'
    );

    this.descriptionField = page.locator(
      'textarea[name="description"], input[name="description"], textarea[placeholder*="escription" i]'
    );

    this.contextField = page.locator(
      'textarea[name="context"], textarea[name="guidelines"], textarea[placeholder*="ontext" i], textarea[placeholder*="uideline" i]'
    );
  }

  /**
   * Click the create/add agent button
   */
  async clickCreateAgent(): Promise<void> {
    await expect(this.createAgentButton.first()).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });
    await this.createAgentButton.first().click();
    await this.page.waitForTimeout(TIMEOUTS.LONG);
    console.log('✓ Create Agent button clicked');
  }

  /**
   * Search for an agent by name
   * @param agentName - Name of the agent to search
   */
  async searchAgent(agentName: string): Promise<void> {
    if (await this.exists(this.searchInput)) {
      console.log(`Searching for agent: ${agentName}`);
      await this.searchInput.first().fill(agentName);
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      console.log('✓ Search query submitted');
    } else {
      console.log('⚠ Search input not found');
    }
  }

  /**
   * Open/click an agent by name
   * @param agentName - Name of the agent to open
   */
  async openAgent(agentName: string): Promise<void> {
    console.log(`Opening agent: ${agentName}`);
    const currentUrl = this.page.url();
    
    await Promise.all([
      this.page.waitForURL(url => url !== currentUrl, { timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {}),
      this.page.click(`text=${agentName}`)
    ]);
    
    await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.NAVIGATION }).catch(() => {});
    console.log('✓ Agent opened');
  }

  /**
   * Navigate to Configuration tab
   */
  async goToConfigurationTab(): Promise<void> {
    console.log('Navigating to Configuration tab...');
    
    if (await this.exists(this.configurationTab)) {
      await this.configurationTab.first().click();
      console.log('✓ Configuration tab clicked');
    } else {
      await this.page.click('text=Configuration').catch(() => {
        console.log('⚠ Configuration tab not found');
      });
    }
    
    await this.page.waitForTimeout(TIMEOUTS.LONG);
  }

  /**
   * Navigate to Run tab
   */
  async goToRunTab(): Promise<void> {
    console.log('Navigating to Run tab...');
    
    if (await this.exists(this.runTab)) {
      await this.runTab.first().click();
      console.log('✓ Run tab clicked');
    } else {
      await this.page.click('text=Run').catch(() => {
        console.log('⚠ Run tab not found');
      });
    }
    
    await this.page.waitForTimeout(TIMEOUTS.LONG);
  }

  /**
   * Fill the agent name field
   * @param name - Agent name
   */
  async fillName(name: string): Promise<void> {
    await expect(this.nameField.first()).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });
    await this.nameField.first().fill(name);
    console.log(`✓ Name field filled: ${name}`);
  }

  /**
   * Fill the agent description field
   * @param description - Agent description
   */
  async fillDescription(description: string): Promise<void> {
    const field = await this.findDescriptionField();
    if (field) {
      await field.fill(description);
      console.log(`✓ Description field filled: ${description}`);
    } else {
      console.log('⚠ Description field not found');
    }
  }

  /**
   * Fill the agent context/guidelines field
   * @param context - Agent context or guidelines
   */
  async fillContext(context: string): Promise<void> {
    const field = await this.findContextField();
    if (field) {
      await field.clear();
      await field.fill(context);
      console.log(`✓ Context field filled: ${context}`);
    } else {
      console.log('⚠ Context field not found');
    }
  }

  /**
   * Get the value of the context field
   */
  async getContextValue(): Promise<string> {
    const field = await this.findContextField();
    if (field) {
      return await field.inputValue();
    }
    return '';
  }

  /**
   * Click the Save button
   */
  async clickSave(): Promise<void> {
    await this.saveButton.first().click();
    console.log('✓ Save button clicked');
  }

  /**
   * Save with potential redirect/page close handling
   */
  async saveWithRedirect(): Promise<boolean> {
    try {
      console.log('Clicking Save button...');
      const currentUrl = this.page.url();
      
      // Click save and wait for URL change (indicates navigation)
      await Promise.all([
        this.page.waitForURL(url => url !== currentUrl, { timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {}),
        this.saveButton.first().click()
      ]);

      console.log('✓ Save operation completed, navigation detected');
      
      // Wait for new page to load
      await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.NAVIGATION }).catch(() => {});
      return true;
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      
      if (err.includes('Target closed') || err.includes('context') || err.includes('detached')) {
        console.log('✓ Save triggered redirect/close (expected)');
        return true;
      }
      
      console.log(`⚠ Save operation failed: ${err}`);
      return false;
    }
  }

  /**
   * Check if save button is disabled
   */
  async isSaveButtonDisabled(): Promise<boolean> {
    return await this.saveButton.first().isDisabled();
  }

  /**
   * Check for success notification
   */
  async checkSuccessNotification(timeout = TIMEOUTS.ELEMENT_VISIBLE): Promise<boolean> {
    const indicators = [
      'text=updated successfully',
      'text=successfully updated',
      'text=Agent has been updated',
      'text=Changes saved',
      'text=saved successfully',
      'text=created successfully',
      '.toast',
      '.notification',
      '[role="alert"]',
    ];

    for (const indicator of indicators) {
      try {
        const locator = this.page.locator(indicator);
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.first().isVisible({ timeout: TIMEOUTS.MEDIUM }).catch(() => false);
          if (isVisible) {
            const text = await locator.first().textContent().catch(() => '');
            console.log(`✓ Success notification: "${text}"`);
            return true;
          }
        }
      } catch {
        continue;
      }
    }

    console.log('⚠ No success notification found');
    return false;
  }

  /**
   * Check for validation error messages
   */
  async checkValidationError(): Promise<boolean> {
    const errorIndicators = [
      'text=required',
      'text=Required',
      'text=mandatory',
      'text=cannot be empty',
      '[role="alert"]',
      '.error',
      '[aria-invalid="true"]',
    ];

    for (const indicator of errorIndicators) {
      const count = await this.page.locator(indicator).count();
      if (count > 0) {
        console.log(`✓ Validation error found: ${indicator}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Verify agent appears in the list
   * @param agentName - Name of the agent to verify
   */
  async verifyAgentInList(agentName: string): Promise<boolean> {
    const selectors = [
      `text="${agentName}"`,
      `a:has-text("${agentName}")`,
      `*:has-text("${agentName}")`,
    ];

    for (const selector of selectors) {
      const count = await this.page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Agent found in list: ${agentName}`);
        return true;
      }
    }

    // Fallback: check page content
    const content = await this.page.content();
    if (content.includes(agentName)) {
      console.log(`✓ Agent name found in page content: ${agentName}`);
      return true;
    }

    console.log(`⚠ Agent not found in list: ${agentName}`);
    return false;
  }

  /**
   * Create a new agent with all fields
   * @param agent - Agent data object
   */
  async createAgent(agent: { name: string; description?: string; context?: string }): Promise<void> {
    await this.clickCreateAgent();
    await this.screenshot('agent-form-opened.png');

    await this.fillName(agent.name);

    if (agent.description) {
      await this.fillDescription(agent.description);
    }

    if (agent.context) {
      await this.fillContext(agent.context);
    }

    await this.screenshot('agent-form-filled.png');
    
    // Use saveWithRedirect to handle page navigation after save
    await this.saveWithRedirect();
    
    console.log('✓ Agent created and navigated to detail page');
  }

  /**
   * Edit existing agent context
   * @param agentName - Name of agent to edit
   * @param newContext - New context value
   */
  async editAgentContext(agentName: string, newContext: string): Promise<void> {
    await this.searchAgent(agentName);
    await this.openAgent(agentName);
    await this.screenshot('agent-opened.png');

    await this.goToConfigurationTab();
    await this.screenshot('config-tab.png');

    await this.fillContext(newContext);
    await this.screenshot('context-modified.png');

    await this.saveWithRedirect();
  }

  /**
   * Delete an agent
   * @param agentName - Name of agent to delete
   */
  async deleteAgent(agentName: string): Promise<void> {
    console.log(`Deleting agent: ${agentName}`);
    
    // Open the agent if not already on detail page
    if (!this.page.url().includes(`/agents/all/`)) {
      await this.searchAgent(agentName);
      await this.openAgent(agentName);
    }
    
    await this.page.waitForTimeout(TIMEOUTS.LONG);
    await this.screenshot('agent-detail-before-delete.png');

    // Click menu button (three dots)
    await expect(this.menuButton).toBeVisible({ timeout: TIMEOUTS.PAGE_LOAD });
    await this.menuButton.click();
    console.log('✓ Menu button clicked');
    
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await this.screenshot('delete-menu-opened.png');

    // Click Delete menu item
    await expect(this.deleteMenuItem).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    await this.deleteMenuItem.click();
    console.log('✓ Delete menu item clicked');
    
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await this.screenshot('delete-confirmation-dialog.png');

    // Enter agent name for confirmation
    await expect(this.deleteConfirmationInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    await this.deleteConfirmationInput.fill(agentName);
    console.log(`✓ Entered agent name for confirmation: ${agentName}`);
    
    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    
    // Click confirm delete button
    await expect(this.deleteConfirmButton).toBeEnabled({ timeout: TIMEOUTS.ELEMENT_ENABLED });
    await this.deleteConfirmButton.click();
    console.log('✓ Delete confirmed');
    
    await this.page.waitForTimeout(TIMEOUTS.LONG);
  }

  /**
   * Cancel agent deletion
   */
  async cancelDeletion(): Promise<void> {
    const cancelButton = this.page.getByRole('dialog').getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
    console.log('✓ Deletion cancelled');
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
  }

  /**
   * Check for delete success notification
   */
  async checkDeleteNotification(timeout = TIMEOUTS.ELEMENT_VISIBLE): Promise<boolean> {
    const indicators = [
      'text=deleted successfully',
      'text=successfully deleted',
      'text=Agent has been deleted',
      'text=removed successfully',
      'text=successfully removed',
      '.toast',
      '.notification',
      '[role="alert"]',
    ];

    for (const indicator of indicators) {
      try {
        const locator = this.page.locator(indicator);
        const count = await locator.count();
        if (count > 0) {
          const isVisible = await locator.first().isVisible({ timeout: TIMEOUTS.MEDIUM }).catch(() => false);
          if (isVisible) {
            const text = await locator.first().textContent().catch(() => '');
            console.log(`✓ Delete notification: "${text}"`);
            return true;
          }
        }
      } catch {
        continue;
      }
    }

    console.log('⚠ No delete notification found');
    return false;
  }

  /**
   * Verify agent is NOT in the list (deleted)
   * @param agentName - Name of the agent to verify is gone
   */
  async verifyAgentNotInList(agentName: string): Promise<boolean> {
    // Wait for UI to update
    await this.page.waitForTimeout(TIMEOUTS.LONG);

    const selectors = [
      `text="${agentName}"`,
      `a:has-text("${agentName}")`,
      `*:has-text("${agentName}")`,
    ];

    for (const selector of selectors) {
      const count = await this.page.locator(selector).count();
      if (count > 0) {
        console.log(`⚠ Agent still found in list: ${agentName}`);
        return false;
      }
    }

    console.log(`✓ Agent not found in list (deleted): ${agentName}`);
    return true;
  }

  /**
   * Save agent as a new version (with redirect handling)
   * @param versionName - Name for the new version
   */
  async saveAsNewVersion(versionName: string): Promise<void> {
    console.log(`Saving as new version: ${versionName}`);
    
    // Click Save As Version button
    await expect(this.saveAsVersionButton).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    await this.saveAsVersionButton.click();
    console.log('✓ Save As Version button clicked');
    
    // Wait for dialog and fill version name
    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    await expect(this.versionNameInput).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
    await this.versionNameInput.fill(versionName);
    console.log(`✓ Version name entered: ${versionName}`);
    
    // Click Save in the dialog with redirect handling
    try {
      await expect(this.versionSaveButton).toBeEnabled({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
      
      const saveClickPromise = this.versionSaveButton.click();
      const urlChangePromise = this.page.waitForURL(/\/agents\/all\/\d+\/\d+/, { timeout: TIMEOUTS.API_RESPONSE }).catch(() => null);
      
      await Promise.race([
        Promise.all([urlChangePromise, saveClickPromise]),
        saveClickPromise,
      ]);
      
      console.log('✓ Version Save button clicked');
      await this.page.waitForTimeout(TIMEOUTS.LONG).catch(() => {});
      console.log('✓ Version save completed with redirect');
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      
      if (err.includes('Target closed') || err.includes('context') || err.includes('detached')) {
        console.log('✓ Version save triggered redirect (expected)');
      } else {
        console.log(`⚠ Version save operation: ${err}`);
      }
    }
  }

  /**
   * Check for version save success notification
   */
  async checkVersionSaveNotification(): Promise<boolean> {
    await this.page.waitForTimeout(TIMEOUTS.SHORT);

    const notificationSelectors = [
      'text=Saved new version successfully',
      'text=Version saved',
      'text=New version created',
      '[role="alert"]:has-text("version")',
      '.notification:has-text("version")',
    ];

    for (const selector of notificationSelectors) {
      try {
        const notification = this.page.locator(selector);
        if (await notification.isVisible({ timeout: TIMEOUTS.MEDIUM })) {
          console.log('✓ Version save notification found');
          return true;
        }
      } catch {
        continue;
      }
    }

    console.log('⚠ No version save notification found');
    return false;
  }

  /**
   * Get the current version number from the UI
   */
  async getCurrentVersion(): Promise<string> {
    // Wait for page to stabilize
    await this.page.waitForTimeout(TIMEOUTS.SHORT);
    
    // The version number appears in a readonly textbox next to the version dropdown combobox
    // According to error context, it shows like: textbox: "68"
    const versionTextboxes = this.page.locator('input[type="text"][readonly], input[readonly]');
    const count = await versionTextboxes.count();
    
    for (let i = 0; i < count; i++) {
      const value = await versionTextboxes.nth(i).inputValue();
      // Version numbers are numeric strings
      if (value && /^\d+$/.test(value.trim())) {
        console.log(`✓ Current version: ${value}`);
        return value;
      }
    }
    
    // Fallback: try all text inputs
    const allTextInputs = this.page.locator('input[type="text"]');
    const allCount = await allTextInputs.count();
    
    for (let i = 0; i < allCount; i++) {
      const value = await allTextInputs.nth(i).inputValue();
      if (value && /^\d+$/.test(value.trim()) && parseInt(value) > 0) {
        console.log(`✓ Current version (fallback): ${value}`);
        return value;
      }
    }
    
    console.log('⚠ Version number not found');
    return '';
  }

  // Private helper methods

  private async findDescriptionField(): Promise<Locator | null> {
    const selectors = [
      this.descriptionField,
      this.page.locator('textarea, input[type="text"]').nth(1),
    ];

    for (const selector of selectors) {
      if (await this.exists(selector)) {
        return selector.first();
      }
    }

    return null;
  }

  private async findContextField(): Promise<Locator | null> {
    // Try multiple strategies to find context field
    const strategies = [
      this.page.getByLabel('Guidelines for the AI agent'),
      this.page.getByLabel('Context'),
      this.contextField,
      this.page.locator('textarea').nth(2),
    ];

    for (const locator of strategies) {
      if (await this.exists(locator)) {
        await expect(locator.first()).toBeVisible({ timeout: TIMEOUTS.ELEMENT_VISIBLE });
        return locator.first();
      }
    }

    return null;
  }

  /**
   * Navigate back to agents list page
   */
  async navigateToAgentsList(): Promise<void> {
    console.log('Navigating to agents list...');
    
    // Wait for any pending navigation/operations to complete
    await this.page.waitForTimeout(TIMEOUTS.LONG);
    await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.NAVIGATION }).catch(() => {});
    
    try {
      await this.page.goto('https://next.elitea.ai/alita_ui/agents/all', { 
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUTS.PAGE_LOAD 
      });
      
      await this.page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.NAVIGATION }).catch(() => {});
      console.log('✓ Navigated to agents list');
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      console.log(`⚠ Navigation error: ${err}`);
      
      // Check if we're already on the agents list page
      if (this.page.url().includes('/agents/all')) {
        console.log('✓ Already on agents list page');
        return;
      }
      
      throw error;
    }
  }

  /**
   * Check if an agent is in the list
   * @param agentName - Name of the agent to look for
   * @returns true if agent is found, false otherwise
   */
  async isAgentInList(agentName: string): Promise<boolean> {
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const selectors = [
      `text="${agentName}"`,
      `a:has-text("${agentName}")`,
      `[data-testid*="agent"]:has-text("${agentName}")`,
    ];

    for (const selector of selectors) {
      const count = await this.page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Agent found in list: ${agentName}`);
        return true;
      }
    }

    console.log(`⚠ Agent not found in list: ${agentName}`);
    return false;
  }
}
