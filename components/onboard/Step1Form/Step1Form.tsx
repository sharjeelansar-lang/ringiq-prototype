'use client';

import { type S1 } from '@/types/onboard';
import { ObField, ObInput, ObSelect } from '@/components/onboard/ObField/ObField';

function phoneDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

function formatPhoneDisplay(value: string) {
  const digits = phoneDigits(value);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function Step1Form({
  data, onChange, errors, plan,
}: {
  data: S1; onChange: (d: S1) => void; errors: Record<string, string>; plan?: string;
}) {
  const u = (k: keyof S1) => (v: string) => onChange({ ...data, [k]: v });
  const phoneU = (k: 'phone' | 'officeLine2') => (v: string) => onChange({ ...data, [k]: phoneDigits(v) });
  const line2Required = plan === 'backup';
  return (
    <div className="flex flex-col gap-3.5">
      <ObField label="Practice Name" error={errors.practiceName}>
        <ObInput value={data.practiceName} onChange={u('practiceName')} placeholder="Valley Eye Associates" hasError={!!errors.practiceName} />
      </ObField>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ObField label="Website" error={errors.website}>
          <ObInput value={data.website} onChange={u('website')} placeholder="https://www.valleyeye.com" hasError={!!errors.website} />
        </ObField>
        <ObField label="EHR / Patient Management Software" error={errors.ehrSystem}>
          <ObSelect value={data.ehrSystem} onChange={u('ehrSystem')} options={['CrystalPM']} hasError={!!errors.ehrSystem} />
        </ObField>
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ObField label="Your Name" error={errors.contactName}>
          <ObInput value={data.contactName} onChange={u('contactName')} placeholder="Dr. Sarah Chen" hasError={!!errors.contactName} />
        </ObField>
        <ObField label="Work Email" error={errors.email}>
          <ObInput value={data.email} onChange={u('email')} placeholder="sarah@valleyeye.com" type="email" hasError={!!errors.email} />
        </ObField>
      </div>
      <ObField label="Practice Phone" error={errors.phone}>
        <ObInput value={formatPhoneDisplay(data.phone)} onChange={phoneU('phone')} placeholder="(208) 552-7323" type="tel" hasError={!!errors.phone} />
      </ObField>

      <div>
        <p className="mb-1 text-[13px] font-bold text-mid">
          Additional Phone Lines{' '}
          {line2Required
            ? <span className="text-xs font-semibold text-teal">Line 2 required for 3-Ring Backup</span>
            : <span className="font-normal text-light">(optional)</span>
          }
        </p>
        <p className="mb-2.5 text-xs leading-normal text-muted-foreground">
          Use the line your office answers after three rings. It can be direct-dial or Main + extension.
        </p>
        <ObField label={`3-Ring Backup / 2nd line${line2Required ? ' *' : ''}`} error={errors.officeLine2}>
          <ObInput value={formatPhoneDisplay(data.officeLine2)} onChange={phoneU('officeLine2')} placeholder="(586) 991-6560" type="tel" hasError={!!errors.officeLine2} />
        </ObField>
      </div>
    </div>
  );
}
