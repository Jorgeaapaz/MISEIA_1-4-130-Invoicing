import { ObjectId } from 'mongodb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import { formatCents, formatDate } from '@/lib/format'
import type { Invoice, Customer } from '@/lib/types'

const statusStyles: Record<string, string> = {
  draft: 'bg-muted/20 text-muted',
  sent: 'bg-accent/20 text-accent',
  paid: 'bg-success/20 text-success',
  overdue: 'bg-danger/20 text-danger',
  cancelled: 'bg-muted/20 text-muted',
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    notFound()
  }

  const invoicesCol = await getCollection<Invoice>('invoices')
  const invoice = await invoicesCol.findOne({
    _id: objectId,
    userId: session.user._id,
  })
  if (!invoice) notFound()

  const customersCol = await getCollection<Customer>('customers')
  const customer = await customersCol.findOne({ _id: invoice.customerId })

  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueAt) < new Date()
  const displayStatus = isOverdue ? 'overdue' : invoice.status

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link href="/invoices" className="text-sm text-muted hover:text-foreground">
          ← Back to Invoices
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{invoice.number}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[displayStatus]}`}>
              {displayStatus}
            </span>
          </div>
          {customer && <p className="text-sm text-muted">{customer.name}</p>}
        </div>
        <div className="flex gap-2">
          {invoice.status === 'draft' && (
            <Link
              href={`/invoices/${id}/edit`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Edit
            </Link>
          )}
          <InvoiceActions id={id} status={invoice.status} />
        </div>
      </div>

      {/* Dates */}
      <div className="mb-6 grid gap-4 rounded-xl border border-border/50 bg-surface p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted">Issued</p>
          <p className="text-sm font-medium">{formatDate(invoice.issuedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Due</p>
          <p className="text-sm font-medium">{formatDate(invoice.dueAt)}</p>
        </div>
        {invoice.paidAt && (
          <div>
            <p className="text-xs text-muted">Paid</p>
            <p className="text-sm font-medium">{formatDate(invoice.paidAt)}</p>
          </div>
        )}
      </div>

      {/* Customer info */}
      {customer && (
        <div className="mb-6 rounded-xl border border-border/50 bg-surface p-5">
          <p className="mb-1 text-xs text-muted">Bill To</p>
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-muted">{customer.email}</p>
          {customer.address?.street && (
            <p className="text-sm text-muted">
              {[customer.address.street, customer.address.city, customer.address.state, customer.address.zip]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Line items */}
      <div className="mb-6 rounded-xl border border-border/50 bg-surface">
        <div className="border-b border-border/50 px-5 py-3">
          <div className="grid grid-cols-[1fr_80px_100px_100px] gap-2 text-xs font-medium text-muted">
            <span>Description</span>
            <span>Qty</span>
            <span>Unit Price</span>
            <span className="text-right">Total</span>
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {invoice.items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_100px_100px] gap-2 px-5 py-3 text-sm">
              <span>{item.description}</span>
              <span className="text-muted">{item.quantity}</span>
              <span className="text-muted">{formatCents(item.unitPriceCents)}</span>
              <span className="text-right font-medium">{formatCents(item.totalCents)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border/50 px-5 py-4 text-right">
          <div className="text-sm text-muted">
            Subtotal: <span className="text-foreground">{formatCents(invoice.subtotalCents)}</span>
          </div>
          {invoice.taxCents > 0 && (
            <div className="text-sm text-muted">
              Tax ({invoice.taxRate}%): <span className="text-foreground">{formatCents(invoice.taxCents)}</span>
            </div>
          )}
          <div className="mt-1 text-lg font-bold">{formatCents(invoice.totalCents)}</div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="rounded-xl border border-border/50 bg-surface p-5">
          <p className="mb-1 text-xs text-muted">Notes</p>
          <p className="text-sm">{invoice.notes}</p>
        </div>
      )}
    </div>
  )
}

function InvoiceActions({ id, status }: { id: string; status: string }) {
  return (
    <div className="flex gap-2">
      {status === 'sent' && (
        <form
          action={async () => {
            'use server'
            const { getSession } = await import('@/lib/auth')
            const { getCollection } = await import('@/lib/db')
            const { ObjectId } = await import('mongodb')
            const { revalidatePath } = await import('next/cache')

            const session = await getSession()
            if (!session) return

            await (await getCollection<Invoice>('invoices')).updateOne(
              { _id: new ObjectId(id), userId: session.user._id },
              { $set: { status: 'paid', paidAt: new Date(), updatedAt: new Date() } }
            )
            revalidatePath(`/invoices/${id}`)
          }}
        >
          <button
            type="submit"
            className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success transition-colors hover:bg-success/20"
          >
            Mark Paid
          </button>
        </form>
      )}
      <a
        href={`/api/invoices/${id}/pdf`}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        PDF
      </a>
      {(status === 'draft' || status === 'sent') && (
        <form
          action={async () => {
            'use server'
            const { getSession } = await import('@/lib/auth')
            const { getCollection } = await import('@/lib/db')
            const { ObjectId } = await import('mongodb')
            const { redirect } = await import('next/navigation')

            const session = await getSession()
            if (!session) return

            await (await getCollection<Invoice>('invoices')).deleteOne({
              _id: new ObjectId(id),
              userId: session.user._id,
            })
            redirect('/invoices')
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            Delete
          </button>
        </form>
      )}
    </div>
  )
}
