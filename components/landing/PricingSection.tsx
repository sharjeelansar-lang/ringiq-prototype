"use client"

import Link from "next/link"
import type { CSSProperties } from "react"
import { Check, Minus } from "lucide-react"
import { SectionLabel } from "./SectionLabel"
import { Reveal } from "./Reveal"

const PLANS = [
  {
    slug:    "nights-weekends",
    name:    "Free Nights & Weekends",
    price:   null,
    freeLabel: "Free",
    note:    "during covered hours",
    tag:     null,
    dark:    false,
    body:    "Iris covers after-hours calls only. Perfect for practices that want an AI buffer outside business hours without changing their daytime flow.",
    bullets: ["After-hours + weekend coverage", "Full appointment scheduling", "Cancellation & rescheduling", "Urgent call transfer"],
    cta:     "Start Free",
  },
  {
    slug:    "backup",
    name:    "3-Ring Backup",
    price:   "1.50",
    note:    "per AI call · ~135 calls / mo",
    tag:     "Most Popular",
    dark:    true,
    body:    "Iris picks up after 3 rings. Your staff answers first; she's the backup. Only pay for the calls your team can't reach.",
    bullets: ["All-hours coverage", "Answers after 3 rings", "Full EHR scheduling access", "Overflow + failover protection"],
    cta:     "Get Started",
  },
  {
    slug:    "full-service",
    name:    "Full Service",
    price:   "1",
    note:    "per AI call · ~900 calls / mo",
    tag:     null,
    dark:    false,
    body:    "Iris answers every inbound call on the first ring, up to 25 concurrent calls. Built for practices that want zero hold time and zero missed calls.",
    bullets: ["First-ring answer, every call", "Max 25 concurrent calls", "Priority transfer routing", "On-call emergency handling"],
    cta:     "Get Started",
  },
]

// ── Comparison table data ─────────────────────────────────────────────────────
// cells: [Free Nights & Weekends, 3-Ring Backup, Full Service]
// true → check, false → dash "—", string → literal value

type Cell = string | boolean
interface Row {
  label:  string
  cells:  [Cell, Cell, Cell]
  sub?:   boolean      // indented child row
  em?:    boolean      // emphasized values (bold)
  good?:  boolean      // render string values in green (revenue rows)
  cost?:  boolean      // render paid values in red (cost row)
}
interface Group { title: string | null; rows: Row[] }

const TABLE: Group[] = [
  {
    title: null,
    rows: [
      { label: "Cost per call",                                    cells: ["Free", "$1.50", "$1.00"], em: true },
      { label: "Estimated calls / month per OD professional",      cells: ["45", "135", "900"] },
      { label: "Spam, 1-800 calls, hang-ups & misdials",           cells: ["No charge", "No charge", "No charge"] },
      { label: "Call transfer to your office on patient request",  cells: [false, true, true] },
    ],
  },
  {
    title: "AI Phone Agent",
    rows: [
      { label: "Urgent call management",                    cells: [true, true, true] },
      { label: "Urgent call text alerts",                   cells: [true, true, true] },
      { label: "New appointments booked into Crystal PMS",  cells: [true, true, true] },
      { label: "Existing appointment management",           cells: [true, true, true] },
      { label: "Confirm existing appointments",             cells: [true, true, true], sub: true },
      { label: "Rescheduling requests",                     cells: [true, true, true], sub: true },
      { label: "Cancellations",                             cells: [true, true, true], sub: true },
      { label: "Glasses-ready calls answered",              cells: [true, true, true] },
      { label: "Other calls — TASK record in PMS",          cells: [true, true, true] },
    ],
  },
  {
    title: "Business Terms",
    rows: [
      { label: "Monthly service, no annual contract",            cells: [true, true, true] },
      { label: "Setup fee",                                      cells: ["None", "None", "None"] },
      { label: "Deposit (refundable)",                           cells: ["None", "$300", "$300"] },
      { label: "Billing — card on file, 10th of following month", cells: [false, true, true] },
      { label: "No change to your public phone number",          cells: [true, true, true] },
      { label: "Works with your existing phone system",          cells: [true, true, true] },
      { label: "Learns your business",                           cells: [true, true, true] },
      { label: "Setup time",                                     cells: ["2 days", "5 days", "5 days"] },
    ],
  },
  {
    title: "Call Analytics",
    rows: [
      { label: "Total phone calls",              cells: [false, true, true] },
      { label: "Appointment requests",           cells: [false, true, true] },
      { label: "Booked",                         cells: [false, true, true], sub: true },
      { label: "Not booked",                     cells: [false, true, true], sub: true },
      { label: "Success ratio",                  cells: [false, true, true], sub: true },
      { label: "Not-booked request analytics",   cells: [false, true, true], sub: true },
      { label: "Other calls",                    cells: [false, true, true] },
      { label: "Issue descriptions",             cells: [false, true, true], sub: true },
      { label: "Call recordings",                cells: [false, true, true] },
      { label: "Call transcripts",               cells: [false, true, true] },
      { label: "Call analytics dashboard",       cells: [false, true, true] },
    ],
  },
  {
    title: "Monthly Results",
    rows: [
      { label: "20% more phone calls answered",                cells: ["45", "125", "180"] },
      { label: "More appointment requests booked / OD",        cells: ["9", "26", "38"] },
      { label: "Incremental revenue (@ $400 APR / exam)",      cells: ["$3,780", "$10,500", "$15,120"], em: true, good: true },
      { label: "Value of staff time saved ($3 / call)",        cells: [false, "$375", "$2,700"], good: true },
      { label: "RingIQ monthly service cost",                  cells: ["Free", "$188", "$900"], em: true, cost: true },
    ],
  },
]

const comparisonGridStyle: CSSProperties = {
  gridTemplateColumns: "minmax(260px, 1.45fr) repeat(3, minmax(150px, 1fr))",
}

function CellValue({ value, row, popular }: { value: Cell; row: Row; popular: boolean }) {
  if (value === true) {
    return (
      <span className={`inline-flex w-[22px] h-[22px] rounded-full items-center justify-center ${popular ? "bg-primary" : "bg-accent"}`}>
        <Check size={13} strokeWidth={2.6} className={popular ? "text-white" : "text-primary"} />
      </span>
    )
  }
  if (value === false) {
    return <Minus size={15} className="text-[#CBD5E1] inline-block" />
  }
  const color = row.cost && value !== "Free"
    ? "text-[#DC2626]"
    : row.good
      ? "text-[#0E9F6E]"
      : "text-foreground"
  return (
    <span className={`text-[13.5px] tabular-nums ${row.em ? "font-bold" : "font-medium"} ${color}`}>
      {value}
    </span>
  )
}

function ComparisonTable() {
  return (
    <div className="lp-cmp-wrap overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <div className="lp-cmp min-w-[860px] rounded-2xl border-[1.5px] border-border bg-white overflow-hidden shadow-[0_18px_60px_rgba(15,23,42,0.06)]">

        {/* Plan header row */}
        <div className="lp-cmp-row grid bg-white border-b-[1.5px] border-border" style={comparisonGridStyle}>
          <div className="px-6 py-4 flex min-h-[118px] flex-col justify-center">
            <span className="font-display text-[15px] font-bold text-foreground tracking-[-0.01em]">Compare plans</span>
            <span className="text-[12px] text-muted-foreground mt-0.5">Per-call pricing. No contracts.</span>
          </div>
          {PLANS.map((p, i) => (
            <div key={p.slug} className={`px-4 py-4 min-h-[118px] text-center flex flex-col items-center justify-center gap-1 ${i === 1 ? "lp-cmp-pop" : ""}`}>
              <span className={`text-[12px] font-bold tracking-[0.02em] ${i === 1 ? "text-primary" : "text-muted-foreground"}`}>{p.name}</span>
              <span className="font-display text-[22px] font-extrabold tracking-[-0.03em] text-foreground leading-none">
                {p.freeLabel ?? <>{"$"}{p.price}<span className="font-body text-[11px] font-medium text-muted-foreground tracking-normal"> /call</span></>}
              </span>
              <Link
                href={`/onboard?plan=${p.slug}`}
                className={`mt-2 text-[12px] font-semibold no-underline rounded-lg px-4 py-1.5 transition-colors ${
                  i === 1
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "border-[1.5px] border-border text-foreground hover:border-primary"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Groups */}
        {TABLE.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <div className="lp-cmp-row grid bg-accent border-b border-accent-border" style={comparisonGridStyle}>
                <div className="px-6 py-[10px]">
                  <span className="font-display text-[12.5px] font-bold tracking-[0.07em] uppercase text-primary whitespace-nowrap">{group.title}</span>
                </div>
                <div /><div className="lp-cmp-pop" /><div />
              </div>
            )}
            {group.rows.map((row, ri) => (
              <div key={ri} className="lp-cmp-row grid border-b border-[#EEF1F6] last:border-b-0 hover:bg-[#FAFBFD] transition-colors" style={comparisonGridStyle}>
                <div className={`py-[11px] flex items-center ${row.sub ? "pl-10 pr-6" : "px-6"}`}>
                  <span className={`text-[13.5px] leading-snug ${row.sub ? "text-muted-foreground" : "text-navy-mid font-medium"}`}>
                    {row.label}
                  </span>
                </div>
                {row.cells.map((cell, ci) => (
                  <div key={ci} className={`py-[11px] px-3 flex items-center justify-center ${ci === 1 ? "lp-cmp-pop" : ""}`}>
                    <CellValue value={cell} row={row} popular={ci === 1} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        {/* Footer CTA row */}
        <div className="lp-cmp-row grid bg-[#FAFBFD] border-t-[1.5px] border-border" style={comparisonGridStyle}>
          <div className="px-6 py-4 flex items-center">
            <span className="text-[12.5px] text-muted-foreground">All plans HIPAA-compliant · cancel by email before the 25th</span>
          </div>
          {PLANS.map((p, i) => (
            <div key={p.slug} className={`px-4 py-4 flex items-center justify-center ${i === 1 ? "lp-cmp-pop" : ""}`}>
              <Link
                href={`/onboard?plan=${p.slug}`}
                className={`text-[12.5px] font-bold no-underline ${i === 1 ? "text-primary" : "text-navy-mid"}`}
              >
                Choose →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-28 py-[108px] px-6 bg-white">
      <div className="lp-container">
        <Reveal>
          <SectionLabel>Service Plans</SectionLabel>
          <h2 className="lp-section-h2">
            Pick the coverage<br />that fits your practice.
          </h2>
          <p className="text-[16px] text-muted-foreground mb-[60px] max-w-[480px]">
            Every plan includes a dedicated number, live EHR
            integration, and Iris&apos;s full scheduling capability.
          </p>
        </Reveal>

        <div className="lp-pricing-grid grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-center">
          {PLANS.map((p, i) => (
            <Reveal key={i} delay={i * 0.08} className="h-full">
              <div className={`lp-price-card flex h-full min-h-[520px] flex-col rounded-[20px] p-8 ${p.dark ? "bg-foreground border-2 border-primary shadow-[0_24px_64px_#27499320] lg:scale-[1.02]" : "bg-background border-[1.5px] border-border"}`}>
                {p.tag && (
                  <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold tracking-[0.08em] px-4 py-1 rounded-full uppercase whitespace-nowrap">
                    {p.tag}
                  </div>
                )}

                <div className={`text-[13px] font-semibold mb-[14px] font-display tracking-[-0.01em] ${p.dark ? "text-teal-bright" : "text-primary"}`}>{p.name}</div>
                {p.freeLabel ? (
                  <div className={`font-display text-[48px] font-extrabold tracking-tighter leading-none mb-1.5 ${p.dark ? "text-white" : "text-foreground"}`}>
                    {p.freeLabel}
                  </div>
                ) : (
                  <div className={`flex items-start leading-none mb-1.5 ${p.dark ? "text-white" : "text-foreground"}`}>
                    <span className="font-body text-[26px] font-bold mt-1.5 mr-0.5 tracking-tight">$</span>
                    <span className="font-display text-[48px] font-extrabold tracking-tighter">{p.price}</span>
                  </div>
                )}
                <div className={`text-[13px] mb-[22px] ${p.dark ? "text-[#94A3B8]" : "text-muted-foreground"}`}>{p.note}</div>

                <div className={`h-px mb-[22px] ${p.dark ? "bg-navy-mid" : "bg-border"}`} />

                <p className={`text-[14px] leading-[1.65] mb-6 ${p.dark ? "text-[#CBD5E1]" : "text-muted-foreground"}`}>{p.body}</p>

                <ul className="list-none p-0 m-0 mb-7 flex flex-col gap-[11px]">
                  {p.bullets.map(b => (
                    <li key={b} className={`flex items-start gap-[9px] text-[14px] ${p.dark ? "text-[#E2E8F0]" : "text-navy-mid"}`}>
                      <span className="shrink-0 mt-[1px]">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <circle cx="7.5" cy="7.5" r="7.5" fill="#D8E5FF" />
                          <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#274993" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/onboard?plan=${p.slug}`}
                  className={`mt-auto block text-center py-[13px] px-6 rounded-[10px] font-semibold text-[15px] no-underline tracking-[-0.01em] font-body transition-opacity duration-150 ${p.dark ? "bg-primary text-white shadow-[0_4px_18px_rgba(39,73,147,0.28)]" : "bg-white text-foreground border-[1.5px] border-border"}`}
                >
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Detailed comparison */}
        <Reveal className="mt-20" y={26}>
          <div className="text-center mb-10">
            <h3 className="font-display text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.03em] text-foreground m-0 mb-3">
              Everything in every plan, side by side
            </h3>
            <p className="text-[15px] text-muted-foreground m-0 max-w-[520px] mx-auto">
              Exact features, terms, and the monthly results a typical
              OD professional sees on each plan.
            </p>
          </div>
          <ComparisonTable />
        </Reveal>
      </div>
    </section>
  )
}
