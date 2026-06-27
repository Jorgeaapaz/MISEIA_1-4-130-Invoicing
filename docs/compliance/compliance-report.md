# Compliance Report — Invoicing SaaS
**Date:** 2026-06-27  
**Project:** 1-4-130-Invoicing (`invoicing/`)  
**Evaluator:** Claude Sonnet 4.6 (automated)

---

## 1. Funcionalidad y cumplimiento del enunciado — Nota estimada: 7/9

### Base (4/4) ✅
| Criterio | Estado | Evidencia |
|---|---|---|
| `fn_se_instala` | ✅ PASS | README documenta `npm install` claramente |
| `fn_arranca_local` | ✅ PASS | `npm run dev` → http://localhost:3000, documentado |
| `fn_flujo_principal_funciona` | ✅ PASS | Auth magic link + CRUD clientes + facturas implementado |
| `fn_persistencia_efectiva` | ✅ PASS | MongoDB con driver nativo; datos persisten en disco |

### Notable (3/3) ✅
| Criterio | Estado | Evidencia |
|---|---|---|
| `fn_validaciones_de_entrada` | ✅ PASS | API routes retornan 400/401 en casos inválidos |
| `fn_manejo_errores_consistente` | ✅ PASS | Respuestas `{error: string}` con status codes correctos |
| `fn_funciones_completas_del_enunciado` | ✅ PASS | Magic link, clientes, facturas, PDF, email — todo implementado |

### Excepcional (0/3) ❌
| Criterio | Estado | Evidencia |
|---|---|---|
| `fn_features_extra_pertinentes` | ⚠️ PARCIAL | PDF + email son extras, pero sin paginación/filtros/búsqueda |
| `fn_estados_intermedios_ui` | ⚠️ PARCIAL | UI funcional pero sin skeletons/spinners/empty states explícitos |
| `fn_deploy_publico_accesible` | ❌ FAIL | Sin URL pública documentada; sin Dockerfile ni deploy a VM |

---

## 2. Calidad de código y arquitectura — Nota estimada: 6/10

### Base (4/4) ✅
| Criterio | Estado | Evidencia |
|---|---|---|
| `cq_estructura_carpetas_clara` | ✅ PASS | `app/`, `lib/`, `components/` bien separados |
| `cq_nombres_descriptivos` | ✅ PASS | Funciones y archivos con nombres claros |
| `cq_separacion_responsabilidades` | ✅ PASS | lib/ (lógica) ≠ app/api/ (rutas) ≠ components/ (UI) |
| `cq_dependencias_lockeadas` | ✅ PASS | `package-lock.json` presente y commiteado |

### Notable (2/3) ⚠️
| Criterio | Estado | Evidencia |
|---|---|---|
| `cq_tests_minimos` | ❌ FAIL | **Cero tests** — ni Jest ni Playwright configurados |
| `cq_linter_configurado` | ✅ PASS | `eslint.config.mjs` presente, `npm run lint` en package.json |
| `cq_sin_secretos_en_repo` | ✅ PASS | `.env*` en `.gitignore`; no se commitea `.env.local`; sin credenciales hardcoded |

### Excepcional (1/3)
| Criterio | Estado | Evidencia |
|---|---|---|
| `cq_arquitectura_razonada` | ✅ PASS | README documenta Singleton, Repository, Context, Money-as-integers |
| `cq_cobertura_alta` | ❌ FAIL | Sin tests → sin cobertura |
| `cq_ci_funcional` | ❌ FAIL | Sin `.github/workflows/` ni `.gitlab-ci.yml` |

---

## 3. Documentación y decisiones — Nota estimada: 4/10

### Base (3/4)
| Criterio | Estado | Evidencia |
|---|---|---|
| `dc_readme_presente` | ✅ PASS | README.md detallado con features, estructura y arquitectura |
| `dc_env_example` | ❌ FAIL | No existe `.env.example`; solo `.env.local` (ignorado por git) |
| `dc_comandos_verificacion` | ✅ PASS | README incluye comandos exactos de instalación y ejecución |
| `dc_seccion_uso` | ✅ PASS | Ejemplos request/response incluidos |

### Notable (0/3) ❌
| Criterio | Estado | Evidencia |
|---|---|---|
| `dc_diagrama_arquitectura` | ❌ FAIL | Sin diagrama (ASCII, Mermaid, etc.) |
| `dc_decisiones_documentadas` | ❌ FAIL | Solo tabla de patrones, sin trade-offs reales documentados |
| `dc_cambios_ia_documentados` | ❌ FAIL | Sin sección de revisión crítica de IA |

### Excepcional (0/3) ❌
| Criterio | Estado | Evidencia |
|---|---|---|
| `dc_adrs_o_decision_log` | ❌ FAIL | Sin ADRs |
| `dc_justificacion_cuantitativa` | ❌ FAIL | Sin métricas o benchmarks |
| `dc_instrucciones_deploy` | ❌ FAIL | Sin Dockerfile, sin instrucciones de deploy a VM/cloud |

---

## Resumen de Issues No Conformes

| # | ID | Categoría | Severidad |
|---|---|---|---|
| 1 | `fn_deploy_publico_accesible` | Funcionalidad | Alta |
| 2 | `cq_tests_minimos` | Calidad | Alta |
| 3 | `cq_ci_funcional` | Calidad | Alta |
| 4 | `cq_cobertura_alta` | Calidad | Media |
| 5 | `dc_env_example` | Documentación | Media |
| 6 | `dc_diagrama_arquitectura` | Documentación | Media |
| 7 | `dc_decisiones_documentadas` | Documentación | Media |
| 8 | `dc_instrucciones_deploy` | Documentación | Alta |
| 9 | `dc_cambios_ia_documentados` | Documentación | Baja |
| 10 | `fn_estados_intermedios_ui` | Funcionalidad | Baja |
