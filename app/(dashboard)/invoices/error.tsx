'use client'

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-2xl text-danger">
        ✕
      </div>
      <h2 className="mb-2 text-lg font-semibold">Failed to load invoices</h2>
      <p className="mb-6 max-w-sm text-sm text-muted">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  )
}
