import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateMongoId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineId = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  const processId = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const counter   = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return `${timestamp}${machineId}${processId}${counter}`;
}

export function slugifyDisplayName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern Time (ET) — America/New_York' },
  { value: 'America/Chicago',     label: 'Central Time (CT) — America/Chicago' },
  { value: 'America/Denver',      label: 'Mountain Time (MT) — America/Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) — America/Los_Angeles' },
  { value: 'America/Anchorage',   label: 'Alaska Time (AKT) — America/Anchorage' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time (HST) — Pacific/Honolulu' },
  { value: 'US/Central',          label: 'US Central — US/Central' },
  { value: 'US/Eastern',          label: 'US Eastern — US/Eastern' },
  { value: 'US/Mountain',         label: 'US Mountain — US/Mountain' },
  { value: 'US/Pacific',          label: 'US Pacific — US/Pacific' },
];

export const VAPI_TEMPLATES = [
  { value: 'tpl_eyecare_v3',       label: 'Eyecare Standard v3 — Full scheduling + FAQ' },
  { value: 'tpl_eyecare_lite_v2',  label: 'Eyecare Lite v2 — Scheduling only' },
  { value: 'tpl_dental_v2',        label: 'Dental Standard v2 — Full scheduling + FAQ' },
  { value: 'tpl_medical_v1',       label: 'Medical General v1 — Multi-specialty' },
  { value: 'tpl_optometry_pro_v4', label: 'Optometry Pro v4 — Advanced routing' },
];

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export const MOCK_BUSINESSES = [
  {
    id: '1',
    practiceDisplayName: 'Primary Eyecare Associates - Sterling Heights',
    corporateCleanName: 'pea_sterling_heights',
    environmentStatus: 'live_production' as const,
    mongoOfficeId: '6839a2f1c4b8e3d0a7f125bc',
    cpmid: 'CRYSTL-SH-001',
    timezone: 'America/New_York',
    createdAt: '2024-11-14',
    inboundPhone: '',
    twilioSid: '',
  },
];
