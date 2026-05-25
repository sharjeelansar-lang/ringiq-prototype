'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, LayoutDashboard, Building2, Settings,
  ChevronRight, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'A';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    // active on /dashboard and all sub-pages except /dashboard/settings
    match: (p: string) => p === '/dashboard'
      || p.startsWith('/dashboard/offices')
      || p.startsWith('/dashboard/businesses'),
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    match: (p: string) => p.startsWith('/dashboard/settings'),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(j => { if (j.success) setUser({ name: j.user.name || 'Admin', email: j.user.email }); })
      .catch(() => {});
  }, []);

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-slate-950 border-r border-slate-800/70 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/70">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <Zap size={16} className="text-cyan-400" />
        </div>
        <div>
          <span className="text-sm font-bold text-white tracking-tight">RingIQ</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-mono">console v2.4</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 px-3 py-2 mt-1">
          Operations
        </p>

        {NAV_ITEMS.map(({ label, href, icon: Icon, match }) => {
          const isActive = match(pathname);
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent',
              )}
            >
              <Icon size={15} className={cn(
                'transition-colors',
                isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400',
              )} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={13} className="text-cyan-500/50" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-800/70">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <div
            className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)' }}
          >
            {user ? initials(user.name) : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email ?? '…'}</p>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="text-slate-600 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

    </aside>
  );
}
