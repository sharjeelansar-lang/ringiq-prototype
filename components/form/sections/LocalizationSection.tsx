'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { TIMEZONES, US_STATES } from '@/lib/utils';
import { FormField, Input, Select } from '@/components/ui/FormField';
import type { FieldPath } from 'react-hook-form';

const STATE_OPTIONS = US_STATES.map((s) => ({ value: s, label: s }));
const TZ_OPTIONS    = TIMEZONES.map((t) => ({ value: t.value, label: t.label }));

const DAYS = [
  { key: 'mondayFriday', label: 'Mon – Fri' },
  { key: 'saturday',     label: 'Saturday'  },
  { key: 'sunday',       label: 'Sunday'    },
] as const;

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function LocalizationSection({ form }: Props) {
  const { register, getFieldState, formState } = form;

  const getVisibleError = (name: FieldPath<BusinessFormSchema>) => {
    const fieldState = getFieldState(name, formState);
    const shouldShow = formState.submitCount > 0 || fieldState.isTouched || fieldState.isDirty;

    return {
      message: shouldShow ? fieldState.error?.message : undefined,
      hasError: shouldShow && !!fieldState.error,
    };
  };

  const timezoneError = getVisibleError('timezone');
  const streetAddressError = getVisibleError('streetAddress');
  const cityError = getVisibleError('city');
  const stateError = getVisibleError('state');
  const zipCodeError = getVisibleError('zipCode');

  return (
    <div className="flex flex-col gap-7">

      {/* Address block */}
      <div className="grid grid-cols-4 gap-x-6 gap-y-5">
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

        <div className="col-span-4">
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

      {/* Hours block */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-4">
          Business Hours
        </p>
        <div className="flex flex-col gap-3">
          {DAYS.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-[160px_200px_200px] gap-3 items-end">
              <p className="text-sm text-slate-400 pb-2.5 font-medium">{label}</p>
              <FormField label="Open">
                <Input
                  {...register(`operationalHours.${key}.open`)}
                  type="time"
                  className="font-mono text-xs"
                />
              </FormField>
              <FormField label="Close">
                <Input
                  {...register(`operationalHours.${key}.close`)}
                  type="time"
                  className="font-mono text-xs"
                />
              </FormField>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <FormField label="Lunch Block" hint='e.g. "Doctor Lunch Block: 12:00 PM - 01:00 PM"'>
            <Input
              {...register('internalWorkingHours')}
              placeholder="Doctor Lunch Block: 12:00 PM - 01:00 PM"
            />
          </FormField>
        </div>
      </div>

    </div>
  );
}
