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
        hint="10-digit Twilio number — the main RingIQ tracking line for this practice"
      >
        <Input
          {...register('inboundPhone')}
          placeholder="2313896122"
          error={!!errors.inboundPhone}
          className="font-mono"
        />
      </FormField>

      <FormField
        label="VAPI AI Assistant Number"
        error={errors.vapiAssistantPhoneNumber?.message}
        hint="10-digit Twilio number — the line VAPI answers on the 4th ring"
      >
        <Input
          {...register('vapiAssistantPhoneNumber')}
          placeholder="2313899335"
          error={!!errors.vapiAssistantPhoneNumber}
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Public Transfer Number"
        error={errors.publicNumber?.message}
        hint="Office's main public number — displayed to callers"
      >
        <Input
          {...register('publicNumber')}
          placeholder="+12488792388"
          error={!!errors.publicNumber}
          className="font-mono"
        />
      </FormField>

      <FormField
        label="Failover Transfer Number"
        error={errors.failoverTransferNumber?.message}
        hint="E.164 number calls are forwarded to after the ring threshold (e.g. 2nd office line)"
      >
        <Input
          {...register('failoverTransferNumber')}
          placeholder="+15869916560"
          error={!!errors.failoverTransferNumber}
          className="font-mono"
        />
      </FormField>
    </div>
  );
}
