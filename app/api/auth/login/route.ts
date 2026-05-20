import { NextRequest } from 'next/server'
import { generateMagicLink } from '@/lib/auth'
import { sendMagicLinkEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const token = await generateMagicLink(email.toLowerCase().trim())
    await sendMagicLinkEmail(email.toLowerCase().trim(), token)

    return Response.json({ message: 'Magic link sent' })
  } catch {
    return Response.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}
