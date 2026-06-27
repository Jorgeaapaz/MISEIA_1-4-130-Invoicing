@~/.claude/prompts/new_functionality_prompt_spec.md

# Create .env.example Template File

## Role
Act as a Software Developer and DevOps Engineer.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
Stack: Next.js 16 + TypeScript + MongoDB + Mailhog + Rustfs/S3  
The project uses `.env.local` for secrets (correctly gitignored via `.env*` in `.gitignore`).  
The evaluation requires a `.env.example` with ALL required variables listed but WITHOUT real values.  
Current `.env.local` contents:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=invoicing
AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=invoicing
MAILHOG_HOST=localhost
MAIL_PORT=1027
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Task
Create a `.env.example` file at the project root (`invoicing/.env.example`) with:
1. All required environment variables listed
2. Placeholder values (not real secrets) — e.g. `your-mongodb-uri-here`
3. Inline comments explaining each variable's purpose
4. Add a reference to `.env.example` in the README.md "Getting Started" section

### Guidelines
- File must be committed to git (NOT in .gitignore)
- Use descriptive placeholder values, not empty strings
- Group variables by service (MongoDB, S3/Rustfs, Email, App)
- Update README to reference `.env.example` instead of listing variables inline

## Output checklist and Guardrails
- [ ] `.env.example` created at project root
- [ ] All variables from `.env.local` present in `.env.example`
- [ ] No real credentials in `.env.example`
- [ ] README updated to reference `.env.example`
- [ ] File is NOT in `.gitignore` (so it gets committed)
- [ ] Unit test or manual verification that the app still starts with copied values
