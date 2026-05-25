'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  error?: boolean;
}

export function StepperInput({ value, onChange, min = 1, max = 5, error }: StepperInputProps) {
  const decrement = () => { if (value > min) onChange(value - 1); };
  const increment = () => { if (value < max) onChange(value + 1); };

  return (
    <div
      className={cn(
        'flex items-center gap-0 rounded-lg border overflow-hidden bg-slate-900 w-fit',
        error ? 'border-red-500/60' : 'border-slate-700/60'
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center w-10 h-10 transition-all duration-150',
          'hover:bg-slate-800 active:bg-slate-700 border-r border-slate-700/60',
          value <= min ? 'opacity-30 cursor-not-allowed' : 'text-slate-300 cursor-pointer'
        )}
      >
        <Minus size={14} />
      </button>
      <div className="flex items-center justify-center w-14 h-10">
        <span className="text-base font-bold text-cyan-400 font-mono tabular-nums">{value}</span>
      </div>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center w-10 h-10 transition-all duration-150',
          'hover:bg-slate-800 active:bg-slate-700 border-l border-slate-700/60',
          value >= max ? 'opacity-30 cursor-not-allowed' : 'text-slate-300 cursor-pointer'
        )}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
