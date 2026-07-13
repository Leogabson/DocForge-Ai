const features = [
  {
    title: 'Editorial Formatting',
    description: 'Turn rough drafts into polished documents with thoughtful structure, clear hierarchy, and careful rhythm.',
    icon: '✦',
    size: 'large',
  },
  {
    title: 'Quiet Collaboration',
    description: 'Work with your team in a calm, shared workspace with version-aware updates and focused review.',
    icon: '◌',
    size: 'large',
  },
  {
    title: 'Refined Templates',
    description: 'Choose from curated layouts for reports, proposals, client materials, and internal documents.',
    icon: '❖',
    size: 'small',
  },
  {
    title: 'Structured Export',
    description: 'Move seamlessly from draft to PDF, DOCX, HTML, or text without sacrificing polish.',
    icon: '↗',
    size: 'small',
  },
  {
    title: 'Focused Review',
    description: 'Inspect revisions with precision using clear annotations, tracked changes, and a distraction-light canvas.',
    icon: '✓',
    size: 'small',
  },
  {
    title: 'Premium Workflows',
    description: 'Keep every detail in place with graceful automation designed for professional teams.',
    icon: '◍',
    size: 'small',
  },
];

const stats = [
  { value: '50k+', label: 'Professionals' },
  { value: '12x', label: 'Faster Turnaround' },
  { value: '99.9%', label: 'Uptime' },
];

const plans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'A thoughtful place to organize and refine your first documents.',
    features: ['5 documents per month', 'Core formatting tools', 'PDF export'],
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$29',
    description: 'Built for teams shaping polished content with consistency and care.',
    features: ['Unlimited documents', 'Advanced styling', 'DOCX, HTML, PDF export'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations with secure workflows, governance, and bespoke needs.',
    features: ['Admin controls', 'API access', 'Priority support'],
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1f2937]">
      <div className="mx-auto flex max-w-7xl flex-col px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:px-10">
        <header className="flex flex-col gap-3 rounded-full border border-[#e7e5e4] bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(31,41,55,0.05)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1f6f5f] text-lg font-semibold text-white">
                DF
              </div>
              <div>
                <p className="text-base font-semibold text-[#1f6f5f]">DocForge</p>
                <p className="text-xs text-[#6b7280]">Editorial Document Studio</p>
              </div>
            </div>
            <a
              href="/editor"
              className="rounded-full bg-[#1f6f5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#175a4d] sm:hidden"
            >
              Open Editor
            </a>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#6b7280] md:flex">
            <a className="transition hover:text-[#1f6f5f]" href="#features">
              Features
            </a>
            <a className="transition hover:text-[#1f6f5f]" href="#pricing">
              Pricing
            </a>
            <a className="transition hover:text-[#1f6f5f]" href="#about">
              About
            </a>
          </nav>
          <a
            href="/editor"
            className="hidden rounded-full bg-[#1f6f5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#175a4d] sm:inline-flex"
          >
            Open Editor
          </a>
        </header>

        <section className="grid items-center gap-10 px-0 py-12 sm:gap-12 sm:px-2 sm:py-16 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e7e5e4] bg-[#f7f5f0] px-4 py-2 text-sm font-medium text-[#d4a373]">
              <span className="text-base">✦</span>
              Premium document workflows for modern teams
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-[#1f2937] sm:text-4xl lg:text-6xl">
              Shape ideas into <span className="text-[#1f6f5f]">clear, enduring documents</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#6b7280] sm:text-lg">
              DocForge combines calm collaboration, editorial precision, and thoughtful automation to help teams create polished work with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/editor"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f6f5f] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#175a4d] sm:w-auto"
              >
                Start Free
                <span>→</span>
              </a>
              <a
                href="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e7e5e4] bg-white px-6 py-3.5 text-sm font-semibold text-[#1f2937] transition hover:border-[#1f6f5f] hover:text-[#1f6f5f] sm:w-auto"
              >
                <span>◫</span>
                Explore Workspace
              </a>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#e7e5e4] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(31,41,55,0.03)]">
                  <p className="text-lg font-semibold text-[#1f2937]">{stat.value}</p>
                  <p className="text-sm text-[#6b7280]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-[#e7e5e4] bg-white p-3 shadow-[0_20px_60px_rgba(31,41,55,0.06)] sm:p-5">
            <div className="rounded-[24px] border border-[#f0ece8] bg-[#fcfbf8] p-5">
              <div className="flex items-center justify-between rounded-2xl border border-[#e7e5e4] bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-[#1f2937]">Document composition</p>
                  <p className="text-xs text-[#6b7280]">Structured and ready to refine</p>
                </div>
                <div className="rounded-full bg-[#d4a373] px-3 py-1 text-sm font-semibold text-white">Featured</div>
              </div>
              <div className="mt-4 space-y-3 rounded-2xl border border-[#e7e5e4] bg-white p-4">
                <div className="h-3 w-3/4 rounded-full bg-[#e7e5e4]" />
                <div className="h-3 w-full rounded-full bg-[#f7f5f0]" />
                <div className="h-3 w-5/6 rounded-full bg-[#f7f5f0]" />
                <div className="flex gap-2">
                  <div className="h-10 flex-1 rounded-2xl bg-[#1f6f5f]/10" />
                  <div className="h-10 flex-1 rounded-2xl bg-[#d4a373]/20" />
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-[#e7e5e4] bg-white p-4">
                <p className="text-sm font-semibold text-[#1f2937]">Export options</p>
                <div className="mt-3 flex items-center justify-between text-sm text-[#6b7280]">
                  <span>PDF • DOCX • HTML • TXT</span>
                  <span className="font-semibold text-[#1f6f5f]">Refined</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="rounded-[32px] border border-[#e7e5e4] bg-white px-6 py-10 shadow-[0_16px_50px_rgba(31,41,55,0.04)] sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Thoughtful features</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#1f2937] sm:text-4xl">
              Designed for careful work, not noise.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const isLarge = feature.size === 'large';
              return (
                <div
                  key={feature.title}
                  className={`rounded-[24px] border border-[#e7e5e4] bg-[#fcfbf8] p-6 transition hover:border-[#1f6f5f]/40 hover:shadow-[0_12px_30px_rgba(31,41,55,0.05)] ${
                    isLarge ? 'lg:col-span-1' : ''
                  }`}
                >
                  <div
                    className={`flex items-center justify-center rounded-2xl font-semibold ${
                      isLarge
                        ? 'h-16 w-16 bg-[#1f6f5f] text-3xl text-white'
                        : 'h-12 w-12 bg-[#f7f5f0] text-2xl text-[#1f6f5f]'
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#1f2937] lg:text-xl">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#6b7280]">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="pricing" className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-[#e7e5e4] bg-[#f7f5f0] p-8 text-[#1f2937] shadow-[0_20px_50px_rgba(31,41,55,0.04)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Why it stands out</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">
              Clear pricing for thoughtful growth.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-[#6b7280]">
              Choose the plan that fits your pace and keep your documents moving without unnecessary complexity.
            </p>
            <div className="mt-8 space-y-3 text-sm text-[#6b7280]">
              <div className="flex items-center gap-3">
                <span className="text-xl text-[#1f6f5f]">✓</span>
                <span>14-day free trial on every plan</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl text-[#1f6f5f]">✓</span>
                <span>Flexible upgrades without friction</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl text-[#1f6f5f]">✓</span>
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[28px] border p-6 transition ${
                  plan.highlight
                    ? 'border-[#1f6f5f] bg-white shadow-[0_16px_40px_rgba(31,41,55,0.06)]'
                    : 'border-[#e7e5e4] bg-white hover:border-[#1f6f5f]/40'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 right-6 rounded-full bg-[#d4a373] px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </div>
                )}
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1f6f5f]">
                  {plan.name}
                </p>
                <p className="mt-4 text-4xl font-semibold text-[#1f2937]">
                  {plan.price}
                  {plan.price !== 'Custom' && <span className="text-lg font-normal text-[#6b7280]">/mo</span>}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#6b7280]">{plan.description}</p>
                <button
                  className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-[#1f6f5f] text-white hover:bg-[#175a4d]'
                      : 'border border-[#e7e5e4] text-[#1f2937] hover:border-[#1f6f5f] hover:text-[#1f6f5f]'
                  }`}
                >
                  {plan.highlight ? 'Get Started' : 'Try for Free'}
                </button>
                <ul className="mt-6 space-y-3 text-sm text-[#6b7280]">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#1f6f5f]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mt-10 rounded-[32px] border border-[#e7e5e4] bg-[#fcfbf8] px-6 py-10 shadow-[0_16px_50px_rgba(31,41,55,0.04)] sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4a373]">Ready to begin</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#1f2937] sm:text-4xl">
                From first draft to final export, everything feels deliberate.
              </h2>
            </div>
            <a
              href="/editor"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f6f5f] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#175a4d] sm:w-auto"
            >
              Create Your First Document
              <span>→</span>
            </a>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#e7e5e4] bg-white/80 px-6 py-8 text-sm text-[#6b7280] backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-6 sm:grid-cols-4">
            <div>
              <p className="font-semibold uppercase tracking-wider text-[#1f2937]">Product</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="#features" className="transition hover:text-[#1f6f5f]">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition hover:text-[#1f6f5f]">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/templates" className="transition hover:text-[#1f6f5f]">
                    Templates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-[#1f2937]">Company</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="#about" className="transition hover:text-[#1f6f5f]">
                    About
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="transition hover:text-[#1f6f5f]">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/editor" className="transition hover:text-[#1f6f5f]">
                    Editor
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-[#1f2937]">Legal</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="#" className="transition hover:text-[#1f6f5f]">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-[#1f6f5f]">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-[#1f6f5f]">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-[#1f2937]">Contact</p>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <a href="#" className="transition hover:text-[#1f6f5f]">
                    hello@docforge.com
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-[#1f6f5f]">
                    +1 (415) 555-0147
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-[#e7e5e4] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 DocForge. Made for careful work.</p>
            <div className="flex gap-4 text-xs">
              <a href="#" className="transition hover:text-[#1f6f5f]">
                Status
              </a>
              <a href="#" className="transition hover:text-[#1f6f5f]">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
