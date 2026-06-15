import { Clock, Calendar, PhoneCall, Zap, DollarSign, Shield } from 'lucide-react';

// ── Plans ─────────────────────────────────────────────────────────────────────
export const PLANS = [
  {
    slug:    'nights-weekends',
    name:    'Free Nights & Weekends',
    price:   'Free',
    note:    'outside of office hours',
    bullets: ['After-hours + weekend coverage', 'Full appointment scheduling', 'Cancellation & rescheduling', 'Urgent call transfer'],
  },
  {
    slug:     'backup',
    name:     '3-Ring Backup',
    price:    '$1.50',
    note:     'per AI conversation call* · ~180 calls / mo',
    featured: true,
    subtitle: 'including Free nights & weekends',
    bullets:  ['All-hours coverage', 'Answers after 3 rings', 'Full EHR scheduling', 'Overflow + failover protection'],
  },
  {
    slug:    'full-service',
    name:    'Full Service',
    price:   '$1',
    note:    'per AI call · ~850 calls / mo',
    bullets: ['First-ring answer, every call', '~850 AI calls / month', 'Priority transfer routing', 'On-call emergency handling'],
  },
] as const;

export type PlanSlug = typeof PLANS[number]['slug'];

export function planLabel(slug: string): string {
  return PLANS.find((p) => p.slug === slug)?.name ?? slug;
}

// ── Voices ────────────────────────────────────────────────────────────────────
export const VOICES = [
  { id: 'savannah', vapiId: 'Savannah',  name: 'Savannah', tone: 'Warm & Natural',          desc: 'Southern American — friendly and approachable', sample: '/voices/savannah.wav' },
  { id: 'elliot',   vapiId: 'Elliot',    name: 'Elliot',   tone: 'Friendly & Professional', desc: 'Canadian accent — soothing and trustworthy',    sample: '/voices/elliot.wav' },
  { id: 'clara',    vapiId: 'Clara New', name: 'Clara',    tone: 'Warm & Professional',     desc: 'American — warm, clear and conversational',     sample: '/voices/clara.wav' },
  { id: 'kai',      vapiId: 'Kai New',   name: 'Kai',      tone: 'Relaxed & Approachable',  desc: 'American — friendly, smooth and laid-back',     sample: '/voices/kai.wav' },
];

export function vapiVoiceId(slug: string): string {
  return VOICES.find((v) => v.id === slug)?.vapiId ?? slug;
}

// ── Form options ──────────────────────────────────────────────────────────────
export const US_TIMEZONES: { value: string; label: string }[] = [
  { value: 'America/New_York',    label: 'Eastern Time (ET)'       },
  { value: 'America/Chicago',     label: 'Central Time (CT)'       },
  { value: 'America/Denver',      label: 'Mountain Time (MT)'      },
  { value: 'America/Phoenix',     label: 'Mountain Time – Arizona' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)'       },
  { value: 'America/Anchorage',   label: 'Alaska Time (AKT)'       },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time (HT)'        },
];

export const PHONE_PROVIDERS = [
  'AT&T', 'Comcast / Xfinity', 'Spectrum', 'Vonage', 'RingCentral',
  '8x8', 'Nextiva', 'Google Voice', 'Grasshopper', 'Ooma', 'Other',
];

export const AFTER_HOURS_POLICIES = [
  'Iris takes a message',
  'Transfer to on-call doctor',
  'Play voicemail greeting only',
  'Iris answers 24 / 7 (full AI coverage)',
];

export const CALL_VOLUMES = [
  'Under 200 / month', '200–500 / month', '500–1,000 / month', '1,000+ / month',
];

export const PHONE_SETUPS = [
  'Basic landline', 'VoIP / digital phone', 'Answering service', 'Other',
];

export const PHONE_PROVIDERS_LIST = PHONE_PROVIDERS;

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

// ── Interest & benefit options ────────────────────────────────────────────────
export const INTEREST_OPTIONS = [
  { id: 'after_hours',     label: 'After-hours coverage', icon: Clock },
  { id: 'scheduling',      label: 'Appointment booking',  icon: Calendar },
  { id: 'missed_calls',    label: 'Reduce missed calls',  icon: PhoneCall },
  { id: 'ehr_integration', label: 'EHR integration',      icon: Zap },
  { id: 'cost_savings',    label: 'Lower staffing costs', icon: DollarSign },
  { id: 'availability',    label: '24/7 availability',    icon: Shield },
];

export const BENEFITS = [
  { text: 'Iris answers every call, even at 2 am',  icon: PhoneCall },
  { text: 'Schedules directly in your EHR',          icon: Calendar },
  { text: 'Dedicated sub-account — no data mixing',  icon: Shield },
  { text: 'Live in under 48 hours',                  icon: Zap },
];

// ── Step metadata ─────────────────────────────────────────────────────────────
export const META_WITH_PLAN = [
  { title: 'Meet Iris first',          sub: "Preview Iris's voice and tell us what matters most before choosing coverage." },
  { title: 'Choose the plan you might want to start with', sub: "We'll build a test agent you can talk with and customize. When you're comfortable, you can start with your chosen plan." },
  { title: 'About your practice',     sub: 'Tell us who you are and how to reach you' },
  { title: 'Your current setup',      sub: 'Help us understand your practice and phone system' },
  { title: 'Office hours & greeting', sub: 'Configure how Iris will represent your practice' },
];

export const META_NO_PLAN = [
  { title: 'Meet Iris first',          sub: "Preview Iris's voice and tell us what matters most before setup." },
  { title: 'About your practice',     sub: 'Tell us who you are and how to reach you' },
  { title: 'Your current setup',      sub: 'Help us understand your practice and phone system' },
  { title: 'Office hours & greeting', sub: 'Configure how Iris will represent your practice' },
];
