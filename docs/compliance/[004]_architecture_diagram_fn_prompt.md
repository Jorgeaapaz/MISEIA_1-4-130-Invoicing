@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Architecture Diagram to README

## Role
Act as a Software Architect and Technical Writer.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
README.md exists but lacks an architecture diagram.  
The architecture includes: Next.js App Router, MongoDB, Mailhog, Rustfs/S3, magic-link auth, PDF generation.

## Task
Add a Mermaid architecture diagram to `README.md` showing:
1. Client browser → Next.js App (server components + API routes)
2. Next.js → MongoDB (via `lib/db.ts` singleton)
3. Next.js → Mailhog SMTP (via `lib/email.ts` + Nodemailer)
4. Next.js → Rustfs/S3 (for PDF storage if applicable)
5. Auth flow: Login page → `/api/auth/login` → Mailhog → email → `/api/auth/verify` → session cookie → dashboard

Add a second Mermaid sequence diagram showing the magic-link auth flow specifically.

Insert diagrams in a new `## Architecture` section in README.md, placed before `## Getting Started`.

### Guidelines
- Use Mermaid syntax: ` ```mermaid ` code blocks (GitHub renders them natively)
- Keep diagrams readable — max 10 nodes per diagram
- Label all arrows with the protocol/action used

## Output checklist and Guardrails
- [ ] `## Architecture` section added to README.md
- [ ] System diagram with all components shown
- [ ] Sequence diagram for magic-link auth flow
- [ ] Both diagrams in valid Mermaid syntax
- [ ] Diagrams render correctly on GitHub (test with Mermaid Live Editor)
