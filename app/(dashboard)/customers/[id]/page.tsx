import { ObjectId } from 'mongodb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import { formatCents, formatDate } from '@/lib/format'
import type { Customer, Invoice } from '@/lib/types'

export default async function CustomerDetailPage({
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

  const customers = await getCollection<Customer>('customers')
  const customer = await customers.findOne({
    _id: objectId,
    userId: session.user._id,
  })

  if (!customer) notFound()

  const invoicesCol = await getCollection<Invoice>('invoices')
  const customerInvoices = await invoicesCol
    .find({ customerId: objectId })
    .sort({ createdAt: -1 })
    .toArray()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link href="/customers" className="text-sm text-muted hover:text-foreground">
          ← Back to Customers
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-muted">{customer.email}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/customers/${id}/edit`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Edit
          </Link>
          <DeleteButton id={id} />
        </div>
      </div>

      {/* Details */}
      <div className="mb-8 rounded-xl border border-border/50 bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {customer.taxId && (
            <div>
              <p className="text-xs text-muted">Tax ID</p>
              <p className="text-sm">{customer.taxId}</p>
            </div>
          )}
          {customer.address?.street && (
            <div>
              <p className="text-xs text-muted">Address</p>
              <p className="text-sm">
                {[customer.address.street, customer.address.city, customer.address.state, customer.address.zip, customer.address.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted">Created</p>
            <p className="text-sm">{formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Customer invoices */}
      <div className="rounded-xl border border-border/50 bg-surface">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h2 className="font-semibold">Invoices ({customerInvoices.length})</h2>
          <Link
            href={`/invoices/new?customerId=${id}`}
            className="text-sm text-accent hover:underline"
          >
            New Invoice
          </Link>
        </div>
        {customerInvoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No invoices for this customer yet.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {customerInvoices.map((inv) => (
              <Link
                key={inv._id.toString()}
                href={`/invoices/${inv._id.toString()}`}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface-hover"
              >
                <div>
                  <span className="font-medium">{inv.number}</span>
                  <span className="ml-3 text-sm text-muted">{formatDate(inv.createdAt)}</span>
                </div>
                <span className="font-medium">{formatCents(inv.totalCents)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        'use server'
        const { getSession } = await import('@/lib/auth')
        const { getCollection } = await import('@/lib/db')
        const { ObjectId } = await import('mongodb')
        const { redirect } = await import('next/navigation')

        const session = await getSession()
        if (!session) return

        const invoicesCol = await getCollection<Invoice>('invoices')
        const hasInvoices = await invoicesCol.findOne({ customerId: new ObjectId(id) })
        if (hasInvoices) return

        const customers = await getCollection<Customer>('customers')
        await customers.deleteOne({ _id: new ObjectId(id), userId: session.user._id })
        redirect('/customers')
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
      >
        Delete
      </button>
    </form>
  )
}
