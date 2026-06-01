'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Building2, MoreVertical, Pencil, Trash2, Phone, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MockBusiness } from '@/types/business';

const T = {
  bg:      '#F7F6F3',
  surface: '#FFFFFF',
  border:  '#E2E8F0',
  navy:    '#0F172A',
  mid:     '#1E293B',
  muted:   '#64748B',
  light:   '#94A3B8',
  teal:    '#274993',
  tealFd:  '#EEF4FF',
  tealBd:  '#D8E5FF',
  hover:   '#F8FAFC',
}

// ── Delete modal ──────────────────────────────────────────────────────────────

function DeleteModal({
  business, onConfirm, onCancel, loading,
}: {
  business: MockBusiness;
  onConfirm: (deleteNumber: boolean) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const hasNumber = !!(business.twilioSid && business.inboundPhone);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(4px)' }}
        onClick={!loading ? onCancel : undefined}
      />
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 440,
        borderRadius: 18, border: `1.5px solid ${T.border}`,
        background: T.surface,
        boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 size={18} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, margin: 0 }}>Delete Business</h3>
              <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onCancel} disabled={loading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.light, display: 'flex', padding: 4, opacity: loading ? 0.4 : 1 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '0 24px 20px' }}>
          <p style={{ fontSize: 14, color: T.mid, lineHeight: 1.6 }}>
            You are about to permanently remove{' '}
            <span style={{ fontWeight: 600, color: T.navy }}>{business.practiceDisplayName}</span>{' '}
            from the registry.
          </p>
          {hasNumber && (
            <div style={{
              marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', borderRadius: 10,
              border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)',
            }}>
              <Phone size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#B45309', marginBottom: 2 }}>Twilio number connected</p>
                <p style={{ fontSize: 12, fontFamily: 'var(--font-geist-mono)', color: T.mid }}>{business.inboundPhone}</p>
                <p style={{ fontSize: 12, color: T.muted, marginTop: 5 }}>Would you also like to release this number from Twilio?</p>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 24px', borderTop: `1px solid ${T.border}`,
          justifyContent: hasNumber ? 'space-between' : 'flex-end',
        }}>
          <button
            onClick={onCancel} disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              color: T.muted, background: T.bg, border: `1.5px solid ${T.border}`,
              cursor: 'pointer', opacity: loading ? 0.4 : 1, fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasNumber && (
              <button
                type="button" onClick={() => onConfirm(false)} disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: T.mid, background: T.bg, border: `1.5px solid ${T.border}`,
                  cursor: 'pointer', opacity: loading ? 0.4 : 1, fontFamily: 'inherit',
                }}
              >
                {loading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                Delete without number
              </button>
            )}
            <button
              type="button" onClick={() => onConfirm(hasNumber)} disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: '#fff', background: '#EF4444', border: 'none',
                cursor: 'pointer', opacity: loading ? 0.5 : 1,
                boxShadow: '0 2px 8px rgba(239,68,68,0.25)', fontFamily: 'inherit',
              }}
            >
              {loading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
              {hasNumber ? 'Delete with number' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface BusinessTableProps {
  businesses: MockBusiness[];
  onDeleted?: () => void;
}

export function BusinessTable({ businesses, onDeleted }: BusinessTableProps) {
  const router = useRouter();
  const [openMenu,      setOpenMenu]      = useState<string | null>(null);
  const [menuPos,       setMenuPos]       = useState<{ top: number; right: number } | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<MockBusiness | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openMenuHandler = (bizId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openMenu === bizId) {
      setOpenMenu(null); setMenuPos(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      setOpenMenu(bizId);
    }
  };
  const closeMenu = () => { setOpenMenu(null); setMenuPos(null); };

  const handleDelete = async (deleteNumber: boolean) => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/offices/${deleteTarget.mongoOfficeId}?deleteNumber=${deleteNumber}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Delete failed');
      toast.success(`${deleteTarget.practiceDisplayName} removed from registry.`);
      setDeleteTarget(null);
      onDeleted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete business');
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeMenuBiz = openMenu ? businesses.find(b => b.id === openMenu) ?? null : null;

  const COLS = '1fr 1fr 120px 150px 100px 36px';

  return (
    <>
      {openMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={closeMenu} />}

      {/* Dropdown */}
      {activeMenuBiz && menuPos && (
        <div style={{
          position: 'fixed', top: menuPos.top, right: menuPos.right,
          zIndex: 50, width: 150,
          borderRadius: 10, border: `1.5px solid ${T.border}`,
          background: T.surface,
          boxShadow: '0 8px 28px rgba(15,23,42,0.10)',
          overflow: 'hidden', padding: '4px 0',
        }}>
          <button
            type="button"
            onClick={() => { closeMenu(); router.push(`/dashboard/offices/${activeMenuBiz.mongoOfficeId}`); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '9px 14px', fontSize: 13, color: T.mid,
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = T.hover}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
          >
            <Pencil size={12} style={{ color: T.light }} />
            Edit
          </button>
          <div style={{ height: 1, background: T.border, margin: '2px 10px' }} />
          <button
            type="button"
            onClick={() => { closeMenu(); setDeleteTarget(activeMenuBiz); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '9px 14px', fontSize: 13, color: '#EF4444',
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}

      <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: COLS, gap: 16,
          padding: '10px 20px', borderBottom: `1px solid ${T.border}`,
          background: T.bg,
        }}>
          {['Practice Name', 'Clean Name', 'Status', 'Timezone', 'Created', ''].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.light }}>
              {h}
            </span>
          ))}
        </div>

        {/* Empty state */}
        {businesses.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: T.bg, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={22} style={{ color: T.light }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: T.muted, margin: 0 }}>No businesses registered yet</p>
            <p style={{ fontSize: 12, color: T.light, margin: 0 }}>Create your first business profile to get started</p>
          </div>
        ) : (
          businesses.map((biz, idx) => (
            <div
              key={biz.id}
              onClick={() => router.push(`/dashboard/offices/${biz.mongoOfficeId}`)}
              style={{
                display: 'grid', gridTemplateColumns: COLS, gap: 16,
                alignItems: 'center', padding: '13px 20px',
                cursor: 'pointer', transition: 'background 0.12s',
                borderBottom: idx !== businesses.length - 1 ? `1px solid ${T.border}` : 'none',
                borderLeft: '2.5px solid transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = T.hover;
                (e.currentTarget as HTMLDivElement).style.borderLeftColor = T.teal;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.borderLeftColor = 'transparent';
              }}
            >
              {/* Practice name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {biz.practiceDisplayName}
                </span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-geist-mono)', color: T.light, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {biz.mongoOfficeId}
                </span>
              </div>

              {/* Clean name */}
              <span style={{ fontSize: 12, fontFamily: 'var(--font-geist-mono)', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {biz.corporateCleanName || <span style={{ color: T.light }}>-</span>}
              </span>

              {/* Status badge */}
              <div>
                {biz.environmentStatus === 'live_production' ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: 'rgba(16,185,129,0.08)', color: '#059669',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                    <CheckCircle2 size={10} />
                    Live
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: 'rgba(245,158,11,0.08)', color: '#D97706',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}>
                    <Clock size={10} />
                    Testing
                  </span>
                )}
              </div>

              {/* Timezone */}
              <span style={{ fontSize: 11, color: T.muted, fontFamily: 'var(--font-geist-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {biz.timezone || '-'}
              </span>

              {/* Created */}
              <span style={{ fontSize: 11, color: T.light }}>{biz.createdAt}</span>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={(e) => openMenuHandler(biz.id, e)}
                  style={{
                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 6, background: openMenu === biz.id ? T.bg : 'none', border: 'none',
                    cursor: 'pointer', color: openMenu === biz.id ? T.mid : T.light,
                    transition: 'all 0.12s',
                  }}
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          business={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => !deleteLoading && setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
