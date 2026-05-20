import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import { formatCents, formatDate } from '@/lib/format'
import type { Invoice } from '@/lib/types'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const invoices = await getCollection<Invoice>('invoices')
  const userId = session.user._id

  const allInvoices = await invoices
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()

  const totalRevenueCents = allInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalCents, 0)

  const pendingCents = allInvoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.totalCents, 0)

  const overdueCount = allInvoices.filter(
    (inv) => inv.status === 'sent' && new Date(inv.dueAt) < new Date()
  ).length

  const recentInvoices = allInvoices.slice(0, 5)

  const stats = [
    { label: 'Total Invoices', value: allInvoices.length.toString(), icon: '◆', color: 'text-accent' },
    { label: 'Revenue', value: formatCents(totalRevenueCents), icon: '↑', color: 'text-success' },
    { label: 'Pending', value: formatCents(pendingCents), icon: '◷', color: 'text-warning' },
    { label: 'Overdue', value: overdueCount.toString(), icon: '!', color: 'text-danger' },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted">
            Welcome back{session.user.name ? `, ${session.user.name}` : ''}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-surface p-5"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className={`text-lg ${stat.color}`}>{stat.icon}</span>
              <span className="text-sm text-muted">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border border-border/50 bg-surface">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h2 className="font-semibold">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No invoices yet. Create your first invoice to get started.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {recentInvoices.map((invoice) => (
              <Link
                key={invoice._id.toString()}
                href={`/invoices/${invoice._id.toString()}`}
                className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface-hover"
              >
                <div>
                  <span className="font-medium">{invoice.number}</span>
                  <span className="ml-3 text-sm text-muted">
                    {formatDate(invoice.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={invoice.status} dueAt={invoice.dueAt} />
                  <span className="font-medium">
                    {formatCents(invoice.totalCents)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status, dueAt }: { status: string; dueAt: Date }) {
  const isOverdue = status === 'sent' && new Date(dueAt) < new Date()
  const displayStatus = isOverdue ? 'overdue' : status

  const styles: Record<string, string> = {
    draft: 'bg-muted/20 text-muted',
    sent: 'bg-accent/20 text-accent',
    paid: 'bg-success/20 text-success',
    overdue: 'bg-danger/20 text-danger',
    cancelled: 'bg-muted/20 text-muted',
  }

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[displayStatus] || styles.draft}`}
    >
      {displayStatus}
    </span>
  )
}
