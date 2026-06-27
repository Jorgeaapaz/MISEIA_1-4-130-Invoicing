export default function InvoicesLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-28 animate-pulse rounded-lg bg-surface-hover" />
          <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-hover" />
      </div>
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-surface-hover" />
        ))}
      </div>
      <div className="rounded-xl border border-border/50 bg-surface divide-y divide-border/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="space-y-1.5">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-20 animate-pulse rounded bg-surface-hover" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-5 w-16 animate-pulse rounded-full bg-surface-hover" />
              <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
