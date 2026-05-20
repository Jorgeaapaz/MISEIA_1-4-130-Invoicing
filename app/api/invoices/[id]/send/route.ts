import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import { sendInvoiceEmail } from '@/lib/email'
import { formatCents } from '@/lib/format'
import type { Invoice, Customer } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: NextRequest, context: RouteContext) {
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

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice ${invoice.number}</h2>
        <p>Dear ${customer.name},</p>
        <p>Please find your invoice details below:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="border-bottom: 1px solid #ddd;">
              <th style="text-align: left; padding: 8px;">Description</th>
              <th style="text-align: right; padding: 8px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px;">${item.description} (x${item.quantity})</td>
                <td style="text-align: right; padding: 8px;">${formatCents(item.totalCents)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Total</td>
              <td style="text-align: right; padding: 8px; font-weight: bold;">${formatCents(invoice.totalCents)}</td>
            </tr>
          </tfoot>
        </table>
        ${invoice.notes ? `<p style="color: #666;">${invoice.notes}</p>` : ''}
      </div>
    `

    await sendInvoiceEmail(customer.email, `Invoice ${invoice.number}`, html)

    await invoicesCol.updateOne(
      { _id: objectId },
      { $set: { status: 'sent', updatedAt: new Date() } }
    )

    return Response.json({ message: 'Invoice sent' })
  } catch {
    return Response.json({ error: 'Failed to send invoice' }, { status: 500 })
  }
}
