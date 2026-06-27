@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement UI Loading, Error, and Empty States

## Role
Act as a Frontend Developer with expertise in Next.js App Router and Tailwind CSS.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
Stack: Next.js 16 + TypeScript + Tailwind CSS v4  
The UI is functional but lacks explicit loading states, error states, and empty states.  
Dark theme per AGENTS.md design guidelines. Use `frontend-design` skill for all UI work.  
Key pages: `app/(dashboard)/customers/`, `app/(dashboard)/invoices/`, `app/(dashboard)/dashboard/`

## Task
Add explicit UI states to all dashboard pages:

### 1. Loading States
- Add `loading.tsx` files in each dashboard route segment (Next.js App Router convention)
- Create a `<SkeletonCard />` component in `components/ui/` for list skeletons
- Show spinner/skeleton while API calls are in-flight on client components

### 2. Error States  
- Add `error.tsx` files in each dashboard route segment
- Create a reusable `<ErrorBoundary />` component with retry button
- API errors (non-200) must show user-friendly message, not raw JSON

### 3. Empty States
- When customer list is empty → show "No customers yet" with CTA to create first customer
- When invoice list is empty → show "No invoices yet" with CTA to create first invoice
- Empty states must be visually distinct (icon + message + button)

### Design Guidelines (per AGENTS.md)
- Dark theme: use slate-900/slate-800 backgrounds
- Accent color consistent across all states
- Mobile-responsive
- No images — use CSS-only icon placeholders or SVG icons

## Output checklist and Guardrails
- [ ] `app/(dashboard)/customers/loading.tsx` created
- [ ] `app/(dashboard)/invoices/loading.tsx` created  
- [ ] `app/(dashboard)/customers/error.tsx` created
- [ ] `app/(dashboard)/invoices/error.tsx` created
- [ ] `components/ui/SkeletonCard.tsx` created
- [ ] Empty state shown when collections are empty
- [ ] All states match dark theme design
- [ ] Mobile-responsive
- [ ] `npm run build` passes with no TypeScript errors
