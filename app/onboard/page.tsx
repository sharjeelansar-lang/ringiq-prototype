'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight, ArrowLeft, Check, Loader2, CheckCircle2,
  ChevronDown, Clock, Calendar, PhoneCall, Zap, DollarSign, Shield, X,
} from 'lucide-react';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BRAND      = '#274993';
const BRAND_DARK = '#1D3870';
const BRAND_SOFT = '#EEF4FF';
const BRAND_LINE = '#D8E5FF';
const TEAL       = '#0D9488';

const T = {
  bg:      '#F7F6F3',
  surface: '#FFFFFF',
  border:  '#E2E8F0',
  navy:    '#0F172A',
  mid:     '#334155',
  muted:   '#64748B',
  light:   '#94A3B8',
  inputBg: '#F8FAFC',
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  /* ── Shell ── */
  .ob-shell {
    display: grid;
    grid-template-columns: 420px 1fr;
    min-height: 100dvh;
  }

  /* ── Left panel ── */
  .ob-left {
    position: sticky;
    top: 0;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 36px 36px 30px;
    background: linear-gradient(145deg, #274993 0%, #1D3870 52%, #0F172A 100%);
    color: #fff;
    isolation: isolate;
    overflow: hidden;
  }
  .ob-left::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.2));
    z-index: -1;
  }
  .ob-left-glow-a {
    position: absolute; top: -120px; right: -100px;
    width: 340px; height: 340px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,135,219,0.22), transparent 65%);
    pointer-events: none; z-index: -1;
  }
  .ob-left-glow-b {
    position: absolute; bottom: -60px; left: -80px;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(13,148,136,0.15), transparent 65%);
    pointer-events: none; z-index: -1;
  }

  .ob-logo-plate {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 8px 12px;
    border-radius: 11px;
    background: rgba(255,255,255,0.95);
    box-shadow: 0 8px 24px rgba(15,23,42,0.18);
    margin-bottom: 32px;
  }

  .ob-left-body { flex: 1; display: flex; flex-direction: column; min-height: 0; }

  .ob-kicker {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 11px; border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.09);
    color: rgba(255,255,255,0.78);
    font-size: 12px; font-weight: 600; margin-bottom: 14px;
  }
  .ob-left-title {
    margin: 0 0 10px;
    font-size: 24px; line-height: 1.18; font-weight: 800;
    letter-spacing: -0.03em; color: #fff;
  }
  .ob-left-sub {
    margin: 0 0 24px;
    font-size: 13px; line-height: 1.65;
    color: rgba(255,255,255,0.56);
  }

  .ob-benefits { display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }
  .ob-benefit  { display: flex; align-items: center; gap: 11px; }
  .ob-benefit-icon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    background: rgba(13,148,136,0.12);
    border: 1px solid rgba(13,148,136,0.22);
    display: flex; align-items: center; justify-content: center;
  }
  .ob-benefit-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.4; }

  /* Live call */
  .ob-call {
    border-radius: 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 15px 17px;
    margin-bottom: 24px;
  }
  .ob-call-header { display: flex; align-items: center; gap: 7px; margin-bottom: 11px; }
  .ob-call-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #10B981; box-shadow: 0 0 8px rgba(16,185,129,0.6);
  }
  .ob-call-lbl {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,0.36);
    letter-spacing: 0.07em; text-transform: uppercase;
  }
  .ob-bubble-p {
    background: rgba(255,255,255,0.08); border-radius: 8px;
    padding: 7px 11px; font-size: 12px;
    color: rgba(255,255,255,0.62); line-height: 1.4; margin-bottom: 7px;
  }
  .ob-bubble-i {
    background: rgba(13,148,136,0.12);
    border: 1px solid rgba(13,148,136,0.22);
    border-radius: 8px; padding: 7px 11px;
    font-size: 12px; color: rgba(255,255,255,0.85);
    line-height: 1.4; margin-bottom: 8px;
  }
  .ob-call-confirm { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #10B981; }

  /* Step timeline */
  .ob-timeline { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; }
  .ob-tl-hd {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: rgba(255,255,255,0.24); margin-bottom: 13px;
  }
  .ob-tl-list { display: flex; flex-direction: column; gap: 0; }
  .ob-tl-row  { display: flex; align-items: flex-start; gap: 12px; position: relative; }
  .ob-tl-row:not(:last-child)::after {
    content: "";
    position: absolute; left: 10px; top: 22px;
    width: 1px; height: calc(100% + 2px);
    background: rgba(255,255,255,0.1);
  }
  .ob-tl-row.done::after  { background: rgba(13,148,136,0.35); }

  .ob-tl-node {
    width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #fff; margin-bottom: 14px;
    transition: all 0.25s ease;
  }
  .ob-tl-node.done    { background: ${TEAL}; box-shadow: 0 0 0 3px rgba(13,148,136,0.2); }
  .ob-tl-node.active  { background: ${BRAND}; box-shadow: 0 0 0 4px rgba(39,73,147,0.25); }
  .ob-tl-node.pending { background: transparent; border: 1.5px solid rgba(255,255,255,0.16); color: rgba(255,255,255,0.32); }

  .ob-tl-txt { font-size: 12px; padding-top: 4px; line-height: 1.3; transition: color 0.25s ease; }
  .ob-tl-txt.done    { color: rgba(255,255,255,0.38); }
  .ob-tl-txt.active  { color: rgba(255,255,255,0.92); font-weight: 600; }
  .ob-tl-txt.pending { color: rgba(255,255,255,0.2); }

  /* ── Right panel ── */
  .ob-right {
    display: flex; align-items: flex-start; justify-content: center;
    min-height: 100dvh; padding: 60px 48px;
    background:
      radial-gradient(circle at 100% 0%, rgba(39,73,147,0.06), transparent 36%),
      #FFFFFF;
  }
  .ob-form-content { width: 100%; max-width: 520px; padding-top: 4px; }

  .ob-mobile-logo { display: none; margin-bottom: 28px; }

  /* Progress bar */
  .ob-prog-track {
    height: 3px; border-radius: 999px;
    background: ${T.border}; margin-bottom: 36px; overflow: hidden;
  }
  .ob-prog-fill {
    height: 100%; border-radius: 999px;
    background: linear-gradient(90deg, ${BRAND}, #4F7AE8);
    transition: width 0.45s ease;
  }

  /* Plan chip */
  .ob-plan-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px;
    background: ${BRAND_SOFT}; border: 1.5px solid ${BRAND_LINE};
    margin-bottom: 24px;
    animation: ob-rise 0.3s ease both;
  }
  .ob-plan-chip-txt  { flex: 1; font-size: 13px; color: ${T.navy}; }
  .ob-plan-chip-txt strong { color: ${BRAND}; font-weight: 700; }
  .ob-plan-chip-chg {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; color: ${T.light}; text-decoration: none;
    padding: 4px 8px; border-radius: 6px; transition: background 0.15s;
  }
  .ob-plan-chip-chg:hover { background: rgba(0,0,0,0.05); }

  /* Step header */
  .ob-step-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 11px; border-radius: 999px;
    background: ${BRAND_SOFT}; border: 1px solid ${BRAND_LINE};
    color: ${BRAND}; font-size: 12px; font-weight: 700;
    margin-bottom: 14px;
  }
  .ob-step-heading {
    margin: 0; font-size: clamp(26px, 3vw, 32px); font-weight: 800;
    color: ${T.navy}; line-height: 1.1; letter-spacing: -0.03em;
  }
  .ob-step-sub {
    margin: 10px 0 28px; font-size: 14px;
    color: ${T.muted}; line-height: 1.6;
  }

  /* Fields */
  .ob-fields { display: flex; flex-direction: column; gap: 18px; animation: ob-rise 0.35s ease both; }
  .ob-row-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ob-row-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }

  .ob-label { display: block; font-size: 13px; font-weight: 700; color: ${T.mid}; margin-bottom: 7px; }
  .ob-field-err { margin-top: 5px; font-size: 12px; color: #DC2626; font-weight: 500; }

  .ob-frame {
    min-height: 52px; display: flex; align-items: center;
    gap: 10px; padding: 0 14px;
    border: 1.5px solid ${T.border};
    border-radius: 12px; background: ${T.inputBg};
    transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  }
  .ob-frame:focus-within {
    border-color: ${BRAND}; background: #fff;
    box-shadow: 0 0 0 4px rgba(39,73,147,0.1);
  }
  .ob-frame.err  { border-color: #EF4444; }
  .ob-frame.err:focus-within { border-color: #EF4444; box-shadow: 0 0 0 4px rgba(239,68,68,0.1); }
  .ob-frame.textarea { align-items: flex-start; min-height: 92px; }

  .ob-input {
    flex: 1; min-width: 0; height: 50px;
    background: transparent; border: none; outline: none;
    font-size: 15px; color: ${T.navy}; font-family: inherit;
  }
  .ob-select {
    flex: 1; min-width: 0; height: 50px;
    background: transparent; border: none; outline: none;
    font-size: 15px; font-family: inherit;
    appearance: none; -webkit-appearance: none; cursor: pointer;
  }
  .ob-textarea {
    flex: 1; min-width: 0;
    background: transparent; border: none; outline: none;
    font-size: 15px; color: ${T.navy}; font-family: inherit;
    resize: vertical; padding: 14px 0; line-height: 1.6; min-height: 66px;
  }

  /* Interest grid */
  .ob-interest-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ob-int-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; border-radius: 12px;
    border: 1.5px solid ${T.border}; background: ${T.inputBg};
    cursor: pointer; font-family: inherit; text-align: left;
    transition: all 0.15s ease;
  }
  .ob-int-btn.on { border-color: ${BRAND}; background: ${BRAND_SOFT}; }
  .ob-int-icon {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: ${T.bg}; transition: background 0.15s;
  }
  .ob-int-btn.on .ob-int-icon { background: ${BRAND}; }
  .ob-int-lbl { font-size: 13px; font-weight: 500; color: ${T.navy}; line-height: 1.3; transition: color 0.15s; }
  .ob-int-btn.on .ob-int-lbl  { color: ${BRAND}; }

  /* Plan selector */
  .ob-plan-list { display: flex; flex-direction: column; gap: 10px; animation: ob-rise 0.35s ease both; }
  .ob-plan-card {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 18px; border-radius: 14px;
    border: 2px solid ${T.border}; background: ${T.inputBg};
    cursor: pointer; font-family: inherit; text-align: left;
    transition: all 0.15s ease;
  }
  .ob-plan-card.on {
    border-color: ${BRAND}; background: ${BRAND_SOFT};
    box-shadow: 0 0 0 4px rgba(39,73,147,0.08);
  }
  .ob-plan-radio {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
    border: 2px solid ${T.border}; background: transparent;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .ob-plan-card.on .ob-plan-radio { border-color: ${BRAND}; background: ${BRAND}; }
  .ob-plan-name { font-size: 14px; font-weight: 700; color: ${T.navy}; transition: color 0.15s; }
  .ob-plan-card.on .ob-plan-name { color: ${BRAND}; }
  .ob-plan-pop {
    font-size: 10px; font-weight: 700; padding: 2px 8px;
    border-radius: 999px; background: ${BRAND}; color: #fff;
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  .ob-plan-price { font-size: 22px; font-weight: 800; color: ${T.navy}; letter-spacing: -0.04em; transition: color 0.15s; }
  .ob-plan-card.on .ob-plan-price { color: ${BRAND}; }
  .ob-plan-note { font-size: 12px; color: ${T.muted}; font-weight: 400; margin-left: 5px; }
  .ob-plan-bullets { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 6px; }
  .ob-plan-bullet { display: flex; align-items: center; gap: 4px; font-size: 11px; color: ${T.muted}; }

  /* Error & nav */
  .ob-submit-err {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px; border-radius: 12px;
    background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.22);
    color: #B91C1C; font-size: 13px; line-height: 1.45;
    margin-top: 16px; animation: ob-rise 0.24s ease both;
  }
  .ob-nav {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 32px; padding-top: 24px; border-top: 1px solid ${T.border};
  }
  .ob-btn-back {
    display: inline-flex; align-items: center; gap: 7px;
    min-height: 48px; padding: 0 18px; border-radius: 12px;
    border: 1.5px solid ${T.border}; background: transparent;
    color: ${T.muted}; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: border-color 0.15s, background 0.15s;
  }
  .ob-btn-back:hover { border-color: ${T.light}; background: ${T.inputBg}; }
  .ob-btn-next {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 52px; padding: 0 28px; border-radius: 14px; border: none;
    background: ${BRAND}; color: #fff;
    font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit;
    box-shadow: 0 16px 34px rgba(39,73,147,0.22); letter-spacing: -0.01em;
    transition: transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
  }
  .ob-btn-next:hover { background: ${BRAND_DARK}; transform: translateY(-1px); box-shadow: 0 20px 42px rgba(39,73,147,0.28); }
  .ob-btn-next:disabled { cursor: not-allowed; opacity: 0.65; transform: none; }

  .ob-footnote { margin-top: 20px; font-size: 12px; color: ${T.light}; text-align: center; line-height: 1.5; }

  /* ── Success screen ── */
  .ob-succ-shell {
    min-height: 100dvh; background: ${T.bg};
    display: flex; align-items: center; justify-content: center;
    padding: 40px 24px; position: relative;
  }
  .ob-succ-dot-bg {
    position: fixed; inset: 0; pointer-events: none;
    background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
    background-size: 26px 26px; opacity: 0.5;
  }
  .ob-succ-glow {
    position: fixed; top: -8%; right: -5%; pointer-events: none;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(39,73,147,0.08), transparent 65%);
    filter: blur(40px);
  }
  .ob-succ-card {
    position: relative; z-index: 10;
    width: min(520px, 100%);
    background: ${T.surface}; border-radius: 24px;
    border: 1px solid rgba(39,73,147,0.12);
    box-shadow: 0 24px 80px rgba(15,23,42,0.1), 0 2px 12px rgba(15,23,42,0.04);
    overflow: hidden; animation: ob-rise 0.5s ease both;
  }
  .ob-succ-banner {
    padding: 28px 32px;
    background: linear-gradient(145deg, #274993 0%, #1D3870 52%, #0F172A 100%);
    display: flex; align-items: center; gap: 18px;
    position: relative; isolation: isolate;
  }
  .ob-succ-banner::before {
    content: "";
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.2));
    z-index: -1;
  }
  .ob-succ-icon {
    width: 54px; height: 54px; border-radius: 15px; flex-shrink: 0;
    background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3);
    display: flex; align-items: center; justify-content: center;
  }
  .ob-succ-banner-title { margin: 0; font-size: 21px; font-weight: 800; color: #fff; letter-spacing: -0.03em; }
  .ob-succ-banner-sub   { margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.58); line-height: 1.4; }
  .ob-succ-body { padding: 28px 32px 32px; }
  .ob-succ-steps { display: flex; flex-direction: column; gap: 13px; margin: 18px 0 26px; }
  .ob-succ-step  { display: flex; align-items: center; gap: 13px; }
  .ob-succ-num {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: ${BRAND};
    background: ${BRAND_SOFT}; border: 1.5px solid ${BRAND_LINE};
  }
  .ob-succ-cta {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 52px; width: 100%; border-radius: 14px;
    background: ${BRAND}; color: #fff; font-size: 15px; font-weight: 800;
    text-decoration: none; box-shadow: 0 16px 34px rgba(39,73,147,0.22);
    transition: transform 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
  }
  .ob-succ-cta:hover { background: ${BRAND_DARK}; transform: translateY(-1px); box-shadow: 0 20px 42px rgba(39,73,147,0.28); }

  /* Animations */
  @keyframes ob-rise {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Responsive */
  @media (max-width: 860px) {
    .ob-shell { grid-template-columns: 1fr; }
    .ob-left  { display: none; }
    .ob-mobile-logo { display: inline-flex; }
    .ob-right { padding: 36px 24px; }
  }
  @media (max-width: 480px) {
    .ob-right { padding: 28px 18px; }
    .ob-row-2, .ob-row-2-1 { grid-template-columns: 1fr; }
    .ob-interest-grid { grid-template-columns: 1fr; }
  }
`;

// ── Plan data ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    slug:     'nights-weekends',
    name:     'Free Nights & Weekends',
    price:    'Free',
    note:     'during covered hours',
    bullets:  ['After-hours + weekend coverage', 'Full appointment scheduling', 'Cancellation & rescheduling', 'Urgent call transfer'],
  },
  {
    slug:     'backup',
    name:     '3-Ring Backup',
    price:    '$1',
    note:     'per AI call · ~180 calls / mo',
    featured: true,
    bullets:  ['All-hours coverage', 'Answers after 3 rings', 'Full EHR scheduling', 'Overflow + failover protection'],
  },
  {
    slug:     'full-service',
    name:     'Full Service',
    price:    '$1',
    note:     'per AI call · ~850 calls / mo',
    bullets:  ['First-ring answer, every call', '~850 AI calls / month', 'Priority transfer routing', 'On-call emergency handling'],
  },
] as const;

type PlanSlug = typeof PLANS[number]['slug'];

function planLabel(slug: string) {
  return PLANS.find((p) => p.slug === slug)?.name ?? slug;
}

// ── Form options ──────────────────────────────────────────────────────────────
const ROLES        = ['Owner / Optometrist', 'Practice Manager', 'Office Manager', 'Front Desk Staff', 'Other'];
const EHR_SYSTEMS  = ['Eyefinity', 'RevolutionEHR', 'Compulink', 'Crystal PM', 'DrChrono', 'Nextech', 'Other / Not sure'];
const LOCATIONS    = ['1 location', '2–3 locations', '4–5 locations', '6+ locations'];
const CALL_VOLUMES = ['Under 200 / month', '200–500 / month', '500–1,000 / month', '1,000+ / month'];
const PHONE_SETUPS = ['Basic landline', 'VoIP / digital phone', 'Answering service', 'Dedicated receptionist'];
const US_STATES    = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const INTEREST_OPTIONS = [
  { id: 'after_hours',     label: 'After-hours coverage',  icon: Clock },
  { id: 'scheduling',      label: 'Appointment booking',   icon: Calendar },
  { id: 'missed_calls',    label: 'Reduce missed calls',   icon: PhoneCall },
  { id: 'ehr_integration', label: 'EHR integration',       icon: Zap },
  { id: 'cost_savings',    label: 'Lower staffing costs',  icon: DollarSign },
  { id: 'availability',    label: '24/7 availability',     icon: Shield },
];

const BENEFITS = [
  { text: 'Iris answers every call, even at 2 am',        icon: PhoneCall },
  { text: 'Schedules directly in your EHR',               icon: Calendar },
  { text: 'Dedicated sub-account — no data mixing',       icon: Shield },
  { text: 'Live in under 48 hours',                       icon: Zap },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type S1 = { practiceName: string; contactName: string; contactRole: string; email: string; phone: string };
type S2 = { city: string; state: string; locationCount: string; ehrSystem: string; monthlyCallVolume: string; currentPhoneSetup: string };
type S3 = { interests: string[]; notes: string };

// ── Field primitives ──────────────────────────────────────────────────────────
function ObField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="ob-label">{label}</label>
      {children}
      {error && <p className="ob-field-err">{error}</p>}
    </div>
  );
}

function ObInput({ value, onChange, placeholder, type = 'text', hasError }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hasError?: boolean;
}) {
  return (
    <div className={`ob-frame${hasError ? ' err' : ''}`}>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="ob-input"
        style={{ WebkitBoxShadow: `0 0 0 1000px ${T.inputBg} inset`, WebkitTextFillColor: T.navy }}
      />
    </div>
  );
}

function ObSelect({ value, onChange, options, placeholder, hasError }: {
  value: string; onChange: (v: string) => void; options: readonly string[] | string[];
  placeholder?: string; hasError?: boolean;
}) {
  return (
    <div className={`ob-frame${hasError ? ' err' : ''}`} style={{ position: 'relative' }}>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="ob-select"
        style={{ color: value ? T.navy : T.light, paddingRight: 32 }}
      >
        {placeholder && <option value="" style={{ color: T.light }}>{placeholder}</option>}
        {options.map((o) => <option key={o} value={o} style={{ color: T.navy }}>{o}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.light, pointerEvents: 'none' }} />
    </div>
  );
}

// ── Plan step ─────────────────────────────────────────────────────────────────
function PlanStep({ selected, onSelect }: { selected: PlanSlug | ''; onSelect: (s: PlanSlug) => void }) {
  return (
    <div className="ob-plan-list">
      {PLANS.map((plan) => {
        const on = selected === plan.slug;
        return (
          <button key={plan.slug} type="button" onClick={() => onSelect(plan.slug)} className={`ob-plan-card${on ? ' on' : ''}`}>
            <div className="ob-plan-radio">
              {on && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="ob-plan-name">{plan.name}</span>
                {'featured' in plan && plan.featured && <span className="ob-plan-pop">Popular</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 7 }}>
                <span className="ob-plan-price">{plan.price}</span>
                <span className="ob-plan-note">{plan.note}</span>
              </div>
              <div className="ob-plan-bullets">
                {plan.bullets.map((b) => (
                  <span key={b} className="ob-plan-bullet">
                    <Check size={10} style={{ color: TEAL }} /> {b}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Form steps ────────────────────────────────────────────────────────────────
function Step1Form({ data, onChange, errors }: { data: S1; onChange: (d: S1) => void; errors: Record<string, string> }) {
  const u = (k: keyof S1) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <div className="ob-fields">
      <ObField label="Practice Name" error={errors.practiceName}>
        <ObInput value={data.practiceName} onChange={u('practiceName')} placeholder="Valley Eye Associates" hasError={!!errors.practiceName} />
      </ObField>
      <div className="ob-row-2">
        <ObField label="Your Name" error={errors.contactName}>
          <ObInput value={data.contactName} onChange={u('contactName')} placeholder="Dr. Sarah Chen" hasError={!!errors.contactName} />
        </ObField>
        <ObField label="Your Role" error={errors.contactRole}>
          <ObSelect value={data.contactRole} onChange={u('contactRole')} options={ROLES} placeholder="Select role" hasError={!!errors.contactRole} />
        </ObField>
      </div>
      <ObField label="Work Email" error={errors.email}>
        <ObInput value={data.email} onChange={u('email')} placeholder="sarah@valleyeye.com" type="email" hasError={!!errors.email} />
      </ObField>
      <ObField label="Practice Phone" error={errors.phone}>
        <ObInput value={data.phone} onChange={u('phone')} placeholder="(208) 552-7323" type="tel" hasError={!!errors.phone} />
      </ObField>
    </div>
  );
}

function Step2Form({ data, onChange, errors }: { data: S2; onChange: (d: S2) => void; errors: Record<string, string> }) {
  const u = (k: keyof S2) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <div className="ob-fields">
      <div className="ob-row-2-1">
        <ObField label="City" error={errors.city}>
          <ObInput value={data.city} onChange={u('city')} placeholder="Boise" hasError={!!errors.city} />
        </ObField>
        <ObField label="State" error={errors.state}>
          <ObSelect value={data.state} onChange={u('state')} options={US_STATES} placeholder="ST" hasError={!!errors.state} />
        </ObField>
      </div>
      <div className="ob-row-2">
        <ObField label="# of Locations" error={errors.locationCount}>
          <ObSelect value={data.locationCount} onChange={u('locationCount')} options={LOCATIONS} placeholder="How many?" hasError={!!errors.locationCount} />
        </ObField>
        <ObField label="EHR System" error={errors.ehrSystem}>
          <ObSelect value={data.ehrSystem} onChange={u('ehrSystem')} options={EHR_SYSTEMS} placeholder="Your EHR" hasError={!!errors.ehrSystem} />
        </ObField>
      </div>
      <ObField label="Monthly Call Volume" error={errors.monthlyCallVolume}>
        <ObSelect value={data.monthlyCallVolume} onChange={u('monthlyCallVolume')} options={CALL_VOLUMES} placeholder="Approx. calls per month?" hasError={!!errors.monthlyCallVolume} />
      </ObField>
      <ObField label="Current Phone Setup" error={errors.currentPhoneSetup}>
        <ObSelect value={data.currentPhoneSetup} onChange={u('currentPhoneSetup')} options={PHONE_SETUPS} placeholder="What are you using today?" hasError={!!errors.currentPhoneSetup} />
      </ObField>
    </div>
  );
}

function Step3Form({ data, toggle, onChange }: { data: S3; toggle: (id: string) => void; onChange: (d: S3) => void }) {
  return (
    <div className="ob-fields">
      <div>
        <label className="ob-label">What matters most to your practice?</label>
        <p style={{ fontSize: 13, color: T.muted, margin: '0 0 12px' }}>Select all that apply</p>
        <div className="ob-interest-grid">
          {INTEREST_OPTIONS.map(({ id, label, icon: Icon }) => {
            const on = data.interests.includes(id);
            return (
              <button key={id} type="button" onClick={() => toggle(id)} className={`ob-int-btn${on ? ' on' : ''}`}>
                <div className="ob-int-icon">
                  <Icon size={13} style={{ color: on ? '#fff' : T.muted }} />
                </div>
                <span className="ob-int-lbl">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <ObField label="Anything else? (optional)">
        <div className="ob-frame textarea">
          <textarea
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            placeholder="Special requirements, questions, or context you'd like us to know…"
            className="ob-textarea"
          />
        </div>
      </ObField>
    </div>
  );
}

// ── Left panel ────────────────────────────────────────────────────────────────
function LeftPanel({ step, hasPlanFromUrl }: { step: number; hasPlanFromUrl: boolean }) {
  const labels = hasPlanFromUrl
    ? ['About your practice', 'Your current setup', 'What matters most']
    : ['Choose your plan', 'About your practice', 'Your current setup', 'What matters most'];

  return (
    <aside className="ob-left" aria-label="RingIQ onboarding">
      <div className="ob-left-glow-a" aria-hidden />
      <div className="ob-left-glow-b" aria-hidden />

      <div className="ob-logo-plate">
        <Image src="/assets/logo.png" alt="RingIQ" width={120} height={34} priority style={{ width: 120, height: 'auto' }} />
      </div>

      <div className="ob-left-body">
        <div className="ob-kicker">
          <PhoneCall size={13} /> AI phone reception for optometry
        </div>
        <h1 className="ob-left-title">Your practice deserves a smarter first impression.</h1>
        <p className="ob-left-sub">Iris handles every inbound call so your team can focus on patients in the room.</p>

        <div className="ob-benefits">
          {BENEFITS.map(({ text, icon: Icon }) => (
            <div key={text} className="ob-benefit">
              <div className="ob-benefit-icon"><Icon size={13} style={{ color: TEAL }} /></div>
              <span className="ob-benefit-text">{text}</span>
            </div>
          ))}
        </div>

        <div className="ob-call">
          <div className="ob-call-header">
            <span className="ob-call-dot" />
            <span className="ob-call-lbl">Iris · Live Call</span>
          </div>
          <div className="ob-bubble-p">&ldquo;Hi, I&rsquo;d like to book a follow-up for next week…&rdquo;</div>
          <div className="ob-bubble-i">
            <span style={{ color: TEAL, fontWeight: 700 }}>Iris: </span>
            &ldquo;Of course! I have Tuesday at 2:30 pm available…&rdquo;
          </div>
          <div className="ob-call-confirm">
            <CheckCircle2 size={11} />
            <span>Appointment booked · EHR updated</span>
          </div>
        </div>
      </div>

      <div className="ob-timeline">
        <p className="ob-tl-hd">Your progress</p>
        <div className="ob-tl-list">
          {labels.map((label, i) => {
            const n      = i + 1;
            const done   = n < step;
            const active = n === step;
            const state  = done ? 'done' : active ? 'active' : 'pending';
            return (
              <div key={label} className={`ob-tl-row ${state}`}>
                <div className={`ob-tl-node ${state}`}>
                  {done ? <Check size={10} strokeWidth={3} /> : n}
                </div>
                <span className={`ob-tl-txt ${state}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ practiceName, plan }: { practiceName: string; plan: string }) {
  return (
    <div className="ob-succ-shell">
      <div className="ob-succ-dot-bg" aria-hidden />
      <div className="ob-succ-glow" aria-hidden />
      <div className="ob-succ-card">
        <div className="ob-succ-banner">
          <div className="ob-succ-icon">
            <CheckCircle2 size={26} style={{ color: '#10B981' }} />
          </div>
          <div>
            <h1 className="ob-succ-banner-title">You&rsquo;re on the list!</h1>
            <p className="ob-succ-banner-sub">Application received — we&rsquo;ll be in touch within 1–2 business days.</p>
          </div>
        </div>
        <div className="ob-succ-body">
          <p style={{ fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.65 }}>
            We received your request for{' '}
            <strong style={{ color: T.navy }}>{practiceName}</strong>.
            {plan && (
              <> Selected plan: <strong style={{ color: BRAND }}>{planLabel(plan)}</strong>.</>
            )}
          </p>
          <div className="ob-succ-steps">
            {[
              'Application review (24–48 hrs)',
              'Onboarding call scheduled',
              'Iris goes live for your practice',
            ].map((text, i) => (
              <div key={text} className="ob-succ-step">
                <div className="ob-succ-num">{i + 1}</div>
                <span style={{ fontSize: 13, color: T.muted }}>{text}</span>
              </div>
            ))}
          </div>
          <a href="/" className="ob-succ-cta">
            <CheckCircle2 size={16} /> Done — back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Step meta ─────────────────────────────────────────────────────────────────
const META_WITH_PLAN = [
  { title: 'Choose your plan',    sub: 'Select the coverage that fits your practice' },
  { title: 'About your practice', sub: 'Tell us who you are and how to reach you' },
  { title: 'Your current setup',  sub: 'Help us understand your practice better' },
  { title: 'What matters most',   sub: 'Select everything you want Iris to handle' },
];
const META_NO_PLAN = [
  { title: 'About your practice', sub: 'Tell us who you are and how to reach you' },
  { title: 'Your current setup',  sub: 'Help us understand your practice better' },
  { title: 'What matters most',   sub: 'Select everything you want Iris to handle' },
];

// ── Inner component ───────────────────────────────────────────────────────────
function OnboardContent() {
  const searchParams   = useSearchParams();
  const urlPlanRaw     = searchParams.get('plan') ?? '';
  const validSlugs     = PLANS.map((p) => p.slug) as string[];
  const urlPlan        = validSlugs.includes(urlPlanRaw) ? (urlPlanRaw as PlanSlug) : '';
  const hasPlanFromUrl = !!urlPlan;

  const totalSteps = hasPlanFromUrl ? 3 : 4;
  const [step,        setStep]        = useState(1);
  const [plan,        setPlan]        = useState<PlanSlug | ''>(urlPlan);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const [s1, setS1] = useState<S1>({ practiceName: '', contactName: '', contactRole: '', email: '', phone: '' });
  const [s2, setS2] = useState<S2>({ city: '', state: '', locationCount: '', ehrSystem: '', monthlyCallVolume: '', currentPhoneSetup: '' });
  const [s3, setS3] = useState<S3>({ interests: [], notes: '' });

  const practiceStep = hasPlanFromUrl ? 1 : 2;
  const setupStep    = hasPlanFromUrl ? 2 : 3;
  const goalsStep    = hasPlanFromUrl ? 3 : 4;
  const planStep     = hasPlanFromUrl ? null : 1;

  const meta = hasPlanFromUrl ? META_NO_PLAN : META_WITH_PLAN;

  const validatePractice = () => {
    const e: Record<string, string> = {};
    if (s1.practiceName.trim().length < 2)              e.practiceName = 'Practice name is required';
    if (!s1.contactName.trim())                         e.contactName  = 'Your name is required';
    if (!s1.contactRole)                                e.contactRole  = 'Please select your role';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s1.email))  e.email        = 'Enter a valid email address';
    if (!/^\d{10}$/.test(s1.phone.replace(/\D/g, ''))) e.phone        = 'Enter a valid 10-digit phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSetup = () => {
    const e: Record<string, string> = {};
    if (!s2.city.trim())       e.city              = 'City is required';
    if (!s2.state)             e.state             = 'State is required';
    if (!s2.locationCount)     e.locationCount     = 'Required';
    if (!s2.ehrSystem)         e.ehrSystem         = 'Required';
    if (!s2.monthlyCallVolume) e.monthlyCallVolume = 'Required';
    if (!s2.currentPhoneSetup) e.currentPhoneSetup = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (planStep !== null && step === planStep && !plan) {
      setErrors({ plan: 'Please select a plan to continue' });
      return;
    }
    if (step === practiceStep && !validatePractice()) return;
    if (step === setupStep    && !validateSetup())    return;
    setErrors({});
    setStep((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => { setErrors({}); setStep((n) => n - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/queue', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...s1, ...s2, interests: s3.interests, notes: s3.notes, plan: plan || '', phone: s1.phone.replace(/\D/g, '') }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleInterest = (id: string) =>
    setS3((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));

  const progressPct = Math.round((step / totalSteps) * 100);

  return (
    <>
      <style>{CSS}</style>
      {submitted ? (
        <SuccessScreen practiceName={s1.practiceName} plan={plan} />
      ) : null}
      {submitted ? null : <div className="ob-shell">
        <LeftPanel step={step} hasPlanFromUrl={hasPlanFromUrl} />

        <div className="ob-right">
          <div className="ob-form-content">

            {/* Mobile logo */}
            <div className="ob-mobile-logo">
              <Image src="/assets/logo.png" alt="RingIQ" width={120} height={34} priority style={{ width: 120, height: 'auto' }} />
            </div>

            {/* Progress bar */}
            <div className="ob-prog-track">
              <div className="ob-prog-fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Plan chip */}
            {hasPlanFromUrl && (
              <div className="ob-plan-chip">
                <Check size={14} style={{ color: BRAND, flexShrink: 0 }} />
                <span className="ob-plan-chip-txt">
                  <strong>{planLabel(urlPlan)}</strong> selected
                </span>
                <a href="/onboard" className="ob-plan-chip-chg">
                  <X size={11} /> Change
                </a>
              </div>
            )}

            {/* Step header */}
            <div key={`header-${step}`} style={{ animation: 'ob-rise 0.3s ease both' }}>
              <div className="ob-step-pill">
                Step {step} of {totalSteps}
              </div>
              <h2 className="ob-step-heading">{meta[step - 1].title}</h2>
              <p className="ob-step-sub">{meta[step - 1].sub}</p>
            </div>

            {/* Form body */}
            <div key={`body-${step}`}>
              {planStep !== null && step === planStep && (
                <>
                  <PlanStep selected={plan} onSelect={(s) => { setPlan(s); setErrors({}); }} />
                  {errors.plan && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 12, fontWeight: 500 }}>{errors.plan}</p>}
                </>
              )}
              {step === practiceStep && <Step1Form data={s1} onChange={setS1} errors={errors} />}
              {step === setupStep    && <Step2Form data={s2} onChange={setS2} errors={errors} />}
              {step === goalsStep    && <Step3Form data={s3} toggle={toggleInterest} onChange={setS3} />}
            </div>

            {submitError && (
              <div className="ob-submit-err">{submitError}</div>
            )}

            {/* Navigation */}
            <div className="ob-nav">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="ob-btn-back">
                  <ArrowLeft size={15} /> Back
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={step < totalSteps ? handleNext : handleSubmit}
                disabled={submitting}
                className="ob-btn-next"
              >
                {submitting ? (
                  <><Loader2 size={15} style={{ animation: 'ob-spin 1s linear infinite' }} /> Submitting…</>
                ) : step < totalSteps ? (
                  <>Continue <ArrowRight size={15} /></>
                ) : (
                  <>Request Access <ArrowRight size={15} /></>
                )}
              </button>
            </div>

            <p className="ob-footnote">
              We review every application personally. Your data is never shared.
            </p>
          </div>
        </div>
      </div>}
    </>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function OnboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={24} style={{ color: BRAND, animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <OnboardContent />
    </Suspense>
  );
}
