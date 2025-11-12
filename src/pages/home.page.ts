import type { Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly url = 'https://playwright.dev/';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async title(): Promise<string> {
    return this.page.title();
  }
}
