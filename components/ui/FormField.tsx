'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-semibold tracking-widest uppercase text-slate-400 flex items-center gap-1">
        {label}
        {required && <span className="text-cyan-400">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full bg-slate-900 border text-slate-100 rounded-md px-3 py-2.5 text-sm',
        'placeholder:text-slate-600 outline-none transition-all duration-200',
        'focus:ring-1 focus:ring-cyan-500/60 focus:border-cyan-500/60',
        error
          ? 'border-red-500/60 focus:ring-red-500/40 focus:border-red-500/40'
          : 'border-slate-700/60 hover:border-slate-600',
        props.readOnly && 'opacity-60 cursor-not-allowed bg-slate-950 font-mono text-xs tracking-wider text-slate-400',
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ className, error, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full bg-slate-900 border text-slate-100 rounded-md px-3 py-2.5 text-sm',
        'outline-none transition-all duration-200 cursor-pointer',
        'focus:ring-1 focus:ring-cyan-500/60 focus:border-cyan-500/60',
        error
          ? 'border-red-500/60'
          : 'border-slate-700/60 hover:border-slate-600',
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled className="text-slate-500 bg-slate-900">
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
