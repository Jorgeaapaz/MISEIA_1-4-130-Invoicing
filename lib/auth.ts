import { ObjectId } from 'mongodb'
import { cookies } from 'next/headers'
import { getCollection } from './db'
import type { MagicLink, Session, User } from './types'

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAGIC_LINK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

export async function generateMagicLink(email: string): Promise<string> {
  const token = crypto.randomUUID()
  const now = new Date()

  const users = await getCollection<User>('users')
  const existingUser = await users.findOne({ email })
  if (!existingUser) {
    await users.insertOne({
      _id: new ObjectId(),
      email,
      name: '',
      createdAt: now,
      updatedAt: now,
    } as User)
  }

  const magicLinks = await getCollection<MagicLink>('magic_links')
  await magicLinks.insertOne({
    _id: new ObjectId(),
    email,
    token,
    expiresAt: new Date(now.getTime() + MAGIC_LINK_DURATION_MS),
    used: false,
    createdAt: now,
  } as MagicLink)

  return token
}

export async function validateMagicLink(
  token: string
): Promise<User | null> {
  const magicLinks = await getCollection<MagicLink>('magic_links')
  const link = await magicLinks.findOneAndUpdate(
    {
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { used: true } }
  )

  if (!link) return null

  const users = await getCollection<User>('users')
  const user = await users.findOne({ email: link.email })
  if (!user) return null

  const sessionToken = await createSession(user._id)
  await setSessionCookie(sessionToken)

  return user
}

export async function createSession(userId: ObjectId): Promise<string> {
  const token = crypto.randomUUID()
  const now = new Date()

  const sessions = await getCollection<Session>('sessions')
  await sessions.insertOne({
    _id: new ObjectId(),
    userId,
    token,
    expiresAt: new Date(now.getTime() + SESSION_DURATION_MS),
    createdAt: now,
  } as Session)

  return token
}

export async function getSession(): Promise<{ user: User } | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) return null

  const sessions = await getCollection<Session>('sessions')
  const session = await sessions.findOne({
    token: sessionToken,
    expiresAt: { $gt: new Date() },
  })

  if (!session) return null

  const users = await getCollection<User>('users')
  const user = await users.findOne({ _id: session.userId })

  if (!user) return null

  return { user }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (sessionToken) {
    const sessions = await getCollection<Session>('sessions')
    await sessions.deleteOne({ token: sessionToken })
  }

  cookieStore.delete('session')
}

async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })
}
