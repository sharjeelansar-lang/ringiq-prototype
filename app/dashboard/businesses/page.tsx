'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Activity, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { BusinessTable } from '@/components/dashboard/BusinessTable';
import { MockBusiness } from '@/types/business';

const T = {
  bg:      '#F7F6F3',
  surface: '#FFFFFF',
  border:  '#E2E8F0',
  navy:    '#0F172A',
  muted:   '#64748B',
  light:   '#94A3B8',
  teal:    '#274993',
  tealFd:  '#EEF4FF',
};

export default function BusinessesPage() {
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

  const liveCount  = businesses.filter((b) => b.environmentStatus === 'live_production').length;
  const testCount  = businesses.filter((b) => b.environmentStatus === 'internal_testing').length;
  const totalCount = businesses.length;

  const stats = [
    { label: 'Total Enrolled',   value: totalCount, icon: Building2,    color: T.navy },
    { label: 'Live Production',  value: liveCount,  icon: CheckCircle2, color: '#10B981' },
    { label: 'Internal Testing', value: testCount,  icon: Clock,        color: '#F59E0B' },
    { label: 'Active Today',     value: totalCount, icon: Activity,     color: T.teal },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: `1px solid ${T.border}`, background: 'rgba(247,246,243,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: T.navy, letterSpacing: '-0.02em', margin: 0 }}>Business Registry</h1>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Enrolled tenant profiles</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={fetchOffices} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 13, color: T.muted, fontWeight: 500, background: T.surface, border: `1.5px solid ${T.border}`, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.15s', fontFamily: 'inherit' }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button onClick={() => router.push('/dashboard/businesses/new')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 9, background: '#274993', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'opacity 0.15s', boxShadow: '0 4px 16px rgba(39,73,147,0.28)', fontFamily: 'inherit', letterSpacing: '-0.01em' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              <Plus size={16} strokeWidth={2.5} /> Add Business
            </button>
          </div>
        </header>

        {/* Stats strip */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: T.surface }}>
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, padding: '14px 24px', borderRight: i < stats.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {loading ? <span style={{ display: 'inline-block', width: 20, height: 14, background: T.border, borderRadius: 4 }} /> : value}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Registered Tenants</h2>
                <span style={{ padding: '2px 8px', borderRadius: 100, background: T.bg, border: `1px solid ${T.border}`, fontSize: 11, color: T.muted, fontFamily: 'var(--font-geist-mono)' }}>
                  {loading ? '...' : totalCount}
                </span>
              </div>
              {!loading && !fetchError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, display: 'block' }} />
                  <span style={{ fontSize: 11, color: T.light, fontFamily: 'var(--font-geist-mono)' }}>Live · MongoDB Atlas</span>
                </div>
              )}
            </div>

            {fetchError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', fontSize: 13, color: '#DC2626' }}>
                <span style={{ fontWeight: 600 }}>Failed to load offices:</span>
                <span style={{ opacity: 0.8 }}>{fetchError}</span>
                <button onClick={fetchOffices} style={{ marginLeft: 'auto', fontSize: 12, background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Retry</button>
              </div>
            )}

            {loading ? (
              <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: 'hidden' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 20px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none', opacity: 1 - i * 0.18 }}>
                    {[200, 140, 64, 140, 80].map((w, j) => (
                      <div key={j} style={{ height: 12, background: T.bg, borderRadius: 4, width: w, flexShrink: 0 }} />
                    ))}
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
