import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { validateMagicLink } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    redirect('/auth/verify?error=missing_token')
  }

  const user = await validateMagicLink(token)

  if (!user) {
    redirect('/auth/verify?error=invalid_token')
  }

  redirect('/dashboard')
}
