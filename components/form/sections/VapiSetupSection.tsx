'use client';

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Bot, Link2, CheckCircle2, Loader2,
  Phone, Sparkles, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BusinessFormSchema } from '@/lib/schema';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

function StepBadge({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  return (
    <div className={cn(
      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
      done   ? 'bg-violet-500 text-white'
      : active ? 'bg-violet-500/80 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
      : 'bg-slate-800 text-slate-500',
    )}>
      {done ? '✓' : n}
    </div>
  );
}

export function VapiSetupSection({ form }: Props) {
  const { watch, setValue } = form;

  const practiceDisplayName = watch('practiceDisplayName');
  const cpmid               = watch('cpmid');
  const mongoOfficeId       = watch('mongoOfficeId');
  const publicNumber        = watch('publicNumber');
  const syeLocationId       = watch('syeLocationId');
  const recordingDisclosure = watch('recordingDisclosure');
  const allowSameDayBookings = watch('allowSameDayBookings');
  const vapiPhoneNumber     = watch('vapiAssistantPhoneNumber');

  // Read Twilio creds from form first; fall back to localStorage if watch() missed the setValue
  const formSid   = watch('twilioSubAccountSid');
  const formToken = watch('twilioSubAccountToken');

  const [subAccountSid, setSubAccountSid]     = useState(formSid);
  const [subAccountToken, setSubAccountToken] = useState(formToken);

  useEffect(() => {
    const sid   = formSid   || '';
    const token = formToken || '';

    if (sid && token) {
      setSubAccountSid(sid);
      setSubAccountToken(token);
      return;
    }

    // Fallback: read from localStorage
    try {
      const stored = localStorage.getItem('ringiq_twilio_creds');
      if (stored) {
        const creds = JSON.parse(stored) as {
          subAccountSid: string; subAccountToken: string;
          inboundPhone: string; twilioSid: string;
        };
        if (creds.subAccountSid)   { setSubAccountSid(creds.subAccountSid);     setValue('twilioSubAccountSid',   creds.subAccountSid,   { shouldValidate: false }); }
        if (creds.subAccountToken) { setSubAccountToken(creds.subAccountToken);  setValue('twilioSubAccountToken', creds.subAccountToken, { shouldValidate: false }); }
        if (creds.inboundPhone && !vapiPhoneNumber) {
          setValue('vapiAssistantPhoneNumber', creds.inboundPhone, { shouldValidate: false });
        }
      }
    } catch { /* storage not available */ }
  }, [formSid, formToken]);

  const [assistant,    setAssistant]    = useState<{ id: string; name: string } | null>(null);
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistError,  setAssistError]  = useState('');

  const [linked,       setLinked]       = useState(false);
  const [linkLoading,  setLinkLoading]  = useState(false);
  const [linkError,    setLinkError]    = useState('');

  const missingTwilio   = !subAccountSid || !subAccountToken;
  const practiceName    = practiceDisplayName; // alias for display use

  // ── Step 1: Create VAPI assistant ─────────────────────────────────────────

  const createAssistant = async () => {
    setAssistLoading(true); setAssistError('');
    try {
      const res  = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceDisplayName,
          cpmid,
          mongoOfficeId,
          publicNumber,
          syeLocationId,
          recordingDisclosure,
          allowSameDayBookings,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setAssistant(json.assistant);
      setValue('vapiAssistantId', json.assistant.id, { shouldValidate: false });
      toast.success('Iris assistant deployed successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Assistant creation failed';
      setAssistError(msg); toast.error(`VAPI error: ${msg}`);
    } finally { setAssistLoading(false); }
  };

  // ── Step 2: Link VAPI number to assistant ─────────────────────────────────

  const linkNumber = async () => {
    if (!assistant || !vapiPhoneNumber || !subAccountSid || !subAccountToken) return;
    setLinkLoading(true); setLinkError('');
    try {
      const res  = await fetch('/api/vapi/phone-number/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber:      vapiPhoneNumber,
          twilioAccountSid: subAccountSid,
          twilioAuthToken:  subAccountToken,
          assistantId:      assistant.id,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setLinked(true);
      toast.success('VAPI number linked — Iris is live on that line.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Number link failed';
      setLinkError(msg); toast.error(`Link failed: ${msg}`);
    } finally { setLinkLoading(false); }
  };

  // ── Full success ──────────────────────────────────────────────────────────

  if (linked && assistant) {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
            <Sparkles size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-300">Iris is deployed and live</p>
            <p className="text-xs text-slate-500 mt-0.5">Assistant linked to the VAPI line — ready to answer calls.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Assistant</span>
            <span className="text-sm text-violet-300 font-medium">{assistant.name}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Assistant ID</span>
            <span className="text-xs font-mono text-slate-400 break-all">{assistant.id}</span>
          </div>
          <div className="col-span-2 flex flex-col gap-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">VAPI Line</span>
            <span className="text-sm font-mono text-emerald-400">{vapiPhoneNumber}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Widget ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/20">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-violet-400/20 bg-violet-400/10">
            <Bot size={15} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">VAPI AI Setup</p>
            <p className="text-xs text-slate-500">Deploy Iris assistant · Link VAPI number</p>
          </div>
        </div>
        {/* Live prerequisite indicator */}
        <div className={cn(
          'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border',
          missingTwilio
            ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
            : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
        )}>
          <div className={cn('w-1.5 h-1.5 rounded-full', missingTwilio ? 'bg-amber-400' : 'bg-emerald-400')} />
          {missingTwilio ? 'Twilio step pending' : 'Twilio ready'}
        </div>
      </div>

      {/* Prerequisite warning */}
      {missingTwilio && (
        <div className="mx-4 mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
          <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80">
            Complete the Twilio Setup step first — the sub-account credentials are needed to link the VAPI number.
          </p>
        </div>
      )}

      <div className="p-4 flex flex-col gap-4">

        {/* ── Step 1: Create assistant ── */}
        <div className={cn('flex gap-4', missingTwilio && 'opacity-50 pointer-events-none')}>
          <StepBadge n={1} done={!!assistant} active={!assistant && !missingTwilio} />
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-200">Deploy Iris Assistant</p>
                <p className="text-xs text-slate-500 mt-0.5">Creates a VAPI AI agent with a practice-specific prompt</p>
              </div>
              {assistant && (
                <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                  {assistant.id.slice(0, 14)}…
                </span>
              )}
            </div>

            {!assistant ? (
              <>
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Sparkles size={13} className="text-violet-400 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500">Assistant name</span>
                    <span className="text-sm text-slate-200 font-medium">
                      {practiceName ? `${practiceName} — Iris` : 'Enter a practice name in Step 1'}
                    </span>
                  </div>
                </div>
                {assistError && <p className="text-xs text-red-400">{assistError}</p>}
                <button type="button" onClick={createAssistant}
                  disabled={assistLoading || !practiceDisplayName || !cpmid}
                  className="flex items-center gap-2 w-fit px-4 py-2 rounded-lg text-sm font-semibold
                    bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30
                    transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {assistLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                  {assistLoading ? 'Deploying…' : 'Deploy Iris'}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-violet-400">
                <CheckCircle2 size={13} /> {assistant.name} deployed
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800/40" />

        {/* ── Step 2: Link VAPI number ── */}
        <div className={cn('flex gap-4', (!assistant) && 'opacity-40 pointer-events-none')}>
          <StepBadge n={2} done={linked} active={!!assistant && !linked} />
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p className="text-sm font-semibold text-slate-200">Link VAPI Number to Iris</p>
              <p className="text-xs text-slate-500 mt-0.5">Imports the VAPI line and routes inbound calls to the assistant</p>
            </div>

            {vapiPhoneNumber ? (
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <Phone size={14} className="text-violet-400 shrink-0" />
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-sm font-mono text-slate-100">{vapiPhoneNumber}</span>
                  <span className="text-xs text-slate-500">VAPI AI line → Iris</span>
                </div>
                {assistant && (
                  <span className="text-xs text-slate-600 font-mono">{assistant.id.slice(0, 10)}…</span>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg border border-slate-800 bg-slate-900/40">
                <AlertCircle size={13} className="text-slate-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">
                  Enter the VAPI AI Assistant Number in the <span className="text-slate-400">Phone Numbers</span> section on Step 1.
                </p>
              </div>
            )}

            {linkError && <p className="text-xs text-red-400">{linkError}</p>}

            <button type="button" onClick={linkNumber}
              disabled={!assistant || !vapiPhoneNumber || !subAccountSid || !subAccountToken || linkLoading}
              className="flex items-center gap-2 w-fit px-5 py-2.5 rounded-lg text-sm font-bold
                bg-violet-500 hover:bg-violet-400 text-white transition-all
                shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed">
              {linkLoading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              {linkLoading ? 'Linking…' : 'Link Number'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
