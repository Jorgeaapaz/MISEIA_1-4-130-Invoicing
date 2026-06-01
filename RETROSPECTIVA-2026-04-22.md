# Retrospectiva de Sesión — 2026-04-22
### Implementación completa del Invoicing SaaS

## Resumen / Overview
Se implementó desde cero un SaaS de facturación completo sobre un proyecto Next.js 16.2.4 recién creado con `create-next-app`. La sesión cubrió las 6 fases planificadas: fundación (DB, auth, email), landing page, dashboard con layout autenticado, CRUD de clientes, CRUD de facturas con líneas dinámicas, generación de PDF y settings. El build final (`npm run build`) compiló exitosamente con todas las 25 rutas registradas.

## Proceso de Creación
Se inicia con un prompt sencillo `PROMPT.md`, a Claude Code se le indicó  lo siguinte: 
```
Usando la skill `microprompt` y el archivo `PROMPT.md`, add al fichero AGENTS.md la especificación.
```
Una vez generado el archivo `AGENTS.md`, se le indicó  a Claude Code:
```
Usa AGENTS.md e implementa la aplicación.
```

## Proceso de instalación / Installation

### 1. Dependencias instaladas
```bash
npm install mongodb nodemailer
npm install -D @types/nodemailer
npm install pdfkit
npm install -D @types/pdfkit
```

### 2. Variables de entorno
Se creó `.env.local` con:
```env
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

### 3. Estructura de archivos creados

```
invoicing/
  .env.local
  proxy.ts                              # Protección de rutas (Next.js 16 proxy)
  lib/
    types.ts                            # Interfaces TypeScript
    db.ts                               # MongoDB singleton
    auth.ts                             # Magic link + sesiones
    email.ts                            # Nodemailer → Mailhog
    format.ts                           # Formateo moneda/fecha
    pdf.ts                              # Generación PDF con PDFKit
    context/
      GlobalContext.tsx                  # Provider de estado global
  app/
    globals.css                         # Dark theme forzado + variables CSS
    layout.tsx                          # Root layout (metadata actualizada)
    page.tsx                            # Landing page
    auth/
      login/page.tsx                    # Formulario magic link
      verify/page.tsx                   # Validación de token
    api/
      auth/login/route.ts              # POST: enviar magic link
      auth/logout/route.ts             # POST: destruir sesión
      auth/me/route.ts                 # GET: usuario actual
      customers/route.ts               # GET lista, POST crear
      customers/[id]/route.ts          # GET, PUT, DELETE
      invoices/route.ts                # GET lista, POST crear
      invoices/[id]/route.ts           # GET, PUT, DELETE
      invoices/[id]/pdf/route.ts       # GET: descargar PDF
      invoices/[id]/send/route.ts      # POST: enviar por email
      invoices/[id]/status/route.ts    # PATCH: cambiar estado
      settings/route.ts                # GET, PUT perfil usuario
    (dashboard)/
      layout.tsx                        # Layout autenticado (sidebar + topbar + GlobalProvider)
      dashboard/page.tsx                # Dashboard con stats
      customers/page.tsx                # Lista clientes
      customers/new/page.tsx            # Crear cliente
      customers/[id]/page.tsx           # Detalle cliente
      customers/[id]/edit/page.tsx      # Editar cliente
      invoices/page.tsx                 # Lista facturas con filtros
      invoices/new/page.tsx             # Crear factura con líneas dinámicas
      invoices/[id]/page.tsx            # Detalle factura
      invoices/[id]/edit/page.tsx       # Editar factura (solo draft)
      settings/page.tsx                 # Configuración perfil/empresa
  components/
    ui/Sidebar.tsx                      # Navegación lateral responsive
    ui/TopBar.tsx                       # Header con email + logout
    invoice/InvoiceLineItems.tsx        # Componente líneas dinámicas
```

## Comandos ejecutados / Commands Run

| Comando | Descripción |
|---------|-------------|
| `npm install mongodb nodemailer` | Driver nativo MongoDB + cliente SMTP |
| `npm install -D @types/nodemailer` | Tipos TypeScript para nodemailer |
| `npm install pdfkit` | Librería de generación de PDF |
| `npm install -D @types/pdfkit` | Tipos TypeScript para pdfkit |
| `npx next build` | Verificación de compilación (2 ejecuciones) |

## Levantar y detener la aplicación / Running & Stopping

### Prerrequisitos
- **MongoDB** corriendo en `localhost:27017` (instalado localmente)
- **Mailhog** corriendo en Docker (SMTP en puerto `1027`, UI web en `8025`)

### Iniciar
```bash
cd D:/Master-IA-Dev/04-Bloque4/1-4-130-Invoicing/invoicing
npm run dev
```

### Detener
`Ctrl+C` en la terminal donde corre `npm run dev`.

### Build de producción
```bash
npm run build
npm start
```

### Probar el flujo de autenticación
1. Ir a `http://localhost:3000`
2. Click en "Get Started Free" o "Sign In"
3. Introducir un email y enviar
4. Abrir Mailhog en `http://localhost:8025` para ver el magic link
5. Click en el enlace → redirige a `/dashboard`

### Probar endpoints con curl
```bash
# Login (envía magic link)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Ver usuario autenticado (requiere cookie de sesión)
curl http://localhost:3000/api/auth/me -b "session=<token>"

# Listar clientes
curl http://localhost:3000/api/customers -b "session=<token>"

# Crear cliente
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -b "session=<token>" \
  -d '{"name":"Acme Corp","email":"billing@acme.com"}'

# Listar facturas
curl http://localhost:3000/api/invoices -b "session=<token>"

# Descargar PDF de factura
curl http://localhost:3000/api/invoices/<id>/pdf -b "session=<token>" -o invoice.pdf
```

## Configuración de red / Network Configuration

Esta aplicación corre directamente en Windows (no en VM), por lo que **no se requiere configuración NAT ni port forwarding**.

### Nota sobre VirtualBox (si se migra a VM)
> **Aclaración — VirtualBox NAT:** Si la app se moviera a una VM con adaptador NAT en VirtualBox, el dominio no resolvería automáticamente desde la máquina física Windows. Se debería agregar una entrada manual en el archivo de hosts de Windows.
>
> Editar (como Administrador) `C:\Windows\System32\drivers\etc\hosts` y agregar:
> ```
> 127.0.0.1   invoicing.local
> ```

## URLs de prueba / Test URLs

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Landing page |
| `http://localhost:3000/auth/login` | Login con magic link |
| `http://localhost:3000/dashboard` | Dashboard (requiere sesión) |
| `http://localhost:3000/customers` | Gestión de clientes |
| `http://localhost:3000/invoices` | Gestión de facturas |
| `http://localhost:3000/settings` | Configuración perfil/empresa |
| `http://localhost:8025` | Mailhog UI (ver emails enviados) |

## Problemas encontrados / Problems & Solutions

| Problem | Solution |
|---------|----------|
| Error de tipo: `Buffer` no es asignable a `BodyInit` en la ruta PDF | Se envolvió el buffer con `new Uint8Array(pdfBuffer)` en `app/api/invoices/[id]/pdf/route.ts:51` |

## Resultados y conclusiones / Results & Conclusions

### Lo que funcionó
- **Build exitoso** — Las 25 rutas compilan sin errores con Next.js 16.2.4 (Turbopack)
- **Arquitectura limpia** — Separación clara: `lib/` para lógica de negocio, `app/api/` para API routes, `app/(dashboard)/` para páginas autenticadas, `components/` para UI reutilizable
- **Proxy en lugar de middleware** — Siguiendo la convención de Next.js 16 (`proxy.ts` con export nombrado `proxy`)
- **Dinero en centavos** — Todos los valores monetarios como enteros, formateo solo en render
- **Magic link auth** — Implementación propia sin librerías externas, tokens de un solo uso con expiración de 15 min
- **Dark theme consistente** — Variables CSS globales aplicadas en toda la app

### Pendiente para próximas sesiones
- Probar el flujo completo end-to-end con MongoDB y Mailhog corriendo
- Implementar almacenamiento de PDFs en S3/Rustfs
- Añadir tests (Playwright E2E + Jest unitarios según AGENTS.md)
- Configurar CI para ejecutar tests automáticamente
- Considerar añadir paginación a las listas de clientes/facturas cuando crezcan
