<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Invoicing SaaS - Especificación del Proyecto

Sistema SaaS de facturación con autenticación por magic link, MongoDB como base de datos y landing page con diseño profesional.

## Design guidelines (for `frontend-design` skill)
- Use dark theme for better readability.
- Customer-facing: clean, modern storefront feel - bold typography, clear CTAs
- Color palette: pick one accent color and stay consistent across all microfrontends
- No images anywhere, use category-colored icon placeholders (CSS only)
- Mobile-responsive layouts

## Arquitectura Base de datos
- Como base de datos usamos MongoDB con el driver nativo.
- MongoDB está instalado en el ordenador local.

## Arquitectura Storage de pdf, videos, audios, etc
- AWS S3 usando Rustfs que está en docker, para almacenar los archivos multimedia.

## Arquitectura Mail
- Usar mailhog que está instalado en docker.

## Authentication Rules
- Autenticación exclusivamente por **magic link** (sin contraseñas).
- Flujo: el usuario introduce su email → se genera un token único con expiración → se envía un enlace por email (via Mailhog) → al hacer clic se valida el token y se crea la sesión.
- Los tokens magic link se almacenan en la colección `magic_links` de MongoDB con campos: `email`, `token`, `expiresAt`, `used`.
- Expiración del token: **15 minutos**. Tokens de un solo uso — marcar como `used: true` tras validación.
- La sesión se gestiona con una cookie HTTP-only segura que contiene un session token.
- Las sesiones se almacenan en la colección `sessions` de MongoDB con campos: `userId`, `token`, `expiresAt`.
- Proteger todas las rutas de la app (excepto landing, login y API de auth) verificando la sesión válida.
- No usar middleware.tsx — la verificación de sesión se hace en server components o en las API routes directamente.
- `lib/auth.ts` centraliza toda la lógica: generación de magic link, validación de token, creación/verificación de sesión, logout.
- No usar librerías externas de auth (NextAuth, Auth.js, etc.) — implementación propia con el driver nativo de MongoDB.

## Arquitectura Frontend
- Usar Next.js con TypeScript
- No usar el fichero middleware.tsx, sino usar proxy en su lugar.
- Usar un globalcontext para almacenar el estado global de la aplicación, como el usuario autenticado, preferencias, etc. Enviar prop drilling.
- Hacer npm run build cuando se haya acabado la codificación, no cada vez.

## Repositorio en GitHub
- Hacer commit con mensajes claros y descriptivos, siguiendo la convención de commits (feat, fix, docs, style, refactor, test, chore).
- Organizar el código en carpetas lógicas (components, pages, lib, utils, etc).
- Usar ramas para nuevas features o fixes, y hacer merge a main solo cuando estén completas.

## Coding rules
1. Read the Next.js docs in `node_modules/next/dist/docs` before using any API
2. All DB access must go through `lib/db.ts` singleton - never create a new `MongoClient` inline
3. All money values stored and computed in **cents** (integers) - format for display only at render time
4. API routes return `{error: string}` on failure with the appropriate HTTP status code
5. No `any` types - use TypeScript interfaces in `lib/types.ts`
6. Server components fetch data directly from MongoDB; client components call API routes
7. Use `frontend-design` skill for every new page/component - do not write plain unstyled HTML

## Testing rules
1. Usa Playwright para las pruebas end-to-end, cubriendo flujos críticos como registro, login, facturación, etc.
2. Usa Jest para las pruebas unitarias de funciones críticas en `lib/` como procesamiento de pagos, validación de datos, etc.
3. Escribe pruebas antes de implementar nuevas funcionalidades (TDD) para asegurar buena cobertura y calidad del código.
4. Configura CI para ejecutar las pruebas automáticamente.

## Environment variables
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=invoicing

# AWS S3 / Rustfs
AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=invoicing

# Email
MAILHOG_HOST=localhost
MAIL_PORT=1027

# Next.js
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Retrospective
1. At the end of the project, use the skill `session-retrospective` to generate a retrospective report.
