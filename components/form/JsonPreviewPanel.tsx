'use client';

import { useMemo, useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';
import { BusinessFormSchema } from '@/lib/schema';

interface Props {
  data: Partial<BusinessFormSchema>;
  mongoId: string;
}

function buildTenantJson(data: Partial<BusinessFormSchema>, mongoId: string) {
  return {
    _id: mongoId,
    practice: {
      displayName: data.practiceDisplayName ?? '',
      cleanName: data.corporateCleanName ?? '',
      environment: data.environmentStatus ?? 'internal_testing',
    },
    ehr: {
      cpmid: data.cpmid ?? '',
      syeLocationId: data.syeLocationId ?? 8,
      vapiTemplateId: data.vapiAssistantTemplateId ?? '',
    },
    telephony: {
      inboundPhone: data.inboundPhone ?? '',
      twilioSid: data.twilioSid ?? '',
      carrierTrunk: data.carrierTrunkName ?? '',
      failoverRings: data.failoverRingCount ?? 3,
      voipRouting: data.voipRoutingType ?? 'webhook',
    },
    localization: {
      timezone: data.timezone ?? '',
      address: {
        street: data.streetAddress ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        zip: data.zipCode ?? '',
      },
      hours: {
        mondayFriday: {
          open: data.operationalHours?.mondayFriday?.open ?? '08:00',
          close: data.operationalHours?.mondayFriday?.close ?? '17:00',
        },
        saturday: {
          open: data.operationalHours?.saturday?.open ?? '09:00',
          close: data.operationalHours?.saturday?.close ?? '14:00',
        },
        sunday: {
          open: data.operationalHours?.sunday?.open ?? '',
          close: data.operationalHours?.sunday?.close ?? '',
          closed: true,
        },
      },
      internalWorkingHours: data.internalWorkingHours ?? '',
    },
    behavior: {
      recordingDisclosure: data.recordingDisclosure ?? false,
      allowSameDayBookings: data.allowSameDayBookings ?? false,
      maxSlotSearchRounds: data.maxSlotSearchRounds ?? 3,
      mandatoryEmailProfile: data.mandatoryEmailProfile ?? false,
    },
    meta: {
      createdAt: new Date().toISOString(),
      schemaVersion: '2.4.0',
    },
  };
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function JsonLine({ k, v, indent = 0, isLast = false }: { k?: string; v: JsonValue; indent?: number; isLast?: boolean }) {
  const pad = '  '.repeat(indent);

  if (v === null) return <span className="text-slate-500">{pad}{k && <><span className="text-violet-400">&quot;{k}&quot;</span><span className="text-slate-500">: </span></>}<span className="text-rose-400">null</span>{!isLast && ','}</span>;
  if (typeof v === 'boolean') return <span>{pad}{k && <><span className="text-violet-400">&quot;{k}&quot;</span><span className="text-slate-500">: </span></>}<span className="text-amber-400">{String(v)}</span>{!isLast && ','}</span>;
  if (typeof v === 'number') return <span>{pad}{k && <><span className="text-violet-400">&quot;{k}&quot;</span><span className="text-slate-500">: </span></>}<span className="text-cyan-400">{v}</span>{!isLast && ','}</span>;
  if (typeof v === 'string') return <span>{pad}{k && <><span className="text-violet-400">&quot;{k}&quot;</span><span className="text-slate-500">: </span></>}<span className="text-emerald-400">&quot;{v}&quot;</span>{!isLast && ','}</span>;

  if (Array.isArray(v)) {
    return (
      <>
        <span>{pad}{k && <><span className="text-violet-400">&quot;{k}&quot;</span><span className="text-slate-500">: </span></>}[</span>
        {v.map((item, i) => <JsonLine key={i} v={item} indent={indent + 1} isLast={i === v.length - 1} />)}
        <span>{pad}]{!isLast && ','}</span>
      </>
    );
  }

  const entries = Object.entries(v as Record<string, JsonValue>);
  return (
    <>
      <span>{pad}{k && <><span className="text-violet-400">&quot;{k}&quot;</span><span className="text-slate-500">: </span></>}{'{'}</span>
      {entries.map(([ek, ev], i) => (
        <JsonLine key={ek} k={ek} v={ev} indent={indent + 1} isLast={i === entries.length - 1} />
      ))}
      <span>{pad}{'}'}{!isLast && ','}</span>
    </>
  );
}

export function JsonPreviewPanel({ data, mongoId }: Props) {
  const [copied, setCopied] = useState(false);
  const tenantJson = useMemo(() => buildTenantJson(data, mongoId), [data, mongoId]);
  const jsonString = JSON.stringify(tenantJson, null, 2);
  const entries = Object.entries(tenantJson);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-0 rounded-xl border border-slate-800/60 bg-[#0d1117] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Code2 size={14} className="text-cyan-400" />
          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
            Tenant Schema Preview
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-mono">live</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-slate-400
              hover:text-slate-200 hover:bg-slate-800 transition-all duration-150 border border-slate-700/50"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* Language bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 border-b border-slate-800/40 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-amber-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-xs font-mono text-slate-600 ml-2">tenant-config.json</span>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-6 text-slate-300">
        <div className="flex flex-col">
          <span className="text-slate-500">{'{'}</span>
          {entries.map(([k, v], i) => (
            <JsonLine
              key={k}
              k={k}
              v={v as JsonValue}
              indent={1}
              isLast={i === entries.length - 1}
            />
          ))}
          <span className="text-slate-500">{'}'}</span>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/40 bg-slate-950/30 flex-shrink-0">
        <span className="text-xs font-mono text-slate-600">{jsonString.split('\n').length} lines</span>
        <span className="text-xs font-mono text-slate-600">{new Blob([jsonString]).size} bytes</span>
      </div>
    </div>
  );
}
