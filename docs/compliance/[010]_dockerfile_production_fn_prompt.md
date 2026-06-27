@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Dockerfile and Production Environment File

## Role
Act as a DevOps Engineer and Software Developer.

## Context
Project: `D:\Master-IA-Dev\04-Bloque4\1-4-130-Invoicing\invoicing`  
Stack: Next.js 16 + TypeScript + MongoDB  
Target: GCI Ubuntu VM at `34.174.56.186`, Docker + Traefik setup  
The app must be containerized for deployment via GitHub/GitLab CI/CD.

## Task

### 1. Create `Dockerfile` at project root
Use multi-stage build pattern:
- **Stage 1 (deps):** `node:20-alpine` — install only production deps
- **Stage 2 (builder):** Install all deps, copy source, run `NODE_ENV=production npm run build`
- **Stage 3 (runner):** `node:20-alpine` — copy only `.next/standalone`, `.next/static`, `public/`

Requirements:
- Enable Next.js standalone output: update `next.config.ts` to add `output: 'standalone'`
- Run as non-root user (`nextjs:nodejs`)
- EXPOSE port 3000
- CMD: `node server.js`

### 2. Create `docs/compliance/env.production`
Production environment variables for the GCI VM deployment:
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
NODE_ENV=production
```

### 3. Create `docker-compose.vm.yml` for deployment on VM
```yaml
services:
  invoicing-app:
    image: ghcr.io/jorgeaapaz/miseia_1-4-130-invoicing:latest
    container_name: invoicing-app
    restart: unless-stopped
    env_file: .env.production
    networks:
      - miseia-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.invoicing.rule=Host(`invoicing.deviaaps.com`)"
      - "traefik.http.routers.invoicing.entrypoints=websecure"
      - "traefik.http.routers.invoicing.tls=true"
      - "traefik.http.routers.invoicing.tls.certresolver=cloudflare"
      - "traefik.http.services.invoicing.loadbalancer.server.port=3000"
networks:
  miseia-net:
    external: true
```

### Dockerfile Guidelines
- `.dockerignore` must exclude: `node_modules`, `.next`, `.env*`, `*.md`, `docs/`
- Image should be <200MB after multi-stage build
- Must work with `docker build -t invoicing .` locally before CI/CD

## Output checklist and Guardrails
- [ ] `Dockerfile` created with multi-stage build
- [ ] `next.config.ts` updated: `output: 'standalone'`
- [ ] `.dockerignore` created
- [ ] `docs/compliance/env.production` created (not committed to git — add to .gitignore)
- [ ] `docker-compose.vm.yml` created for VM deployment
- [ ] `docker build -t invoicing .` succeeds locally
- [ ] `npm run build` still works outside Docker
