'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Customer } from '@/lib/types'

export default function EditCustomerPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setCustomer(data.customer)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      taxId: form.get('taxId') as string,
      address: {
        street: form.get('street') as string,
        city: form.get('city') as string,
        state: form.get('state') as string,
        zip: form.get('zip') as string,
        country: form.get('country') as string,
      },
    }

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to update customer')
      }

      router.push(`/customers/${id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!customer) {
    return <div className="text-sm text-muted">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link href={`/customers/${id}`} className="text-sm text-muted hover:text-foreground">
          ← Back to Customer
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit Customer</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-surface p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-muted">Name *</label>
            <input id="name" name="name" required defaultValue={customer.name}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-muted">Email *</label>
            <input id="email" name="email" type="email" required defaultValue={customer.email}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label htmlFor="taxId" className="mb-1.5 block text-sm font-medium text-muted">Tax ID</label>
            <input id="taxId" name="taxId" defaultValue={customer.taxId || ''}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>

        <h3 className="mb-4 text-sm font-semibold text-muted">Address</h3>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <input name="street" defaultValue={customer.address?.street || ''} placeholder="Street"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <input name="city" defaultValue={customer.address?.city || ''} placeholder="City"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          <input name="state" defaultValue={customer.address?.state || ''} placeholder="State"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          <input name="zip" defaultValue={customer.address?.zip || ''} placeholder="ZIP Code"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          <input name="country" defaultValue={customer.address?.country || ''} placeholder="Country"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/customers/${id}`}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
