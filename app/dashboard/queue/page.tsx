'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw, ChevronDown, ChevronRight, Mail, Phone, MapPin,
  Calendar, ArrowRight, X, Check, Clock, Inbox, Trash2,
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';

const T = {
  bg:       '#F7F6F3',
  surface:  '#FFFFFF',
  border:   '#E2E8F0',
  navy:     '#0F172A',
  mid:      '#1E293B',
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
  red:      '#DC2626',
  redFd:    '#FEF2F2',
  redBd:    'rgba(239,68,68,0.2)',
  green:    '#059669',
  greenFd:  '#F0FDF4',
  greenBd:  '#BBF7D0',
};

type QueueStatus = 'pending' | 'rejected';

type QueueItem = {
  id: string;
  practiceName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  locationCount: string;
  ehrSystem: string;
  monthlyCallVolume: string;
  currentPhoneSetup: string;
  interests: string[];
  notes: string;
  plan: string;
  status: QueueStatus;
  createdAt: string;
};

type OfficeItem = {
  id: string;
  practiceDisplayName: string;
  city: string;
  state: string;
  cpmid: string;
  timezone: string;
  prospectPlan: string;
  environmentStatus: string;
  createdAt: string;
  inboundPhone: string;
};

const PLAN_LABELS: Record<string, string> = {
  'nights-weekends': 'Nights & Weekends',
  'backup':          '3-Ring Backup',
  'full-service':    'Full Service',
};

const INTEREST_LABELS: Record<string, string> = {
  'after_hours':     'After-hours coverage',
  'scheduling':      'Appointment booking',
  'missed_calls':    'Reduce missed calls',
  'ehr_integration': 'EHR integration',
  'cost_savings':    'Lower staffing costs',
  'availability':    '24/7 availability',
};

const STATUS_FILTER_TABS: { key: QueueStatus | 'approved'; label: string }[] = [
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Registered' },
  { key: 'rejected', label: 'Declined' },
];

function StatusBadge({ status }: { status: QueueStatus }) {
  const map = {
    pending:  { bg: T.amberFd,  border: T.amberBd,  color: T.amber,  dot: T.amber,  label: 'Pending' },
    approved: { bg: T.greenFd,  border: T.greenBd,  color: T.green,  dot: T.green,  label: 'Approved' },
    rejected: { bg: T.redFd,    border: T.redBd,    color: T.red,    dot: T.red,    label: 'Declined' },
  };
  const s = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, color: s.color }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'block' }} />
      {s.label}
    </span>
  );
}

function PlanBadge({ slug }: { slug: string }) {
  if (!slug) return <span style={{ fontSize: 12, color: T.light }}>—</span>;
  return (
    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 6, background: T.brandFd, border: `1px solid ${T.brandBd}`, fontSize: 11, fontWeight: 600, color: T.brand }}>
      {PLAN_LABELS[slug] ?? slug}
    </span>
  );
}

function formatPhone(p: string) {
  const d = p.replace(/\D/g, '');
  if (d.length !== 10) return p;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Skeleton() {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: 'hidden' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none', opacity: 1 - i * 0.2 }}>
          {[180, 130, 90, 90, 80, 70].map((w, j) => (
            <div key={j} style={{ height: 12, background: T.bg, borderRadius: 4, width: w, flexShrink: 0 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function QueuePage() {
  const router  = useRouter();
  const [items,         setItems]         = useState<QueueItem[]>([]);
  const [offices,       setOffices]       = useState<OfficeItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState('');
  const [filter,        setFilter]        = useState<QueueStatus | 'approved'>('pending');
  const [expanded,      setExpanded]      = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<QueueItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [qRes, oRes] = await Promise.all([fetch('/api/queue'), fetch('/api/offices')]);
      const [qJson, oJson] = await Promise.all([qRes.json(), oRes.json()]);
      if (!qRes.ok || !qJson.success) throw new Error(qJson.error ?? 'Failed to load queue');
      if (!oRes.ok || !oJson.success) throw new Error(oJson.error ?? 'Failed to load offices');
      setItems(qJson.queue as QueueItem[]);
      setOffices(oJson.offices as OfficeItem[]);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const updateStatus = async (id: string, status: QueueStatus) => {
    setActionLoading(id);
    try {
      const res  = await fetch(`/api/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to update');
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
    } catch {
      // keep existing state on error
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartSetup = (item: QueueItem) => {
    router.push(`/dashboard/businesses/new?prospectId=${item.id}`);
  };

  const handleReject = (id: string) => updateStatus(id, 'rejected');

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/queue/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to delete');
      setItems((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
      setExpanded(null);
    } catch {
      // keep existing state on error
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  const pendingCount  = items.filter((i) => i.status === 'pending').length;
  const rejectedCount = items.filter((i) => i.status === 'rejected').length;

  const counts: Record<string, number> = {
    pending:  pendingCount,
    approved: offices.length,
    rejected: rejectedCount,
  };

  const visibleQueue = items.filter((i) => i.status === filter);

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg, overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: `1px solid ${T.border}`, background: 'rgba(247,246,243,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: T.navy, letterSpacing: '-0.02em', margin: 0 }}>Registration Queue</h1>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Practice applications submitted via /onboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {pendingCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: T.amberFd, border: `1px solid ${T.amberBd}` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.amber, display: 'block' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: T.amber }}>{pendingCount} awaiting review</span>
              </div>
            )}
            <button onClick={fetchQueue} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 13, color: T.muted, fontWeight: 500, background: T.surface, border: `1.5px solid ${T.border}`, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.15s', fontFamily: 'inherit' }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </header>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '0 32px', borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
          {STATUS_FILTER_TABS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button key={key} onClick={() => setFilter(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${active ? T.brand : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500, color: active ? T.brand : T.muted, transition: 'all 0.15s', marginBottom: -1 }}
              >
                {label}
                {counts[key] > 0 && (
                  <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 100, background: active ? T.brandFd : T.bg, border: `1px solid ${active ? T.brandBd : T.border}`, color: active ? T.brand : T.muted, fontFamily: 'var(--font-geist-mono)' }}>
                    {counts[key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {fetchError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)', fontSize: 13, color: T.red, marginBottom: 16 }}>
              <span style={{ fontWeight: 600 }}>Failed to load:</span>
              <span style={{ opacity: 0.8 }}>{fetchError}</span>
              <button onClick={fetchQueue} style={{ marginLeft: 'auto', fontSize: 12, background: 'none', border: 'none', color: T.red, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>Retry</button>
            </div>
          )}

          {/* ── Registered (offices) tab ─────────────────────────────────── */}
          {filter === 'approved' && (
            loading ? <Skeleton /> : offices.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Inbox size={20} style={{ color: T.light }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: 0 }}>No registered businesses yet</p>
                <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>Businesses appear here once their setup wizard is completed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.1fr 1fr 100px 120px', gap: 16, padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                  {['Practice', 'Location', 'Plan', 'CPMID', 'Enrolled', 'Status'].map((h) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.light }}>{h}</div>
                  ))}
                </div>
                {offices.map((o, i) => (
                  <div key={o.id}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.1fr 1fr 100px 120px', gap: 16, padding: '14px 20px', borderBottom: i < offices.length - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                    onClick={() => router.push(`/dashboard/offices/${o.id}`)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = T.surface; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.practiceDisplayName}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.city && o.state ? `${o.city}, ${o.state}` : '—'}
                    </div>
                    <div><PlanBadge slug={o.prospectPlan} /></div>
                    <div style={{ fontSize: 12, color: T.muted, fontFamily: 'var(--font-geist-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.cpmid || '—'}</div>
                    <div style={{ fontSize: 11, color: T.light, fontFamily: 'var(--font-geist-mono)' }}>{formatDate(o.createdAt)}</div>
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                        background: T.greenFd,
                        border: `1px solid ${T.greenBd}`,
                        color: T.green,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.green, display: 'block' }} />
                        Approved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Pending / Declined queue tabs ────────────────────────────── */}
          {filter !== 'approved' && (
            loading ? <Skeleton /> : visibleQueue.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Inbox size={20} style={{ color: T.light }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: 0 }}>
                  {filter === 'pending' ? 'No pending applications' : 'No declined applications'}
                </p>
                <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                  Applications submitted via /onboard appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.1fr 1fr 100px 120px', gap: 16, padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                  {['Practice', 'Contact', 'Location', 'Plan', 'EHR', 'Applied', 'Status'].map((h) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.light }}>{h}</div>
                  ))}
                </div>
                {visibleQueue.map((item, rowIdx) => {
                  const isExpanded = expanded === item.id;
                  const isLast     = rowIdx === visibleQueue.length - 1;
                  const isActing   = actionLoading === item.id;
                  return (
                    <div key={item.id} style={{ borderBottom: isLast && !isExpanded ? 'none' : `1px solid ${T.border}` }}>
                      <div
                        onClick={() => setExpanded(isExpanded ? null : item.id)}
                        style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.1fr 1fr 100px 120px', gap: 16, padding: '14px 20px', cursor: 'pointer', transition: 'background 0.1s', background: isExpanded ? T.bg : T.surface }}
                        onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = '#FAFAFA'; }}
                        onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = T.surface; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          {isExpanded
                            ? <ChevronDown size={13} style={{ color: T.brand, flexShrink: 0 }} />
                            : <ChevronRight size={13} style={{ color: T.light, flexShrink: 0 }} />
                          }
                          <span style={{ fontSize: 14, fontWeight: 600, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.practiceName}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.contactName}</p>
                          <p style={{ fontSize: 11, color: T.muted, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.contactRole}</p>
                        </div>
                        <div style={{ fontSize: 13, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.city && item.state ? `${item.city}, ${item.state}` : '—'}
                        </div>
                        <div><PlanBadge slug={item.plan} /></div>
                        <div style={{ fontSize: 12, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.ehrSystem || '—'}</div>
                        <div style={{ fontSize: 11, color: T.light, fontFamily: 'var(--font-geist-mono)' }}>{formatDate(item.createdAt)}</div>
                        <div><StatusBadge status={item.status} /></div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${T.border}`, background: T.bg, animation: 'fade-up .2s ease-out both' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: '20px 0 20px' }}>
                            <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '16px 18px' }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Contact</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.navy }}>
                                  <Mail size={12} style={{ color: T.muted, flexShrink: 0 }} />
                                  <a href={`mailto:${item.email}`} style={{ color: T.brand, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.email}</a>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.navy }}>
                                  <Phone size={12} style={{ color: T.muted, flexShrink: 0 }} />
                                  {formatPhone(item.phone)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.navy }}>
                                  <MapPin size={12} style={{ color: T.muted, flexShrink: 0 }} />
                                  {item.city && item.state ? `${item.city}, ${item.state}` : '—'}
                                </div>
                              </div>
                            </div>
                            <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '16px 18px' }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Practice Setup</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {[
                                  { label: 'Locations',   value: item.locationCount },
                                  { label: 'EHR System',  value: item.ehrSystem },
                                  { label: 'Call Volume', value: item.monthlyCallVolume },
                                  { label: 'Phone Setup', value: item.currentPhoneSetup },
                                ].map(({ label, value }) => (
                                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                    <span style={{ color: T.muted }}>{label}</span>
                                    <span style={{ color: T.navy, fontWeight: 500, textAlign: 'right', maxWidth: '58%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '16px 18px' }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Interests & Goals</p>
                              {item.interests.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                                  {item.interests.map((id) => (
                                    <span key={id} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: T.tealFd, border: `1px solid ${T.tealBd}`, color: T.teal, fontWeight: 500 }}>
                                      {INTEREST_LABELS[id] ?? id}
                                    </span>
                                  ))}
                                </div>
                              ) : <p style={{ fontSize: 12, color: T.light, marginBottom: 10 }}>None selected</p>}
                              {item.notes && (
                                <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>"{item.notes}"</p>
                              )}
                            </div>
                          </div>

                          {item.status === 'pending' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStartSetup(item); }}
                                disabled={isActing}
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 9, background: isActing ? '#5B6E9E' : T.brand, color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: isActing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(39,73,147,0.25)', fontFamily: 'inherit', transition: 'opacity 0.15s' }}
                                onMouseEnter={(e) => { if (!isActing) e.currentTarget.style.opacity = '0.88'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                              >
                                <ArrowRight size={13} /> Start Setup
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReject(item.id); }}
                                disabled={isActing}
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 9, background: 'none', color: T.red, border: `1.5px solid ${T.redBd}`, fontSize: 13, fontWeight: 600, cursor: isActing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                              >
                                <X size={13} /> Decline
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}
                                disabled={isActing}
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 9, background: 'none', color: T.red, border: `1.5px solid ${T.redBd}`, fontSize: 13, fontWeight: 600, cursor: isActing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                              <span style={{ fontSize: 12, color: T.light }}>Registered automatically when wizard is completed</span>
                            </div>
                          )}

                          {item.status === 'rejected' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateStatus(item.id, 'pending'); }}
                                disabled={isActing}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 9, background: T.bg, border: `1.5px solid ${T.border}`, color: T.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                <Clock size={12} /> Restore to Pending
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item); }}
                                disabled={isActing}
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 9, background: 'none', color: T.red, border: `1.5px solid ${T.redBd}`, fontSize: 13, fontWeight: 600, cursor: isActing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          onClick={() => { if (!deleteLoading) setDeleteConfirm(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#FFFFFF', borderRadius: 14, padding: '28px 28px 24px', width: 400, boxShadow: '0 20px 60px rgba(15,23,42,0.18)', border: `1px solid ${T.border}` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: T.redFd, border: `1px solid ${T.redBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={18} style={{ color: T.red }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.navy, margin: '0 0 4px' }}>Delete Application</p>
                <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>
                  This will permanently delete <strong style={{ color: T.navy }}>{deleteConfirm.practiceName}</strong>'s application from the database. This cannot be undone.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: T.bg, border: `1.5px solid ${T.border}`, color: T.muted, cursor: deleteLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={deleteLoading}
                style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: T.red, color: '#fff', border: 'none', cursor: deleteLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: deleteLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}
              >
                {deleteLoading ? 'Deleting…' : <><Trash2 size={13} /> Delete Permanently</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
