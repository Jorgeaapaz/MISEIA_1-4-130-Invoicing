import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import type { User } from '@/lib/types'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return Response.json({ user: session.user })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, company } = await request.json()

    const users = await getCollection<User>('users')
    await users.updateOne(
      { _id: session.user._id },
      {
        $set: {
          name: name || '',
          company: company || undefined,
          updatedAt: new Date(),
        },
      }
    )

    const updatedUser = await users.findOne({ _id: session.user._id })

    return Response.json({ user: updatedUser })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
