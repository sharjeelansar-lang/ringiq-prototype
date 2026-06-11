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
    const twilioDigits = result.twilioNumber.phoneNumber.replace(/\D/g, '').slice(-10);
    const vapiDigits   = result.vapiNumber.phoneNumber.replace(/\D/g, '').slice(-10);
    const sid          = result.subAccount?.sid ?? '';
    const token        = result.subAccount?.authToken ?? '';

    // inboundPhone = main routing number (office forwards their public # here)
    setValue('inboundPhone',             twilioDigits, { shouldValidate: true });
    setValue('twilioSid',                result.twilioNumber.sid, { shouldValidate: false });
    setValue('twilioSubAccountSid',      sid,   { shouldValidate: false });
    setValue('twilioSubAccountToken',    token, { shouldValidate: false });
    // vapiAssistantPhoneNumber = AI agent line (imported into VAPI in the next step)
    setValue('vapiAssistantPhoneNumber', vapiDigits, { shouldValidate: false });

    try {
      localStorage.setItem('ringiq_twilio_creds', JSON.stringify({
        subAccountSid:   sid,
        subAccountToken: token,
        inboundPhone:    twilioDigits,
        twilioSid:       result.twilioNumber.sid,
        vapiPhone:       vapiDigits,
        vapiNumberSid:   result.vapiNumber.sid,
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
