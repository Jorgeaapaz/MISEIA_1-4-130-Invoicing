@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a Github CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in Github and Google Cloud Services

## Task
Create Github actions that allows to compile and deploy the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory ~/MISEIA1-4-130-invoicing. Test and build must be done in a GitHub Actions. The service must be created in the remote ubuntu VM in Docker.

The app must be accessible through Traefik using the domain `invoicing.deviaaps.com`, port 30001, use the traefik wildcard `*.deviaaps.com`.

Use /gh and gcloud for all secrets required.

## Context
- **GitHub repo:** `https://github.com/Jorgeaapaz/MISEIA_1-4-130-Invoicing`
- **Remote VM:** `gcvmuser@34.174.56.186` (GCI Ubuntu VM)
- **SSH key path (local):** `C:\ubuntuiso\.ssh\vboxuser`
- **App directory on VM:** `~/MISEIA1-4-130-invoicing`
- **Docker network:** `miseia-net` (already exists on VM)
- **Traefik:** Running on VM, wildcard cert `*.deviaaps.com` via Cloudflare DNS-01
- **App port:** 30001 (internal Next.js port)
- **Domain:** `invoicing.deviaaps.com`
- **MongoDB:** `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- **env.production file:** `docs/compliance/env.production`

## Production Environment Variables (from env.production)
```
MONGODB_URI=mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin
MONGODB_DB=invoicing
MAILHOG_HOST=mailhog
MAIL_PORT=1025
NEXT_PUBLIC_API_URL=https://invoicing.deviaaps.com
AWS_USERNAME=rustfsadmin
AWS_PASSWORD=RustfsSecret2024!
AWS_REGION=us-east-1
AWS_URL=http://rustfs:9000
AWS_BUCKET=invoicing
```

## Pipeline Requirements
1. **On push to `master`:**
   - Run `npm ci`
   - Run `npm test` (Jest unit tests)
   - Run `NODE_ENV=production npm run build`
   - Build Docker image
   - Push to GitHub Container Registry (ghcr.io)
   - SSH into VM and deploy new container

2. **Dockerfile** to create at project root:
   - Multi-stage build (builder + runner)
   - Base: `node:20-alpine`
   - Standalone Next.js output (`output: 'standalone'` in next.config.ts)
   - Non-root user

3. **Docker Compose service on VM** (`~/MISEIA1-4-130-invoicing/docker-compose.yml`):
   - Container name: `invoicing-app`
   - Network: `miseia-net`
   - Port: 30001:3000 internal
   - Traefik labels for `invoicing.deviaaps.com`
   - Env from `.env.production` on VM

4. **GitHub Secrets to create via gh CLI:**
   - `VM_SSH_KEY` — contents of `C:\ubuntuiso\.ssh\vboxuser`
   - `VM_HOST` — `34.174.56.186`
   - `VM_USER` — `gcvmuser`
   - `GHCR_TOKEN` — GitHub PAT with `packages:write`

## GitHub Actions Workflow File
Save to `.github/workflows/ci-cd.yml`

## Output checklist and Guardrails
- [ ] `.github/workflows/ci-cd.yml` created
- [ ] `Dockerfile` created with multi-stage build
- [ ] `next.config.ts` updated with `output: 'standalone'`
- [ ] GitHub secrets created via `gh secret set`
- [ ] VM docker-compose.yml created with Traefik labels
- [ ] `invoicing.deviaaps.com` accessible after deploy
- [ ] `npm test` must pass before deploy proceeds
- [ ] Pipeline is green on last push to master
