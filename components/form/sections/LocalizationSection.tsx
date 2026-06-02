'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { TIMEZONES, US_STATES } from '@/lib/utils';
import { FormField, Input, Select } from '@/components/ui/FormField';
import type { FieldPath } from 'react-hook-form';

const STATE_OPTIONS = US_STATES.map((s) => ({ value: s, label: s }));
const TZ_OPTIONS    = TIMEZONES.map((t) => ({ value: t.value, label: t.label }));

const AFTER_HOURS_OPTIONS = [
  { value: 'ai_takes_message',       label: 'AI takes a message'          },
  { value: 'transfer_voicemail',     label: 'Transfer to voicemail'       },
  { value: 'ai_emergency_triage',    label: 'AI handles emergency triage' },
  { value: 'refer_on_call',          label: 'Refer to on-call doctor'     },
  { value: 'play_outgoing_message',  label: 'Play outgoing message'       },
];

const DAYS = [
  { key: 'mondayFriday', label: 'Mon – Fri', canClose: false },
  { key: 'saturday',     label: 'Saturday',  canClose: true  },
  { key: 'sunday',       label: 'Sunday',    canClose: true  },
] as const;

function SubHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
    </div>
  );
}

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function LocalizationSection({ form }: Props) {
  const { register, watch, setValue, getFieldState, formState } = form;

  const satClosed = watch('operationalHours.saturday.closed');
  const sunClosed = watch('operationalHours.sunday.closed');

  const closedMap: Record<string, boolean> = {
    mondayFriday: false,
    saturday:     satClosed ?? false,
    sunday:       sunClosed ?? true,
  };

  const getVisibleError = (name: FieldPath<BusinessFormSchema>) => {
    const fieldState = getFieldState(name, formState);
    const shouldShow = formState.submitCount > 0 || fieldState.isTouched || fieldState.isDirty;
    return {
      message:  shouldShow ? fieldState.error?.message : undefined,
      hasError: shouldShow && !!fieldState.error,
    };
  };

  const timezoneError    = getVisibleError('timezone');
  const streetAddressError = getVisibleError('streetAddress');
  const cityError        = getVisibleError('city');
  const stateError       = getVisibleError('state');
  const zipCodeError     = getVisibleError('zipCode');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px', alignItems: 'start' }}>

      {/* ── Left: Address + Hours ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div className="grid grid-cols-4 gap-x-5 gap-y-4">
          <div className="col-span-2">
            <FormField label="Timezone" required error={timezoneError.message}>
              <Select
                {...register('timezone')}
                options={TZ_OPTIONS}
                placeholder="Select timezone..."
                error={timezoneError.hasError}
              />
            </FormField>
          </div>

          <div className="col-span-2">
            <FormField label="Street Address" required error={streetAddressError.message}>
              <Input
                {...register('streetAddress')}
                placeholder="4230 Coolidge Hwy"
                error={streetAddressError.hasError}
              />
            </FormField>
          </div>

          <div className="col-span-2">
            <FormField label="City" required error={cityError.message}>
              <Input
                {...register('city')}
                placeholder="Sterling Heights"
                error={cityError.hasError}
              />
            </FormField>
          </div>

          <FormField label="State" required error={stateError.message}>
            <Select
              {...register('state')}
              options={STATE_OPTIONS}
              placeholder="ST"
              error={stateError.hasError}
            />
          </FormField>

          <FormField label="ZIP" required error={zipCodeError.message}>
            <Input
              {...register('zipCode')}
              placeholder="48310"
              error={zipCodeError.hasError}
              className="font-mono"
            />
          </FormField>
        </div>

        <SubHeader label="Business Hours" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DAYS.map(({ key, label, canClose }) => {
            const isClosed = closedMap[key];
            return (
              <div
                key={key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 1fr auto',
                  gap: '0 10px',
                  alignItems: 'end',
                  opacity: isClosed ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <p className="text-sm text-slate-400 pb-2.5 font-medium">{label}</p>
                <FormField label="Open">
                  <Input
                    {...register(`operationalHours.${key}.open`)}
                    type="time"
                    className="font-mono text-xs"
                    disabled={isClosed}
                  />
                </FormField>
                <FormField label="Close">
                  <Input
                    {...register(`operationalHours.${key}.close`)}
                    type="time"
                    className="font-mono text-xs"
                    disabled={isClosed}
                  />
                </FormField>
                {canClose ? (
                  <div style={{ paddingBottom: 4 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const field = `operationalHours.${key}.closed` as FieldPath<BusinessFormSchema>;
                        setValue(field, !isClosed, { shouldValidate: false });
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        border: `1.5px solid ${isClosed ? '#FCA5A5' : '#E2E8F0'}`,
                        background: isClosed ? '#FEF2F2' : '#F8FAFC',
                        color: isClosed ? '#DC2626' : '#94A3B8',
                        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isClosed ? 'Closed' : 'Open'}
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            );
          })}
        </div>

        <FormField label="Lunch Block" hint="e.g. Doctor Lunch Block: 12:00 PM – 01:00 PM">
          <Input
            {...register('internalWorkingHours')}
            placeholder="Doctor Lunch Block: 12:00 PM - 01:00 PM"
          />
        </FormField>

      </div>

      {/* ── Right: AI Scripting + On-Call ─────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <SubHeader label="AI Scripting" />

        <FormField
          label="Office Greeting"
          hint="Opening line Iris reads to every caller"
        >
          <textarea
            {...register('officeGreeting')}
            rows={3}
            placeholder="Thank you for calling [Practice Name]! This is Iris, your AI scheduling assistant. How can I help you today?"
            style={{
              width: '100%', borderRadius: 6, padding: '10px 12px',
              fontSize: 13, color: '#0F172A', background: '#FFFFFF',
              border: '1.5px solid #E2E8F0', outline: 'none', resize: 'vertical',
              fontFamily: 'inherit', lineHeight: 1.5,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(39,73,147,0.6)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
          />
        </FormField>

        <FormField
          label="Location Note"
          hint="Directions hint shown to callers"
        >
          <Input
            {...register('locationNote')}
            placeholder="Located next to the CVS on Coolidge Hwy, Suite 200"
          />
        </FormField>

        <FormField
          label="After-Hours Policy"
          hint="How Iris handles calls outside business hours"
        >
          <Select
            {...register('afterHoursPolicy')}
            options={AFTER_HOURS_OPTIONS}
            placeholder="Select after-hours policy..."
          />
        </FormField>

        <SubHeader label="On-Call Doctor" />

        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <FormField
            label="On-Call Doctor Name"
            hint="Referred after hours by AI"
          >
            <Input
              {...register('onCallDoctorName')}
              placeholder="Dr. Sarah Mitchell"
            />
          </FormField>

          <FormField
            label="On-Call Mobile Number"
            hint="E.164 — given to callers in emergencies"
          >
            <Input
              {...register('onCallDoctorPhone')}
              placeholder="+12485550199"
              className="font-mono"
            />
          </FormField>
        </div>

      </div>

    </div>
  );
}
