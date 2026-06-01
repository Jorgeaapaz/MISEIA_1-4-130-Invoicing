import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { GlobalProvider } from '@/lib/context/GlobalContext'
import Sidebar from '@/components/ui/Sidebar'
import TopBar from '@/components/ui/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession().catch(() => null)

  if (!session) {
    redirect('/auth/login')
  }

  const serializedUser = JSON.parse(JSON.stringify(session.user))

  return (
    <GlobalProvider initialUser={serializedUser}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </GlobalProvider>
  )
}
