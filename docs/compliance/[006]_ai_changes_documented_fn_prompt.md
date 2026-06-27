@~/.claude/prompts/new_functionality_prompt_spec.md

# Document AI-Assisted Changes in README

## Role
Act as a Technical Writer and Software Developer.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
The project was developed with AI assistance (Claude Code).  
The evaluation requires documentation of what was changed vs. AI-generated drafts.  
Retrospective file: `RETROSPECTIVA-2026-04-22.md` contains session notes.

## Task
Add a `## AI-Assisted Development` section to README.md that documents:
1. What parts were AI-generated
2. What the developer reviewed, rejected, or modified
3. Specific examples of corrections made to AI output
4. Lessons learned / where AI added the most value vs. where manual review was critical

### Required Content
Read `RETROSPECTIVA-2026-04-22.md` for context on what was done in the development session.  
Document at least 3 specific examples such as:
- "AI generated auth middleware approach → rejected in favor of per-route verification per AGENTS.md spec"
- "AI generated `sendMagicLink` using wrong token format → corrected to use `crypto.randomUUID()`"
- "AI scaffolded invoice API routes correctly → accepted with minor TypeScript type improvements"

### Guidelines
- Be specific — name functions, files, or patterns that were corrected
- This is a compliance requirement, not optional
- Section should be honest about the collaboration, not marketing copy

## Output checklist and Guardrails
- [ ] `## AI-Assisted Development` section added to README.md
- [ ] At least 3 specific examples of AI output reviewed/modified
- [ ] References actual code in the project (function names, file paths)
- [ ] Tone is analytical, not promotional
