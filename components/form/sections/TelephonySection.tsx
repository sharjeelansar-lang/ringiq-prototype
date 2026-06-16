'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { FormField, Input } from '@/components/ui/FormField';
import { SubHeader } from '@/components/ui/SubHeader';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

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
          label="3-Ring Backup / 2nd Line"
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
