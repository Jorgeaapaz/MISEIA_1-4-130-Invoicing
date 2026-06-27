import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import type { Customer } from '@/lib/types'
import Link from 'next/link'

export default async function CustomersPage() {
  const session = await getSession()
  if (!session) return null

  const customers = await getCollection<Customer>('customers')
  const list = await customers
    .find({ userId: session.user._id })
    .sort({ createdAt: -1 })
    .toArray()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted">{list.length} total</p>
        </div>
        <Link
          href="/customers/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Add Customer
        </Link>
      </div>

      <div className="rounded-xl border border-border/50 bg-surface">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
              👤
            </div>
            <h3 className="mb-1 font-semibold">No customers yet</h3>
            <p className="mb-5 text-sm text-muted">Add your first customer to start creating invoices.</p>
            <Link
              href="/customers/new"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Add your first customer
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {list.map((customer) => (
              <Link
                key={customer._id.toString()}
                href={`/customers/${customer._id.toString()}`}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-hover"
              >
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted">{customer.email}</p>
                </div>
                <span className="text-sm text-muted">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
