'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, AlertCircle, ArrowRight, CheckCircle2, Eye,
  EyeOff, KeyRound, Loader2, Lock, Mail, ShieldCheck,
} from 'lucide-react';

const BRAND = '#274993';
const BRAND_DARK = '#1D3870';
const BRAND_SOFT = '#EEF4FF';
const BRAND_LINE = '#D8E5FF';

const T = {
  bg: '#F7F6F3',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  navy: '#0F172A',
  mid: '#334155',
  muted: '#64748B',
  light: '#94A3B8',
  inputBg: '#F8FAFC',
};

function FieldRow({
  id, label, icon: Icon, right, children, delay = 0,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  right?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="login-field" style={{ animationDelay: `${delay}ms` }}>
      <div className="login-field-label-row">
        <label htmlFor={id} className="login-label">{label}</label>
        {right}
      </div>
      <div className="login-input-frame">
        <Icon size={17} className="login-input-icon" />
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: 50,
  background: 'transparent',
  padding: 0,
  fontSize: 16,
  color: T.navy,
  outline: 'none',
  border: 'none',
  fontFamily: 'inherit',
  WebkitBoxShadow: `0 0 0 1000px ${T.inputBg} inset`,
  WebkitTextFillColor: T.navy,
};

export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
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
    <div className="login-shell">
      <style>{`
        .login-shell {
          width: min(1040px, 100%);
          min-height: 620px;
          display: grid;
          grid-template-columns: minmax(320px, 0.9fr) minmax(360px, 1fr);
          border: 1px solid rgba(39, 73, 147, 0.14);
          border-radius: 24px;
          background: ${T.surface};
          box-shadow: 0 26px 80px rgba(15, 23, 42, 0.12), 0 2px 12px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          animation: login-rise 0.55s ease both;
        }

        .login-brand-panel {
          position: relative;
          padding: 34px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background:
            linear-gradient(140deg, rgba(39, 73, 147, 0.98) 0%, rgba(29, 56, 112, 0.98) 58%, rgba(15, 23, 42, 0.98) 100%);
          color: #fff;
          isolation: isolate;
        }

        .login-brand-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.3));
          z-index: -1;
        }

        .login-brand-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .login-logo-plate {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 9px 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
        }

        .login-secure-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.86);
          font-size: 12px;
          font-weight: 600;
        }

        .login-brand-copy {
          max-width: 360px;
          padding: 72px 0 64px;
        }

        .login-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          font-weight: 700;
        }

        .login-brand-title {
          margin: 0;
          color: #fff;
          font-size: clamp(34px, 4vw, 48px);
          line-height: 1.02;
          font-weight: 800;
          letter-spacing: 0;
        }

        .login-brand-text {
          margin: 18px 0 0;
          max-width: 320px;
          color: rgba(255,255,255,0.74);
          font-size: 15px;
          line-height: 1.65;
        }

        .login-signal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .login-signal {
          min-height: 94px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.09);
          backdrop-filter: blur(10px);
        }

        .login-signal svg {
          color: #AFC2FF;
          margin-bottom: 12px;
        }

        .login-signal strong {
          display: block;
          font-size: 13px;
          line-height: 1.25;
          color: #fff;
        }

        .login-signal span {
          display: block;
          margin-top: 4px;
          color: rgba(255,255,255,0.58);
          font-size: 12px;
          line-height: 1.35;
        }

        .login-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background:
            radial-gradient(circle at 100% 0%, rgba(39,73,147,0.07), transparent 34%),
            ${T.surface};
        }

        .login-form-content {
          width: 100%;
          max-width: 410px;
        }

        .login-mobile-logo {
          display: none;
          margin-bottom: 28px;
        }

        .login-form-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 7px 10px;
          border-radius: 999px;
          background: ${BRAND_SOFT};
          border: 1px solid ${BRAND_LINE};
          color: ${BRAND};
          font-size: 12px;
          font-weight: 700;
        }

        .login-heading {
          margin: 0;
          color: ${T.navy};
          font-size: clamp(30px, 3vw, 38px);
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: 0;
        }

        .login-subhead {
          margin: 12px 0 30px;
          color: ${T.muted};
          font-size: 15px;
          line-height: 1.6;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .login-field {
          animation: login-rise 0.48s ease both;
        }

        .login-field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 22px;
          margin-bottom: 7px;
        }

        .login-label {
          color: ${T.mid};
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0;
        }

        .login-input-frame {
          min-height: 54px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 14px;
          border: 1.5px solid ${T.border};
          border-radius: 14px;
          background: ${T.inputBg};
          transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }

        .login-input-frame:focus-within {
          border-color: ${BRAND};
          background: #fff;
          box-shadow: 0 0 0 4px rgba(39, 73, 147, 0.11);
        }

        .login-input-icon {
          color: ${T.light};
          flex-shrink: 0;
        }

        .login-ghost-button {
          min-height: 34px;
          padding: 0 8px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: ${BRAND};
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
        }

        .login-icon-button {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: ${T.light};
          cursor: pointer;
        }

        .login-icon-button:hover,
        .login-ghost-button:hover {
          background: rgba(39,73,147,0.08);
        }

        .login-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.22);
          color: #B91C1C;
          font-size: 14px;
          line-height: 1.45;
          animation: login-rise 0.24s ease both;
        }

        .login-submit {
          min-height: 54px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 4px;
          padding: 0 24px;
          border: 0;
          border-radius: 14px;
          background: ${BRAND};
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 16px;
          font-weight: 800;
          box-shadow: 0 16px 34px rgba(39,73,147,0.24);
          transition: transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
        }

        .login-submit:hover {
          background: ${BRAND_DARK};
          transform: translateY(-1px);
          box-shadow: 0 20px 40px rgba(39,73,147,0.28);
        }

        .login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.68;
          transform: none;
        }

        .login-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid ${T.border};
          color: ${T.muted};
          font-size: 12px;
        }

        .login-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 28px;
          white-space: nowrap;
        }

        .login-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #10B981;
          box-shadow: 0 0 0 4px rgba(16,185,129,0.12);
        }

        @keyframes login-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-shell,
          .login-field,
          .login-error {
            animation: none;
          }
          .login-submit {
            transition: none;
          }
        }

        @media (max-width: 860px) {
          .login-shell {
            min-height: auto;
            max-width: 520px;
            grid-template-columns: 1fr;
          }
          .login-brand-panel {
            display: none;
          }
          .login-form-panel {
            padding: 34px 26px;
          }
          .login-mobile-logo {
            display: inline-flex;
          }
        }

        @media (max-width: 480px) {
          .login-shell {
            border-radius: 20px;
          }
          .login-form-panel {
            padding: 28px 20px;
          }
          .login-meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>

      <section className="login-brand-panel" aria-label="RingIQ staff access">
        <div className="login-brand-top">
          <div className="login-logo-plate">
            <Image src="/assets/logo.png" alt="RingIQ" width={132} height={38} priority style={{ width: 132, height: 'auto' }} />
          </div>
          <div className="login-secure-pill">
            <ShieldCheck size={14} />
            Protected
          </div>
        </div>

        <div className="login-brand-copy">
          <div className="login-kicker">
            <Activity size={15} />
            Client Operations Console
          </div>
          <h1 className="login-brand-title">Quiet control for every rollout.</h1>
          <p className="login-brand-text">
            Staff access for onboarding practices, checking tenant details, and keeping the enrollment pipeline moving.
          </p>
        </div>

        <div className="login-signal-grid" aria-label="Console status">
          <div className="login-signal">
            <CheckCircle2 size={19} />
            <strong>Systems operational</strong>
            <span>API, auth, and console routes are available.</span>
          </div>
          <div className="login-signal">
            <KeyRound size={19} />
            <strong>Session secured</strong>
            <span>JWT access with protected staff routes.</span>
          </div>
        </div>
      </section>

      <section className="login-form-panel" aria-label="Sign in">
        <div className="login-form-content">
          <div className="login-mobile-logo">
            <Image src="/assets/logo.png" alt="RingIQ" width={132} height={38} priority style={{ width: 132, height: 'auto' }} />
          </div>

          <div className="login-form-eyebrow">
            <ShieldCheck size={14} />
            Staff login
          </div>
          <h2 className="login-heading">Welcome back.</h2>
          <p className="login-subhead">
            Sign in with your staff credentials to continue to the RingIQ enrollment console.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <FieldRow id="email" label="Email address" icon={Mail} delay={90}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ringiq.ai"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </FieldRow>

            <FieldRow
              id="password"
              label="Password"
              icon={Lock}
              delay={150}
              right={
                <button
                  type="button"
                  className="login-ghost-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            >
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={inputStyle}
              />
              <button
                type="button"
                className="login-icon-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </FieldRow>

            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={17} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? (
                <>
                  <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Access console
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-meta">
            <div className="login-meta-item">
              <span className="login-dot" />
              Systems operational
            </div>
            <div className="login-meta-item">
              <ShieldCheck size={14} />
              JWT secured
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
