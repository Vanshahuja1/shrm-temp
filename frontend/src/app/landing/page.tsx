import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'SHRM | Systematic Human Resource Management',
  description:
    'Modern, secure and scalable HR platform for enterprises. Streamline hiring, onboarding, payroll, performance and compliance with SHRM.',
  openGraph: {
    title: 'SHRM | Systematic Human Resource Management',
    description:
      'Modern, secure and scalable HR platform for enterprises. Streamline hiring, onboarding, payroll, performance and compliance with SHRM.',
    type: 'website',
    url: '/landing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHRM | Systematic Human Resource Management',
    description:
      'Modern, secure and scalable HR platform for enterprises. Streamline hiring, onboarding, payroll, performance and compliance with SHRM.',
  },
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Schema.org JSON-LD */}
      <Script id="ld-json-landing" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'SHRM',
          url: '/landing',
          description:
            'Modern, secure and scalable HR platform for enterprises. Streamline hiring, onboarding, payroll, performance and compliance with SHRM.',
          publisher: { '@type': 'Organization', name: 'SHRM' },
        })}
      </Script>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-2">
            <Image src="/one_aim.jpg" alt="One Aim" width={100} height={60} />
            
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-gray-700 sm:flex">
            <Link href="#features" className="hover:text-gray-900">Features</Link>
            <Link href="#showcase" className="hover:text-gray-900">Showcase</Link>
            <Link href="#use-cases" className="hover:text-gray-900">Use cases</Link>
            <Link href="#testimonials" className="hover:text-gray-900">Customers</Link>
            <Link href="#faq" className="hover:text-gray-900">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="hidden rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 sm:inline-flex">Sign in</Link>
            <Link href="/auth" className="inline-flex items-center rounded-md bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-white" />
        <div className="absolute -top-48 -right-40 h-[32rem] w-[32rem] rounded-full bg-red-100 blur-3xl opacity-40" />
        <div className="absolute -bottom-48 -left-40 h-[28rem] w-[28rem] rounded-full bg-slate-100 blur-3xl opacity-40" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Enterprise-ready HR platform
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Systematic Human Resource Management
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Centralize your people operations with a single secure platform. From talent acquisition to payroll and performance, SHRM gives HR teams the visibility, control and automation they need to scale.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Get started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                Explore features
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 text-left sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-2xl font-bold">99.99%</div>
                <div className="mt-1 text-sm text-gray-600">Uptime SLA</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-2xl font-bold">200k+</div>
                <div className="mt-1 text-sm text-gray-600">Employees managed</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-2xl font-bold">60+</div>
                <div className="mt-1 text-sm text-gray-600">Countries supported</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-2xl font-bold">SOC 2</div>
                <div className="mt-1 text-sm text-gray-600">Type II compliant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">A unified workspace for HR</h2>
            <p className="mt-3 text-sm text-gray-600">
              Keep employee data, workflows and analytics in one place. No more switching tools or reconciling spreadsheets.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Real-time people directory</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Automations & approvals</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Exportable reports</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-red-100 to-slate-100 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-1 border-b border-gray-100 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <Image src="/shrm.png" alt="SHRM" width={600} height={400} />
            </div>
          </div>
        </div>
      </section>

      <section id="logos" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
          <div className="text-xs font-semibold tracking-widest text-gray-500">ACME INC</div>
          <div className="text-xs font-semibold tracking-widest text-gray-500">GLOBEX</div>
          <div className="text-xs font-semibold tracking-widest text-gray-500">INITECH</div>
          <div className="text-xs font-semibold tracking-widest text-gray-500">UMBRELLA</div>
          <div className="text-xs font-semibold tracking-widest text-gray-500">STARK</div>
          <div className="text-xs font-semibold tracking-widest text-gray-500">WAYNE</div>
        </div>
      </section>

      <section id="features" className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-3 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 5h18v2H3V5zm2 4h14v10H5V9zm2 2v6h10v-6H7z"/></svg>
            </div>
            <h3 className="mt-6 text-lg font-semibold">Talent Acquisition</h3>
            <p className="mt-2 text-sm text-gray-600">Sourcing, ATS, interview scheduling and offer workflows with insights to hire faster and better.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Unified candidate pipeline</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Structured interviews</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Automated offers</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 4h16v2H4V4zm0 6h16v10H4V10zm2 2v6h12v-6H6z"/></svg>
            </div>
            <h3 className="mt-6 text-lg font-semibold">Core HR & Payroll</h3>
            <p className="mt-2 text-sm text-gray-600">Single source of truth for people data, time & attendance, benefits and multi-country payroll.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Role-based access</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Policy automation</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Global compliance</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 7a5 5 0 015 5H7a5 5 0 015-5zm-7 8h14v2H5v-2z"/></svg>
            </div>
            <h3 className="mt-6 text-lg font-semibold">Performance & Analytics</h3>
            <p className="mt-2 text-sm text-gray-600">OKRs, reviews, compensation cycles and real-time insights to drive engagement and outcomes.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Configurable cycles</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>Dashboards & exports</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"/>AI-assisted insights</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <h2 className="text-center text-2xl font-semibold">Built for modern HR teams</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold">High-growth startups</h3>
            <p className="mt-2 text-sm text-gray-600">Move fast with templates, automation and an API-first platform.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Global enterprises</h3>
            <p className="mt-2 text-sm text-gray-600">Robust permissions, auditability and global payroll and compliance.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Distributed teams</h3>
            <p className="mt-2 text-sm text-gray-600">Seamless experiences across geographies, timezones and devices.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold">Security & Compliance</h3>
            <p className="mt-2 text-sm text-gray-600">Built-in security with SSO, audit logging, encryption and granular permissions. Certified and aligned with leading standards.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">SOC 2 Type II</div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">ISO 27001</div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">GDPR Ready</div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">Role-based Access</div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold">Integrations</h3>
            <p className="mt-2 text-sm text-gray-600">Connect SHRM with your identity, finance and collaboration stack using prebuilt connectors and APIs.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">Okta, Azure AD</div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">Workday, Netsuite</div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">Slack, Teams</div>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">Zapier, Webhooks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <h2 className="text-center text-2xl font-semibold">Loved by HR and employees</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <figure className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <blockquote className="text-sm text-gray-700">“SHRM helped us standardize processes across 12 countries and reduced time-to-hire by 35%.”</blockquote>
              <figcaption className="mt-4 text-xs text-gray-500">VP People, Global SaaS</figcaption>
            </figure>
            <figure className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <blockquote className="text-sm text-gray-700">“Implementation was smooth and the team adopted it quickly thanks to the clean UX.”</blockquote>
              <figcaption className="mt-4 text-xs text-gray-500">Head of HR, Fintech</figcaption>
            </figure>
            <figure className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <blockquote className="text-sm text-gray-700">“The analytics and exports saved our monthly reporting days of manual work.”</blockquote>
              <figcaption className="mt-4 text-xs text-gray-500">HR Ops Lead, Manufacturing</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="mt-2 text-sm text-gray-600">Average customer rating</p>
              <p className="mt-4 text-sm text-gray-700">Teams choose SHRM for reliability, speed of implementation and an intuitive experience employees love.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-2xl font-bold">8 weeks</div>
              <p className="mt-2 text-sm text-gray-600">Avg time to value</p>
              <p className="mt-4 text-sm text-gray-700">Guided onboarding and data migration with best-practice templates tailored to your org.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-2xl font-bold">40%</div>
              <p className="mt-2 text-sm text-gray-600">Lower admin effort</p>
              <p className="mt-4 text-sm text-gray-700">Automate repetitive tasks and unlock proactive insights so your HR team can focus on people.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500">Starter</h4>
            <div className="mt-2 text-3xl font-bold">$5</div>
            <div className="text-sm text-gray-500">per employee / mo</div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Core HR, Directory</li>
              <li>Time off, Policies</li>
              <li>Email support</li>
            </ul>
            <Link href="/auth" className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Choose Starter
            </Link>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <h4 className="text-sm font-semibold text-red-700">Business</h4>
            <div className="mt-2 text-3xl font-bold text-red-900">$12</div>
            <div className="text-sm text-red-800">per employee / mo</div>
            <ul className="mt-4 space-y-2 text-sm text-red-900/80">
              <li>Everything in Starter</li>
              <li>Payroll, Performance</li>
              <li>SSO, Audit logs</li>
            </ul>
            <Link href="/auth" className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
              Choose Business
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500">Enterprise</h4>
            <div className="mt-2 text-3xl font-bold">Custom</div>
            <div className="text-sm text-gray-500">annual agreements</div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Advanced security</li>
              <li>Global payroll</li>
              <li>Dedicated support</li>
            </ul>
            <Link href="/auth" className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
          <h2 className="text-center text-2xl font-semibold">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            <details className="group rounded-lg border border-gray-200 bg-white p-4 [&_summary]:cursor-pointer">
              <summary className="text-sm font-medium text-gray-900">How long does implementation take?</summary>
              <p className="mt-2 text-sm text-gray-600">Most customers go live in 6–8 weeks with guided onboarding and data migration.</p>
            </details>
            <details className="group rounded-lg border border-gray-200 bg-white p-4 [&_summary]:cursor-pointer">
              <summary className="text-sm font-medium text-gray-900">Do you support multi-country payroll?</summary>
              <p className="mt-2 text-sm text-gray-600">Yes. We support payroll across 60+ countries via partners and integrations.</p>
            </details>
            <details className="group rounded-lg border border-gray-200 bg-white p-4 [&_summary]:cursor-pointer">
              <summary className="text-sm font-medium text-gray-900">What security certifications do you have?</summary>
              <p className="mt-2 text-sm text-gray-600">We are SOC 2 Type II and ISO 27001 compliant with regular external audits.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
          <h3 className="text-xl font-semibold">Get product updates</h3>
          <p className="mt-2 text-sm text-gray-600">Subscribe for release notes, best practices and HR benchmarks.</p>
          <form className="mt-6 mx-auto flex max-w-md items-center gap-3">
            <input type="email" required placeholder="you@company.com" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300" />
            <button type="submit" className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gray-100 bg-gradient-to-br from-red-600 to-red-700">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center text-white lg:px-8">
          <h2 className="text-3xl font-semibold">Ready to transform your HR?</h2>
          <p className="mt-2 text-sm text-red-100">Join organizations that trust SHRM to run their people operations.</p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link href="/auth" className="inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50">Start now</Link>
            <Link href="#" className="inline-flex items-center rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Book a demo</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} SHRM. All rights reserved.</div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="#" className="hover:text-gray-900">Security</Link>
              <Link href="#" className="hover:text-gray-900">Privacy</Link>
              <Link href="#" className="hover:text-gray-900">Status</Link>
              <Link href="#" className="hover:text-gray-900">Docs</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
