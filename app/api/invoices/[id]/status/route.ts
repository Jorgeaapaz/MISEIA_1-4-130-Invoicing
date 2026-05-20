import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import type { Invoice, InvoiceStatus } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

const validStatuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export async function PATCH(request: NextRequest, context: RouteContext) {
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

    const { status } = await request.json()

    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateFields: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    }

    if (status === 'paid') {
      updateFields.paidAt = new Date()
    }

    const invoices = await getCollection<Invoice>('invoices')
    const result = await invoices.updateOne(
      { _id: objectId, userId: session.user._id },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return Response.json({ message: 'Status updated' })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
