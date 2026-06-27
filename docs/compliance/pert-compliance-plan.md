# PERT Compliance Plan — Invoicing SaaS
**Date:** 2026-06-27

---

## PERT Compliance Plan

Ordered list of tasks to bring the project to full compliance. Dependencies indicated with `→`.

```
T1: env.example          (no deps)
T2: Unit Tests (Jest)    (no deps)
T3: E2E Tests (Playwright) → T2
T4: Architecture Diagram (no deps)
T5: Decision Docs        (no deps)
T6: AI Changes Doc       (no deps)
T7: UI Loading States    (no deps)
T8: CI/CD GitHub         → T2, T3
T9: CI/CD GitLab         → T2, T3
T10: Dockerfile + env.production → T1
T11: Deploy to GCI VM    → T8, T10
T12: README Deploy Section → T11
```

### Prompt Files Reference
| Task | Disciplined Prompt File |
|---|---|
| T1 | `[001]_env_example_dotfile_fn_prompt.md` |
| T2 | `[002]_jest_unit_tests_fn_prompt.md` |
| T3 | `[003]_playwright_e2e_tests_fn_prompt.md` |
| T4 | `[004]_architecture_diagram_fn_prompt.md` |
| T5 | `[005]_decisions_documented_fn_prompt.md` |
| T6 | `[006]_ai_changes_documented_fn_prompt.md` |
| T7 | `[007]_ui_loading_states_fn_prompt.md` |
| T8 | `[008]_github_cicd_pipeline_fn_prompt.md` |
| T9 | `[009]_gitlab_cicd_pipeline_fn_prompt.md` |
| T10 | `[010]_dockerfile_production_fn_prompt.md` |
| T11 | `[011]_deploy_gci_vm_fn_prompt.md` |
| T12 | `[012]_readme_deploy_section_fn_prompt.md` |

---

## Execution PERT

Tasks ordered for sequential execution respecting dependencies:

| Order | Task ID | Task Name | Depends On | Prompt File |
|---|---|---|---|---|
| 1 | T1 | Create `.env.example` | — | `[001]_env_example_dotfile_fn_prompt.md` |
| 2 | T4 | Architecture Diagram in README | — | `[004]_architecture_diagram_fn_prompt.md` |
| 3 | T5 | Decision Trade-offs Documentation | — | `[005]_decisions_documented_fn_prompt.md` |
| 4 | T6 | Document AI Changes | — | `[006]_ai_changes_documented_fn_prompt.md` |
| 5 | T7 | UI Loading / Empty States | — | `[007]_ui_loading_states_fn_prompt.md` |
| 6 | T2 | Jest Unit Tests | — | `[002]_jest_unit_tests_fn_prompt.md` |
| 7 | T3 | Playwright E2E Tests | T2 | `[003]_playwright_e2e_tests_fn_prompt.md` |
| 8 | T10 | Dockerfile + env.production | T1 | `[010]_dockerfile_production_fn_prompt.md` |
| 9 | T8 | GitHub CI/CD Pipeline | T2, T3, T10 | `[008]_github_cicd_pipeline_fn_prompt.md` |
| 10 | T9 | GitLab CI/CD Pipeline | T2, T3, T10 | `[009]_gitlab_cicd_pipeline_fn_prompt.md` |
| 11 | T11 | Deploy App to GCI VM | T8, T10 | `[011]_deploy_gci_vm_fn_prompt.md` |
| 12 | T12 | README Deploy Section | T11 | `[012]_readme_deploy_section_fn_prompt.md` |
