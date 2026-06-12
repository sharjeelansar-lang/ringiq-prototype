'use client';

import { type S2 } from '@/types/onboard';
import { US_TIMEZONES, CALL_VOLUMES, US_STATES, PHONE_PROVIDERS, PHONE_SETUPS } from '@/lib/onboard';
import { ObField, ObInput, ObSelect } from '@/components/onboard/ObField/ObField';

export function Step2Form({
  data, onChange, errors,
}: {
  data: S2; onChange: (d: S2) => void; errors: Record<string, string>;
}) {
  const u = (k: keyof S2) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ObField label="Office Time Zone" error={errors.timezone}>
          <ObSelect value={data.timezone} onChange={u('timezone')} options={US_TIMEZONES} placeholder="Select time zone" hasError={!!errors.timezone} />
        </ObField>
        <ObField label="Monthly Call Volume" error={errors.monthlyCallVolume}>
          <ObSelect value={data.monthlyCallVolume} onChange={u('monthlyCallVolume')} options={CALL_VOLUMES} placeholder="Approx. calls per month?" hasError={!!errors.monthlyCallVolume} />
        </ObField>
      </div>
      <ObField label="Street Address" error={errors.streetAddress}>
        <ObInput value={data.streetAddress} onChange={u('streetAddress')} placeholder="123 Main St, Suite 200" hasError={!!errors.streetAddress} />
      </ObField>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[2fr_1fr_1fr]">
        <ObField label="City" error={errors.city}>
          <ObInput value={data.city} onChange={u('city')} placeholder="Boise" hasError={!!errors.city} />
        </ObField>
        <ObField label="State" error={errors.state}>
          <ObSelect value={data.state} onChange={u('state')} options={US_STATES} placeholder="ST" hasError={!!errors.state} />
        </ObField>
        <ObField label="ZIP Code" error={errors.zipCode}>
          <ObInput value={data.zipCode} onChange={u('zipCode')} placeholder="83702" hasError={!!errors.zipCode} />
        </ObField>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ObField label="Phone Provider" error={errors.phoneProvider}>
          <ObSelect value={data.phoneProvider} onChange={u('phoneProvider')} options={PHONE_PROVIDERS} placeholder="Who is your provider?" hasError={!!errors.phoneProvider} />
        </ObField>
        <ObField label="Phone System Type" error={errors.currentPhoneSetup}>
          <ObSelect value={data.currentPhoneSetup} onChange={u('currentPhoneSetup')} options={PHONE_SETUPS} placeholder="What type?" hasError={!!errors.currentPhoneSetup} />
        </ObField>
      </div>
    </div>
  );
}
