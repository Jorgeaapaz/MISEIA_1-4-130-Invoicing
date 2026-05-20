import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import type { Customer, Invoice } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const customers = await getCollection<Customer>('customers')
    const customer = await customers.findOne({
      _id: objectId,
      userId: session.user._id,
    })

    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    return Response.json({ customer })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, taxId, address } = body

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const customers = await getCollection<Customer>('customers')
    const result = await customers.updateOne(
      { _id: objectId, userId: session.user._id },
      {
        $set: {
          name,
          email,
          taxId: taxId || undefined,
          address: address || undefined,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    return Response.json({ message: 'Customer updated' })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return Response.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const invoices = await getCollection<Invoice>('invoices')
    const hasInvoices = await invoices.findOne({ customerId: objectId })
    if (hasInvoices) {
      return Response.json(
        { error: 'Cannot delete customer with existing invoices' },
        { status: 409 }
      )
    }

    const customers = await getCollection<Customer>('customers')
    const result = await customers.deleteOne({
      _id: objectId,
      userId: session.user._id,
    })

    if (result.deletedCount === 0) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    return Response.json({ message: 'Customer deleted' })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
