'use client'

import type { InvoiceItem } from '@/lib/types'

interface LineItemsProps {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
}

export default function InvoiceLineItems({ items, onChange }: LineItemsProps) {
  function updateItem(index: number, field: string, value: string) {
    const updated = [...items]
    const item = { ...updated[index] }

    if (field === 'description') {
      item.description = value
    } else if (field === 'quantity') {
      item.quantity = Number(value) || 0
      item.totalCents = Math.round(item.quantity * item.unitPriceCents)
    } else if (field === 'unitPrice') {
      item.unitPriceCents = Math.round((Number(value) || 0) * 100)
      item.totalCents = Math.round(item.quantity * item.unitPriceCents)
    }

    updated[index] = item
    onChange(updated)
  }

  function addItem() {
    onChange([...items, { description: '', quantity: 1, unitPriceCents: 0, totalCents: 0 }])
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="mb-2 grid grid-cols-[1fr_80px_100px_100px_40px] gap-2 text-xs font-medium text-muted">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit Price</span>
        <span>Total</span>
        <span />
      </div>

      {items.map((item, index) => (
        <div key={index} className="mb-2 grid grid-cols-[1fr_80px_100px_100px_40px] gap-2">
          <input
            value={item.description}
            onChange={(e) => updateItem(index, 'description', e.target.value)}
            placeholder="Item description"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            type="number"
            min="0"
            step="1"
            value={item.quantity || ''}
            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPriceCents ? (item.unitPriceCents / 100).toFixed(2) : ''}
            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
            placeholder="0.00"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="flex items-center px-3 text-sm">
            ${(item.totalCents / 100).toFixed(2)}
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="flex items-center justify-center rounded-lg text-muted transition-colors hover:text-danger"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="mt-2 text-sm text-accent hover:underline"
      >
        + Add line item
      </button>
    </div>
  )
}
