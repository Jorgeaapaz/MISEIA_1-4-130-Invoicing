@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement Playwright End-to-End Tests

## Role
Act as a QA Engineer and Software Developer with expertise in Playwright and Next.js.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
Stack: Next.js 16 + TypeScript + MongoDB + Mailhog  
The app runs on `http://localhost:3000`. Mailhog UI at `http://localhost:8025`.  
Authentication is magic-link only — tests must intercept the Mailhog API to extract tokens.  
Currently: **zero E2E tests** configured.

## Task
1. Install Playwright: `npm install --save-dev @playwright/test`
2. Run `npx playwright install chromium`
3. Create `playwright.config.ts` at project root (baseURL: http://localhost:3000)
4. Create `e2e/` directory and write tests:

### Test Suites to Cover
**auth.spec.ts** — Authentication flow:
- User submits email → magic link sent → appear in Mailhog
- Extract token from Mailhog API (`GET http://localhost:8025/api/v2/messages`)
- Navigate to verify URL → redirected to `/dashboard`
- Session persists on page refresh
- Logout clears session → redirected to login

**customers.spec.ts** — Customer CRUD:
- Create customer with valid data → appears in list
- Edit customer → changes persisted
- Delete customer → removed from list
- Validation: empty name shows error

**invoices.spec.ts** — Invoice flow:
- Create invoice with line items → status is `draft`
- View invoice detail → correct totals
- Update status to `sent` → badge updates
- Download PDF → response is PDF content-type

5. Add `"test:e2e": "playwright test"` to `package.json`
6. Add E2E test instructions to README.md

### Playwright E2E Guidelines
- Use `test.beforeEach` to reset DB state (call a test-only API route or use seed script)
- Extract magic link token using: `GET http://localhost:8025/api/v2/messages` → parse body for token
- Use `page.waitForURL()` and `expect(page).toHaveURL()` for redirect assertions
- Run tests with `--headed` flag for visual debugging during development

## Output checklist and Guardrails
- [ ] `playwright.config.ts` created
- [ ] `package.json` has `test:e2e` script
- [ ] `e2e/auth.spec.ts` covers login and logout
- [ ] `e2e/customers.spec.ts` covers CRUD
- [ ] `e2e/invoices.spec.ts` covers create + status update
- [ ] `npx playwright test` passes all tests
- [ ] README updated with E2E test instructions
