'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, Cpu, Phone, MapPin,
  CheckCircle2, Clock, Copy, Check, ExternalLink, RefreshCw,
  PhoneCall, Hash, Globe, Layers,
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';

interface HoursBlock { isOpen: boolean; open: string; close: string; }

interface OfficeDetail {
  _id: string;
  name: string;
  corporateCleanName?: string;
  officeStatus: string;
  tzName: string;
  tzOffset: number;
  phone: string;
  officeLine2?: string;
  officeLine3?: string;
  servicePlan: string;
  skipRecordingMessage: boolean;
  createdAt: string;
  address: { street: string; city: string; state: string; zip: number | string };
  email: { company: string };
  twilioNumbers: { number: string; title: string; disabled: boolean; sid?: string }[];
  workingHours: Record<string, HoursBlock>;
  workingLunchHours: { doctorLunch?: string };
  ehr: { cpmid: string; syeLocationId: number };
  prospectPlan?: string;
}

const PLAN_LABELS: Record<string, string> = {
  'nights-weekends': 'Free Nights & Weekends',
  'backup':          '3-Ring Backup',
  'full-service':    'Full Service',
};

// ── Copy row ──────────────────────────────────────────────────────────────────

function DataRow({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const display = value !== undefined && value !== null && value !== '' ? String(value) : '—';
  const canCopy = display !== '—';

  const copy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0 group">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 w-36 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <span className={cn(
          'text-right break-all leading-snug',
          mono ? 'font-mono text-xs text-[#274993]' : 'text-xs text-slate-700',
          display === '—' ? 'text-slate-300' : '',
        )}>
          {display}
        </span>
        {canCopy && (
          <button
            onClick={copy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-slate-600 shrink-0"
          >
            {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

const ACCENT: Record<string, { icon: string; border: string; bg: string }> = {
  cyan:    { icon: 'text-[#274993]',   border: 'border-blue-200',    bg: 'bg-blue-50' },
  violet:  { icon: 'text-violet-600',  border: 'border-violet-200',  bg: 'bg-violet-50' },
  emerald: { icon: 'text-emerald-600', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  amber:   { icon: 'text-amber-600',   border: 'border-amber-200',   bg: 'bg-amber-50' },
  rose:    { icon: 'text-rose-600',    border: 'border-rose-200',    bg: 'bg-rose-50' },
};

function Panel({ title, icon: Icon, accent = 'cyan', children }: {
  title: string; icon: React.ElementType; accent?: string; children: React.ReactNode;
}) {
  const a = ACCENT[accent] ?? ACCENT.cyan;
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <div className={cn('flex items-center justify-center w-7 h-7 rounded-lg border', a.bg, a.border)}>
          <Icon size={13} className={a.icon} />
        </div>
        <span className="text-xs font-semibold text-slate-600 tracking-wide">{title}</span>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isLive = status === 'active';
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
      isLive
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-700 border-amber-200',
    )}>
      {isLive ? <CheckCircle2 size={11} /> : <Clock size={11} />}
      {isLive ? 'Live Production' : 'Internal Testing'}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-20 bg-white rounded-xl border border-slate-200 shadow-sm" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-2.5">
            <div className="h-3.5 bg-slate-100 rounded w-28" />
            {[...Array(3)].map((__, j) => (
              <div key={j} className="h-2.5 bg-slate-100 rounded w-full" style={{ opacity: 1 - j * 0.25 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OfficeDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const [office, setOffice] = useState<OfficeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/offices/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error ?? 'Not found');
        setOffice(json.office);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const DAY_LABELS: Record<string, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
    thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="flex items-center gap-4 px-8 py-5 border-b border-slate-200 bg-white/90 backdrop-blur-sm shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800
              transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100 shrink-0"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <div className="w-px h-5 bg-slate-200" />

          {office ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">{office.name}</h1>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{office._id}</p>
              </div>
              <StatusBadge status={office.officeStatus} />
            </div>
          ) : (
            <div className="h-6 bg-slate-100 rounded w-48 animate-pulse" />
          )}

          {office && (
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100 shrink-0"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </header>

        {/* ── Body ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading && <Skeleton />}

          {error && (
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-red-200 bg-red-50 text-red-600">
              <span className="font-semibold text-sm">Failed to load:</span>
              <span className="text-sm text-red-500">{error}</span>
              <button onClick={() => router.push('/dashboard')} className="ml-auto text-xs underline">
                Back to dashboard
              </button>
            </div>
          )}

          {!loading && office && (
            <div className="flex flex-col gap-5">

              {/* ── Hero strip — key identifiers at a glance ── */}
              <div className="grid grid-cols-4 gap-3">
                {/* Primary phone */}
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 shrink-0">
                    <Phone size={14} className="text-[#274993]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">Inbound Line</p>
                    <p className="text-sm font-mono text-[#274993] font-semibold truncate">
                      {office.twilioNumbers?.[0]?.number || '—'}
                    </p>
                  </div>
                </div>

                {/* Timezone */}
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 border border-violet-200 shrink-0">
                    <Globe size={14} className="text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">Timezone</p>
                    <p className="text-sm font-mono text-slate-700 truncate">{office.tzName || '—'}</p>
                  </div>
                </div>

                {/* CPMID */}
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
                    <Hash size={14} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">CPM ID</p>
                    <p className="text-sm font-mono text-slate-700 truncate">{office.ehr?.cpmid || '—'}</p>
                  </div>
                </div>

                {/* Plan */}
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 shrink-0">
                    <Layers size={14} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">Plan</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {office.prospectPlan ? (PLAN_LABELS[office.prospectPlan] ?? office.prospectPlan) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Detail panels ── */}
              <div className="grid grid-cols-2 gap-4">

                <Panel title="Core Business" icon={Building2} accent="cyan">
                  <DataRow label="Display Name"  value={office.name} />
                  <DataRow label="Clean Name"    value={office.corporateCleanName} mono />
                  <DataRow label="Status"        value={office.officeStatus} />
                  <DataRow label="Plan"          value={office.prospectPlan ? (PLAN_LABELS[office.prospectPlan] ?? office.prospectPlan) : undefined} />
                  <DataRow label="Service Plan"  value={office.servicePlan} mono />
                  <DataRow label="Office ID"     value={office._id} mono />
                  <DataRow label="Created"       value={office.createdAt ? new Date(office.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''} />
                </Panel>

                <Panel title="EHR Integration" icon={Cpu} accent="violet">
                  <DataRow label="CPMID"          value={office.ehr?.cpmid} mono />
                  <DataRow label="SYE Location"   value={office.ehr?.syeLocationId} mono />
                  <DataRow label="Email Company"  value={office.email?.company} mono />
                </Panel>

                <Panel title="Telephony" icon={Phone} accent="emerald">
                  {office.twilioNumbers?.map((t, i) => (
                    <DataRow key={i} label={`${t.title} Line`} value={t.number} mono />
                  ))}
                  {office.twilioNumbers?.[0]?.sid && (
                    <DataRow label="Twilio SID" value={office.twilioNumbers[0].sid} mono />
                  )}
                  <DataRow label="Practice Phone"  value={office.phone}        mono />
                  <DataRow label="Office Line 2"   value={office.officeLine2}  mono />
                  <DataRow label="Office Line 3"   value={office.officeLine3}  mono />
                  <DataRow label="Skip Recording"  value={office.skipRecordingMessage ? 'Yes' : 'No'} />
                </Panel>

                <Panel title="Address & Timezone" icon={MapPin} accent="amber">
                  <DataRow label="Street"    value={office.address?.street} />
                  <DataRow label="City"      value={office.address?.city} />
                  <DataRow label="State"     value={office.address?.state} />
                  <DataRow label="ZIP"       value={office.address?.zip} mono />
                  <DataRow label="Timezone"  value={office.tzName} mono />
                  <DataRow label="UTC Offset" value={office.tzOffset != null ? `UTC${office.tzOffset >= 0 ? '+' : ''}${office.tzOffset}` : undefined} mono />
                </Panel>

                <Panel title="Working Hours" icon={Clock} accent="rose">
                  {office.workingHours && Object.keys(office.workingHours).length > 0
                    ? Object.entries(office.workingHours).map(([day, block]) => (
                      <DataRow
                        key={day}
                        label={DAY_LABELS[day] ?? day}
                        value={block.isOpen ? `${block.open} – ${block.close}` : 'Closed'}
                      />
                    ))
                    : <div className="py-3 text-xs text-slate-400">No hours configured</div>
                  }
                  {office.workingLunchHours?.doctorLunch && (
                    <DataRow label="Lunch Block" value={office.workingLunchHours.doctorLunch} />
                  )}
                </Panel>

                <Panel title="Provisioned Lines" icon={PhoneCall} accent="cyan">
                  {office.twilioNumbers?.length ? (
                    office.twilioNumbers.map((t, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-mono text-[#274993]">{t.number}</span>
                          <span className="text-[10px] text-slate-400">{t.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full border font-semibold',
                            t.disabled
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          )}>
                            {t.disabled ? 'Disabled' : 'Active'}
                          </span>
                          <ExternalLink size={12} className="text-slate-300" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 text-xs text-slate-400">No Twilio numbers provisioned</div>
                  )}
                </Panel>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
