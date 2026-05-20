import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = 'mongodb://localhost:27017'
const MONGODB_DB = 'invoicing'

const USER_EMAIL = 'demo@invoicing.app'

async function seed() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  console.log('Connected to MongoDB')

  // Indexes
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
    db.collection('magic_links').createIndex({ token: 1 }, { unique: true }),
    db.collection('sessions').createIndex({ token: 1 }, { unique: true }),
    db.collection('customers').createIndex({ userId: 1 }),
    db.collection('invoices').createIndex({ userId: 1 }),
    db.collection('invoices').createIndex({ customerId: 1 }),
  ])

  // Clear existing data
  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('customers').deleteMany({}),
    db.collection('invoices').deleteMany({}),
    db.collection('magic_links').deleteMany({}),
    db.collection('sessions').deleteMany({}),
  ])
  console.log('Cleared existing data')

  // User
  const userId = new ObjectId()
  const now = new Date()

  await db.collection('users').insertOne({
    _id: userId,
    email: USER_EMAIL,
    name: 'Alex Rivera',
    company: {
      name: 'Rivera Design Studio',
      address: '123 Creative Ave, San Francisco, CA 94103',
      taxId: 'US-987654321',
      phone: '+1 (415) 555-0192',
    },
    createdAt: now,
    updatedAt: now,
  })
  console.log(`Created user: ${USER_EMAIL}`)

  // Customers
  const customers = [
    {
      _id: new ObjectId(),
      userId,
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      address: { street: '1 Infinite Loop', city: 'Cupertino', state: 'CA', zip: '95014', country: 'US' },
      taxId: 'US-111222333',
      createdAt: daysAgo(90),
      updatedAt: daysAgo(90),
    },
    {
      _id: new ObjectId(),
      userId,
      name: 'Globex Industries',
      email: 'accounts@globex.io',
      address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zip: '62701', country: 'US' },
      taxId: 'US-444555666',
      createdAt: daysAgo(75),
      updatedAt: daysAgo(75),
    },
    {
      _id: new ObjectId(),
      userId,
      name: 'Initech LLC',
      email: 'finance@initech.com',
      address: { street: '4 Pennsylvania Plaza', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
      createdAt: daysAgo(60),
      updatedAt: daysAgo(60),
    },
    {
      _id: new ObjectId(),
      userId,
      name: 'Umbrella Corp',
      email: 'ap@umbrella.biz',
      address: { street: '50 Raccoon Street', city: 'Raccoon City', state: 'MO', zip: '63101', country: 'US' },
      taxId: 'US-777888999',
      createdAt: daysAgo(45),
      updatedAt: daysAgo(45),
    },
    {
      _id: new ObjectId(),
      userId,
      name: 'Stark Industries',
      email: 'payments@stark.com',
      address: { street: '200 Park Avenue', city: 'New York', state: 'NY', zip: '10166', country: 'US' },
      taxId: 'US-100200300',
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
  ]

  await db.collection('customers').insertMany(customers)
  console.log(`Created ${customers.length} customers`)

  // Invoices
  const [acme, globex, initech, umbrella, stark] = customers

  const invoices = [
    // Paid
    invoice(userId, acme._id, 'INV-2025-001', 'paid', daysAgo(80), daysAgo(50), [
      item('Brand identity design', 1, 350000),
      item('Logo variations (5)', 1, 75000),
      item('Style guide document', 1, 50000),
    ], 8, daysAgo(48)),

    invoice(userId, globex._id, 'INV-2025-002', 'paid', daysAgo(70), daysAgo(40), [
      item('Website redesign — 5 pages', 1, 480000),
      item('Mobile responsive implementation', 1, 120000),
    ], 8, daysAgo(35)),

    invoice(userId, initech._id, 'INV-2025-003', 'paid', daysAgo(65), daysAgo(35), [
      item('UI/UX audit report', 1, 150000),
      item('Wireframes (10 screens)', 1, 200000),
      item('Interactive prototype', 1, 100000),
    ], 0, daysAgo(30)),

    // Sent / awaiting payment
    invoice(userId, acme._id, 'INV-2025-004', 'sent', daysAgo(20), daysAhead(10), [
      item('Monthly retainer — April 2025', 1, 400000),
    ], 8),

    invoice(userId, stark._id, 'INV-2025-005', 'sent', daysAgo(15), daysAhead(15), [
      item('Dashboard UI design', 1, 600000),
      item('Component library (React)', 1, 350000),
      item('Design system documentation', 1, 150000),
    ], 8),

    // Overdue
    invoice(userId, umbrella._id, 'INV-2025-006', 'overdue', daysAgo(50), daysAgo(20), [
      item('Product illustration set (12 icons)', 1, 240000),
      item('Revisions (2 rounds)', 1, 60000),
    ], 0),

    invoice(userId, globex._id, 'INV-2025-007', 'overdue', daysAgo(45), daysAgo(15), [
      item('Email template design (5 templates)', 1, 175000),
      item('HTML/CSS coding', 1, 125000),
    ], 8),

    // Draft
    invoice(userId, stark._id, 'INV-2025-008', 'draft', daysAgo(5), daysAhead(25), [
      item('Q2 retainer — May 2025', 1, 400000),
      item('Extra revision hours (8h × $150)', 8, 15000),
    ], 8),

    invoice(userId, initech._id, 'INV-2025-009', 'draft', daysAgo(2), daysAhead(28), [
      item('Pitch deck design (20 slides)', 1, 280000),
    ], 0),

    // Cancelled
    invoice(userId, umbrella._id, 'INV-2025-010', 'cancelled', daysAgo(60), daysAgo(30), [
      item('Social media kit', 1, 180000),
    ], 0),
  ]

  await db.collection('invoices').insertMany(invoices)
  console.log(`Created ${invoices.length} invoices`)

  // Magic link so you can log in immediately
  const magicToken = 'demo-magic-token-seed-2025'
  await db.collection('magic_links').insertOne({
    _id: new ObjectId(),
    email: USER_EMAIL,
    token: magicToken,
    expiresAt: daysAhead(1),
    used: false,
    createdAt: now,
  })

  console.log('\n✓ Seed complete')
  console.log(`\nDemo account: ${USER_EMAIL}`)
  console.log(`Magic link:   http://localhost:3000/api/auth/verify?token=${magicToken}`)

  await client.close()
}

// Helpers

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysAhead(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

function item(description: string, quantity: number, unitPriceCents: number) {
  return { description, quantity, unitPriceCents, totalCents: quantity * unitPriceCents }
}

function invoice(
  userId: ObjectId,
  customerId: ObjectId,
  number: string,
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  issuedAt: Date,
  dueAt: Date,
  items: ReturnType<typeof item>[],
  taxRate: number,
  paidAt?: Date,
) {
  const subtotalCents = items.reduce((s, i) => s + i.totalCents, 0)
  const taxCents = Math.round(subtotalCents * taxRate / 100)
  const totalCents = subtotalCents + taxCents
  const now = new Date()

  return {
    _id: new ObjectId(),
    userId,
    customerId,
    number,
    status,
    items,
    subtotalCents,
    taxRate,
    taxCents,
    totalCents,
    issuedAt,
    dueAt,
    ...(paidAt ? { paidAt } : {}),
    createdAt: issuedAt,
    updatedAt: now,
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
