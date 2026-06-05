'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { TwilioProvisioningWidget, TwilioProvisionResult } from '@/components/form/TwilioProvisioningWidget';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function ProvisioningSection({ form }: Props) {
  const { watch, setValue } = form;
  const practiceName  = watch('practiceDisplayName');
  const failoverNumber = watch('officeLine2');

  const handleProvisioned = (result: TwilioProvisionResult) => {
    const digits = result.purchasedNumber.phoneNumber.replace(/\D/g, '').slice(-10);
    const sid    = result.subAccount?.sid ?? '';
    const token  = result.subAccount?.authToken ?? '';

    setValue('inboundPhone',             digits, { shouldValidate: true });
    setValue('twilioSid',                result.purchasedNumber.sid, { shouldValidate: true });
    setValue('twilioSubAccountSid',      sid,    { shouldValidate: false });
    setValue('twilioSubAccountToken',    token,  { shouldValidate: false });
    setValue('vapiAssistantPhoneNumber', digits, { shouldValidate: false });

    // Persist to localStorage so the VAPI step can read it even if watch() misses the update
    try {
      localStorage.setItem('ringiq_twilio_creds', JSON.stringify({
        subAccountSid:   sid,
        subAccountToken: token,
        inboundPhone:    digits,
        twilioSid:       result.purchasedNumber.sid,
      }));
    } catch { /* storage not available */ }
  };

  return (
    <div className="w-full">
      <TwilioProvisioningWidget
        practiceName={practiceName}
        failoverNumber={failoverNumber}
        onProvisioned={handleProvisioned}
        onSkip={() => {}}
      />
      <p className="mt-3 text-xs text-slate-600">
        After purchasing, continue to the <span className="text-slate-400">VAPI</span> step to deploy the AI assistant.
      </p>
    </div>
  );
}
