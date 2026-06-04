'use client';

import { X, Check } from 'lucide-react';
import { type S3 } from '@/types/onboard';
import { AFTER_HOURS_POLICIES } from '@/lib/onboard';
import { ObField, ObInput, ObSelect } from '@/components/onboard/ObField/ObField';

function HoursRow({
  label, openVal, closeVal, closed, onOpen, onClose, onToggle,
}: {
  label: string; openVal: string; closeVal: string; closed: boolean;
  onOpen: (v: string) => void; onClose: (v: string) => void; onToggle: () => void;
}) {
  return (
    <div className="ob-hours-row">
      <span className="ob-hours-day-lbl">{label}</span>
      <div className={`ob-frame${closed ? ' dimmed' : ''}`}>
        <input
          type="time" value={openVal} onChange={(e) => onOpen(e.target.value)} disabled={closed}
          className="ob-input" style={{ WebkitTextFillColor: 'var(--foreground)' }}
        />
      </div>
      <div className={`ob-frame${closed ? ' dimmed' : ''}`}>
        <input
          type="time" value={closeVal} onChange={(e) => onClose(e.target.value)} disabled={closed}
          className="ob-input" style={{ WebkitTextFillColor: 'var(--foreground)' }}
        />
      </div>
      <button type="button" onClick={onToggle} className={`ob-day-closed-btn${closed ? ' closed' : ''}`}>
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
  return (
    <div className="ob-fields">
      <ObField label="Office Greeting" error={errors.officeGreeting}>
        <div className="ob-frame textarea">
          <textarea
            value={data.officeGreeting}
            onChange={(e) => onChange({ ...data, officeGreeting: e.target.value })}
            placeholder={`"Thank you for calling Valley Eye Associates, this is Iris. How can I help you today?"`}
            className="ob-textarea"
          />
        </div>
      </ObField>
      <ObField label="Office Location Note (optional)">
        <ObInput value={data.locationNote} onChange={u('locationNote')} placeholder="Suite 200, use the rear entrance off Oak Ave" />
      </ObField>

      <div>
        <label className="ob-label">Office Hours for Phone Answering</label>
        <div className="ob-hours-hdr" style={{ marginTop: 10 }}>
          <span />
          <span className="ob-hours-hdr-lbl">Opens</span>
          <span className="ob-hours-hdr-lbl">Closes</span>
          <span />
        </div>
        <HoursRow
          label="Mon – Fri" openVal={data.mondayFridayOpen} closeVal={data.mondayFridayClose} closed={false}
          onOpen={u('mondayFridayOpen')} onClose={u('mondayFridayClose')} onToggle={() => {}}
        />
        <HoursRow
          label="Saturday" openVal={data.saturdayOpen} closeVal={data.saturdayClose} closed={data.saturdayClosed}
          onOpen={u('saturdayOpen')} onClose={u('saturdayClose')}
          onToggle={() => onChange({ ...data, saturdayClosed: !data.saturdayClosed })}
        />
        <HoursRow
          label="Sunday" openVal="" closeVal="" closed={data.sundayClosed}
          onOpen={() => {}} onClose={() => {}}
          onToggle={() => onChange({ ...data, sundayClosed: !data.sundayClosed })}
        />
      </div>

      <div className="ob-row-2">
        <ObField label="Lunch Break (optional)">
          <ObInput value={data.lunchBreak} onChange={u('lunchBreak')} placeholder="12:00 PM – 1:00 PM" />
        </ObField>
        <ObField label="After-Hours Policy" error={errors.afterHoursPolicy}>
          <ObSelect value={data.afterHoursPolicy} onChange={u('afterHoursPolicy')} options={AFTER_HOURS_POLICIES} placeholder="What happens after close?" hasError={!!errors.afterHoursPolicy} />
        </ObField>
      </div>
    </div>
  );
}
