@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Deploy Instructions Section to README

## Role
Act as a Technical Writer and DevOps Engineer.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
The README has local dev instructions but no deployment documentation.  
The evaluation requires a `dc_instrucciones_deploy` section with verifiable steps.  
After completing tasks T8–T11, the app is deployed at `https://invoicing.deviaaps.com`.

## Task
Add a `## Deployment` section to README.md with:

### 1. Production URL
```
https://invoicing.deviaaps.com
```

### 2. Infrastructure Overview
- GCI VM: `34.174.56.186` (Ubuntu, Docker + Traefik)
- Container: `invoicing-app` on `miseia-net` Docker network
- CI/CD: GitHub Actions (`.github/workflows/ci-cd.yml`)
- Registry: GitHub Container Registry (`ghcr.io`)

### 3. Manual Deploy Steps (verifiable)
```bash
# 1. Build and push Docker image
docker build -t ghcr.io/jorgeaapaz/miseia_1-4-130-invoicing:latest .
docker push ghcr.io/jorgeaapaz/miseia_1-4-130-invoicing:latest

# 2. Deploy to VM
ssh -i ~/.ssh/vboxuser gcvmuser@34.174.56.186 \
  "cd ~/MISEIA1-4-130-invoicing && docker compose pull && docker compose up -d"

# 3. Verify
curl -f https://invoicing.deviaaps.com
```

### 4. Automatic Deploy via CI/CD
- Push to `master` triggers GitHub Actions pipeline
- Pipeline: test → build → push image → SSH deploy → health check
- Status badge in README header

### 5. Environment Variables for Production
Reference `docs/compliance/env.production` — copy to VM as `.env.production` before first deploy.

### Guidelines
- All commands must be copy-paste executable
- Add a GitHub Actions status badge at top of README
- Section placed after `## Getting Started`, before `## Example Output`

## Output checklist and Guardrails
- [ ] `## Deployment` section added to README.md
- [ ] Production URL documented
- [ ] Manual deploy steps verified (actual commands that work)
- [ ] GitHub Actions badge added
- [ ] Reference to `env.production` for production config
- [ ] Steps are copy-paste executable without additional knowledge
