# elitea-playwright-tests

This repository contains a minimal Playwright + TypeScript test setup.

Quick start (PowerShell):

```powershell
# install dependencies
npm install

# install browsers Playwright needs
npx playwright install

# run tests (headless)
npm test

# run tests headed
npm run test:headed
```

Files added:
- `playwright.config.ts` — Playwright configuration
- `tsconfig.json` — TypeScript configuration
- `tests/example.spec.ts` — Example test
- `package.json` — scripts + devDependencies
