'use client';

import { Check } from 'lucide-react';
import { PLANS, type PlanSlug } from '@/lib/onboard';

export function PlanStep({
  selected, onSelect,
}: {
  selected: PlanSlug | ''; onSelect: (s: PlanSlug) => void;
}) {
  return (
    <div className="ob-plan-list">
      {PLANS.map((plan) => {
        const on = selected === plan.slug;
        return (
          <button
            key={plan.slug}
            type="button"
            onClick={() => onSelect(plan.slug)}
            className={`ob-plan-card${on ? ' on' : ''}`}
          >
            <div className="ob-plan-radio">
              {on && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'subtitle' in plan && plan.subtitle ? 2 : 4 }}>
                <span className="ob-plan-name">{plan.name}</span>
                {'featured' in plan && plan.featured && (
                  <span className="ob-plan-pop">Popular</span>
                )}
              </div>
              {'subtitle' in plan && plan.subtitle && (
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', marginBottom: 6 }}>
                  {plan.subtitle}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 7 }}>
                <span className="ob-plan-price">{plan.price}</span>
                <span className="ob-plan-note">{plan.note}</span>
              </div>
              <div className="ob-plan-bullets">
                {plan.bullets.map((b) => (
                  <span key={b} className="ob-plan-bullet">
                    <Check size={10} style={{ color: 'var(--teal)' }} /> {b}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
      <p style={{ fontSize: 11, color: 'var(--light)', lineHeight: 1.5, marginTop: 12 }}>
        * Calls with 30 seconds or more of AI conversation. SPAM calls, 1-800 calls, hang-ups, and misdials are not chargeable.
      </p>
    </div>
  );
}
