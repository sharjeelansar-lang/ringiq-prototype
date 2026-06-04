'use client';

import Image from 'next/image';
import { PhoneCall, Check, CheckCircle2 } from 'lucide-react';
import { BENEFITS } from '@/lib/onboard';

export function LeftPanel({
  step, hasPlanFromUrl,
}: {
  step: number; hasPlanFromUrl: boolean;
}) {
  const labels = hasPlanFromUrl
    ? ['About your practice', 'Your current setup', 'Office hours & greeting', 'Finish up']
    : ['Choose your plan', 'About your practice', 'Your current setup', 'Office hours & greeting', 'Finish up'];

  return (
    <aside className="ob-left" aria-label="RingIQ onboarding">
      <div className="ob-left-glow-a" aria-hidden />
      <div className="ob-left-glow-b" aria-hidden />

      <div className="ob-logo-plate">
        <Image src="/assets/logo.png" alt="RingIQ" width={120} height={34} priority style={{ width: 120, height: 'auto' }} />
      </div>

      <div className="ob-left-body">
        <div className="ob-kicker">
          <PhoneCall size={13} /> AI phone reception for optometry
        </div>
        <h1 className="ob-left-title">Your practice deserves a smarter first impression.</h1>
        <p className="ob-left-sub">Iris handles every inbound call so your team can focus on patients in the room.</p>

        <div className="ob-benefits">
          {BENEFITS.map(({ text, icon: Icon }) => (
            <div key={text} className="ob-benefit">
              <div className="ob-benefit-icon">
                <Icon size={13} style={{ color: 'var(--teal)' }} />
              </div>
              <span className="ob-benefit-text">{text}</span>
            </div>
          ))}
        </div>

        <div className="ob-call">
          <div className="ob-call-header">
            <span className="ob-call-dot" />
            <span className="ob-call-lbl">Iris · Live Call</span>
          </div>
          <div className="ob-bubble-p">&ldquo;Hi, I&rsquo;d like to book a follow-up for next week…&rdquo;</div>
          <div className="ob-bubble-i">
            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>Iris: </span>
            &ldquo;Of course! I have Tuesday at 2:30 pm available…&rdquo;
          </div>
          <div className="ob-call-confirm">
            <CheckCircle2 size={11} />
            <span>Appointment booked · EHR updated</span>
          </div>
        </div>
      </div>

      <div className="ob-timeline">
        <p className="ob-tl-hd">Your progress</p>
        <div className="ob-tl-list">
          {labels.map((label, i) => {
            const n      = i + 1;
            const done   = n < step;
            const active = n === step;
            const state  = done ? 'done' : active ? 'active' : 'pending';
            return (
              <div key={label} className={`ob-tl-row ${state}`}>
                <div className={`ob-tl-node ${state}`}>
                  {done ? <Check size={10} strokeWidth={3} /> : n}
                </div>
                <span className={`ob-tl-txt ${state}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
