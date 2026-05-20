import Link from 'next/link'

const features = [
  {
    icon: '✦',
    title: 'Magic Link Auth',
    description: 'No passwords to remember. Sign in with a secure link sent straight to your inbox.',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: '◆',
    title: 'Invoice Management',
    description: 'Create, edit, and track invoices with a clean interface. Draft to paid in seconds.',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: '●',
    title: 'Customer Tracking',
    description: 'Organize your clients. Full history, contact details, and invoice records in one place.',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: '▼',
    title: 'PDF Export',
    description: 'Generate professional PDF invoices instantly. Send them directly or download for your records.',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-accent">●</span> Invoicing
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-all hover:border-accent hover:text-foreground"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface px-4 py-1.5 text-sm text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Now in beta — free while in early access
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
            Simple invoicing
            <br />
            <span className="bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
              for modern businesses
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Create, send, and track invoices effortlessly.
            Built for freelancers and small teams who value their time.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/login"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-accent/40"
            >
              Get Started Free
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <span className="text-sm text-muted">No credit card required</span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to get paid
            </h2>
            <p className="mx-auto max-w-lg text-muted">
              A focused set of tools — no bloat, no complexity. Just the essentials done right.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border/50 bg-surface p-6 transition-all hover:border-border hover:bg-surface-hover"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} ${feature.iconColor} text-xl`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/50 bg-surface p-12 text-center">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
            Ready to simplify your invoicing?
          </h2>
          <p className="mb-8 text-muted">
            Start sending professional invoices in minutes. No setup, no hassle.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-semibold text-white transition-all hover:bg-accent-hover"
          >
            Start Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Invoicing. All rights reserved.
          </span>
          <span className="text-xs text-muted/60">Built with Next.js</span>
        </div>
      </footer>
    </div>
  )
}
