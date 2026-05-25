'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Clock, Building2,
  MoreVertical, Pencil, Trash2, Phone, X, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { MockBusiness } from '@/types/business';
import { cn } from '@/lib/utils';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={!loading ? onCancel : undefined} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Business</h3>
              <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onCancel} disabled={loading}
            className="text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-40 ml-4 mt-0.5">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-5">
          <p className="text-sm text-slate-300 leading-relaxed">
            You are about to permanently remove{' '}
            <span className="font-semibold text-white">{business.practiceDisplayName}</span>{' '}
            from the registry.
          </p>
          {hasNumber && (
            <div className="mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <Phone size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300 mb-0.5">Twilio number connected</p>
                <p className="text-xs font-mono text-slate-300">{business.inboundPhone}</p>
                <p className="text-xs text-slate-500 mt-1.5">Would you also like to release this number from Twilio?</p>
              </div>
            </div>
          )}
        </div>

        <div className={cn(
          'flex items-center gap-2.5 px-6 py-4 border-t border-slate-800/60',
          hasNumber ? 'justify-between' : 'justify-end',
        )}>
          <button onClick={onCancel} disabled={loading}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200
              border border-slate-700/60 hover:border-slate-600 transition-all disabled:opacity-40">
            Cancel
          </button>
          <div className="flex items-center gap-2.5">
            {hasNumber && (
              <button type="button" onClick={() => onConfirm(false)} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  text-slate-300 border border-slate-700/60 hover:border-slate-600 hover:text-white
                  transition-all disabled:opacity-40">
                {loading ? <Loader2 size={13} className="animate-spin" /> : null}
                Delete without number
              </button>
            )}
            <button type="button" onClick={() => onConfirm(hasNumber)} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                bg-red-500 hover:bg-red-400 text-white transition-all
                shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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

const COL = 'grid-cols-[1fr_1fr_130px_160px_110px_36px]';

export function BusinessTable({ businesses, onDeleted }: BusinessTableProps) {
  const router = useRouter();
  const [openMenu,     setOpenMenu]     = useState<string | null>(null);
  const [menuPos,      setMenuPos]      = useState<{ top: number; right: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MockBusiness | null>(null);
  const [deleteLoading,setDeleteLoading]= useState(false);

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

  return (
    <>
      {/* Backdrop closes the menu on outside click */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={closeMenu} />}

      {/* Dropdown rendered outside overflow-hidden table — fixed to viewport */}
      {activeMenuBiz && menuPos && (
        <div
          style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
          className="z-50 w-40 rounded-xl border border-slate-700/80 bg-slate-900 shadow-xl shadow-black/50 overflow-hidden py-1"
        >
          <button
            type="button"
            onClick={() => { closeMenu(); router.push(`/dashboard/offices/${activeMenuBiz.mongoOfficeId}`); }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-slate-300
              hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <Pencil size={12} className="text-slate-500" />
            Edit
          </button>
          <div className="h-px bg-slate-800/60 mx-2" />
          <button
            type="button"
            onClick={() => { closeMenu(); setDeleteTarget(activeMenuBiz); }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-red-400
              hover:bg-red-500/8 hover:text-red-300 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">

        {/* Column headers */}
        <div className={cn('grid gap-4 px-5 py-3 border-b border-slate-800/60 bg-slate-900/60', COL)}>
          {['Practice Name', 'Clean Name', 'Status', 'Timezone', 'Created', ''].map(h => (
            <span key={h} className="text-[10px] font-semibold tracking-widest uppercase text-slate-600">
              {h}
            </span>
          ))}
        </div>

        {/* Empty state */}
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
              <Building2 size={22} className="text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-slate-600 font-medium">No businesses registered yet</p>
            <p className="text-xs text-slate-700">Create your first business profile to get started</p>
          </div>
        ) : (
          businesses.map((biz, idx) => (
            <div
              key={biz.id}
              onClick={() => router.push(`/dashboard/offices/${biz.mongoOfficeId}`)}
              className={cn(
                `grid ${COL} gap-4 items-center px-5 py-3.5`,
                'cursor-pointer group relative transition-all duration-150',
                // Left accent border — the terminal precision differentiator
                'border-l-2 border-l-transparent hover:border-l-cyan-500',
                'hover:bg-slate-800/20',
                idx !== businesses.length - 1 && 'border-b border-slate-800/40',
              )}
            >
              {/* Practice name + ID */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                  {biz.practiceDisplayName}
                </span>
                <span className="text-[10px] font-mono text-slate-700 truncate">{biz.mongoOfficeId}</span>
              </div>

              {/* Clean name */}
              <span className="text-xs font-mono text-slate-500 truncate">
                {biz.corporateCleanName || <span className="text-slate-700 not-italic">—</span>}
              </span>

              {/* Status badge */}
              <div>
                {biz.environmentStatus === 'live_production' ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={10} />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock size={10} />
                    Testing
                  </span>
                )}
              </div>

              {/* Timezone */}
              <span className="text-[11px] text-slate-500 font-mono truncate">{biz.timezone || '—'}</span>

              {/* Created */}
              <span className="text-[11px] text-slate-600">{biz.createdAt}</span>

              {/* Actions */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => openMenuHandler(biz.id, e)}
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-md transition-all',
                    openMenu === biz.id
                      ? 'bg-slate-700 text-slate-200'
                      : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800 opacity-0 group-hover:opacity-100',
                  )}
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
