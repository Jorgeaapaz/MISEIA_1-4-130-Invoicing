@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement Jest Unit Tests for Critical lib/ Functions

## Role
Act as a Software Developer with expertise in TypeScript testing, Jest, and Next.js.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
Stack: Next.js 16 + TypeScript + MongoDB native driver  
Critical lib files requiring unit tests:
- `lib/auth.ts` — magic link generation, token validation, session management
- `lib/format.ts` — currency formatting (cents ↔ display)
- `lib/email.ts` — email sending via Nodemailer/Mailhog
- `lib/pdf.ts` — PDF generation with PDFKit

Currently: **zero tests** configured.

## Task
1. Install and configure Jest + ts-jest for TypeScript support:
   - `npm install --save-dev jest ts-jest @types/jest jest-environment-node`
   - Create `jest.config.ts` at project root
   - Add `"test": "jest"` and `"test:coverage": "jest --coverage"` to `package.json` scripts
2. Create `__tests__/` directory at project root
3. Write unit tests for:
   - `lib/format.ts` — `formatCents()`, `parseCurrency()` (pure functions, no mocking needed)
   - `lib/auth.ts` — `sendMagicLink()`, `verifyMagicLink()`, `createSession()`, `verifySession()` (mock MongoDB)
   - `lib/email.ts` — `sendEmail()` (mock Nodemailer transport)
4. Achieve >60% line coverage on `lib/` domain code
5. Add test commands to README.md

### Jest Unit Test Guidelines
- Use `jest.mock()` for MongoDB client and Nodemailer
- Test happy path AND error cases (expired tokens, already-used tokens, invalid sessions)
- Keep tests deterministic — freeze dates with `jest.useFakeTimers()` where needed
- No `any` types in test files either

## Output checklist and Guardrails
- [ ] `jest.config.ts` created
- [ ] `package.json` has `test` and `test:coverage` scripts  
- [ ] `__tests__/format.test.ts` — pure function tests, no mocks
- [ ] `__tests__/auth.test.ts` — MongoDB mocked, covers: generate link, validate link (valid/expired/used), create session, verify session
- [ ] `__tests__/email.test.ts` — Nodemailer mocked
- [ ] `npm test` runs green with no failures
- [ ] Coverage report shows >60% on lib/ files
- [ ] README updated with `npm test` command
