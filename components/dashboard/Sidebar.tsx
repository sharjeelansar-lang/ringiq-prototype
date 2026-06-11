'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Inbox, Settings, ChevronRight, LogOut, Menu, X } from 'lucide-react';

const T = {
  bg:     '#FFFFFF',
  border: '#E2E8F0',
  navy:   '#0F172A',
  mid:    '#1E293B',
  muted:  '#64748B',
  light:  '#94A3B8',
  teal:   '#274993',
  tealFd: '#EEF4FF',
  tealBd: '#D8E5FF',
  hover:  '#F8FAFC',
  amber:  '#D97706',
  amberFd:'#FFFBEB',
  amberBd:'#FDE68A',
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'A';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const [user,         setUser]         = useState<{ name: string; email: string } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => { if (j.success) setUser({ name: j.user.name || 'Admin', email: j.user.email }); })
      .catch(() => {});

    // Fetch pending queue count for badge
    fetch('/api/queue')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.queue)) {
          setPendingCount(j.queue.filter((q: { status: string }) => q.status === 'pending').length);
        }
      })
      .catch(() => {});
  }, []);

  const NAV_ITEMS = [
    {
      label: 'Overview',
      href:  '/dashboard',
      icon:  LayoutDashboard,
      match: (p: string) => p === '/dashboard',
      badge: null,
    },
    {
      label: 'Businesses',
      href:  '/dashboard/businesses',
      icon:  Building2,
      match: (p: string) =>
        p.startsWith('/dashboard/businesses') || p.startsWith('/dashboard/offices'),
      badge: null,
    },
    {
      label: 'Queue',
      href:  '/dashboard/queue',
      icon:  Inbox,
      match: (p: string) => p.startsWith('/dashboard/queue'),
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      label: 'Settings',
      href:  '/dashboard/settings',
      icon:  Settings,
      match: (p: string) => p.startsWith('/dashboard/settings'),
      badge: null,
    },
  ];

  return (
    <>
      <style>{`
        .dash-sidebar {
          display: flex; flex-direction: column; width: 240px; min-height: 100vh;
          background: #FFFFFF; border-right: 1px solid #E2E8F0; flex-shrink: 0;
          transition: transform 0.25s ease;
        }
        .dash-mob-btn {
          display: none;
          position: fixed; top: 16px; left: 14px; z-index: 200;
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(247,246,243,0.95);
          border: 1.5px solid #E2E8F0;
          align-items: center; justify-content: center;
          cursor: pointer; color: #64748B;
          box-shadow: 0 2px 8px rgba(15,23,42,0.10);
          padding: 0;
        }
        .dash-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(15,23,42,0.38);
          backdrop-filter: blur(2px); z-index: 198;
        }
        @media (max-width: 900px) {
          .dash-sidebar {
            position: fixed; top: 0; left: 0; height: 100dvh; z-index: 199;
            transform: translateX(-100%);
            box-shadow: 4px 0 28px rgba(15,23,42,0.14);
          }
          .dash-sidebar.mob-open { transform: translateX(0); }
          .dash-mob-btn { display: flex; }
          .dash-overlay.mob-open { display: block; }
          .dash-sidebar-close { display: block !important; }
        }
      `}</style>

      <button className="dash-mob-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <Menu size={16} />
      </button>

      <div
        className={`dash-overlay${mobileOpen ? ' mob-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

    <aside className={`dash-sidebar${mobileOpen ? ' mob-open' : ''}`}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 18px 12px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/assets/logo.png" alt="RingIQ" style={{ height: 26, width: 'auto', objectFit: 'contain', objectPosition: 'left' }} />
          <button
            onClick={() => setMobileOpen(false)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: T.light, padding: 4, borderRadius: 6 }}
            className="dash-sidebar-close"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'block' }} />
          <span style={{ fontSize: 10, color: T.light, fontFamily: 'var(--font-geist-mono)' }}>console v2.4</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 10px', flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.light, padding: '8px 10px', marginTop: 4 }}>
          Operations
        </p>

        {NAV_ITEMS.map(({ label, href, icon: Icon, match, badge }) => {
          const isActive = match(pathname);
          return (
            <Link key={label} href={href}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500, background: isActive ? T.tealFd : 'transparent', color: isActive ? T.teal : T.muted, border: `1px solid ${isActive ? T.tealBd : 'transparent'}`, transition: 'all 0.12s' }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = T.hover; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
            >
              <Icon size={15} style={{ color: isActive ? T.teal : T.light, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge !== null && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: T.amberFd, border: `1px solid ${T.amberBd}`, color: T.amber, fontFamily: 'var(--font-geist-mono)', minWidth: 18, textAlign: 'center' }}>
                  {badge}
                </span>
              )}
              {isActive && badge === null && <ChevronRight size={12} style={{ color: T.teal, opacity: 0.6 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: '10px', borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: T.hover, border: `1px solid ${T.border}` }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${T.teal} 0%, #18336F 100%)` }}>
            {user ? initials(user.name) : 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user?.name ?? 'Admin'}</p>
            <p style={{ fontSize: 11, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{user?.email ?? '...'}</p>
          </div>
          <button
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.light, display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6, transition: 'color 0.12s' }}
            title="Sign out"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.light; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
