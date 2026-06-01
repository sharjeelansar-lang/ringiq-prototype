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
      <label style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#64748B',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {label}
        {required && <span style={{ color: '#274993' }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: 12, color: '#94A3B8' }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
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
        'w-full rounded-md px-3 py-2.5 text-sm outline-none transition-all duration-150',
        'placeholder:text-slate-400',
        error
          ? 'border-red-300 focus:ring-1 focus:ring-red-300 focus:border-red-300'
          : 'border-slate-200 hover:border-slate-300 focus:ring-1 focus:ring-[#274993]/40 focus:border-[#274993]/60',
        props.readOnly && 'opacity-60 cursor-not-allowed bg-slate-50 font-mono text-xs tracking-wider text-slate-500',
        className
      )}
      style={{
        background: props.readOnly ? '#F8FAFC' : '#FFFFFF',
        border: `1.5px solid ${error ? '#FCA5A5' : '#E2E8F0'}`,
        color: '#0F172A',
        ...props.style,
      }}
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
        'w-full rounded-md px-3 py-2.5 text-sm outline-none transition-all duration-150 cursor-pointer',
        error
          ? 'focus:ring-1 focus:ring-red-300'
          : 'focus:ring-1 focus:ring-[#274993]/40 focus:border-[#274993]/60',
        className
      )}
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${error ? '#FCA5A5' : '#E2E8F0'}`,
        color: '#0F172A',
        ...props.style,
      }}
      {...props}
    >
      {placeholder && (
        <option value="" disabled style={{ color: '#94A3B8', background: '#FFFFFF' }}>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} style={{ background: '#FFFFFF', color: '#0F172A' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
