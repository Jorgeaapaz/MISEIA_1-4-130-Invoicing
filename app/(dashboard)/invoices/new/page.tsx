'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import InvoiceLineItems from '@/components/invoice/InvoiceLineItems'
import type { Customer, InvoiceItem } from '@/lib/types'

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCustomer = searchParams.get('customerId') || ''

  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState(preselectedCustomer)
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPriceCents: 0, totalCents: 0 },
  ])
  const [taxRate, setTaxRate] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []))
  }, [])

  const subtotalCents = items.reduce((sum, item) => sum + item.totalCents, 0)
  const taxCents = Math.round(subtotalCents * (taxRate / 100))
  const totalCents = subtotalCents + taxCents

  async function handleSubmit(e: React.FormEvent, asDraft: boolean) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const validItems = items.filter((item) => item.description && item.totalCents > 0)
    if (validItems.length === 0) {
      setError('Add at least one line item')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          items: validItems,
          taxRate,
          dueAt: dueDate || undefined,
          notes: notes || undefined,
          status: asDraft ? 'draft' : 'sent',
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to create invoice')
      }

      router.push('/invoices')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link href="/invoices" className="text-sm text-muted hover:text-foreground">
          ← Back to Invoices
        </Link>
        <h1 className="mt-2 text-2xl font-bold">New Invoice</h1>
      </div>

      <form className="space-y-6">
        {/* Customer & dates */}
        <div className="rounded-xl border border-border/50 bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Customer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c._id.toString()} value={c._id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl border border-border/50 bg-surface p-6">
          <h3 className="mb-4 font-semibold">Line Items</h3>
          <InvoiceLineItems items={items} onChange={setItems} />
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-border/50 bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate || ''}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Payment terms, thank you note..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="mt-4 border-t border-border/50 pt-4 text-right">
            <div className="text-sm text-muted">
              Subtotal: <span className="text-foreground">${(subtotalCents / 100).toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="text-sm text-muted">
                Tax ({taxRate}%): <span className="text-foreground">${(taxCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="mt-1 text-lg font-bold">
              Total: ${(totalCents / 100).toFixed(2)}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create & Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
