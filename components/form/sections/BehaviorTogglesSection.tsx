'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessFormSchema } from '@/lib/schema';
import { Toggle } from '@/components/ui/Toggle';

interface Props { form: UseFormReturn<BusinessFormSchema>; }

export function BehaviorTogglesSection({ form }: Props) {
  const { watch, setValue } = form;

  return (
    <div className="flex flex-col gap-3">
      <Toggle
        checked={watch('recordingDisclosure') ?? false}
        onChange={(v) => setValue('recordingDisclosure', v)}
        label="Recording Disclosure Announcement"
        description="Play a compliance disclosure at the start of every inbound call"
      />
      <Toggle
        checked={watch('allowSameDayBookings') ?? false}
        onChange={(v) => setValue('allowSameDayBookings', v)}
        label="Allow Same-Day Online Bookings"
        description="Permit patients to book appointments for the current calendar day"
      />
      <Toggle
        checked={watch('mandatoryEmailProfile') ?? false}
        onChange={(v) => setValue('mandatoryEmailProfile', v)}
        label="Mandatory Email Profile Requirement"
        description="Require a verified email address to complete appointment scheduling"
      />
    </div>
  );
}
