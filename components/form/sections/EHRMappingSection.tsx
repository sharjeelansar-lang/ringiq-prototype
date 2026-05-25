'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { FormField, Input } from '@/components/ui/FormField';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function EHRMappingSection({ form }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-5">
      <FormField
        label="Email Company Code"
        hint='EHR company identifier — e.g. "tso", "icare"'
      >
        <Input
          {...register('emailCompany')}
          placeholder="tso"
          className="font-mono"
        />
      </FormField>

      <FormField label="CPMID" required error={errors.cpmid?.message} hint="CrystalPM store identifier">
        <Input
          {...register('cpmid')}
          placeholder="CRYSTL-SH-001"
          error={!!errors.cpmid}
          className="font-mono"
        />
      </FormField>

      <FormField label="SYE Location ID" required error={errors.syeLocationId?.message} hint="Default: 8 for standalone clinics">
        <Input
          {...register('syeLocationId', { valueAsNumber: true })}
          type="number"
          placeholder="8"
          error={!!errors.syeLocationId}
          className="font-mono"
        />
      </FormField>
    </div>
  );
}
