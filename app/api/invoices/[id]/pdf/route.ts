import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import { generateInvoicePdf } from '@/lib/pdf'
import type { Invoice, Customer, User } from '@/lib/types'

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

    const invoicesCol = await getCollection<Invoice>('invoices')
    const invoice = await invoicesCol.findOne({
      _id: objectId,
      userId: session.user._id,
    })

    if (!invoice) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const customersCol = await getCollection<Customer>('customers')
    const customer = await customersCol.findOne({ _id: invoice.customerId })

    if (!customer) {
      return Response.json({ error: 'Customer not found' }, { status: 404 })
    }

    const usersCol = await getCollection<User>('users')
    const user = await usersCol.findOne({ _id: session.user._id })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const pdfBuffer = await generateInvoicePdf(invoice, customer, user)

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${invoice.number}.pdf`,
      },
    })
  } catch (err) {
    console.error('[PDF] generation error:', err)
    return Response.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
