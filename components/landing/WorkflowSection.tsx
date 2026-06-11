"use client"

import { CalendarCheck2, PhoneCall, AlertTriangle, Wrench, CheckCircle2 } from "lucide-react"
import { SectionLabel } from "./SectionLabel"
import { Reveal } from "./Reveal"

// ── Chat mockup ───────────────────────────────────────────────────────────────

const CHAT: { from: "iris" | "patient"; text: string }[] = [
  { from: "iris",    text: "Thank you for calling Demo Eye Care, this is Iris, your virtual receptionist. How can I assist you today?" },
  { from: "patient", text: "Hi, I need to schedule an appointment for an eye exam." },
  { from: "iris",    text: "Of course! Let me check our schedule for availability. Do you have a preferred day or time?" },
  { from: "patient", text: "I'd prefer something next Tuesday in the morning, if possible." },
]

function ChatMockup() {
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-border shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 max-w-[440px] w-full">
      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-border">
        <span className="relative flex w-2.5 h-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
        </span>
        <span className="text-[13px] font-semibold text-foreground">Live call · RingIQ Iris</span>
        <span className="ml-auto text-[11px] font-medium text-muted-foreground tabular-nums">00:42</span>
      </div>
      <div className="flex flex-col gap-3">
        {CHAT.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-4 py-[10px] text-[13px] leading-[1.55] ${
            m.from === "iris"
              ? "self-start bg-accent text-navy-mid rounded-[14px] rounded-bl-[4px]"
              : "self-end bg-foreground text-white rounded-[14px] rounded-br-[4px]"
          }`}>
            {m.text}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PMS activity feed mockup ──────────────────────────────────────────────────

const FEED = [
  { time: "9:43 AM",  name: "Alice Johnson", action: "Re-scheduled an appointment", icon: CalendarCheck2, tint: "#274993", bg: "#EEF4FF" },
  { time: "10:10 AM", name: "Robert Brown",  action: "Emergency — transferred",     icon: AlertTriangle,  tint: "#D97706", bg: "#FEF6E7" },
  { time: "10:32 AM", name: "Sarah Taylor",  action: "Service call — task created", icon: Wrench,         tint: "#64748B", bg: "#F1F5F9" },
  { time: "11:07 AM", name: "Jane Doe",      action: "Booked appointment",          icon: CheckCircle2,   tint: "#059669", bg: "#E8F8F1" },
]

function FeedMockup() {
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-border shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 max-w-[440px] w-full">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <span className="text-[13px] font-semibold text-foreground">Today</span>
        <span className="text-[11px] font-bold tracking-[0.06em] uppercase text-primary bg-accent border border-accent-border rounded-full px-2.5 py-[3px]">Crystal PMS · synced</span>
      </div>
      <div className="flex flex-col gap-[14px]">
        {FEED.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: f.bg }}>
              <f.icon size={16} style={{ color: f.tint }} />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-foreground leading-tight">{f.name}</div>
              <div className="text-[12px] text-muted-foreground leading-tight mt-0.5">{f.action}</div>
            </div>
            <span className="ml-auto text-[11px] text-light tabular-nums shrink-0">{f.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

const ROWS = [
  {
    label:   "Reduce office stress",
    title:   <>A stress-free office,<br />every day.</>,
    body:    "Every doctor knows the stress when a receptionist is out — phones ring unanswered, patients get frustrated, and your team is stretched thin. Iris handles the calls so your team can focus on creating a calm, organized environment for your patients.",
    points:  ["No scrambling when someone calls in sick", "Patients never hear voicemail or hold music", "Your team stays present with in-office patients"],
    visual:  <ChatMockup />,
    flip:    false,
  },
  {
    label:   "Simplify your workflow",
    title:   <>Phones become one less<br />thing to worry about.</>,
    body:    "No more multitasking, no more on-hold patients, no more chaos when someone is out. Iris answers every call, schedules appointments, and writes everything back to your PMS — reliably and effortlessly.",
    points:  ["Eliminates phone-related multitasking for your staff", "Every call logged as an appointment or task in your PMS", "24/7 reliability — no sick days, no downtime"],
    visual:  <FeedMockup />,
    flip:    true,
  },
]

export function WorkflowSection() {
  return (
    <section className="py-[108px] px-6 bg-background overflow-hidden">
      <div className="lp-container">
        <Reveal>
          <SectionLabel>Better than voicemail</SectionLabel>
          <h2 className="lp-section-h2">
            We answer the phone.<br />Your team breathes.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-[88px] mt-12">
          {ROWS.map((row, i) => (
            <Reveal key={i} y={28}>
              <div className={`lp-wf-row ${row.flip ? "lp-wf-row--flip" : ""}`}>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent border border-accent-border rounded-full mb-5">
                    <PhoneCall size={12} className="text-primary" />
                    <span className="text-[12px] font-bold text-primary tracking-[0.02em]">{row.label}</span>
                  </div>
                  <h3 className="font-display text-[clamp(26px,3.2vw,38px)] font-extrabold tracking-[-0.03em] leading-[1.12] text-foreground m-0 mb-5">
                    {row.title}
                  </h3>
                  <p className="text-[15.5px] text-muted-foreground leading-[1.75] m-0 mb-6 max-w-[460px]">{row.body}</p>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3">
                    {row.points.map(pt => (
                      <li key={pt} className="flex items-start gap-[10px] text-[14.5px] text-navy-mid">
                        <span className="shrink-0 mt-[2px]">
                          <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
                            <circle cx="7.5" cy="7.5" r="7.5" fill="#D8E5FF" />
                            <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#274993" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center">{row.visual}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
