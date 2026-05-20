import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import type { Invoice } from '@/lib/types'

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

    const invoices = await getCollection<Invoice>('invoices')
    const invoice = await invoices.findOne({
      _id: objectId,
      userId: session.user._id,
    })

    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return Response.json({ invoice })
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

    const invoices = await getCollection<Invoice>('invoices')
    const existing = await invoices.findOne({
      _id: objectId,
      userId: session.user._id,
    })

    if (!existing) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (existing.status !== 'draft') {
      return Response.json({ error: 'Only draft invoices can be edited' }, { status: 400 })
    }

    const body = await request.json()
    const { customerId, items, taxRate = 0, dueAt, notes } = body

    const subtotalCents = items.reduce(
      (sum: number, item: { totalCents: number }) => sum + item.totalCents,
      0
    )
    const taxCents = Math.round(subtotalCents * (taxRate / 100))
    const totalCents = subtotalCents + taxCents

    await invoices.updateOne(
      { _id: objectId },
      {
        $set: {
          customerId: new ObjectId(customerId),
          items,
          subtotalCents,
          taxRate,
          taxCents,
          totalCents,
          dueAt: dueAt ? new Date(dueAt) : existing.dueAt,
          notes: notes || undefined,
          updatedAt: new Date(),
        },
      }
    )

    return Response.json({ message: 'Invoice updated' })
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
    const result = await invoices.deleteOne({
      _id: objectId,
      userId: session.user._id,
    })

    if (result.deletedCount === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return Response.json({ message: 'Invoice deleted' })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
