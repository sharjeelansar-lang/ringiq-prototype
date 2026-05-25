'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { TwilioProvisioningWidget, TwilioProvisionResult } from '@/components/form/TwilioProvisioningWidget';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function ProvisioningSection({ form }: Props) {
  const { watch, setValue } = form;
  const practiceName = watch('practiceDisplayName');

  const handleProvisioned = (result: TwilioProvisionResult) => {
    setValue('inboundPhone',         result.purchasedNumber.phoneNumber,  { shouldValidate: true });
    setValue('twilioSid',            result.purchasedNumber.sid,           { shouldValidate: true });
    setValue('twilioSubAccountSid',  result.subAccount?.sid ?? '',         { shouldValidate: false });
  };

  return (
    <div className="w-full">
      <TwilioProvisioningWidget
        practiceName={practiceName}
        onProvisioned={handleProvisioned}
        onSkip={() => {}}
      />
      <p className="mt-3 text-xs text-slate-600">
        After purchasing, <span className="text-slate-400">Inbound Phone</span> and{' '}
        <span className="text-slate-400">Twilio SID</span> in the next step will be auto-filled.
      </p>
    </div>
  );
}
