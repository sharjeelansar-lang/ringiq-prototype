'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const ONBOARD_STEPS = [
  {
    label: 'Meet Iris',
    detail: 'Preview the voice and choose the outcomes you care about.',
  },
  {
    label: 'Choose your plan',
    detail: 'Start with the coverage level you want Iris to test.',
  },
  {
    label: 'About your practice',
    detail: 'Practice, EHR, website, and the best contact for setup.',
  },
  {
    label: 'Your current setup',
    detail: 'Location, timezone, call volume, and phone system basics.',
  },
  {
    label: 'Office hours & greeting',
    detail: 'Tell Iris when to answer and how your office should sound.',
  },
];

export function LeftPanel({
  step, hasPlanFromUrl,
}: {
  step: number; hasPlanFromUrl: boolean;
}) {
  const steps = hasPlanFromUrl
    ? ONBOARD_STEPS.filter(({ label }) => label !== 'Choose your plan')
    : ONBOARD_STEPS;

  return (
    <aside
      className="relative isolate hidden h-dvh overflow-hidden bg-[linear-gradient(145deg,var(--primary)_0%,var(--primary-dark)_52%,#0F172A_100%)] px-8 pb-6 pt-7 text-white lg:sticky lg:top-0 lg:flex lg:flex-col"
      aria-label="RingIQ onboarding"
    >
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[length:40px_40px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),rgba(0,0,0,0.2))]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-[100px] -top-[120px] -z-10 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(99,135,219,0.22),transparent_65%)]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-[60px] -left-20 -z-10 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(13,148,136,0.15),transparent_65%)]" aria-hidden />

      <div className="mb-[22px] inline-flex w-fit items-center rounded-[11px] bg-white/95 px-3 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.18)]">
        <Image src="/assets/logo.png" alt="RingIQ" width={120} height={34} priority className="h-auto w-[120px]" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h1 className="mb-3 text-[30px] font-semibold leading-[1.16] tracking-[-0.035em] text-white">
          5-minutes to your free Nights &amp; Weekends
        </h1>

        <p className="mb-6 max-w-[300px] text-[13px] leading-[1.6] text-white/62">
          Complete each step once. We use it to build a test agent your practice can call and review.
        </p>

        <div className="flex flex-col gap-2.5">
          {steps.map(({ label, detail }, i) => {
            const n      = i + 1;
            const done   = n < step;
            const active = n === step;
            const state  = done ? 'done' : active ? 'active' : 'pending';
            return (
              <div
                key={label}
                className={cn(
                  'relative rounded-2xl border px-3.5 py-3.5 transition-[background-color,border-color,box-shadow] duration-200',
                  done && 'border-teal/20 bg-teal/[0.08]',
                  active && 'border-white/22 bg-white/[0.11] shadow-[0_16px_38px_rgba(15,23,42,0.18)]',
                  state === 'pending' && 'border-white/[0.08] bg-white/[0.035]'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white transition-all duration-200',
                      done && 'bg-teal shadow-[0_0_0_4px_rgba(13,148,136,0.16)]',
                      active && 'bg-primary shadow-[0_0_0_4px_rgba(91,123,216,0.2)]',
                      state === 'pending' && 'border-[1.5px] border-white/16 bg-white/[0.03] text-white/35'
                    )}
                  >
                    {done ? <Check size={15} strokeWidth={3} /> : n}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'm-0 text-[14px] font-semibold leading-tight transition-colors duration-200',
                          done && 'text-white/78',
                          active && 'text-white',
                          state === 'pending' && 'text-white/36'
                        )}
                      >
                        {label}
                      </p>
                      {active && (
                        <span className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white/70">
                          Now
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        'm-0 text-[12px] leading-[1.45]',
                        done && 'text-white/48',
                        active && 'text-white/68',
                        state === 'pending' && 'text-white/25'
                      )}
                    >
                      {detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
