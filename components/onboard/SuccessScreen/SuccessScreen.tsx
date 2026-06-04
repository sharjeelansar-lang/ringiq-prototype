import { CheckCircle2 } from 'lucide-react';
import { planLabel } from '@/lib/onboard';

export function SuccessScreen({
  practiceName, plan,
}: {
  practiceName: string; plan: string;
}) {
  return (
    <div className="ob-succ-shell">
      <div className="ob-succ-dot-bg" aria-hidden />
      <div className="ob-succ-glow"   aria-hidden />
      <div className="ob-succ-card">
        <div className="ob-succ-banner">
          <div className="ob-succ-icon">
            <CheckCircle2 size={26} style={{ color: '#10B981' }} />
          </div>
          <div>
            <h1 className="ob-succ-banner-title">You&rsquo;re on the list!</h1>
            <p className="ob-succ-banner-sub">Application received — we&rsquo;ll be in touch within 1–2 business days.</p>
          </div>
        </div>
        <div className="ob-succ-body">
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.65 }}>
            We received your request for{' '}
            <strong style={{ color: 'var(--foreground)' }}>{practiceName}</strong>.
            {plan && (
              <> Selected plan: <strong style={{ color: 'var(--primary)' }}>{planLabel(plan)}</strong>.</>
            )}
          </p>
          <div className="ob-succ-steps">
            {[
              'Application review (24–48 hrs)',
              'Onboarding call scheduled',
              'Iris goes live for your practice',
            ].map((text, i) => (
              <div key={text} className="ob-succ-step">
                <div className="ob-succ-num">{i + 1}</div>
                <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{text}</span>
              </div>
            ))}
          </div>
          <a href="/" className="ob-succ-cta">
            <CheckCircle2 size={16} /> Done — back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
