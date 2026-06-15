'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ObField({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-[7px] block text-[13px] font-bold text-mid">{label}</label>
      {children}
      {error && <p className="mt-[5px] text-xs font-medium text-[#DC2626]">{error}</p>}
    </div>
  );
}

export function ObInput({
  value, onChange, placeholder, type = 'text', hasError,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hasError?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[52px] items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3.5 transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,73,147,0.1)]',
        hasError && 'border-[#EF4444] focus-within:border-[#EF4444] focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
      )}
    >
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-[50px] min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-[15px] text-foreground outline-none placeholder:text-light"
      />
    </div>
  );
}

export function ObSelect({
  value, onChange, options, placeholder, hasError,
}: {
  value: string; onChange: (v: string) => void;
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string; hasError?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-[52px] items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3.5 transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,73,147,0.1)]',
        hasError && 'border-[#EF4444] focus-within:border-[#EF4444] focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
      )}
    >
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-[50px] min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent pr-8 font-[inherit] text-[15px] outline-none',
          value ? 'text-foreground' : 'text-light'
        )}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const lbl = typeof o === 'string' ? o : o.label;
          return (
            <option key={val} value={val}>{lbl}</option>
          );
        })}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-light"
      />
    </div>
  );
}
