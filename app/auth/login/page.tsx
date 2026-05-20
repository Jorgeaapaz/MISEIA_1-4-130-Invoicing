'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send magic link')
      }

      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center text-xl font-bold tracking-tight">
          <span className="text-accent">●</span> Invoicing
        </Link>

        {status === 'sent' ? (
          <div className="rounded-2xl border border-border/50 bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-2xl text-success">
              ✓
            </div>
            <h2 className="mb-2 text-xl font-bold">Check your email</h2>
            <p className="text-sm text-muted">
              We sent a magic link to <strong className="text-foreground">{email}</strong>.
              Click the link to sign in.
            </p>
            <button
              onClick={() => { setStatus('idle'); setEmail('') }}
              className="mt-6 text-sm text-accent hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-surface p-8">
            <h2 className="mb-1 text-xl font-bold">Sign in</h2>
            <p className="mb-6 text-sm text-muted">
              Enter your email to receive a magic link
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-muted">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mb-4 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />

              {status === 'error' && (
                <p className="mb-4 text-sm text-danger">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
