# Playwright Test: TC05 - Edit Existing Agent Context

This test automates editing the context (guidelines) for an existing agent and verifies the success notification.

- App: https://next.elitea.ai/alita_ui/agents/latest
- User: alita@elitea.ai
- Agent: kpi_aqa_agent

Scenario Steps
1. Open the application and authenticate via Nexus login.
2. Search for agent `kpi_aqa_agent` and open its page.
3. Open the Configuration tab.
4. Update the "Guidelines for the AI agent" field with `Updated Test Context`.
5. Save and verify success toast: "The agent has been updated".
6. Confirm the field value persists as `Updated Test Context`.
7. Logout and verify redirect to Sign In.

How to run locally
- Install dependencies: `npm ci`
- Run tests: `npx playwright test tests/tc05-edit-agent.spec.ts --headed`

Notes
- Selectors rely on accessible role and label attributes to reduce flakiness.
