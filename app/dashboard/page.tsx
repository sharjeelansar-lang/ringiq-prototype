'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Building2, Activity, CheckCircle2, Clock,
  RefreshCw, Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { BusinessTable } from '@/components/dashboard/BusinessTable';
import { MockBusiness } from '@/types/business';

export default function DashboardPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<MockBusiness[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchOffices = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res  = await fetch('/api/offices');
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to load');
      setBusinesses(json.offices);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch offices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffices(); }, [fetchOffices]);

  const liveCount  = businesses.filter(b => b.environmentStatus === 'live_production').length;
  const testCount  = businesses.filter(b => b.environmentStatus === 'internal_testing').length;
  const totalCount = businesses.length;

  const stats = [
    { label: 'Total Enrolled',   value: totalCount, icon: Building2,    color: 'text-slate-300' },
    { label: 'Live Production',  value: liveCount,  icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Internal Testing', value: testCount,  icon: Clock,        color: 'text-amber-400' },
    { label: 'Active Today',     value: totalCount, icon: Activity,     color: 'text-cyan-400' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Business Registry</h1>
            <p className="text-xs text-slate-500 mt-0.5">Enrolled tenant profiles — Client Operations Console</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOffices}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-400
                border border-slate-700/60 hover:border-slate-600 hover:text-slate-200
                transition-all disabled:opacity-40"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/dashboard/businesses/new')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide
                transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Business
            </button>
          </div>
        </header>

        {/* ── Stats strip ── */}
        <div className="flex items-stretch border-b border-slate-800/50 shrink-0">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 flex-1 px-6 py-3.5 border-r border-slate-800/40 last:border-r-0 bg-slate-950/30"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border border-slate-800/80 shrink-0">
                <Icon size={13} className={color} />
              </div>
              <div>
                <div className={`text-base font-bold ${color} leading-none tabular-nums`}>
                  {loading ? <span className="inline-block w-5 h-3.5 bg-slate-800 rounded animate-pulse" /> : value}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5 font-mono">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xs font-semibold text-slate-500 tracking-widest uppercase">Registered Tenants</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-500 text-[11px] font-mono border border-slate-700/40">
                  {loading ? '…' : totalCount}
                </span>
              </div>
              {!loading && !fetchError && (
                <div className="flex items-center gap-1.5">
                  <Zap size={10} className="text-cyan-500" />
                  <span className="text-[10px] text-slate-600 font-mono">Live · MongoDB Atlas</span>
                </div>
              )}
            </div>

            {fetchError && (
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
                <span className="font-semibold">Failed to load offices:</span>
                <span className="text-red-400/70">{fetchError}</span>
                <button onClick={fetchOffices} className="ml-auto text-xs underline hover:text-red-300">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-6 px-5 py-4 border-b border-slate-800/40 last:border-0"
                    style={{ opacity: 1 - i * 0.2 }}
                  >
                    <div className="h-3.5 bg-slate-800 rounded animate-pulse w-52" />
                    <div className="h-3.5 bg-slate-800 rounded animate-pulse w-32" />
                    <div className="h-5 bg-slate-800 rounded-full animate-pulse w-16" />
                    <div className="h-3.5 bg-slate-800 rounded animate-pulse w-36 ml-auto" />
                    <div className="h-3.5 bg-slate-800 rounded animate-pulse w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <BusinessTable businesses={businesses} onDeleted={fetchOffices} />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
