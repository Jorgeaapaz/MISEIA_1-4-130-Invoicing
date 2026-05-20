'use client'

import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/lib/context/GlobalContext'

export default function TopBar() {
  const { user } = useGlobalContext()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-end border-b border-border bg-surface px-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-danger hover:text-danger"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
