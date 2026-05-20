import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: 'No token provided. Please request a new magic link.',
  invalid_token: 'This link is invalid or has expired. Please request a new one.',
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const message = (error && ERROR_MESSAGES[error]) || 'Something went wrong. Please request a new magic link.'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-2xl text-danger">
          ✕
        </div>
        <h2 className="mb-2 text-xl font-bold">Verification Failed</h2>
        <p className="mb-6 text-sm text-muted">{message}</p>
        <Link
          href="/auth/login"
          className="inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}
