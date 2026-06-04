'use client';

import './onboard.css';
import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Loader2, X } from 'lucide-react';

import { type S1, type S2, type S3, type S4 } from '@/types/onboard';
import { PLANS, type PlanSlug, planLabel, vapiVoiceId, META_WITH_PLAN, META_NO_PLAN } from '@/lib/onboard';
import { LeftPanel }     from '@/components/onboard/LeftPanel/LeftPanel';
import { SuccessScreen } from '@/components/onboard/SuccessScreen/SuccessScreen';
import { PlanStep }      from '@/components/onboard/PlanStep/PlanStep';
import { Step1Form }     from '@/components/onboard/Step1Form/Step1Form';
import { Step2Form }     from '@/components/onboard/Step2Form/Step2Form';
import { Step3Form }     from '@/components/onboard/Step3Form/Step3Form';
import { Step4Form }     from '@/components/onboard/Step4Form/Step4Form';

function OnboardContent() {
  const searchParams   = useSearchParams();
  const urlPlanRaw     = searchParams.get('plan') ?? '';
  const validSlugs     = PLANS.map((p) => p.slug) as string[];
  const urlPlan        = validSlugs.includes(urlPlanRaw) ? (urlPlanRaw as PlanSlug) : '';
  const hasPlanFromUrl = !!urlPlan;

  const totalSteps = hasPlanFromUrl ? 4 : 5;

  const [step,        setStep]        = useState(1);
  const [plan,        setPlan]        = useState<PlanSlug | ''>(urlPlan);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const [s1, setS1] = useState<S1>({ practiceName: '', contactName: '', email: '', phone: '', officeLine2: '', officeLine3: '' });
  const [s2, setS2] = useState<S2>({ streetAddress: '', city: '', state: '', zipCode: '', timezone: '', monthlyCallVolume: '', phoneProvider: '', currentPhoneSetup: '' });
  const [s3, setS3] = useState<S3>({ officeGreeting: '', locationNote: '', mondayFridayOpen: '08:00', mondayFridayClose: '17:00', saturdayOpen: '09:00', saturdayClose: '14:00', saturdayClosed: false, sundayClosed: true, lunchBreak: '', afterHoursPolicy: '' });
  const [s4, setS4] = useState<S4>({ voice: '', interests: [], notes: '' });

  const practiceStep = hasPlanFromUrl ? 1 : 2;
  const setupStep    = hasPlanFromUrl ? 2 : 3;
  const officeStep   = hasPlanFromUrl ? 3 : 4;
  const goalsStep    = hasPlanFromUrl ? 4 : 5;
  const planStep     = hasPlanFromUrl ? null : 1;

  const meta = hasPlanFromUrl ? META_NO_PLAN : META_WITH_PLAN;

  const validatePractice = () => {
    const e: Record<string, string> = {};
    if (s1.practiceName.trim().length < 2)              e.practiceName = 'Practice name is required';
    if (!s1.contactName.trim())                         e.contactName  = 'Your name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s1.email))  e.email        = 'Enter a valid email address';
    if (!/^\d{10}$/.test(s1.phone.replace(/\D/g, ''))) e.phone        = 'Enter a valid 10-digit phone number';
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
    if (!s3.afterHoursPolicy) e.afterHoursPolicy = 'Required';
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
          ehrSystem:    'Crystal PM',
          locationCount: '1 location',
          officeGreeting:   s3.officeGreeting,
          locationNote:     s3.locationNote,
          officeHours: {
            mondayFriday: { open: s3.mondayFridayOpen,  close: s3.mondayFridayClose },
            saturday:     { open: s3.saturdayOpen,      close: s3.saturdayClose, closed: s3.saturdayClosed },
            sunday:       { closed: s3.sundayClosed },
          },
          lunchBreak:       s3.lunchBreak,
          afterHoursPolicy: s3.afterHoursPolicy,
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
      setSubmitted(true);
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

  if (submitted) {
    return <SuccessScreen practiceName={s1.practiceName} plan={plan} />;
  }

  return (
    <div className="ob-shell">
      <LeftPanel step={step} hasPlanFromUrl={hasPlanFromUrl} />

      <div className="ob-right">
        <div className="ob-form-content">

          {/* Mobile logo */}
          <div className="ob-mobile-logo">
            <Image src="/assets/logo.png" alt="RingIQ" width={120} height={34} priority style={{ width: 120, height: 'auto' }} />
          </div>

          {/* Progress bar */}
          <div className="ob-prog-track">
            <div className="ob-prog-fill" style={{ width: `${progressPct}%` }} />
          </div>

          {/* Plan chip */}
          {hasPlanFromUrl && (
            <div className="ob-plan-chip">
              <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span className="ob-plan-chip-txt">
                <strong>{planLabel(urlPlan)}</strong> selected
              </span>
              <a href="/onboard" className="ob-plan-chip-chg">
                <X size={11} /> Change
              </a>
            </div>
          )}

          {/* Step header */}
          <div key={`header-${step}`} style={{ animation: 'ob-rise 0.3s ease both' }}>
            <div className="ob-step-pill">Step {step} of {totalSteps}</div>
            <h2 className="ob-step-heading">{meta[step - 1].title}</h2>
            <p className="ob-step-sub">{meta[step - 1].sub}</p>
          </div>

          {/* Form body */}
          <div key={`body-${step}`}>
            {planStep !== null && step === planStep && (
              <>
                <PlanStep selected={plan} onSelect={(s) => { setPlan(s); setErrors({}); }} />
                {errors.plan && (
                  <p style={{ fontSize: 12, color: '#DC2626', marginTop: 12, fontWeight: 500 }}>{errors.plan}</p>
                )}
              </>
            )}
            {step === practiceStep && <Step1Form data={s1} onChange={setS1} errors={errors} />}
            {step === setupStep    && <Step2Form data={s2} onChange={setS2} errors={errors} />}
            {step === officeStep   && <Step3Form data={s3} onChange={setS3} errors={errors} />}
            {step === goalsStep    && <Step4Form data={s4} toggle={toggleInterest} onChange={setS4} />}
          </div>

          {submitError && <div className="ob-submit-err">{submitError}</div>}

          {/* Navigation */}
          <div className="ob-nav">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="ob-btn-back">
                <ArrowLeft size={15} /> Back
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={step < totalSteps ? handleNext : handleSubmit}
              disabled={submitting}
              className="ob-btn-next"
            >
              {submitting ? (
                <><Loader2 size={15} style={{ animation: 'ob-spin 1s linear infinite' }} /> Submitting…</>
              ) : step < totalSteps ? (
                <>Continue <ArrowRight size={15} /></>
              ) : (
                <>Request Access <ArrowRight size={15} /></>
              )}
            </button>
          </div>

          <p className="ob-footnote">
            We review every application personally. Your data is never shared.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} style={{ color: 'var(--primary)', animation: 'ob-spin 1s linear infinite' }} />
      </div>
    }>
      <OnboardContent />
    </Suspense>
  );
}
