import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import type { Invoice } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status')

    const query: Record<string, unknown> = { userId: session.user._id }
    if (status && status !== 'all') {
      query.status = status
    }

    const invoices = await getCollection<Invoice>('invoices')
    const list = await invoices.find(query).sort({ createdAt: -1 }).toArray()

    return Response.json({ invoices: list })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, items, taxRate = 0, dueAt, notes, status = 'draft' } = body

    if (!customerId || !items || items.length === 0) {
      return Response.json({ error: 'Customer and items are required' }, { status: 400 })
    }

    const subtotalCents = items.reduce(
      (sum: number, item: { totalCents: number }) => sum + item.totalCents,
      0
    )
    const taxCents = Math.round(subtotalCents * (taxRate / 100))
    const totalCents = subtotalCents + taxCents

    // Generate invoice number
    const invoicesCol = await getCollection<Invoice>('invoices')
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const countToday = await invoicesCol.countDocuments({
      userId: session.user._id,
      number: { $regex: `^INV-${dateStr}` },
    })
    const number = `INV-${dateStr}-${String(countToday + 1).padStart(3, '0')}`

    const now = new Date()
    const result = await invoicesCol.insertOne({
      _id: new ObjectId(),
      userId: session.user._id,
      customerId: new ObjectId(customerId),
      number,
      status,
      items,
      subtotalCents,
      taxRate,
      taxCents,
      totalCents,
      issuedAt: now,
      dueAt: dueAt ? new Date(dueAt) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      notes: notes || undefined,
      createdAt: now,
      updatedAt: now,
    } as Invoice)

    return Response.json({ id: result.insertedId, number }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
