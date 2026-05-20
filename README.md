# Invoicing SaaS

A **Next.js 16 TypeScript SaaS application** that lets users manage customers, create invoices, generate PDFs, and send them by email — all protected by password-less magic link authentication.

---

## Features Implemented

### Magic Link Authentication
Fully custom auth (no NextAuth/Auth.js) built on top of the native MongoDB driver. The user submits their email → a one-time token (15-minute expiry) is generated and stored in `magic_links` → a link is dispatched via Mailhog → clicking the link validates the token and creates a 7-day HTTP-only session cookie. Tokens are single-use (`used: true` after validation).

### Customer & Invoice Management
Full CRUD for both resources, scoped per authenticated user (`userId` on every query). Invoices support line items with per-unit pricing (all monetary values stored in **cents** as integers), tax calculation, status lifecycle (`draft → sent → paid → cancelled`), PDF generation via PDFKit, and one-click email delivery with the PDF attached.

### PDF Generation & Email Delivery
`lib/pdf.ts` renders a professional A4 invoice document (company info, line items table, subtotals, tax, notes). `lib/email.ts` uses Nodemailer pointed at a local Mailhog instance; it handles both magic-link auth emails and invoice-delivery emails with optional PDF attachments.

---

## Project Structure

```
invoicing/
├── app/
│   ├── page.tsx                          # Landing page (hero + CTAs)
│   ├── layout.tsx                        # Root HTML shell + Geist fonts
│   ├── globals.css                       # Global Tailwind base styles
│   ├── auth/
│   │   ├── login/page.tsx                # Magic link request form
│   │   └── verify/page.tsx              # Token validation landing page
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # Protected dashboard shell (Sidebar + TopBar)
│   │   ├── dashboard/page.tsx           # Overview / stats
│   │   ├── customers/                   # Customer list, create, view, edit pages
│   │   ├── invoices/                    # Invoice list, create, view, edit pages
│   │   └── settings/page.tsx            # Company info settings
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts           # POST – generate & email magic link
│       │   ├── verify/route.ts          # GET  – validate token, create session
│       │   ├── logout/route.ts          # POST – destroy session
│       │   └── me/route.ts              # GET  – return current user
│       ├── customers/
│       │   ├── route.ts                 # GET list / POST create
│       │   └── [id]/route.ts            # GET / PUT / DELETE by id
│       ├── invoices/
│       │   ├── route.ts                 # GET list / POST create
│       │   └── [id]/
│       │       ├── route.ts             # GET / PUT / DELETE by id
│       │       ├── pdf/route.ts         # GET  – stream PDF
│       │       ├── send/route.ts        # POST – email invoice with PDF
│       │       └── status/route.ts      # PUT  – update status
│       └── settings/route.ts            # GET / PUT company info
├── lib/
│   ├── db.ts                            # MongoDB singleton + index creation
│   ├── auth.ts                          # Magic link, session, cookie logic
│   ├── email.ts                         # Nodemailer / Mailhog integration
│   ├── pdf.ts                           # PDFKit invoice renderer
│   ├── format.ts                        # Currency & date formatters (cents <-> dollars)
│   ├── types.ts                         # Shared TypeScript interfaces
│   └── context/GlobalContext.tsx        # React context for authenticated user state
├── components/
│   ├── ui/
│   │   ├── Sidebar.tsx                  # Dashboard navigation sidebar
│   │   └── TopBar.tsx                   # Header with user info + logout
│   └── invoice/
│       └── InvoiceLineItems.tsx         # Line-item table component
├── next.config.ts                       # Next.js configuration
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Dependencies & scripts
```

---

## Design Patterns / Architecture

| Pattern | Where it's applied |
|---|---|
| **Singleton** | `lib/db.ts` — one `MongoClient` instance is reused across all server-side calls via a module-level cached promise |
| **Repository (implicit)** | Each API route is the only place that reads/writes its collection; business logic lives in `lib/` helpers, not inline |
| **Context / Provider** | `GlobalContext.tsx` wraps the entire app to expose the authenticated user without prop drilling |
| **Route Groups** | `app/(dashboard)/` groups all protected pages under a shared layout without affecting URL paths |
| **Money-as-integers** | All prices are stored and computed in cents; `formatCents()` in `lib/format.ts` converts to display strings at render time only |

Session verification is handled **inside** server components and API routes directly (no `middleware.tsx`), keeping the auth boundary explicit and easy to audit.

---

## How It Works

A user visits the login page, enters their email, and receives a magic link. Clicking the link hits `/api/auth/verify`, which validates the token, opens a MongoDB session record, and sets an HTTP-only cookie. From that point every dashboard page or API call reads the cookie server-side to authenticate the request. Invoices are created with line items, rendered to PDF on demand, and can be emailed directly to the customer.

```ts
// lib/auth.ts — simplified magic link flow
export async function sendMagicLink(email: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  const db = await getDb();
  await db.collection('magic_links').insertOne({ email, token, expiresAt, used: false });
  await sendEmail({
    to: email,
    subject: 'Your login link',
    html: `<a href="${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${token}">Sign in</a>`,
  });
}

export async function verifyMagicLink(token: string): Promise<string | null> {
  const db = await getDb();
  const link = await db.collection('magic_links').findOneAndUpdate(
    { token, used: false, expiresAt: { $gt: new Date() } },
    { $set: { used: true } },
  );
  return link?.email ?? null;
}
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally on port `27017`
- Docker (for Mailhog on port `1025`/`8025` and Rustfs/MinIO on port `10000`)

### Clone & Install

```bash
git clone https://github.com/Jorgeaapaz/MISEIA_1-4-130-Invoicing.git
cd MISEIA_1-4-130-Invoicing
npm install
```

### Environment Variables

Copy the values below into a `.env.local` file at the project root:

```env
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

### Run

```bash
npm run dev      # development server at http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

Open [http://localhost:8025](http://localhost:8025) to view emails captured by Mailhog.

---

## Example Output

**Successful magic link login**

1. `POST /api/auth/login` with `{ "email": "user@example.com" }`
2. Response: `{ "message": "Magic link sent" }` — email appears in Mailhog inbox
3. `GET /api/auth/verify?token=<uuid>` — sets session cookie, redirects to `/dashboard`

**Creating an invoice**

```json
POST /api/invoices
{
  "customerId": "683abc...",
  "items": [
    { "description": "Web development", "quantity": 10, "unitPrice": 15000 }
  ],
  "taxRate": 21,
  "notes": "Payment due in 30 days"
}
```

```json
{
  "_id": "683def...",
  "status": "draft",
  "subtotal": 150000,
  "taxAmount": 31500,
  "total": 181500
}
```

**Expired / already-used magic link**

```json
GET /api/auth/verify?token=<stale-uuid>

HTTP 400
{ "error": "Invalid or expired magic link" }
```
