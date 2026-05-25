'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { FormField, Input } from '@/components/ui/FormField';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function TelephonySection({ form }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      <FormField
        label="Inbound Tracking Number"
        required
        error={errors.inboundPhone?.message}
        hint="10-digit number — the RingIQ tracking line assigned to this practice"
      >
        <Input
          {...register('inboundPhone')}
          placeholder="5866363334"
          error={!!errors.inboundPhone}
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Public Transfer Number"
        error={errors.publicNumber?.message}
        hint="Real office landline — calls are forwarded here"
      >
        <Input
          {...register('publicNumber')}
          placeholder="+12085527323"
          error={!!errors.publicNumber}
          className="font-mono"
        />
      </FormField>
    </div>
  );
}
