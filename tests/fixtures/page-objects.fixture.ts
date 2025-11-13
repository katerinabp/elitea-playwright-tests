import { test as base } from '@playwright/test';
import { login } from './auth.fixture';
import { AgentsPage } from '../../src/pages/agents.page';
import { LoginPage } from '../../src/pages/login.page';

/**
 * Extended test fixture with Page Objects
 * Usage: import { test, expect, agentsPage } from './fixtures/page-objects.fixture';
 */
export const test = base.extend<{
  agentsPage: AgentsPage;
  loginPage: LoginPage;
  authenticatedAgentsPage: AgentsPage;
}>({
  // Login page without authentication
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Agents page without authentication
  agentsPage: async ({ page }, use) => {
    const agentsPage = new AgentsPage(page);
    await use(agentsPage);
  },

  // Agents page with automatic authentication
  authenticatedAgentsPage: async ({ page }, use) => {
    await login(page);
    const agentsPage = new AgentsPage(page);
    await use(agentsPage);
  },
});

export { expect } from '@playwright/test';
export { AgentsPage } from '../../src/pages/agents.page';
export { LoginPage } from '../../src/pages/login.page';
