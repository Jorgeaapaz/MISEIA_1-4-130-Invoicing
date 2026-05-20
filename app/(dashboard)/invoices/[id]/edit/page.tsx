'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import InvoiceLineItems from '@/components/invoice/InvoiceLineItems'
import type { Customer, Invoice, InvoiceItem } from '@/lib/types'

export default function EditInvoicePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [taxRate, setTaxRate] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/invoices/${id}`).then((r) => r.json()),
      fetch('/api/customers').then((r) => r.json()),
    ]).then(([invData, custData]) => {
      if (invData.invoice) {
        const inv = invData.invoice
        setInvoice(inv)
        setCustomerId(inv.customerId)
        setItems(inv.items)
        setTaxRate(inv.taxRate || 0)
        setDueDate(inv.dueAt ? new Date(inv.dueAt).toISOString().split('T')[0] : '')
        setNotes(inv.notes || '')
      }
      setCustomers(custData.customers || [])
    })
  }, [id])

  const subtotalCents = items.reduce((sum, item) => sum + item.totalCents, 0)
  const taxCents = Math.round(subtotalCents * (taxRate / 100))
  const totalCents = subtotalCents + taxCents

  async function handleSubmit(e: React.FormEvent) {
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
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          items: validItems,
          taxRate,
          dueAt: dueDate || undefined,
          notes: notes || undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to update invoice')
      }

      router.push(`/invoices/${id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!invoice) return <div className="text-sm text-muted">Loading...</div>

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link href={`/invoices/${id}`} className="text-sm text-muted hover:text-foreground">
          ← Back to Invoice
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit {invoice.number}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="rounded-xl border border-border/50 bg-surface p-6">
          <h3 className="mb-4 font-semibold">Line Items</h3>
          <InvoiceLineItems items={items} onChange={setItems} />
        </div>

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
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="mt-4 border-t border-border/50 pt-4 text-right">
            <div className="text-sm text-muted">Subtotal: ${(subtotalCents / 100).toFixed(2)}</div>
            {taxRate > 0 && <div className="text-sm text-muted">Tax ({taxRate}%): ${(taxCents / 100).toFixed(2)}</div>}
            <div className="mt-1 text-lg font-bold">Total: ${(totalCents / 100).toFixed(2)}</div>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/invoices/${id}`}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
