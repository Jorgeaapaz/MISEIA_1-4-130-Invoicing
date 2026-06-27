@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a GitLab CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in GitLab CI/CD and Google Cloud Services.

## Task
Create a `.gitlab-ci.yml` pipeline that tests, builds, and deploys the Next.js invoicing app to the GCI VM at `gcvmuser@34.174.56.186` in directory `~/MISEIA1-4-130-invoicing`. Use /glab for all GitLab CLI operations. Always set `NODE_ENV=production` only for the `npm run build` command, not as a job-level variable.

## Context
- **GitLab repo:** `https://gitlab.codecrypto.academy/Jorgeaapaz/MISEIA_1-4-130-Invoicing` (or equivalent)
- **Remote VM:** `gcvmuser@34.174.56.186` (GCI Ubuntu VM)
- **SSH:** `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- **App directory on VM:** `~/MISEIA1-4-130-invoicing`
- **Docker network:** `miseia-net` (already running on VM)
- **Traefik:** wildcard `*.deviaaps.com`, domain `invoicing.deviaaps.com`
- **App port:** 30001
- **MongoDB:** `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- **env.production:** `docs/compliance/env.production`

## Pipeline Stages
```
stages:
  - test
  - build
  - deploy
```

### Stage: test
- `npm ci`
- `npm test` (Jest)
- `npm run lint`

### Stage: build
- Set `NODE_ENV=production` **only** in the build script line: `NODE_ENV=production npm run build`
- Build Docker image tagged with `$CI_COMMIT_SHA`
- Push to GitLab Container Registry

### Stage: deploy
- SSH into VM using `$VM_SSH_KEY` (GitLab CI variable)
- Pull latest image from GitLab Container Registry
- Run `docker compose up -d` in `~/MISEIA1-4-130-invoicing/`
- Health check: `curl -f https://invoicing.deviaaps.com || exit 1`

## GitLab CI Variables to Create (via glab CLI)
```bash
glab variable set VM_SSH_KEY --value "$(cat C:\ubuntuiso\.ssh\vboxuser)" --masked
glab variable set VM_HOST --value "34.174.56.186"
glab variable set VM_USER --value "gcvmuser"
glab variable set CI_REGISTRY_USER --value "..."
glab variable set CI_REGISTRY_PASSWORD --value "..." --masked
```

## Key Rules
- `NODE_ENV=production` must ONLY appear in the build command, not as a job or pipeline-level variable
- Tests must run first; deploy is blocked if tests fail
- Use `--masked` for all secret variables in GitLab

## Output checklist and Guardrails
- [ ] `.gitlab-ci.yml` created with 3 stages: test, build, deploy
- [ ] `NODE_ENV=production` used only in npm build command line
- [ ] GitLab CI variables created via `glab variable set`
- [ ] Docker image pushed to GitLab Container Registry
- [ ] VM deployment uses SSH + docker compose
- [ ] Health check confirms app is reachable
- [ ] Pipeline is green on last push to master
