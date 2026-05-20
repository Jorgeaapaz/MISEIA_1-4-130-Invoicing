import { destroySession } from '@/lib/auth'

export async function POST() {
  try {
    await destroySession()
    return Response.json({ message: 'Logged out' })
  } catch {
    return Response.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
