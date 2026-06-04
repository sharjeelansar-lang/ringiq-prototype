'use client';

import { ChevronDown } from 'lucide-react';

export function ObField({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="ob-label">{label}</label>
      {children}
      {error && <p className="ob-field-err">{error}</p>}
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
    <div className={`ob-frame${hasError ? ' err' : ''}`}>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="ob-input"
        style={{
          WebkitBoxShadow: '0 0 0 1000px var(--input-bg) inset',
          WebkitTextFillColor: 'var(--foreground)',
        }}
      />
    </div>
  );
}

export function ObSelect({
  value, onChange, options, placeholder, hasError,
}: {
  value: string; onChange: (v: string) => void;
  options: readonly string[] | string[];
  placeholder?: string; hasError?: boolean;
}) {
  return (
    <div className={`ob-frame${hasError ? ' err' : ''}`} style={{ position: 'relative' }}>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="ob-select"
        style={{ color: value ? 'var(--foreground)' : 'var(--light)', paddingRight: 32 }}
      >
        {placeholder && (
          <option value="" style={{ color: 'var(--light)' }}>{placeholder}</option>
        )}
        {options.map((o) => (
          <option key={o} value={o} style={{ color: 'var(--foreground)' }}>{o}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--light)', pointerEvents: 'none',
        }}
      />
    </div>
  );
}
