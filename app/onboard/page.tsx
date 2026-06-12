'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Loader2, X } from 'lucide-react';

import { type S1, type S2, type S3, type S4 } from '@/types/onboard';
import { PLANS, type PlanSlug, planLabel, vapiVoiceId, META_WITH_PLAN, META_NO_PLAN } from '@/lib/onboard';
import { LeftPanel }     from '@/components/onboard/LeftPanel/LeftPanel';
import { PlanStep }      from '@/components/onboard/PlanStep/PlanStep';
import { Step1Form }     from '@/components/onboard/Step1Form/Step1Form';
import { Step2Form }     from '@/components/onboard/Step2Form/Step2Form';
import { Step3Form }     from '@/components/onboard/Step3Form/Step3Form';
import { Step4Form }     from '@/components/onboard/Step4Form/Step4Form';
import { cn } from '@/lib/utils';

function isValidWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
}

function OnboardContent() {
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const urlPlanRaw     = searchParams.get('plan') ?? '';
  const validSlugs     = PLANS.map((p) => p.slug) as string[];
  const urlPlan        = validSlugs.includes(urlPlanRaw) ? (urlPlanRaw as PlanSlug) : '';
  const hasPlanFromUrl = !!urlPlan;

  const totalSteps = hasPlanFromUrl ? 4 : 5;

  const [step,        setStep]        = useState(1);
  const [plan,        setPlan]        = useState<PlanSlug | ''>(urlPlan);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const [s1, setS1] = useState<S1>({ practiceName: '', contactName: '', email: '', phone: '', website: '', ehrSystem: 'CrystalPM', officeLine2: '' });
  const [s2, setS2] = useState<S2>({ streetAddress: '', city: '', state: '', zipCode: '', timezone: '', monthlyCallVolume: '', phoneProvider: '', currentPhoneSetup: '' });
  const [s3, setS3] = useState<S3>({
    officeGreeting: '',
    locationNote: '',
    mondayFridayOpen: '08:00',
    mondayFridayClose: '17:00',
    mondayOpen: '08:00',
    mondayClose: '17:00',
    mondayClosed: false,
    tuesdayOpen: '08:00',
    tuesdayClose: '17:00',
    tuesdayClosed: false,
    wednesdayOpen: '08:00',
    wednesdayClose: '17:00',
    wednesdayClosed: false,
    thursdayOpen: '08:00',
    thursdayClose: '17:00',
    thursdayClosed: false,
    fridayOpen: '08:00',
    fridayClose: '17:00',
    fridayClosed: false,
    saturdayOpen: '09:00',
    saturdayClose: '14:00',
    saturdayClosed: false,
    sundayOpen: '09:00',
    sundayClose: '14:00',
    sundayClosed: true,
    lunchBreak: '',
    afterHoursPolicy: '',
    currentAfterHoursPolicy: '',
    ringiqAfterHoursPolicy: '',
  });
  const [s4, setS4] = useState<S4>({ voice: '', interests: [], notes: '' });

  const practiceStep = hasPlanFromUrl ? 1 : 2;
  const setupStep    = hasPlanFromUrl ? 2 : 3;
  const officeStep   = hasPlanFromUrl ? 3 : 4;
  const goalsStep    = hasPlanFromUrl ? 4 : 5;
  const planStep     = hasPlanFromUrl ? null : 1;

  const meta = hasPlanFromUrl ? META_NO_PLAN : META_WITH_PLAN;

  const validatePractice = () => {
    const e: Record<string, string> = {};
    if (s1.practiceName.trim().length < 2)                        e.practiceName = 'Practice name is required';
    if (!isValidWebsite(s1.website))                              e.website      = 'Enter a valid practice website';
    if (!s1.ehrSystem)                                            e.ehrSystem    = 'EHR system is required';
    if (!s1.contactName.trim())                                   e.contactName  = 'Your name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s1.email))            e.email        = 'Enter a valid email address';
    if (!/^\d{10}$/.test(s1.phone.replace(/\D/g, '')))           e.phone        = 'Enter a valid 10-digit phone number';
    if (plan === 'backup' && !s1.officeLine2.replace(/\D/g, '')) e.officeLine2  = 'Required for 3-Ring Backup — enter your staff pickup line';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSetup = () => {
    const e: Record<string, string> = {};
    if (!s2.timezone)                                                       e.timezone          = 'Required';
    if (!s2.streetAddress.trim())                                           e.streetAddress     = 'Street address is required';
    if (!s2.city.trim())                                                    e.city              = 'City is required';
    if (!s2.state)                                                          e.state             = 'State is required';
    if (!/^\d{5}$/.test(s2.zipCode.replace(/\D/g, '').slice(0, 5)))        e.zipCode           = 'Enter a valid 5-digit ZIP';
    if (!s2.monthlyCallVolume)                                              e.monthlyCallVolume = 'Required';
    if (!s2.currentPhoneSetup)                                              e.currentPhoneSetup = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateOffice = () => {
    const e: Record<string, string> = {};
    if (!s3.currentAfterHoursPolicy) e.currentAfterHoursPolicy = 'Required';
    if (!s3.ringiqAfterHoursPolicy)  e.ringiqAfterHoursPolicy  = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (planStep !== null && step === planStep && !plan) {
      setErrors({ plan: 'Please select a plan to continue' });
      return;
    }
    if (step === practiceStep && !validatePractice()) return;
    if (step === setupStep    && !validateSetup())    return;
    if (step === officeStep   && !validateOffice())   return;
    setErrors({});
    setStep((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => { setErrors({}); setStep((n) => n - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/queue', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...s1,
          contactRole: 'Owner / Optometrist',
          ...s2,
          website:      normalizeWebsite(s1.website),
          ehrSystem:    s1.ehrSystem,
          locationCount: '1 location',
          officeGreeting:   s3.officeGreeting,
          locationNote:     s3.locationNote,
          officeHours: {
            mondayFriday: { open: s3.mondayFridayOpen,  close: s3.mondayFridayClose },
            monday:       { open: s3.mondayOpen,        close: s3.mondayClose, closed: s3.mondayClosed },
            tuesday:      { open: s3.tuesdayOpen,       close: s3.tuesdayClose, closed: s3.tuesdayClosed },
            wednesday:    { open: s3.wednesdayOpen,     close: s3.wednesdayClose, closed: s3.wednesdayClosed },
            thursday:     { open: s3.thursdayOpen,      close: s3.thursdayClose, closed: s3.thursdayClosed },
            friday:       { open: s3.fridayOpen,        close: s3.fridayClose, closed: s3.fridayClosed },
            saturday:     { open: s3.saturdayOpen,      close: s3.saturdayClose, closed: s3.saturdayClosed },
            sunday:       { open: s3.sundayOpen,        close: s3.sundayClose, closed: s3.sundayClosed },
          },
          lunchBreak:       s3.lunchBreak,
          currentAfterHoursPolicy: s3.currentAfterHoursPolicy,
          ringiqAfterHoursPolicy:  s3.ringiqAfterHoursPolicy,
          afterHoursPolicy: `Current: ${s3.currentAfterHoursPolicy} | RingIQ: ${s3.ringiqAfterHoursPolicy}`,
          voice:            s4.voice,
          vapiVoiceId:      vapiVoiceId(s4.voice),
          interests:        s4.interests,
          notes:            s4.notes,
          plan:             plan || '',
          phone:            s1.phone.replace(/\D/g, ''),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed');
      const thankYouParams = new URLSearchParams({
        practice: s1.practiceName.trim(),
        plan: plan || '',
        date: new Date().toISOString(),
      });
      router.push(`/onboard/thank-you?${thankYouParams.toString()}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleInterest = (id: string) =>
    setS4((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));

  const progressPct = Math.round((step / totalSteps) * 100);

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[420px_1fr]">
      <LeftPanel step={step} hasPlanFromUrl={hasPlanFromUrl} />

      <div className="flex min-h-dvh items-start justify-center bg-[radial-gradient(circle_at_100%_0%,rgba(39,73,147,0.06),transparent_36%),#FFFFFF] px-6 py-9 lg:px-[72px] lg:py-[52px]">
        <div className="w-full max-w-[680px] pt-1">

          {/* Mobile logo */}
          <div className="mb-7 inline-flex lg:hidden">
            <Image src="/assets/logo.png" alt="RingIQ" width={120} height={34} priority className="h-auto w-[120px]" />
          </div>

          {/* Progress bar */}
          <div className="mb-6 h-[3px] overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),#4F7AE8)] transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Plan chip */}
          {hasPlanFromUrl && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border-[1.5px] border-accent-border bg-accent px-3.5 py-2.5">
              <Check size={14} className="shrink-0 text-primary" />
              <span className="flex-1 text-[13px] text-foreground">
                <strong className="font-bold text-primary">{planLabel(urlPlan)}</strong> selected
              </span>
              <a href="/onboard" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-light no-underline transition-colors duration-150 hover:bg-black/5">
                <X size={11} /> Change
              </a>
            </div>
          )}

          {/* Step header */}
          <div key={`header-${step}`}>
            <div className="mb-3.5 inline-flex items-center gap-[7px] rounded-full border border-accent-border bg-accent px-[11px] py-1.5 text-xs font-bold text-primary">
              Step {step} of {totalSteps}
            </div>
            <h2 className="m-0 text-[clamp(26px,3vw,32px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground">{meta[step - 1].title}</h2>
            <p className="mb-4 mt-2 text-sm leading-relaxed text-muted-foreground">{meta[step - 1].sub}</p>
          </div>

          {/* Form body */}
          <div key={`body-${step}`}>
            {planStep !== null && step === planStep && (
              <>
                <PlanStep selected={plan} onSelect={(s) => { setPlan(s); setErrors({}); }} />
                {errors.plan && (
                  <p className="mt-3 text-xs font-medium text-[#DC2626]">{errors.plan}</p>
                )}
              </>
            )}
            {step === practiceStep && <Step1Form data={s1} onChange={setS1} errors={errors} plan={plan} />}
            {step === setupStep    && <Step2Form data={s2} onChange={setS2} errors={errors} />}
            {step === officeStep   && <Step3Form data={s3} onChange={setS3} errors={errors} />}
            {step === goalsStep    && <Step4Form data={s4} toggle={toggleInterest} onChange={setS4} />}
          </div>

          {submitError && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 px-3.5 py-3 text-[13px] leading-snug text-[#B91C1C]">
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-[18px]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex min-h-12 cursor-pointer items-center gap-[7px] rounded-xl border-[1.5px] border-border bg-transparent px-[18px] text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:border-light hover:bg-input-bg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              >
                <ArrowLeft size={15} /> Back
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={step < totalSteps ? handleNext : handleSubmit}
              disabled={submitting}
              className={cn(
                'inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[14px] border-0 bg-primary px-7 text-[15px] font-extrabold tracking-[-0.01em] text-white shadow-[0_16px_34px_rgba(39,73,147,0.22)] transition-[transform,background-color,box-shadow,opacity] duration-150 hover:-translate-y-px hover:bg-primary-dark hover:shadow-[0_20px_42px_rgba(39,73,147,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0'
              )}
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Submitting…</>
              ) : step < totalSteps ? (
                <>Continue <ArrowRight size={15} /></>
              ) : (
                <>Request Test Agent</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    }>
      <OnboardContent />
    </Suspense>
  );
}
