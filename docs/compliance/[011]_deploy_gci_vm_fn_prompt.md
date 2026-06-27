@~/.claude/prompts/new_functionality_prompt_spec.md

# Deploy Invoicing App to GCI VM via Docker

## Role
Act as a DevOps Engineer and Software Developer with expertise in Docker, Traefik, and Google Cloud.

## Context
- **VM:** `gcvmuser@34.174.56.186` (GCI Ubuntu VM)
- **SSH:** `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- **App dir on VM:** `~/MISEIA1-4-130-invoicing`
- **Docker network:** `miseia-net` (external, already running — shared Traefik network)
- **Traefik:** Running with wildcard `*.deviaaps.com` cert via Cloudflare DNS-01
- **Domain:** `invoicing.deviaaps.com`
- **App internal port:** 3000 (Next.js standalone)
- **MongoDB on VM:** `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- **env.production:** `docs/compliance/env.production`

## Task
Perform a first manual deployment to the GCI VM:

### Step 1 — Prepare VM directory
```bash
ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186
mkdir -p ~/MISEIA1-4-130-invoicing
```

### Step 2 — Copy files to VM
```bash
scp -i C:\ubuntuiso\.ssh\vboxuser docs/compliance/env.production gcvmuser@34.174.56.186:~/MISEIA1-4-130-invoicing/.env.production
scp -i C:\ubuntuiso\.ssh\vboxuser docker-compose.vm.yml gcvmuser@34.174.56.186:~/MISEIA1-4-130-invoicing/docker-compose.yml
```

### Step 3 — Build and push Docker image
```bash
docker build -t ghcr.io/jorgeaapaz/miseia_1-4-130-invoicing:latest .
docker push ghcr.io/jorgeaapaz/miseia_1-4-130-invoicing:latest
```

### Step 4 — Deploy on VM
```bash
ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186 \
  "cd ~/MISEIA1-4-130-invoicing && docker compose pull && docker compose up -d"
```

### Step 5 — Verify
```bash
curl -f https://invoicing.deviaaps.com
```

### Traefik Labels Required (in docker-compose.yml on VM)
```yaml
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

## Output checklist and Guardrails
- [ ] VM directory `~/MISEIA1-4-130-invoicing` created
- [ ] `.env.production` copied to VM (NOT committed to git)
- [ ] Docker image built and pushed to registry
- [ ] Container running on VM: `docker ps | grep invoicing-app`
- [ ] App accessible at `https://invoicing.deviaaps.com`
- [ ] Login page loads correctly at production URL
- [ ] README.md updated with production URL
