import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import { formatCents, formatDate } from '@/lib/format'
import type { Invoice } from '@/lib/types'
import Link from 'next/link'

const statusStyles: Record<string, string> = {
  draft: 'bg-muted/20 text-muted',
  sent: 'bg-accent/20 text-accent',
  paid: 'bg-success/20 text-success',
  overdue: 'bg-danger/20 text-danger',
  cancelled: 'bg-muted/20 text-muted',
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const session = await getSession()
  if (!session) return null

  const invoicesCol = await getCollection<Invoice>('invoices')
  const query: Record<string, unknown> = { userId: session.user._id }
  if (filterStatus && filterStatus !== 'all') {
    query.status = filterStatus
  }

  const invoices = await invoicesCol.find(query).sort({ createdAt: -1 }).toArray()

  const statuses = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled']

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted">{invoices.length} total</p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === 'all' ? '/invoices' : `/invoices?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              (filterStatus || 'all') === s
                ? 'bg-accent text-white'
                : 'bg-surface text-muted hover:text-foreground'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-surface">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
              🧾
            </div>
            <h3 className="mb-1 font-semibold">
              {filterStatus && filterStatus !== 'all' ? `No ${filterStatus} invoices` : 'No invoices yet'}
            </h3>
            <p className="mb-5 text-sm text-muted">
              {filterStatus && filterStatus !== 'all'
                ? 'Try a different status filter or create a new invoice.'
                : 'Create your first invoice to get started.'}
            </p>
            <Link
              href="/invoices/new"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Create invoice
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {invoices.map((invoice) => {
              const isOverdue = invoice.status === 'sent' && new Date(invoice.dueAt) < new Date()
              const displayStatus = isOverdue ? 'overdue' : invoice.status

              return (
                <Link
                  key={invoice._id.toString()}
                  href={`/invoices/${invoice._id.toString()}`}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-sm text-muted">{formatDate(invoice.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[displayStatus] || statusStyles.draft}`}
                    >
                      {displayStatus}
                    </span>
                    <span className="w-24 text-right font-medium">
                      {formatCents(invoice.totalCents)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
