'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3.5 rounded-lg border transition-all duration-200 cursor-pointer group',
        checked
          ? 'bg-cyan-500/5 border-cyan-500/30'
          : 'bg-slate-900/40 border-slate-700/40 hover:border-slate-600/60',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {description && (
          <span className="text-xs text-slate-500">{description}</span>
        )}
      </div>
      <div
        className={cn(
          'relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ml-4',
          checked ? 'bg-cyan-500' : 'bg-slate-700'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300',
            checked ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
          )}
        />
      </div>
    </div>
  );
}
