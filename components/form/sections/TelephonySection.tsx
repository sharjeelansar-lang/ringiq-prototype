'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { FormField, Input } from '@/components/ui/FormField';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

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

export function TelephonySection({ form }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div className="grid grid-cols-1 gap-y-4">
        <FormField
          label="Practice Phone"
          error={errors.phone?.message}
          hint="Main number patients call"
        >
          <Input
            {...register('phone')}
            placeholder="+12025550001"
            error={!!errors.phone}
            className="font-mono"
          />
        </FormField>

        <FormField
          label="Office Line 2 — Staff / 3rd-ring pickup"
          error={errors.officeLine2?.message}
          hint="Staff direct line — forwarded after ring threshold"
        >
          <Input
            {...register('officeLine2')}
            placeholder="+12025550002"
            error={!!errors.officeLine2}
            className="font-mono"
          />
        </FormField>

        <FormField
          label="Office Line 3 — AI transfer line"
          error={errors.officeLine3?.message}
          hint="Line Iris transfers calls to when caller requests staff"
        >
          <Input
            {...register('officeLine3')}
            placeholder="+12025550003"
            error={!!errors.officeLine3}
            className="font-mono"
          />
        </FormField>
      </div>

      <SubHeader label="Phone Provider" />

      <FormField
        label="Current Phone Provider"
        hint="e.g. RingCentral, 8×8, Vonage, Avaya"
      >
        <Input
          {...register('phoneProvider')}
          placeholder="RingCentral"
        />
      </FormField>

    </div>
  );
}
