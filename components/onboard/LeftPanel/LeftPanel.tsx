'use client';

import Image from 'next/image';
import { PhoneCall, Check, CheckCircle2 } from 'lucide-react';
import { BENEFITS } from '@/lib/onboard';
import { cn } from '@/lib/utils';

export function LeftPanel({
  step, hasPlanFromUrl,
}: {
  step: number; hasPlanFromUrl: boolean;
}) {
  const labels = hasPlanFromUrl
    ? ['About your practice', 'Your current setup', 'Office hours & greeting', 'Finish up']
    : ['Choose your plan', 'About your practice', 'Your current setup', 'Office hours & greeting', 'Finish up'];

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

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-2.5 inline-flex items-center gap-[7px] rounded-full border border-white/15 bg-white/[0.09] px-2.5 py-[5px] text-xs font-semibold text-white/80">
          <PhoneCall size={13} /> AI phone reception for optometry
        </div>
        <h1 className="mb-2 text-[22px] font-extrabold leading-[1.18] tracking-[-0.03em] text-white">Your practice deserves a smarter first impression.</h1>
        <p className="mb-4 text-[12.5px] leading-relaxed text-white/60">Iris handles every inbound call so your team can focus on patients in the room.</p>

        <div className="mb-3.5 flex flex-col gap-2">
          {BENEFITS.map(({ text, icon: Icon }) => (
            <div key={text} className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] border border-teal/20 bg-teal/10">
                <Icon size={13} className="text-teal" />
              </div>
              <span className="text-[12.5px] leading-snug text-white/70">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto shrink-0 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3">
          <div className="mb-[9px] flex items-center gap-[7px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-white/40">Iris · Live Call</span>
          </div>
          <div className="mb-1.5 rounded-[7px] bg-white/[0.08] px-2.5 py-1.5 text-[11.5px] leading-snug text-white/65">&ldquo;Hi, I&rsquo;d like to book a follow-up for next week…&rdquo;</div>
          <div className="mb-[7px] rounded-[7px] border border-teal/20 bg-teal/10 px-2.5 py-1.5 text-[11.5px] leading-snug text-white/85">
            <span className="font-bold text-teal">Iris: </span>
            &ldquo;Of course! I have Tuesday at 2:30 pm available…&rdquo;
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-500">
            <CheckCircle2 size={11} />
            <span>Appointment booked · EHR updated</span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 shrink-0 border-t border-white/[0.08] pt-3.5">
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/25">Your progress</p>
        <div className="flex flex-col">
          {labels.map((label, i) => {
            const n      = i + 1;
            const done   = n < step;
            const active = n === step;
            const state  = done ? 'done' : active ? 'active' : 'pending';
            return (
              <div
                key={label}
                className={cn(
                  "relative flex items-start gap-2.5 after:absolute after:left-[9px] after:top-5 after:h-[calc(100%+2px)] after:w-px after:bg-white/10 after:content-[''] last:after:hidden",
                  done && 'after:bg-teal/35'
                )}
              >
                <div
                  className={cn(
                    'mb-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white transition-all duration-200',
                    done && 'bg-teal shadow-[0_0_0_3px_rgba(13,148,136,0.2)]',
                    active && 'bg-primary shadow-[0_0_0_3px_rgba(39,73,147,0.25)]',
                    state === 'pending' && 'border-[1.5px] border-white/15 bg-transparent text-white/30'
                  )}
                >
                  {done ? <Check size={10} strokeWidth={3} /> : n}
                </div>
                <span
                  className={cn(
                    'pt-[3px] text-[11.5px] leading-snug transition-colors duration-200',
                    done && 'text-white/40',
                    active && 'font-semibold text-white/90',
                    state === 'pending' && 'text-white/20'
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
