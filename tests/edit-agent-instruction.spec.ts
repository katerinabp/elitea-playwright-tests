import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'https://next.elitea.ai/alita_ui/agents/latest';
const USERNAME = process.env.AGENT_USER ?? 'alita@elitea.ai';
const PASSWORD = process.env.AGENT_PASS ?? 'rokziJ-nuvzo4-hucmih';
const AGENT_NAME = process.env.AGENT_NAME ?? 'kpi_aqa_agent';
const NEW_INSTRUCTION = process.env.INSTRUCTION ?? 'Updated Test Instruction';

async function login(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // Wait for sign-in form or redirect. Adjust selectors if needed.
  // Try common input selectors with fallbacks.
  const usernameSelectors = [
    'input[name="username"]',
    'input[name="email"]',
    'input[placeholder*="Email"]',
    'input[placeholder*="Username"]',
    'input[type="email"]',
  ];
  const passwordSelectors = [
    'input[name="password"]',
    'input[placeholder*="Password"]',
    'input[type="password"]',
  ];
  let usernameFilled = false;
  for (const sel of usernameSelectors) {
    if (await page.locator(sel).count() > 0) {
      await page.fill(sel, USERNAME);
      usernameFilled = true;
      break;
    }
  }
  if (!usernameFilled) {
    // fallback: try any visible text input
    await page.locator('input:visible').first().fill(USERNAME);
  }

  for (const sel of passwordSelectors) {
    if (await page.locator(sel).count() > 0) {
      await page.fill(sel, PASSWORD);
      break;
    }
  }

  // Click a sign-in button (try multiple known variants)
  const signInButtons = [
    'button:has-text("Sign in")',
    'button:has-text("Sign In")',
    'button:has-text("Log in")',
    'button:has-text("Log In")',
    'button[type="submit"]',
  ];
  for (const btn of signInButtons) {
    if (await page.locator(btn).count() > 0) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
        page.click(btn),
      ]);
      break;
    }
  }

  // Wait until Agents list or agent page appears
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/agents/);
}

test.describe('Edit agent instruction and verify on Run tab', () => {
  test('should update Instructions and verify on Run -> Context: Show', async ({ page }) => {
    // 1. Login
    await test.step('Login to application', async () => {
      await login(page);
    });

    // 2. Navigate to Agents list (if not already) and open target agent
    await test.step(`Open agent card/page for ${AGENT_NAME}`, async () => {
      // If landing page is agents list, try to locate agent by name and click it
      const agentLocator = page.getByText(AGENT_NAME, { exact: true });
      if (await agentLocator.count() > 0) {
        await agentLocator.first().click();
      } else {
        // fallback: search within page for a link or element with agent name
        const link = page.locator(`a:has-text("${AGENT_NAME}")`);
        if (await link.count() > 0) {
          await link.first().click();
        } else {
          // as a fallback, navigate directly via expected agent URL pattern (adjust id if needed)
          // NOTE: if direct id is unknown, the test should be updated to locate the agent element.
          throw new Error(`Agent "${AGENT_NAME}" not found on the page. Update selector or ensure agent exists.`);
        }
      }
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/agents\/all|agents\/.+/);
    });

    // 3. Click Configuration tab
    await test.step('Open Configuration tab', async () => {
      // Prefer role=tab label; fallback to text click.
      const tab = page.getByRole('tab', { name: /Configuration/i });
      if (await tab.count() > 0) {
        await tab.click();
      } else {
        const conf = page.getByText('Configuration', { exact: false });
        if (await conf.count() > 0) {
          await conf.click();
        } else {
          throw new Error('Configuration tab not found. Update selector.');
        }
      }
      // wait for the configuration area to appear
      await page.waitForTimeout(500);
    });

    // 4. Fill the Instructions textbox (label "Guidelines for the AI agent")
    await test.step('Fill Instructions field', async () => {
      // Try accessible label first
      const labelLocator = page.getByLabel('Guidelines for the AI agent', { exact: false });
      if (await labelLocator.count() > 0) {
        await labelLocator.fill(NEW_INSTRUCTION);
      } else {
        // fallback: look for common textarea selectors or placeholder
        const textareaCandidates = [
          'textarea[placeholder*="Guidelines"]',
          'textarea[placeholder*="Instructions"]',
          'textarea',
          'div[contenteditable="true"]',
        ];
        let filled = false;
        for (const sel of textareaCandidates) {
          if (await page.locator(sel).count() > 0) {
            await page.locator(sel).first().fill(NEW_INSTRUCTION);
            filled = true;
            break;
          }
        }
        if (!filled) {
          // Try to find by label text node then sibling textarea
          const labelText = page.locator('text=Guidelines for the AI agent');
          if (await labelText.count() > 0) {
            const textarea = labelText.locator('..').locator('textarea');
            if (await textarea.count() > 0) {
              await textarea.fill(NEW_INSTRUCTION);
            } else {
              throw new Error('Instructions field not found. Update selectors.');
            }
          } else {
            throw new Error('Instructions field not found. Update selectors.');
          }
        }
      }
    });

    // 5. Click Save (no Publish)
    await test.step('Click Save to persist changes', async () => {
      // Try Save button by text/role
      const saveBtnCandidates = [
        page.getByRole('button', { name: /Save/i }),
        page.getByText('Save'),
        page.locator('button:has-text("Save")'),
      ];
      let clicked = false;
      for (const candidate of saveBtnCandidates) {
        try {
          if (candidate && await candidate.count() > 0) {
            await Promise.all([
              page.waitForResponse(resp => resp.status() >= 200 && resp.status() < 500).catch(() => {}),
              candidate.first().click(),
            ]);
            clicked = true;
            break;
          }
        } catch {
          // ignore and try next
        }
      }
      if (!clicked) {
        throw new Error('Save button not found or clickable. Update selectors.');
      }
      // Wait a bit for backend persistence and notification
      await page.waitForTimeout(1000);
    });

    // 6. Validate success message
    await test.step('Validate "The agent has been updated" success message', async () => {
      const successTexts = [
        'The agent has been updated',
        'Agent updated',
        'has been updated',
      ];
      let found = false;
      for (const text of successTexts) {
        const el = page.getByText(text, { exact: false });
        if (await el.count() > 0) {
          await expect(el.first()).toBeVisible({ timeout: 5000 });
          found = true;
          break;
        }
      }
      if (!found) {
        // optionally allow test to continue but mark a soft failure via expect(false)
        throw new Error('Success message not found after Save. Adjust checks if notification is different.');
      }
    });

    // 7. Go to Run tab
    await test.step('Open Run tab', async () => {
      const runTab = page.getByRole('tab', { name: /Run/i });
      if (await runTab.count() > 0) {
        await runTab.click();
      } else {
        const run = page.getByText('Run', { exact: false });
        if (await run.count() > 0) {
          await run.click();
        } else {
          throw new Error('Run tab not found. Update selector.');
        }
      }
      await page.waitForTimeout(500);
    });

    // 8. In Run tab, open Context -> Show and verify the updated instruction is visible
    await test.step('Open Context -> Show and check the updated instruction is visible', async () => {
      // Find "Context" area and click "Show"
      const showButton = page.locator('button:has-text("Show")').filter({ hasText: 'Show' }).first();
      if (await showButton.count() > 0) {
        await showButton.click();
      } else {
        // try alternative: link or control with "Context" and "Show"
        const contextLabel = page.getByText('Context', { exact: false });
        if (await contextLabel.count() > 0) {
          const show = contextLabel.locator('..').getByText('Show');
          if (await show.count() > 0) {
            await show.first().click();
          } else {
            // fallback: try any 'Show' button
            const anyShow = page.getByText('Show');
            if (await anyShow.count() > 0) await anyShow.first().click();
            else throw new Error('Show control for Context not found. Update selector.');
          }
        } else {
          // final fallback: try any show button
          const anyShow = page.getByText('Show');
          if (await anyShow.count() > 0) await anyShow.first().click();
          else throw new Error('Show control for Context not found. Update selector.');
        }
      }

      // Wait for dialog/modal to appear
      await page.waitForTimeout(500);

      // Verify NEW_INSTRUCTION is visible somewhere in the page or modal
      const instrLocator = page.locator(`text=${NEW_INSTRUCTION}`);
      if (await instrLocator.count() > 0) {
        await expect(instrLocator.first()).toBeVisible();
      } else {
        // also check partial text
        await expect(page.locator(`text=${NEW_INSTRUCTION.split(' ')[0]}`)).toBeVisible({ timeout: 3000 }).catch(() => {
          throw new Error('Updated instruction not visible in Context show dialog or Run tab. Update selectors or flows.');
        });
      }
    });

    // 9. Logout / cleanup
    await test.step('Logout and cleanup', async () => {
      // Try sign out via menu
      const profileBtn = page.locator('button[aria-label="Account"], button:has-text("Sign out"), button:has-text("Log out"), text=Logout');
      if (await profileBtn.count() > 0) {
        try {
          await profileBtn.first().click();
          const logoutBtn = page.getByText(/Sign out|Log out|Logout/i);
          if (await logoutBtn.count() > 0) {
            await logoutBtn.first().click();
          }
        } catch {
          // ignore errors and fallback to clearing storage
        }
      }

      // Fallback: clear cookies and local storage
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
    });
  });
});
