export default function CustomersLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-surface-hover" />
          <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-surface-hover" />
      </div>
      <div className="rounded-xl border border-border/50 bg-surface divide-y divide-border/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div className="space-y-1.5">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-28 animate-pulse rounded bg-surface-hover" />
            </div>
            <div className="h-4 w-4 animate-pulse rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    </div>
  )
}
