'use client';

import { useState, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Bot, Link2, CheckCircle2, Loader2,
  Phone, Sparkles, AlertCircle, Mic, Play, Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { BusinessFormSchema } from '@/lib/schema';
import { VOICES } from '@/lib/onboard';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

const T = {
  bg:       '#F7F6F3',
  surface:  '#FFFFFF',
  border:   '#E2E8F0',
  navy:     '#0F172A',
  mid:      '#1E293B',
  muted:    '#64748B',
  light:    '#94A3B8',
  teal:     '#274993',
  tealFd:   '#EEF4FF',
  tealBd:   '#D8E5FF',
  hover:    '#F8FAFC',
  violet:   '#7C3AED',
  violetFd: '#F5F3FF',
  violetBd: '#DDD6FE',
};

function StepBadge({ n, done, active }: { n: number; done: boolean; active: boolean }) {
  const bg    = done   ? '#10B981' : active ? T.violet : T.border;
  const color = done   ? '#fff'    : active ? '#fff'   : T.light;
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, flexShrink: 0,
      background: bg, color,
      boxShadow: active ? '0 0 0 3px #DDD6FE' : 'none',
      transition: 'all 0.15s',
    }}>
      {done ? '✓' : n}
    </div>
  );
}

export function VapiSetupSection({ form }: Props) {
  const { watch, setValue } = form;

  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const handlePlay = (voiceId: string, src: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (playingVoice === voiceId) { setPlayingVoice(null); return; }
    setLoadingVoice(voiceId);
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener('canplay', () => {
      setLoadingVoice(null); setPlayingVoice(voiceId);
      audio.play().catch(() => setPlayingVoice(null));
    });
    audio.addEventListener('ended', () => setPlayingVoice(null));
    audio.addEventListener('error', () => { setLoadingVoice(null); setPlayingVoice(null); });
    audio.load();
  };

  const practiceDisplayName  = watch('practiceDisplayName');
  const cpmid                = watch('cpmid');
  const mongoOfficeId        = watch('mongoOfficeId');
  const phone                = watch('phone');
  const syeLocationId        = watch('syeLocationId');
  const recordingDisclosure  = watch('recordingDisclosure');
  const allowSameDayBookings = watch('allowSameDayBookings');
  const vapiPhoneNumber      = watch('vapiAssistantPhoneNumber');
  const vapiVoiceId          = watch('vapiVoiceId');
  const discontinueGreetings = watch('discontinueGreetings');

  const formSid   = watch('twilioSubAccountSid');
  const formToken = watch('twilioSubAccountToken');

  const [subAccountSid,   setSubAccountSid]   = useState(formSid);
  const [subAccountToken, setSubAccountToken] = useState(formToken);

  useEffect(() => {
    const sid   = formSid   || '';
    const token = formToken || '';

    if (sid && token) {
      setSubAccountSid(sid);
      setSubAccountToken(token);
      return;
    }

    try {
      const stored = localStorage.getItem('ringiq_twilio_creds');
      if (stored) {
        const creds = JSON.parse(stored) as {
          subAccountSid: string; subAccountToken: string;
          inboundPhone: string; twilioSid: string;
        };
        if (creds.subAccountSid)   { setSubAccountSid(creds.subAccountSid);    setValue('twilioSubAccountSid',   creds.subAccountSid,   { shouldValidate: false }); }
        if (creds.subAccountToken) { setSubAccountToken(creds.subAccountToken); setValue('twilioSubAccountToken', creds.subAccountToken, { shouldValidate: false }); }
        if (creds.inboundPhone && !vapiPhoneNumber) {
          setValue('vapiAssistantPhoneNumber', creds.inboundPhone, { shouldValidate: false });
        }
      }
    } catch { /* storage not available */ }
  }, [formSid, formToken]);

  const [assistant,     setAssistant]     = useState<{ id: string; name: string } | null>(null);
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistError,   setAssistError]   = useState('');

  const [linked,      setLinked]      = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError,   setLinkError]   = useState('');

  const missingTwilio = !subAccountSid || !subAccountToken;
  const practiceName  = practiceDisplayName;

  // ── Step 1: Create VAPI assistant ─────────────────────────────────────────

  const createAssistant = async () => {
    setAssistLoading(true); setAssistError('');
    try {
      const res  = await fetch('/api/vapi/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceDisplayName, cpmid, mongoOfficeId, phone,
          syeLocationId, recordingDisclosure, allowSameDayBookings,
          voiceId: vapiVoiceId || 'aria',
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
      <div style={{
        borderRadius: 12, border: '1px solid rgba(124,58,237,0.2)',
        background: 'rgba(124,58,237,0.03)', padding: 24,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={17} style={{ color: T.violet }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.violet, margin: 0 }}>Iris is deployed and live</p>
            <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Assistant linked to the VAPI line — ready to answer calls.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, background: T.hover, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, color: T.light, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Assistant</span>
            <span style={{ fontSize: 13, color: T.violet, fontWeight: 500 }}>{assistant.name}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, background: T.hover, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, color: T.light, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Assistant ID</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: T.muted, wordBreak: 'break-all' }}>{assistant.id}</span>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', borderRadius: 8, background: T.hover, border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, color: T.light, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>VAPI Line</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-geist-mono)', color: '#059669' }}>{vapiPhoneNumber}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Widget ────────────────────────────────────────────────────────────────

  return (
    <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 16px', borderBottom: `1px solid ${T.border}`,
        background: T.hover,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            background: T.violetFd, border: `1px solid ${T.violetBd}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={13} style={{ color: T.violet }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>VAPI AI Setup</p>
            <p style={{ fontSize: 11, color: T.muted }}>Deploy Iris assistant · Link VAPI number</p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, padding: '4px 10px', borderRadius: 100,
          border: `1px solid ${missingTwilio ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.2)'}`,
          background: missingTwilio ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
          color: missingTwilio ? '#B45309' : '#059669',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: missingTwilio ? '#F59E0B' : '#10B981' }} />
          {missingTwilio ? 'Twilio step pending' : 'Twilio ready'}
        </div>
      </div>

      {/* Prerequisite warning */}
      {missingTwilio && (
        <div style={{
          margin: '10px 14px 0',
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '8px 12px', borderRadius: 8,
          border: '1px solid rgba(245,158,11,0.2)',
          background: 'rgba(245,158,11,0.05)',
        }}>
          <AlertCircle size={12} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#B45309', margin: 0 }}>
            Complete the Twilio Setup step first — sub-account credentials are needed to link the VAPI number.
          </p>
        </div>
      )}

      {/* ── 2-column body ─────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>

        {/* Left: Voice + toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mic size={11} style={{ color: T.violet }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.light }}>
              AI Voice
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {VOICES.map(({ id, name, tone, desc, sample }) => {
              const selected  = vapiVoiceId === id;
              const isPlaying = playingVoice === id;
              const isLoading = loadingVoice === id;
              return (
                <div
                  key={id}
                  role="radio"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => setValue('vapiVoiceId', id, { shouldValidate: false })}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setValue('vapiVoiceId', id, { shouldValidate: false }); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${selected ? T.violet : T.border}`,
                    background: selected ? T.violetFd : T.hover,
                    transition: 'all 0.15s', userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${selected ? T.violet : T.light}`,
                    background: selected ? T.violet : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: selected ? T.violet : T.light, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tone}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: selected ? T.violet : T.navy }}>{name}</div>
                    <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.3 }}>{desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePlay(id, sample); }}
                    aria-label={isPlaying ? 'Stop sample' : 'Play voice sample'}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      border: `1.5px solid ${isPlaying ? T.violet : T.border}`,
                      background: isPlaying ? T.violet : T.surface,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={11} style={{ color: T.violet, animation: 'spin 1s linear infinite' }} />
                    ) : isPlaying ? (
                      <Square size={8} color="#fff" fill="#fff" />
                    ) : (
                      <Play size={10} color={selected ? T.violet : T.light} fill={selected ? T.violet : T.light} style={{ marginLeft: 1 }} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {!vapiVoiceId && (
            <p style={{ fontSize: 11, color: T.light }}>No voice selected — defaults to Savannah on deploy.</p>
          )}

          {/* Discontinue greetings */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.hover,
            marginTop: 2,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>Discontinue Greetings</span>
              <span style={{ fontSize: 11, color: T.muted }}>Turn off AI greetings for this practice</span>
            </div>
            <button
              type="button"
              onClick={() => setValue('discontinueGreetings', !discontinueGreetings, { shouldValidate: false })}
              style={{
                width: 38, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: discontinueGreetings ? '#EF4444' : '#E2E8F0',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: discontinueGreetings ? 19 : 2,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        {/* Right: Deploy + Link steps */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          borderLeft: `1px solid ${T.border}`, paddingLeft: 24,
        }}>

          {/* Step 1: Deploy */}
          <div style={{ display: 'flex', gap: 12, opacity: missingTwilio ? 0.5 : 1, pointerEvents: missingTwilio ? 'none' : 'auto' }}>
            <StepBadge n={1} done={!!assistant} active={!assistant && !missingTwilio} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>Deploy Iris Assistant</p>
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Creates a VAPI AI agent with a practice-specific prompt</p>
                </div>
                {assistant && (
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: T.violet,
                    background: T.violetFd, border: `1px solid ${T.violetBd}`,
                    padding: '3px 8px', borderRadius: 100, whiteSpace: 'nowrap',
                  }}>
                    {assistant.id.slice(0, 12)}…
                  </span>
                )}
              </div>

              {!assistant ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8,
                    background: T.hover, border: `1px solid ${T.border}`,
                  }}>
                    <Sparkles size={12} style={{ color: T.violet, flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 11, color: T.muted }}>Assistant name</span>
                      <span style={{ fontSize: 12, color: T.navy, fontWeight: 500 }}>
                        {practiceName ? `${practiceName} — Iris` : 'Enter a practice name in Step 1'}
                      </span>
                    </div>
                  </div>
                  {assistError && <p style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>{assistError}</p>}
                  <button type="button" onClick={createAssistant}
                    disabled={assistLoading || !practiceDisplayName || !cpmid}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: T.violetFd, color: T.violet, border: `1.5px solid ${T.violetBd}`,
                      cursor: assistLoading || !practiceDisplayName || !cpmid ? 'not-allowed' : 'pointer',
                      opacity: assistLoading || !practiceDisplayName || !cpmid ? 0.5 : 1,
                      fontFamily: 'inherit', width: 'fit-content',
                    }}>
                    {assistLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Bot size={12} />}
                    {assistLoading ? 'Deploying…' : 'Deploy Iris'}
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.violet }}>
                  <CheckCircle2 size={13} /> {assistant.name} deployed
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${T.border}` }} />

          {/* Step 2: Link */}
          <div style={{ display: 'flex', gap: 12, opacity: !assistant ? 0.45 : 1, pointerEvents: !assistant ? 'none' : 'auto' }}>
            <StepBadge n={2} done={linked} active={!!assistant && !linked} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, margin: 0 }}>Link VAPI Number to Iris</p>
                <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Imports the VAPI line and routes inbound calls to the assistant</p>
              </div>

              {vapiPhoneNumber ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8,
                  background: T.hover, border: `1px solid ${T.border}`,
                }}>
                  <Phone size={13} style={{ color: T.violet, flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-geist-mono)', color: T.navy }}>{vapiPhoneNumber}</span>
                    <span style={{ fontSize: 11, color: T.muted }}>VAPI AI line → Iris</span>
                  </div>
                  {assistant && (
                    <span style={{ fontSize: 10, color: T.light, fontFamily: 'var(--font-geist-mono)' }}>
                      {assistant.id.slice(0, 8)}…
                    </span>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${T.border}`, background: T.hover,
                }}>
                  <AlertCircle size={12} style={{ color: T.light, flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                    Enter the VAPI AI Assistant Number in the <span style={{ color: T.navy, fontWeight: 500 }}>Phone Numbers</span> section on Step 1.
                  </p>
                </div>
              )}

              {linkError && <p style={{ fontSize: 11, color: '#DC2626', margin: 0 }}>{linkError}</p>}

              <button type="button" onClick={linkNumber}
                disabled={!assistant || !vapiPhoneNumber || !subAccountSid || !subAccountToken || linkLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  background: T.violet, color: '#fff', border: 'none',
                  cursor: !assistant || !vapiPhoneNumber || !subAccountSid || !subAccountToken || linkLoading ? 'not-allowed' : 'pointer',
                  opacity: !assistant || !vapiPhoneNumber || !subAccountSid || !subAccountToken || linkLoading ? 0.45 : 1,
                  boxShadow: '0 4px 14px rgba(124,58,237,0.2)',
                  fontFamily: 'inherit', width: 'fit-content',
                }}>
                {linkLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Link2 size={12} />}
                {linkLoading ? 'Linking…' : 'Link Number'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
