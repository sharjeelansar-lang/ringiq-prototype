'use client';

import { X, Check } from 'lucide-react';
import { type S3 } from '@/types/onboard';
import { ObField, ObInput, ObSelect } from '@/components/onboard/ObField/ObField';
import { cn } from '@/lib/utils';

const CURRENT_AFTER_HOURS_OPTIONS = [
  'Office has voicemail',
  'Office has answering service',
  'Office closed, no messaging',
  'Other',
] as const;

const RINGIQ_AFTER_HOURS_OPTIONS = [
  'Iris talks with patients, books or manages appointments, and takes caller information',
  'Text the doctor with urgent calls',
  'Take a message for staff follow-up',
  'Transfer urgent calls only',
  'Other',
] as const;

function HoursRow({
  label, openVal, closeVal, closed, onOpen, onClose, onToggle,
}: {
  label: string; openVal: string; closeVal: string; closed: boolean;
  onOpen: (v: string) => void; onClose: (v: string) => void; onToggle: () => void;
}) {
  return (
    <div className="mb-2.5 grid grid-cols-2 items-end gap-2.5 sm:grid-cols-[110px_1fr_1fr_90px]">
      <span className="col-span-2 pb-0.5 text-[13px] font-semibold text-mid sm:col-span-1 sm:pb-3.5">{label}</span>
      <div className={cn('flex min-h-[52px] items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3.5 transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,73,147,0.1)]', closed && 'pointer-events-none opacity-30')}>
        <input
          type="time" value={openVal} onChange={(e) => onOpen(e.target.value)} disabled={closed}
          className="h-[50px] min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-[15px] text-foreground outline-none"
        />
      </div>
      <div className={cn('flex min-h-[52px] items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3.5 transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,73,147,0.1)]', closed && 'pointer-events-none opacity-30')}>
        <input
          type="time" value={closeVal} onChange={(e) => onClose(e.target.value)} disabled={closed}
          className="h-[50px] min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-[15px] text-foreground outline-none"
        />
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'col-span-2 flex min-h-[52px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-[1.5px] text-[11px] font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 sm:col-span-1',
          closed
            ? 'border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626] focus-visible:ring-[#DC2626]/15'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700 focus-visible:ring-emerald-600/15'
        )}
      >
        {closed ? <><X size={11} /> Closed</> : <><Check size={11} /> Open</>}
      </button>
    </div>
  );
}

export function Step3Form({
  data, onChange, errors,
}: {
  data: S3; onChange: (d: S3) => void; errors: Record<string, string>;
}) {
  const u = (k: keyof S3) => (v: string) => onChange({ ...data, [k]: v });
  const weekdays: {
    label: string;
    openKey: keyof S3;
    closeKey: keyof S3;
    closedKey: keyof S3;
  }[] = [
    { label: 'Monday',    openKey: 'mondayOpen',    closeKey: 'mondayClose',    closedKey: 'mondayClosed' },
    { label: 'Tuesday',   openKey: 'tuesdayOpen',   closeKey: 'tuesdayClose',   closedKey: 'tuesdayClosed' },
    { label: 'Wednesday', openKey: 'wednesdayOpen', closeKey: 'wednesdayClose', closedKey: 'wednesdayClosed' },
    { label: 'Thursday',  openKey: 'thursdayOpen',  closeKey: 'thursdayClose',  closedKey: 'thursdayClosed' },
    { label: 'Friday',    openKey: 'fridayOpen',    closeKey: 'fridayClose',    closedKey: 'fridayClosed' },
  ];
  return (
    <div className="flex flex-col gap-3.5">
      <ObField label="Office Greeting" error={errors.officeGreeting}>
        <div className="flex min-h-[92px] items-start gap-2.5 rounded-xl border-[1.5px] border-border bg-input-bg px-3.5 transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-primary focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(39,73,147,0.1)]">
          <textarea
            value={data.officeGreeting}
            onChange={(e) => onChange({ ...data, officeGreeting: e.target.value })}
            placeholder={`"Thank you for calling Valley Eye Associates, this is Iris. How can I help you today?"`}
            className="min-h-[66px] min-w-0 flex-1 resize-y border-0 bg-transparent py-3.5 font-[inherit] text-[15px] leading-relaxed text-foreground outline-none placeholder:text-light"
          />
        </div>
      </ObField>
      <ObField label="Office Location Note (optional)">
        <ObInput value={data.locationNote} onChange={u('locationNote')} placeholder="Suite 200, use the rear entrance off Oak Ave" />
      </ObField>

      <div>
        <label className="mb-[7px] block text-[13px] font-bold text-mid">Office Hours for Phone Answering</label>
        <div className="mb-2 mt-2.5 hidden grid-cols-[110px_1fr_1fr_90px] gap-2.5 sm:grid">
          <span />
          <span className="pl-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-light">Opens</span>
          <span className="pl-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-light">Closes</span>
          <span />
        </div>
        {weekdays.map(({ label, openKey, closeKey, closedKey }) => (
          <HoursRow
            key={label}
            label={label}
            openVal={String(data[openKey])}
            closeVal={String(data[closeKey])}
            closed={Boolean(data[closedKey])}
            onOpen={u(openKey)}
            onClose={u(closeKey)}
            onToggle={() => onChange({ ...data, [closedKey]: !data[closedKey] })}
          />
        ))}
        <HoursRow
          label="Saturday" openVal={data.saturdayOpen} closeVal={data.saturdayClose} closed={data.saturdayClosed}
          onOpen={u('saturdayOpen')} onClose={u('saturdayClose')}
          onToggle={() => onChange({ ...data, saturdayClosed: !data.saturdayClosed })}
        />
        <HoursRow
          label="Sunday" openVal={data.sundayOpen} closeVal={data.sundayClose} closed={data.sundayClosed}
          onOpen={u('sundayOpen')} onClose={u('sundayClose')}
          onToggle={() => onChange({ ...data, sundayClosed: !data.sundayClosed })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ObField label="Current After-Hours Handling *" error={errors.currentAfterHoursPolicy}>
          <ObSelect
            value={data.currentAfterHoursPolicy}
            onChange={u('currentAfterHoursPolicy')}
            options={CURRENT_AFTER_HOURS_OPTIONS}
            placeholder="What happens now?"
            hasError={!!errors.currentAfterHoursPolicy}
          />
        </ObField>
        <ObField label="RingIQ After-Hours Action *" error={errors.ringiqAfterHoursPolicy}>
          <ObSelect
            value={data.ringiqAfterHoursPolicy}
            onChange={u('ringiqAfterHoursPolicy')}
            options={RINGIQ_AFTER_HOURS_OPTIONS}
            placeholder="What should RingIQ do?"
            hasError={!!errors.ringiqAfterHoursPolicy}
          />
        </ObField>
      </div>

      <ObField label="Lunch Break (optional)">
        <ObInput value={data.lunchBreak} onChange={u('lunchBreak')} placeholder="12:00 PM – 1:00 PM" />
      </ObField>
    </div>
  );
}
