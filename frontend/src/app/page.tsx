import Link from 'next/link';

function LogoIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9h18v12H3V9z" />
      <path d="M3 3h6v4H3zM9 3h6v4H9zM15 3h6v4h-6z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="h-8 w-8 text-[var(--primary)]" />
          <span className="text-xl font-bold text-[var(--primary)]">LendWise</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[var(--primary)] hover:underline">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center border-b border-slate-200 bg-white px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
          Smarter Lending, Faster Growth
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Streamline your loan origination with AI-powered risk assessment, automated document
          analysis, and instant eligibility decisions.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            Start Free Application →
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border-2 border-[var(--primary)] px-6 py-3 font-medium text-[var(--primary)] hover:bg-[var(--primary-light)]"
          >
            Sign in to Dashboard
          </Link>
        </div>
      </section>

      {/* Why Choose LendWise */}
      <section className="border-t border-slate-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-slate-800">
            Why Choose LendWise?
          </h2>
          <p className="mt-2 text-center text-slate-600">
            Built for modern businesses seeking fast, transparent financing solutions.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                ),
                title: 'Instant Decisions',
                desc: 'Get eligibility results in minutes with our AI-powered assessment engine.',
              },
              {
                icon: (
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                ),
                title: 'Secure & Compliant',
                desc: 'Bank-grade security with end-to-end encryption for all your data.',
              },
              {
                icon: (
                  <>
                    <path d="M3 3v18h18" strokeLinecap="round" />
                    <path d="M7 14l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ),
                title: 'Transparent Scoring',
                desc: 'Clear risk scores with actionable insights to improve your eligibility.',
              },
              {
                icon: (
                  <>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
                  </>
                ),
                title: 'Smart Documents',
                desc: 'AI-powered document analysis extracts data automatically from uploads.',
              },
              {
                icon: (
                  <>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ),
                title: 'Dedicated Support',
                desc: 'Expert team available to guide you through every step of the process.',
              },
              {
                icon: (
                  <>
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ),
                title: 'Competitive Rates',
                desc: 'Fair pricing based on your business profile with no hidden fees.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[var(--primary)] bg-white text-[var(--primary)]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-800">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Get Started */}
      <section className="border-t border-slate-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-800">Ready to Get Started?</h2>
          <p className="mt-3 text-slate-600">
            Join thousands of businesses that trust LendWise for their financing needs.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-medium text-white shadow-md hover:bg-[var(--primary-hover)]"
          >
            Create Your Account
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between border-t border-slate-200 bg-white px-6 py-6">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-6 w-6 text-[var(--primary)]" />
          <span className="font-bold text-[var(--primary)]">LendWise</span>
        </div>
        <p className="text-sm text-slate-500">© 2026 LendWise. All rights reserved.</p>
      </footer>
    </div>
  );
}
