'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, CircleCheck, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { planLabel } from '@/lib/onboard';

function formatReceivedDate(value: string | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const practiceName = searchParams.get('practice')?.trim() || 'your practice';
  const plan = searchParams.get('plan')?.trim() || '';
  const dateText = formatReceivedDate(searchParams.get('date') ?? undefined);
  const selectedPlan = plan ? planLabel(plan) : 'your selected plan';

  const agreementItems = [
    'You email CrystalPM that you agree to let RingIQ connect with your office.',
    'We collect the initial $300 refundable deposit and keep a credit card on file.',
    'We customize your AI phone agent with your office instructions.',
    'You send your phone service vendor instructions so AI can answer your phone.',
    'AI begins helping your office.',
  ];

  return (
    <main className="relative h-dvh overflow-hidden bg-background px-5 py-5 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,#CBD5E1_1px,transparent_1px)] bg-[length:28px_28px] opacity-50" aria-hidden />
      <div className="pointer-events-none absolute right-[-12%] top-[-18%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(39,73,147,0.1),transparent_64%)] blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col">
        <header className="mb-5 flex items-center justify-between">
          <Link href="/" aria-label="RingIQ home" className="inline-flex">
            <Image src="/assets/logo.png" alt="RingIQ" width={132} height={38} priority className="h-auto w-[132px]" />
          </Link>
          <span className="hidden rounded-full border border-accent-border bg-accent px-3 py-1.5 text-xs font-bold text-primary sm:inline-flex">
            Request received
          </span>
        </header>

        <section className="flex flex-1 items-center justify-center">
          <div className="w-full overflow-hidden rounded-[24px] border border-[rgba(39,73,147,0.12)] bg-card shadow-[0_24px_80px_rgba(15,23,42,0.1),0_2px_12px_rgba(15,23,42,0.04)]">
            <div className="relative isolate bg-[linear-gradient(145deg,var(--primary)_0%,var(--primary-dark)_52%,#0F172A_100%)] px-6 py-6 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] before:bg-[length:42px_42px] sm:px-8 sm:py-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] border border-emerald-400/30 bg-emerald-400/15">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-300">Request received</p>
                  <h1 className="m-0 text-[clamp(30px,4.4vw,48px)] font-extrabold leading-[0.98] tracking-[-0.05em] text-white">
                    You&rsquo;re on the list!
                  </h1>
                  <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/72">
                    We received your request for <strong className="font-extrabold text-white">{practiceName}</strong>
                    {dateText ? <> on <strong className="font-extrabold text-white">{dateText}</strong></> : null}
                    {' '}and you are most interested in <strong className="font-extrabold text-white">{selectedPlan}</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:px-8 sm:py-6 lg:grid-cols-[1fr_0.7fr]">
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">What happens next</p>
                <h2 className="m-0 text-[clamp(24px,3vw,36px)] font-extrabold leading-tight tracking-[-0.04em] text-foreground">
                  We build the test path before anything goes live.
                </h2>

                <div className="mt-5 space-y-4 text-[14px] leading-relaxed text-mid">
                  <div className="flex gap-3">
                    <CircleCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                    <p className="m-0">
                      We review your request and set up a test version of the AI phone agent for your office.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Mail size={20} className="mt-0.5 shrink-0 text-primary" />
                    <p className="m-0">
                      You receive an email and link to test, review, and decide how the AI phone agent should help your office.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-accent-border bg-accent/70 p-4">
                  <h3 className="m-0 text-lg font-extrabold tracking-[-0.02em] text-foreground">Once you agree</h3>
                  <ol className="mt-3 space-y-2.5">
                    {agreementItems.map((item, index) => (
                      <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-mid">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-primary shadow-sm">
                          {String.fromCharCode(97 + index)}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <aside className="flex flex-col justify-between gap-5">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-600" />
                    <h3 className="m-0 text-xl font-extrabold tracking-[-0.03em] text-foreground">RingIQ.ai Service</h3>
                  </div>
                  <ul className="m-0 space-y-2 p-0 text-sm leading-relaxed text-muted-foreground">
                    <li className="flex gap-2"><span className="font-extrabold text-primary">1.</span> No annual contract.</li>
                    <li className="flex gap-2"><span className="font-extrabold text-primary">2.</span> No setup or configuration fee. The deposit is refundable.</li>
                    <li className="flex gap-2"><span className="font-extrabold text-primary">3.</span> No cancellation fees. Stop service at any time.</li>
                  </ul>
                </div>

                <Link
                  href="/"
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-primary px-6 text-[15px] font-extrabold text-white no-underline shadow-[0_16px_34px_rgba(39,73,147,0.22)] transition-[transform,background-color,box-shadow] duration-150 hover:-translate-y-px hover:bg-primary-dark hover:shadow-[0_20px_42px_rgba(39,73,147,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  Done - back to homepage
                </Link>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function OnboardThankYouPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
