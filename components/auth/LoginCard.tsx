'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Zap, AlertCircle,
  Mail, Lock, ArrowRight, Loader2, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Magic UI: Border Beam ─────────────────────────────────────────────────────

function BorderBeam({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden', className)}
    >
      {/* Rotating conic gradient — shows as 1px border via parent p-px */}
      <span
        className="absolute inset-[-100%] opacity-70"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0%, transparent 55%, #22d3ee 67%, #818cf8 78%, transparent 83%, transparent 100%)',
          animation: 'spin 5s linear infinite',
        }}
      />
    </span>
  );
}

// ── Magic UI: Animated field wrapper ─────────────────────────────────────────

function FieldRow({
  label,
  icon: Icon,
  right,
  children,
  delay = 0,
}: {
  label: string;
  icon: React.ElementType;
  right?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div style={{ animation: `fade-up .55s ease-out ${delay}ms both` }}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500">
          {label}
        </label>
        {right}
      </div>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-xl px-3.5',
          'bg-slate-950/70 border border-slate-800',
          'focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/15',
          'hover:border-slate-700 transition-all duration-200',
        )}
      >
        <Icon size={14} className="text-slate-600 shrink-0" />
        {children}
      </div>
    </div>
  );
}

// ── LoginCard ─────────────────────────────────────────────────────────────────

export function LoginCard() {
  const router = useRouter();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Invalid email or password');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-[400px]"
      style={{ animation: 'fade-up .65s ease-out both' }}
    >
      {/* ── Gradient border wrapper (p-px trick) ── */}
      <div className="relative p-px rounded-2xl">
        <BorderBeam />

        {/* ── Card body ── */}
        <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-2xl overflow-hidden">

          {/* Top highlight line that sweeps once on load */}
          <div className="absolute inset-x-0 top-0 h-px overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 h-full w-2/5"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.9), transparent)',
                animation: 'top-beam 2.4s ease-in-out 0.3s both',
              }}
            />
          </div>

          {/* Subtle inner glow at top */}
          <div
            className="absolute inset-x-0 top-0 h-24 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(34,211,238,0.06), transparent)',
            }}
          />

          <div className="px-7 pt-7 pb-6">

            {/* ── Brand ── */}
            <div
              className="flex items-center gap-3 mb-7"
              style={{ animation: 'fade-up .55s ease-out 80ms both' }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                style={{
                  background: 'rgba(34,211,238,0.07)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  animation: 'glow-pulse 3s ease-in-out infinite',
                }}
              >
                <Zap size={16} className="text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold tracking-tight text-white">RingIQ</span>
                  <span
                    className="text-[9px] font-bold tracking-[0.15em] px-1.5 py-0.5 rounded uppercase"
                    style={{
                      background: 'rgba(34,211,238,0.08)',
                      border: '1px solid rgba(34,211,238,0.18)',
                      color: 'rgba(34,211,238,0.85)',
                    }}
                  >
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">console v2.4</p>
              </div>
            </div>

            {/* ── Heading ── */}
            <div
              className="mb-6"
              style={{ animation: 'fade-up .55s ease-out 140ms both' }}
            >
              <h1
                className="text-[22px] font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 10%, rgba(255,255,255,0.6) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Sign in to continue
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Enrollment Portal — Client Operations Console
              </p>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

              <FieldRow label="Email Address" icon={Mail} delay={190}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ringiq.ai"
                  required
                  className="flex-1 bg-transparent py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                  style={{ colorScheme: 'dark' }}
                />
              </FieldRow>

              <FieldRow
                label="Password"
                icon={Lock}
                delay={240}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                }
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="flex-1 bg-transparent py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-600 hover:text-slate-400 transition-colors shrink-0"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </FieldRow>

              {/* Error */}
              {error && (
                <div
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs"
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    color: 'rgba(252,165,165,0.9)',
                    animation: 'fade-up .3s ease-out both',
                  }}
                >
                  <AlertCircle size={12} className="shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit button */}
              <div
                className="mt-0.5"
                style={{ animation: 'fade-up .55s ease-out 290ms both' }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl py-[11px] text-sm font-bold tracking-wide text-slate-950 transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #34d399 0%, #22d3ee 60%, #06b6d4 100%)',
                    boxShadow: '0 0 28px rgba(6,182,212,0.22)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading)
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        '0 0 44px rgba(6,182,212,0.42)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 0 28px rgba(6,182,212,0.22)';
                  }}
                >
                  {/* Shimmer sweep on hover */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
                      animation: 'shimmer-sweep 1.4s ease-in-out infinite',
                    }}
                    aria-hidden
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Authenticating…
                      </>
                    ) : (
                      <>
                        Access Console
                        <ArrowRight size={14} />
                      </>
                    )}
                  </span>
                </button>
              </div>

            </form>
          </div>

          {/* ── Footer bar ── */}
          <div
            className="flex items-center justify-between px-7 py-3 border-t border-slate-800/50"
            style={{ background: 'rgba(2,6,23,0.5)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-600 font-mono">All systems operational</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-700">
              <Shield size={10} />
              <span className="font-mono">JWT · AES-256</span>
            </div>
          </div>

        </div>
      </div>

      {/* Below-card meta */}
      <p
        className="text-center text-[11px] text-slate-700 mt-5 font-mono tracking-wide"
        style={{ animation: 'fade-up .55s ease-out 380ms both' }}
      >
        ringiq.ai · Enrollment Portal
      </p>
    </div>
  );
}
