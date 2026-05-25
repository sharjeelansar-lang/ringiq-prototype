'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { FieldPath } from 'react-hook-form';
import {
  X, CheckCircle2, ExternalLink, Check,
  Building2, Cpu, Phone, PhoneCall, MapPin, SlidersHorizontal,
} from 'lucide-react';
import { businessFormSchema, BusinessFormSchema } from '@/lib/schema';
import { generateMongoId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CoreBusinessSection } from './sections/CoreBusinessSection';
import { EHRMappingSection } from './sections/EHRMappingSection';
import { ProvisioningSection } from './sections/ProvisioningSection';
import { TelephonySection } from './sections/TelephonySection';
import { LocalizationSection } from './sections/LocalizationSection';
import { BehaviorTogglesSection } from './sections/BehaviorTogglesSection';

interface Props {
  onClose: () => void;
  onSubmit: (data: BusinessFormSchema & { realOfficeId: string }) => void;
}

const STEPS = [
  { id: 'core',         label: 'Core Business',   description: 'Identity & environment',     icon: Building2         },
  { id: 'ehr',          label: 'EHR Mapping',      description: 'CrystalPM & integration',    icon: Cpu               },
  { id: 'provision',    label: 'Provisioning',     description: 'Twilio sub-account & number',icon: Phone             },
  { id: 'telephony',    label: 'Telephony',        description: 'Phone numbers & routing',    icon: PhoneCall         },
  { id: 'localization', label: 'Location & Hours', description: 'Address & business hours',   icon: MapPin            },
  { id: 'behavior',     label: 'Behavior',         description: 'AI booking rules & toggles', icon: SlidersHorizontal },
];

const STEP_FIELDS: Record<number, FieldPath<BusinessFormSchema>[]> = {
  0: ['practiceDisplayName', 'corporateCleanName', 'environmentStatus'],
  1: ['cpmid', 'syeLocationId'],
  2: [],
  3: ['inboundPhone', 'twilioSid'],
  4: ['timezone', 'streetAddress', 'city', 'state', 'zipCode'],
  5: [],
};

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

function StepItem({
  step, index, currentStep, isLast,
}: {
  step: typeof STEPS[0]; index: number; currentStep: number; isLast: boolean;
}) {
  const done   = index < currentStep;
  const active = index === currentStep;
  const Icon   = step.icon;

  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 text-xs font-bold',
          done   ? 'bg-emerald-500 text-slate-950' :
          active ? 'bg-cyan-500 text-slate-950 shadow-[0_0_14px_rgba(6,182,212,0.4)]' :
                   'bg-slate-800 text-slate-600 border border-slate-700/60',
        )}>
          {done ? <Check size={12} strokeWidth={3} /> : <Icon size={12} />}
        </div>
        {!isLast && (
          <div className={cn(
            'w-px flex-1 min-h-[30px] my-1 transition-colors duration-300',
            done ? 'bg-emerald-500/25' : 'bg-slate-800',
          )} />
        )}
      </div>
      <div className={cn('pb-5', isLast && 'pb-0')}>
        <p className={cn(
          'text-sm font-semibold leading-none mb-1 transition-colors duration-200',
          active ? 'text-white' : done ? 'text-slate-400' : 'text-slate-600',
        )}>
          {step.label}
        </p>
        <p className={cn(
          'text-xs leading-none transition-colors duration-200',
          active ? 'text-slate-500' : 'text-slate-700',
        )}>
          {step.description}
        </p>
      </div>
    </div>
  );
}

export function BusinessRegistrationForm({ onClose, onSubmit }: Props) {
  const mongoId = useMemo(() => generateMongoId(), []);
  const [step, setStep] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [createdOfficeId, setCreatedOfficeId] = useState('');

  const form = useForm<BusinessFormSchema>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      practiceDisplayName: '',
      corporateCleanName: '',
      environmentStatus: 'internal_testing',
      mongoOfficeId: mongoId,
      emailCompany: '',
      cpmid: '',
      syeLocationId: 8,
      inboundPhone: '',
      publicNumber: '',
      twilioSid: '',
      carrierTrunkName: '',
      failoverRingCount: 3,
      voipRoutingType: 'sip',
      timezone: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      operationalHours: {
        mondayFriday: { open: '08:00', close: '17:00', closed: false },
        saturday:     { open: '09:00', close: '14:00', closed: false },
        sunday:       { open: '',      close: '',      closed: true  },
      },
      internalWorkingHours: 'Doctor Lunch Block: 12:00 PM - 01:00 PM',
      recordingDisclosure:   true,
      allowSameDayBookings:  false,
      maxSlotSearchRounds:   3,
      mandatoryEmailProfile: false,
    },
    mode: 'onChange',
  });

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
      setCreatedOfficeId(json.officeId);
      setSubmitState('success');
      toast.success('Business registered successfully in MongoDB.');
      setTimeout(() => onSubmit({ ...data, realOfficeId: json.officeId }), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create office';
      setSubmitState('error');
      toast.error(`Registration failed: ${msg}`);
    }
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) {
        toast.error('Please fix the errors before continuing.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  if (submitState === 'success') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={30} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Business Registered</h2>
            <p className="text-sm text-slate-500 mt-1">Office document created in MongoDB.</p>
          </div>
          <div className="w-full px-5 py-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-left">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600 mb-1.5">MongoDB Office ID</p>
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm font-mono text-emerald-400 break-all">{createdOfficeId}</span>
              <ExternalLink size={13} className="text-slate-600 shrink-0" />
            </div>
          </div>
          <p className="text-xs text-slate-700">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex overflow-hidden">

      {/* ── LEFT: Step Navigator ───────────────────────────────────── */}
      <div className="w-64 shrink-0 bg-slate-900/60 border-r border-slate-800/60 flex flex-col px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Building2 size={10} className="text-cyan-400" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 tracking-widest uppercase">New Business</span>
          </div>
          <p className="text-[11px] text-slate-700 mt-0.5">Client Operations Console</p>
        </div>

        <nav className="flex-1">
          {STEPS.map((s, i) => (
            <StepItem
              key={s.id}
              step={s}
              index={i}
              currentStep={step}
              isLast={i === STEPS.length - 1}
            />
          ))}
        </nav>

        <div className="pt-5 border-t border-slate-800/40">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-700 mb-1">Office ID</p>
          <p className="text-[11px] font-mono text-slate-600 break-all leading-relaxed">{mongoId}</p>
        </div>
      </div>

      {/* ── RIGHT: Form Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-10 pt-9 pb-0">
          <div>
            <p className="text-[11px] font-semibold text-slate-600 tracking-widest uppercase mb-2">
              Step {step + 1} / {STEPS.length}
            </p>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none">
              {STEPS[step].label}
            </h2>
            <p className="text-sm text-slate-500 mt-2">{STEPS[step].description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <X size={17} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="shrink-0 mx-10 mt-6 mb-7 h-px bg-slate-800/80 relative overflow-hidden rounded-full">
          <div
            className="absolute inset-y-0 left-0 bg-cyan-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-10 pb-6">
          <form
            id="business-form"
            onSubmit={form.handleSubmit(handleFinalSubmit)}
          >
            {step === 0 && <CoreBusinessSection form={form} />}
            {step === 1 && <EHRMappingSection form={form} />}
            {step === 2 && <ProvisioningSection form={form} />}
            {step === 3 && <TelephonySection form={form} />}
            {step === 4 && <LocalizationSection form={form} />}
            {step === 5 && <BehaviorTogglesSection form={form} />}
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800/60 bg-slate-950/80 px-10 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-600 hover:text-slate-300 transition-colors"
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
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold
                  bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all
                  shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
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
