'use client';

import { Check } from 'lucide-react';
import { PLANS, type PlanSlug } from '@/lib/onboard';
import { cn } from '@/lib/utils';

export function PlanStep({
  selected, onSelect,
}: {
  selected: PlanSlug | ''; onSelect: (s: PlanSlug) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {PLANS.map((plan) => {
        const on = selected === plan.slug;
        return (
          <button
            key={plan.slug}
            type="button"
            onClick={() => onSelect(plan.slug)}
            className={cn(
              'flex cursor-pointer items-start gap-3.5 rounded-[14px] border-2 border-border bg-input-bg px-[18px] py-4 text-left font-[inherit] transition-[border-color,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
              on && 'border-primary bg-accent shadow-[0_0_0_4px_rgba(39,73,147,0.08)]'
            )}
          >
            <div className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-transparent transition-colors duration-150', on && 'border-primary bg-primary')}>
              {on && <div className="h-[7px] w-[7px] rounded-full bg-white" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className={cn('mb-1 flex flex-wrap items-center gap-2', 'subtitle' in plan && plan.subtitle && 'mb-0.5')}>
                <span className={cn('text-sm font-bold text-foreground transition-colors duration-150', on && 'text-primary')}>{plan.name}</span>
                {'featured' in plan && plan.featured && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-white">Popular</span>
                )}
              </div>
              {'subtitle' in plan && plan.subtitle && (
                <div className="mb-1.5 text-xs font-semibold text-teal">
                  {plan.subtitle}
                </div>
              )}
              <div className="mb-[7px] flex flex-wrap items-baseline">
                <span className={cn('text-[22px] font-extrabold tracking-[-0.04em] text-foreground transition-colors duration-150', on && 'text-primary')}>{plan.price}</span>
                <span className="ml-[5px] text-xs font-normal text-muted-foreground">{plan.note}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1">
                {plan.bullets.map((b) => (
                  <span key={b} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Check size={10} className="text-teal" /> {b}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
      <p className="mt-3 text-[11px] leading-normal text-light">
        * Calls with 30 seconds or more of AI conversation. SPAM calls, 1-800 calls, hang-ups, and misdials are not chargeable.
      </p>
    </div>
  );
}
