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

      {/* Tracking numbers */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <FormField
          label="Inbound Tracking Number"
          required
          error={errors.inboundPhone?.message}
          hint="Main RingIQ tracking line"
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
          hint="VAPI line (answers on 4th ring)"
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
          hint="Office public number shown to callers"
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
          hint="E.164 — forwarded after ring threshold"
        >
          <Input
            {...register('failoverTransferNumber')}
            placeholder="+15869916560"
            error={!!errors.failoverTransferNumber}
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

      <SubHeader label="Department Routing" />

      <div className="grid grid-cols-3 gap-x-5 gap-y-4">
        <FormField
          label="Billing Dept. Number"
          hint="Direct billing line"
        >
          <Input
            {...register('billingDeptPhone')}
            placeholder="+12485550100"
            className="font-mono"
          />
        </FormField>

        <FormField
          label="Medical Records Number"
          hint="Records requests line"
        >
          <Input
            {...register('medicalDeptPhone')}
            placeholder="+12485550101"
            className="font-mono"
          />
        </FormField>

        <FormField
          label="Other Dept. Number"
          hint="Additional routing"
        >
          <Input
            {...register('otherDeptPhone')}
            placeholder="+12485550102"
            className="font-mono"
          />
        </FormField>
      </div>

    </div>
  );
}
