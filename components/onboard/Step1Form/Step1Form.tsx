'use client';

import { type S1 } from '@/types/onboard';
import { ObField, ObInput } from '@/components/onboard/ObField/ObField';

export function Step1Form({
  data, onChange, errors,
}: {
  data: S1; onChange: (d: S1) => void; errors: Record<string, string>;
}) {
  const u = (k: keyof S1) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <div className="ob-fields">
      <ObField label="Practice Name" error={errors.practiceName}>
        <ObInput value={data.practiceName} onChange={u('practiceName')} placeholder="Valley Eye Associates" hasError={!!errors.practiceName} />
      </ObField>
      <div className="ob-row-2">
        <ObField label="Your Name" error={errors.contactName}>
          <ObInput value={data.contactName} onChange={u('contactName')} placeholder="Dr. Sarah Chen" hasError={!!errors.contactName} />
        </ObField>
        <ObField label="Work Email" error={errors.email}>
          <ObInput value={data.email} onChange={u('email')} placeholder="sarah@valleyeye.com" type="email" hasError={!!errors.email} />
        </ObField>
      </div>
      <ObField label="Practice Phone" error={errors.phone}>
        <ObInput value={data.phone} onChange={u('phone')} placeholder="(208) 552-7323" type="tel" hasError={!!errors.phone} />
      </ObField>

      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mid)', marginBottom: 4 }}>
          Additional Phone Lines <span style={{ fontWeight: 400, color: 'var(--light)' }}>(optional)</span>
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 10, lineHeight: 1.5 }}>
          These lines help Iris route calls correctly. Lines can be direct-dial or Main + extension.
        </p>
        <div className="ob-row-2">
          <ObField label="Office Line 2 — Staff / 3rd-ring pickup">
            <ObInput value={data.officeLine2} onChange={u('officeLine2')} placeholder="(208) 555-0102 or ext. 2" type="tel" />
          </ObField>
          <ObField label="Office Line 3 — AI transfer line">
            <ObInput value={data.officeLine3} onChange={u('officeLine3')} placeholder="(208) 555-0103 or ext. 3" type="tel" />
          </ObField>
        </div>
      </div>
    </div>
  );
}
