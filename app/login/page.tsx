import { LoginCard } from '@/components/auth/LoginCard';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-[#020617] flex items-center justify-center p-6 overflow-hidden">

      {/* ── Animated gradient orbs ── */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: '-18%', left: '-8%',
          width: 720, height: 720,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 68%)',
          filter: 'blur(48px)',
          animation: 'float-orb 14s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          bottom: '-18%', right: '-6%',
          width: 640, height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,92,246,0.11) 0%, transparent 68%)',
          filter: 'blur(64px)',
          animation: 'float-orb 18s ease-in-out infinite reverse',
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: '42%', right: '18%',
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)',
          filter: 'blur(32px)',
          animation: 'float-orb 22s ease-in-out 5s infinite',
        }}
      />

      {/* ── Dot grid ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148,163,184,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Edge vignette ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 35%, rgba(2,6,23,0.75) 100%)',
        }}
      />

      {/* ── Login card ── */}
      <div className="relative z-10 w-full flex justify-center">
        <LoginCard />
      </div>

    </main>
  );
}
