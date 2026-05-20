import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import type { Customer } from '@/lib/types'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customers = await getCollection<Customer>('customers')
    const list = await customers
      .find({ userId: session.user._id })
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json({ customers: list })
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
    const { name, email, taxId, address } = body

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const now = new Date()
    const customers = await getCollection<Customer>('customers')

    const result = await customers.insertOne({
      _id: new ObjectId(),
      userId: session.user._id,
      name,
      email,
      taxId: taxId || undefined,
      address: address || undefined,
      createdAt: now,
      updatedAt: now,
    } as Customer)

    return Response.json({ id: result.insertedId }, { status: 201 })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
