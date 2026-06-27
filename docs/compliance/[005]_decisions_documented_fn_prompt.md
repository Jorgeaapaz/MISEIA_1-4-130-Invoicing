@~/.claude/prompts/new_functionality_prompt_spec.md

# Document Technical Decisions and Trade-offs in README

## Role
Act as a Software Architect and Technical Writer.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
The README has a patterns table but lacks real trade-off documentation.  
The evaluation requires at least 2 real, specific trade-offs — not generic statements.

## Task
Add a `## Technical Decisions` section to README.md with at least 3 documented trade-offs:

### Required Trade-offs to Document
1. **Custom Auth vs NextAuth/Auth.js**  
   Why: Full control of magic-link flow, no external dependency risk, simpler mental model for the team. Trade-off: more boilerplate, no built-in OAuth providers.

2. **MongoDB Native Driver vs Mongoose**  
   Why: Lighter bundle, no schema-enforcement overhead for a flexible invoice data model, types via TypeScript interfaces instead of Mongoose schemas. Trade-off: no built-in validation middleware, must manage indexes manually.

3. **Money stored in cents (integers) vs floats**  
   Why: Eliminates floating-point rounding errors in tax calculations (e.g., 0.1 + 0.2 ≠ 0.3 in IEEE 754). Trade-off: all display logic requires division by 100 at render time.

4. **No middleware.tsx — server-side auth in each route**  
   Why: AGENTS.md explicitly forbids middleware.tsx; explicit auth checks per route are easier to audit. Trade-off: more repetition, risk of missing a check on a new route.

### Guidelines
- Each decision must include: Context, Decision Made, Alternatives Considered, Consequences
- Avoid generic statements like "we chose X because it's popular"
- Mention specific technical constraints from the project (AGENTS.md rules, team decisions)

## Output checklist and Guardrails
- [ ] `## Technical Decisions` section added to README.md
- [ ] At least 3 trade-offs documented
- [ ] Each trade-off has: context, decision, alternatives, consequences
- [ ] No generic/vague justifications
