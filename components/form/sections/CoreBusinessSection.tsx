'use client';

import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { slugifyDisplayName } from '@/lib/utils';
import { FormField, Input } from '@/components/ui/FormField';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function CoreBusinessSection({ form }: Props) {
  const { register, watch, setValue, formState: { errors } } = form;
  const displayName = watch('practiceDisplayName');

  useEffect(() => {
    if (displayName) {
      setValue('corporateCleanName', slugifyDisplayName(displayName), { shouldValidate: true });
    }
  }, [displayName, setValue]);

  return (
    <FormField label="Practice Display Name" required error={errors.practiceDisplayName?.message}>
      <Input
        {...register('practiceDisplayName')}
        placeholder="Primary Eyecare Associates - Sterling Heights"
        error={!!errors.practiceDisplayName}
      />
    </FormField>
  );
}
