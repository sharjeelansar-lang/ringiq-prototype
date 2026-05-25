'use client';

import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

interface RadioCardGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function RadioCardGroup({ options, value, onChange, error }: RadioCardGroupProps) {
  return (
    <div className={cn('grid gap-2', options.length === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
      {options.map((option) => (
        <div
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative flex flex-col gap-1.5 p-4 rounded-lg border cursor-pointer transition-all duration-200 group',
            value === option.value
              ? 'bg-cyan-500/8 border-cyan-500/50 shadow-[0_0_0_1px_rgba(6,182,212,0.2)]'
              : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600/60',
            error && 'border-red-500/50'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <span
                className={cn(
                  'text-sm font-semibold transition-colors duration-200',
                  value === option.value ? 'text-cyan-300' : 'text-slate-200'
                )}
              >
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-slate-500 leading-relaxed">{option.description}</span>
              )}
            </div>
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all duration-200 flex items-center justify-center',
                value === option.value
                  ? 'border-cyan-400 bg-cyan-400'
                  : 'border-slate-600 bg-transparent'
              )}
            >
              {value === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              )}
            </div>
          </div>
          {option.badge && (
            <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
              {option.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
