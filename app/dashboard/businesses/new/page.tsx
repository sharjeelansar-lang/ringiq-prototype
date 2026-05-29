'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { FieldPath } from 'react-hook-form';
import {
  ArrowLeft, Check, CheckCircle2, ExternalLink,
  Building2, Phone, MapPin,
} from 'lucide-react';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { businessFormSchema, BusinessFormSchema } from '@/lib/schema';
import { generateMongoId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CoreBusinessSection }  from '@/components/form/sections/CoreBusinessSection';
import { EHRMappingSection }    from '@/components/form/sections/EHRMappingSection';
import { ProvisioningSection }  from '@/components/form/sections/ProvisioningSection';
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
  null, // Twilio step has no required fields to gate on
  businessFormSchema.pick({ timezone: true, streetAddress: true, city: true, state: true, zipCode: true }),
];

// ── Horizontal step bar ───────────────────────────────────────────────────────

function StepBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0 px-8 py-3.5 border-b border-slate-800/50 bg-slate-950/40 shrink-0">
      {STEPS.map((s, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        const Icon   = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2.5 px-1">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300',
                done   ? 'bg-emerald-500 text-slate-950' :
                active ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]' :
                         'bg-slate-800 text-slate-600 border border-slate-700/50',
              )}>
                {done ? <Check size={11} strokeWidth={3} /> : <Icon size={11} />}
              </div>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap transition-colors duration-200',
                active ? 'text-white' : done ? 'text-slate-400' : 'text-slate-600',
              )}>
                {s.shortLabel}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'w-10 h-px mx-1 transition-colors duration-300',
                done ? 'bg-emerald-500/35' : 'bg-slate-800',
              )} />
            )}
          </div>
        );
      })}
      <div className="ml-auto text-[11px] text-slate-700 font-mono shrink-0">
        {currentStep + 1} / {STEPS.length}
      </div>
    </div>
  );
}

// ── Divider between merged sections ──────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-slate-800/70" />
      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-600">{label}</span>
      <div className="flex-1 h-px bg-slate-800/70" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewBusinessPage() {
  const router  = useRouter();
  const [mongoId, setMongoId] = useState('');
  const [step,        setStep]        = useState(0);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [createdId,   setCreatedId]   = useState('');

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
      twilioSubAccountSid:  '',
      carrierTrunkName:     '',
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

  // Generate the preview ID client-side only — Math.random() causes hydration
  // mismatch if called during SSR, which forces React to re-render the whole tree.
  useEffect(() => {
    const id = generateMongoId();
    setMongoId(id);
    form.setValue('mongoOfficeId', id);
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
      setCreatedId(json.officeId);
      setSubmitState('success');
      toast.success('Business registered successfully.');
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
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={30} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Business Registered</h2>
              <p className="text-sm text-slate-500 mt-1">Document created in MongoDB Atlas.</p>
            </div>
            <div className="w-full px-5 py-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-left">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-1.5">MongoDB Office ID</p>
              <div className="flex items-center gap-2 justify-between">
                <span className="text-sm font-mono text-emerald-400 break-all">{createdId}</span>
                <ExternalLink size={13} className="text-slate-600 shrink-0" />
              </div>
            </div>
            <p className="text-xs text-slate-700">Redirecting to dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center gap-4 px-8 py-5 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-sm shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200
              transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <div className="w-px h-5 bg-slate-800" />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">New Business Registration</h1>
            <p className="text-xs text-slate-500 mt-0.5">{STEPS[step].subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-700">ID:</span>
            <span className="text-[11px] font-mono text-slate-600">{mongoId.slice(0, 12)}…</span>
          </div>
        </header>

        {/* Step bar */}
        <StepBar currentStep={step} />

        {/* Form body */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <div className={cn(
            'h-full overflow-y-auto max-w-5xl mx-auto w-full px-10',
            step === 2 ? 'py-5' : 'py-8',
          )}>

            {/* Step title + progress line */}
            <div className={step === 2 ? 'mb-4' : 'mb-7'}>
              <h2 className="text-xl font-bold text-white tracking-tight">{STEPS[step].label}</h2>
              <div className="mt-3 h-px bg-slate-800/60 relative overflow-hidden rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-cyan-500/60 transition-all duration-500 rounded-full"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <form id="business-form" onSubmit={form.handleSubmit(handleFinalSubmit)}>

              {/* Step 0: Practice Profile = Core + EHR + Phone Numbers */}
              {step === 0 && (
                <div className="flex flex-col gap-5">
                  <CoreBusinessSection form={form} />
                  <SectionDivider label="EHR Integration" />
                  <EHRMappingSection form={form} />
                  <SectionDivider label="Phone Numbers" />
                  <TelephonySection form={form} />
                </div>
              )}

              {/* Step 1: Twilio Provisioning */}
              {step === 1 && <ProvisioningSection form={form} />}

              {/* Step 2: Site & Schedule */}
              {step === 2 && <LocalizationSection form={form} />}

            </form>
          </div>
        </main>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800/60 bg-slate-950/80 px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200
                  border border-slate-700/60 hover:border-slate-600 transition-all"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-cyan-500 hover:bg-cyan-400
                  text-slate-950 transition-all shadow-lg shadow-cyan-500/20"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                form="business-form"
                disabled={submitState === 'loading'}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold
                  bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all
                  shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitState === 'loading' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    Creating…
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
