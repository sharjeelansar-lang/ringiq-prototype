'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { FieldPath } from 'react-hook-form';
import {
  ArrowLeft, Check, CheckCircle2, ExternalLink,
  Building2, Phone, MapPin, Bot, UserCheck, Loader2,
} from 'lucide-react';

type ProspectData = {
  id: string;
  practiceName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  plan: string;
};

import { Sidebar } from '@/components/dashboard/Sidebar';
import { businessFormSchema, BusinessFormSchema } from '@/lib/schema';
import { generateMongoId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CoreBusinessSection }  from '@/components/form/sections/CoreBusinessSection';
import { EHRMappingSection }    from '@/components/form/sections/EHRMappingSection';
import { ProvisioningSection }  from '@/components/form/sections/ProvisioningSection';
import { VapiSetupSection }     from '@/components/form/sections/VapiSetupSection';
import { TelephonySection }     from '@/components/form/sections/TelephonySection';
import { LocalizationSection }  from '@/components/form/sections/LocalizationSection';

// ── Step config ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'details',
    label: 'Practice Profile',
    shortLabel: 'Profile',
    subtitle: 'Practice identity, display name, EHR identifiers, and phone numbers',
    icon: Building2,
  },
  {
    id: 'provision',
    label: 'Twilio Setup',
    shortLabel: 'Twilio',
    subtitle: 'Provision a Twilio sub-account and acquire a tracking number',
    icon: Phone,
  },
  {
    id: 'vapi',
    label: 'VAPI AI Setup',
    shortLabel: 'VAPI',
    subtitle: 'Deploy the Iris AI assistant and link the VAPI line',
    icon: Bot,
  },
  {
    id: 'location',
    label: 'Site & Schedule',
    shortLabel: 'Schedule',
    subtitle: 'Physical address, timezone, and business hours',
    icon: MapPin,
  },
];

// Per-step partial schemas — validated with .pick() so zodResolver never sees
// other steps' fields and cannot pre-populate their errors.
const STEP_SCHEMAS = [
  businessFormSchema.pick({ practiceDisplayName: true, corporateCleanName: true, cpmid: true, syeLocationId: true }),
  null, // Twilio — no required fields
  null, // VAPI — no required fields
  businessFormSchema.pick({ timezone: true, streetAddress: true, city: true, state: true, zipCode: true }),
];

// ── Horizontal step bar ───────────────────────────────────────────────────────

function StepBar({ currentStep }: { currentStep: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '10px 32px',
      borderBottom: '1px solid #E2E8F0', background: '#FFFFFF', flexShrink: 0,
    }}>
      {STEPS.map((s, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        const Icon   = s.icon;
        return (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                background: done ? '#10B981' : active ? '#274993' : '#F1F5F9',
                color:      done || active ? '#fff' : '#94A3B8',
                border:     done || active ? 'none' : '1.5px solid #E2E8F0',
                boxShadow:  active ? '0 0 0 4px rgba(39,73,147,0.12)' : 'none',
              }}>
                {done ? <Check size={11} strokeWidth={3} /> : <Icon size={11} />}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                color: active ? '#0F172A' : done ? '#274993' : '#94A3B8',
              }}>
                {s.shortLabel}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 36, height: 1, margin: '0 4px',
                background: done ? 'rgba(16,185,129,0.35)' : '#E2E8F0',
              }} />
            )}
          </div>
        );
      })}
      <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94A3B8', fontFamily: 'var(--font-geist-mono)', flexShrink: 0 }}>
        {currentStep + 1} / {STEPS.length}
      </div>
    </div>
  );
}

// ── Divider between merged sections ──────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function NewBusinessContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const prospectId   = searchParams.get('prospectId') ?? '';

  const [mongoId,     setMongoId]     = useState('');
  const [step,        setStep]        = useState(0);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [createdId,   setCreatedId]   = useState('');
  const [prospect,    setProspect]    = useState<ProspectData | null>(null);
  const [prospectLoading, setProspectLoading] = useState(false);

  const form = useForm<BusinessFormSchema>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      practiceDisplayName:  '',
      corporateCleanName:   '',
      environmentStatus:    'internal_testing',
      mongoOfficeId:        '',
      emailCompany:         '',
      cpmid:                '',
      syeLocationId:        8,
      vapiAssistantTemplateId: '',
      inboundPhone:              '',
      vapiAssistantPhoneNumber:  '',
      publicNumber:              '',
      failoverTransferNumber:    '',
      twilioSid:                 '',
      twilioSubAccountSid:       '',
      twilioSubAccountToken:     '',
      vapiAssistantId:           '',
      carrierTrunkName:          '',
      failoverRingCount:    3,
      voipRoutingType:      'sip',
      timezone:             '',
      streetAddress:        '',
      city:                 '',
      state:                '',
      zipCode:              '',
      operationalHours: {
        mondayFriday: { open: '08:00', close: '17:00', closed: false },
        saturday:     { open: '09:00', close: '14:00', closed: false },
        sunday:       { open: '',      close: '',      closed: true  },
      },
      internalWorkingHours:  'Doctor Lunch Block: 12:00 PM - 01:00 PM',
      recordingDisclosure:   true,
      allowSameDayBookings:  false,
      maxSlotSearchRounds:   3,
      mandatoryEmailProfile: false,
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    const id = generateMongoId();
    setMongoId(id);
    form.setValue('mongoOfficeId', id);

    if (!prospectId) return;
    setProspectLoading(true);
    fetch(`/api/queue/${prospectId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.success || !j.prospect) return;
        const p: ProspectData = j.prospect;
        setProspect(p);
        if (p.practiceName) {
          form.setValue('practiceDisplayName', p.practiceName);
          form.setValue('corporateCleanName',  p.practiceName);
        }
        if (p.phone) {
          const digits = p.phone.replace(/\D/g, '');
          if (digits.length === 10) form.setValue('publicNumber', `+1${digits}`);
        }
        if (p.city)  form.setValue('city',  p.city);
        if (p.state) form.setValue('state', p.state);
      })
      .catch(() => {})
      .finally(() => setProspectLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinalSubmit = async (data: BusinessFormSchema) => {
    setSubmitState('loading');
    try {
      const res  = await fetch('/api/offices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Unknown server error');

      // Mark the queue prospect as approved now that setup is complete
      if (prospectId) {
        await fetch(`/api/queue/${prospectId}`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ status: 'approved' }),
        }).catch(() => {}); // non-critical
      }

      setCreatedId(json.officeId);
      setSubmitState('success');
      toast.success('Business registered successfully.');
      try { localStorage.removeItem('ringiq_twilio_creds'); } catch { /* ignore */ }
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create office';
      setSubmitState('error');
      toast.error(`Registration failed: ${msg}`);
    }
  };

  const handleNext = () => {
    const schema = STEP_SCHEMAS[step];
    if (schema) {
      const result = schema.safeParse(form.getValues());
      if (!result.success) {
        result.error.issues.forEach(({ path, message }) => {
          if (path.length > 0) {
            form.setError(path[0] as FieldPath<BusinessFormSchema>, { type: 'manual', message });
          }
        });
        toast.error('Please fix the errors before continuing.');
        return;
      }
    }
    // Clear any manually-set errors from a prior failed attempt on this step
    form.clearErrors();
    setStep(s => s + 1);
  };

  // ── Success ─────────────────────────────────────────────────────────────────

  if (submitState === 'success') {
    return (
      <div style={{ display: 'flex', height: '100vh', background: '#F7F6F3', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', maxWidth: 380 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={30} style={{ color: '#10B981' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Business Registered</h2>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>Document created in MongoDB Atlas.</p>
            </div>
            <div style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.04)', textAlign: 'left' }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 6 }}>MongoDB Office ID</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-geist-mono)', color: '#10B981', wordBreak: 'break-all' }}>{createdId}</span>
                <ExternalLink size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F7F6F3', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '14px 32px', flexShrink: 0,
          borderBottom: '1px solid #E2E8F0',
          background: 'rgba(247,246,243,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: '#64748B', background: 'none', border: 'none',
              cursor: 'pointer', padding: '6px 10px', borderRadius: 8,
              fontFamily: 'inherit', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLButtonElement).style.color = '#0F172A'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
          <div>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              {prospect ? `Setup: ${prospect.practiceName}` : 'New Business Registration'}
            </h1>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{STEPS[step].subtitle}</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: '#94A3B8' }}>ID:</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-geist-mono)', color: '#64748B' }}>{mongoId.slice(0, 12)}...</span>
          </div>
        </header>

        {/* Step bar */}
        <StepBar currentStep={step} />

        {/* Prospect pre-fill banner */}
        {prospectLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 32px', background: '#EEF4FF', borderBottom: '1px solid #D8E5FF', flexShrink: 0 }}>
            <Loader2 size={12} style={{ color: '#274993', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 12, color: '#274993' }}>Loading prospect data…</span>
          </div>
        )}
        {prospect && !prospectLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 32px', background: '#EEF4FF', borderBottom: '1px solid #D8E5FF', flexShrink: 0 }}>
            <UserCheck size={13} style={{ color: '#274993', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#274993', fontWeight: 600 }}>Pre-filled from queue</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              · {prospect.contactName}{prospect.contactRole ? `, ${prospect.contactRole}` : ''}
              {prospect.email ? ` · ${prospect.email}` : ''}
            </span>
            <a
              href={`/dashboard/queue`}
              style={{ marginLeft: 'auto', fontSize: 12, color: '#274993', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
            >
              View original application →
            </a>
          </div>
        )}

        {/* Form body */}
        <main style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{
            height: '100%', overflowY: 'auto',
            maxWidth: 900, margin: '0 auto', width: '100%',
            padding: step === 3 ? '20px 40px' : '32px 40px',
          }}>
            {/* Step title + progress */}
            <div style={{ marginBottom: step === 3 ? 16 : 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>{STEPS[step].label}</h2>
              <div style={{ marginTop: 12, height: 3, background: '#E2E8F0', borderRadius: 9, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: '0 auto 0 0',
                  background: '#274993', borderRadius: 9,
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            <form id="business-form" onSubmit={form.handleSubmit(handleFinalSubmit)}>
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <CoreBusinessSection form={form} />
                  <SectionDivider label="EHR Integration" />
                  <EHRMappingSection form={form} />
                  <SectionDivider label="Phone Numbers" />
                  <TelephonySection form={form} />
                </div>
              )}
              {step === 1 && <ProvisioningSection form={form} />}
              {step === 2 && <VapiSetupSection form={form} />}
              {step === 3 && <LocalizationSection form={form} />}
            </form>
          </div>
        </main>

        {/* Footer */}
        <div style={{
          flexShrink: 0, borderTop: '1px solid #E2E8F0',
          background: 'rgba(247,246,243,0.9)',
          backdropFilter: 'blur(12px)',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{ fontSize: 13, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  color: '#64748B', background: '#FFFFFF', border: '1.5px solid #E2E8F0',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '9px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: '#274993', color: '#fff', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(39,73,147,0.28)',
                  letterSpacing: '-0.01em',
                }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={submitState === 'loading'}
                onClick={() => form.handleSubmit(handleFinalSubmit, () => {
                  toast.error('Some required fields are missing. Check all steps before submitting.');
                })()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: submitState === 'loading' ? '#5B6E9E' : '#274993', color: '#fff', border: 'none',
                  cursor: submitState === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: submitState === 'loading' ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(39,73,147,0.28)',
                  letterSpacing: '-0.01em',
                }}
              >
                {submitState === 'loading' ? (
                  <>
                    <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Creating...
                  </>
                ) : 'Register Business'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function NewBusinessPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', background: '#F7F6F3', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} style={{ color: '#274993', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <NewBusinessContent />
    </Suspense>
  );
}
