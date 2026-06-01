import { LoginCard } from '@/components/auth/LoginCard';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#F7F6F3', display: 'flex', flexDirection: 'column' }}>
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          opacity: 0.6,
        }}
      />
      <div aria-hidden style={{
        position: 'fixed', top: '-10%', right: '-6%', pointerEvents: 'none',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(43,77,168,0.07) 0%, transparent 65%)',
        filter: 'blur(40px)',
      }} />
      <div aria-hidden style={{
        position: 'fixed', bottom: '-10%', left: '-6%', pointerEvents: 'none',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(253,230,138,0.10) 0%, transparent 65%)',
        filter: 'blur(48px)',
      }} />

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', position: 'relative', zIndex: 10,
      }}>
        <LoginCard />
      </div>
    </div>
  );
}
