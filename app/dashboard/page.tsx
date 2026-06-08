'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Clock, Inbox, ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MockBusiness } from '@/types/business';

const T = {
  bg:       '#F7F6F3',
  surface:  '#FFFFFF',
  border:   '#E2E8F0',
  navy:     '#0F172A',
  muted:    '#64748B',
  light:    '#94A3B8',
  brand:    '#274993',
  brandFd:  '#EEF2FF',
  brandBd:  '#C7D2FE',
  teal:     '#0D9488',
  tealFd:   '#F0FDFA',
  tealBd:   '#99F6E4',
  amber:    '#D97706',
  amberFd:  '#FFFBEB',
  amberBd:  '#FDE68A',
};

const PLAN_LABELS: Record<string, string> = {
  'nights-weekends': 'Nights & Weekends',
  'backup':          '3-Ring Backup',
  'full-service':    'Full Service',
};

type QueueItem = {
  id: string;
  practiceName: string;
  contactName: string;
  city: string;
  state: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardOverview() {
  const [businesses,    setBusinesses]    = useState<MockBusiness[]>([]);
  const [queue,         setQueue]         = useState<QueueItem[]>([]);
  const [bizLoading,    setBizLoading]    = useState(true);
  const [queueLoading,  setQueueLoading]  = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  const fetchAll = async (silent = false) => {
    if (!silent) { setBizLoading(true); setQueueLoading(true); }
    else         setRefreshing(true);

    await Promise.allSettled([
      fetch('/api/offices')
        .then((r) => r.json())
        .then((j) => { if (j.success) setBusinesses(j.offices); })
        .finally(() => setBizLoading(false)),
      fetch('/api/queue')
        .then((r) => r.json())
        .then((j) => { if (j.success) setQueue(j.queue as QueueItem[]); })
        .finally(() => setQueueLoading(false)),
    ]);

    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const liveCount    = businesses.filter((b) => b.environmentStatus === 'live_production').length;
  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const recentBiz    = [...businesses].slice(0, 4);
  const recentQueue  = queue.filter((q) => q.status === 'pending').slice(0, 4);

  const stats = [
    { label: 'Total Businesses', value: businesses.length, icon: Building2,    color: T.navy,  loading: bizLoading },
    { label: 'Live Production',  value: liveCount,         icon: CheckCircle2, color: '#10B981', loading: bizLoading },
    { label: 'Pending in Queue', value: pendingCount,      icon: Clock,        color: T.amber, loading: queueLoading },
    { label: 'Total in Queue',   value: queue.length,      icon: Inbox,        color: T.brand, loading: queueLoading },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: `1px solid ${T.border}`, background: 'rgba(247,246,243,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: T.navy, letterSpacing: '-0.02em', margin: 0 }}>Overview</h1>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Command center for your RingIQ operations</p>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 13, color: T.muted, fontWeight: 500, background: T.surface, border: `1.5px solid ${T.border}`, cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.5 : 1, fontFamily: 'inherit' }}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </header>

        {/* Main scrollable */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {stats.map(({ label, value, icon: Icon, color, loading }) => (
              <div key={label} style={{ background: T.surface, borderRadius: 14, border: `1.5px solid ${T.border}`, padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.navy, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                    {loading ? <span style={{ display: 'inline-block', width: 24, height: 18, background: T.border, borderRadius: 4 }} /> : value}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.3 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Two-column sections */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Registered Businesses */}
            <div style={{ background: T.surface, borderRadius: 14, border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={14} style={{ color: T.brand }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Registered Businesses</span>
                  <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 100, background: T.bg, border: `1px solid ${T.border}`, color: T.muted, fontFamily: 'var(--font-geist-mono)' }}>
                    {bizLoading ? '…' : businesses.length}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link href="/dashboard/businesses/new" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.brand, textDecoration: 'none', fontWeight: 600, padding: '5px 10px', borderRadius: 7, background: T.brandFd, border: `1px solid ${T.brandBd}` }}>
                    <Plus size={11} /> Add
                  </Link>
                  <Link href="/dashboard/businesses" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.muted, textDecoration: 'none', fontWeight: 500 }}>
                    View all <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {bizLoading ? (
                <div style={{ padding: '12px 20px' }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none', opacity: 1 - i * 0.25 }}>
                      {[140, 80, 60].map((w, j) => (
                        <div key={j} style={{ height: 11, background: T.bg, borderRadius: 3, width: w }} />
                      ))}
                    </div>
                  ))}
                </div>
              ) : recentBiz.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: T.light, margin: 0 }}>No businesses enrolled yet.</p>
                  <Link href="/dashboard/businesses/new" style={{ fontSize: 12, color: T.brand, textDecoration: 'none', fontWeight: 600 }}>Add the first one →</Link>
                </div>
              ) : (
                <div>
                  {recentBiz.map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < recentBiz.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>{b.practiceDisplayName}</p>
                        <p style={{ fontSize: 11, color: T.muted, margin: '2px 0 0' }}>{b.timezone || 'No timezone set'}</p>
                      </div>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 100,
                        background: T.tealFd,
                        border: `1px solid ${T.tealBd}`,
                        color: T.teal,
                        fontWeight: 600, letterSpacing: '0.04em',
                      }}>
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Queue */}
            <div style={{ background: T.surface, borderRadius: 14, border: `1.5px solid ${T.border}`, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Inbox size={14} style={{ color: pendingCount > 0 ? T.amber : T.muted }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Pending Applications</span>
                  {pendingCount > 0 && (
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 100, background: T.amberFd, border: `1px solid ${T.amberBd}`, color: T.amber, fontWeight: 700, fontFamily: 'var(--font-geist-mono)' }}>
                      {pendingCount}
                    </span>
                  )}
                </div>
                <Link href="/dashboard/queue" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.muted, textDecoration: 'none', fontWeight: 500 }}>
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              {queueLoading ? (
                <div style={{ padding: '12px 20px' }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none', opacity: 1 - i * 0.25 }}>
                      {[140, 80, 60].map((w, j) => (
                        <div key={j} style={{ height: 11, background: T.bg, borderRadius: 3, width: w }} />
                      ))}
                    </div>
                  ))}
                </div>
              ) : recentQueue.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: T.light, margin: '0 0 6px' }}>No pending applications.</p>
                  <p style={{ fontSize: 12, color: T.light, margin: 0 }}>New submissions from /onboard appear here.</p>
                </div>
              ) : (
                <div>
                  {recentQueue.map((q, i) => (
                    <Link key={q.id} href="/dashboard/queue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i < recentQueue.length - 1 ? `1px solid ${T.border}` : 'none', textDecoration: 'none', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = T.bg; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>{q.practiceName}</p>
                        <p style={{ fontSize: 11, color: T.muted, margin: '2px 0 0' }}>
                          {q.city && q.state ? `${q.city}, ${q.state}` : q.contactName}
                          {q.plan ? ` · ${PLAN_LABELS[q.plan] ?? q.plan}` : ''}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: T.light, fontFamily: 'var(--font-geist-mono)', flexShrink: 0 }}>{formatDate(q.createdAt)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/dashboard/businesses/new"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, background: T.brand, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(39,73,147,0.25)', transition: 'opacity 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              <Plus size={14} /> Register a Business
            </Link>
            <Link href="/dashboard/queue"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, background: T.surface, color: T.navy, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: `1.5px solid ${T.border}`, transition: 'border-color 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = T.brand; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border; }}
            >
              <Inbox size={14} style={{ color: T.muted }} /> Review Queue
              {pendingCount > 0 && (
                <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 100, background: T.amberFd, border: `1px solid ${T.amberBd}`, color: T.amber, fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
