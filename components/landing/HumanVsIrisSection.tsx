"use client"

import { Check, X, User, Phone } from "lucide-react"
import { SectionLabel } from "./SectionLabel"
import { IrisIcon } from "./IrisIcon"
import { Reveal } from "./Reveal"

const HUMAN = [
  "Prone to sick days, absences, and limited to office hours",
  "Responses vary based on mood, stress, or multitasking",
  "One call at a time — missed calls during busy periods",
  "Salary, benefits, taxes, and overhead expenses",
  "Time-intensive training and retraining for system updates",
]

const IRIS = [
  "Operates 24/7 without interruptions or absences",
  "Consistent, accurate, professional responses every time",
  "Handles multiple calls simultaneously — zero hold time",
  "Predictable, low per-call cost with no overhead",
  "Integrates with CrystalPM and updates automatically",
]

export function HumanVsIrisSection() {
  return (
    <section className="py-[108px] px-6 bg-white">
      <div className="lp-container">
        <Reveal>
          <SectionLabel>Human vs Iris</SectionLabel>
          <h2 className="lp-section-h2">
            Less payroll.<br />More coverage.
          </h2>
          <p className="text-[16px] text-muted-foreground mb-[52px] max-w-[520px]">
            Compare the challenges of a traditional front desk with
            the consistency of an AI receptionist that never clocks out.
          </p>
        </Reveal>

        <div className="lp-vs-grid">
          <Reveal y={24}>
            <div className="h-full rounded-[20px] border-[1.5px] border-border bg-background p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center">
                  <User size={19} className="text-muted-foreground" />
                </span>
                <div>
                  <div className="font-display text-[17px] font-bold text-foreground tracking-[-0.02em]">Human Receptionist</div>
                  <div className="text-[12px] text-muted-foreground">One person. Office hours only.</div>
                </div>
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-[14px]">
                {HUMAN.map(item => (
                  <li key={item} className="flex items-start gap-[10px] text-[14px] text-muted-foreground leading-[1.55]">
                    <span className="shrink-0 mt-[2px] w-[18px] h-[18px] rounded-full bg-[#FEECEC] flex items-center justify-center">
                      <X size={11} strokeWidth={2.5} className="text-[#DC2626]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal y={24} delay={0.1}>
            <div className="h-full rounded-[20px] border-2 border-primary bg-foreground p-8 relative overflow-hidden shadow-[0_24px_64px_#27499326]">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary opacity-[0.14] blur-2xl" />
              <div className="flex items-center gap-3 mb-6 relative">
                <span className="w-11 h-11 rounded-full bg-[#1E293B] border border-[#33415588] flex items-center justify-center">
                  <IrisIcon size={24} color="#5B7BD8" />
                </span>
                <div>
                  <div className="font-display text-[17px] font-bold text-white tracking-[-0.02em]">Iris, AI Receptionist</div>
                  <div className="text-[12px] text-[#94A3B8]">Every line. Every hour. Every day.</div>
                </div>
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-[14px] relative">
                {IRIS.map(item => (
                  <li key={item} className="flex items-start gap-[10px] text-[14px] text-[#E2E8F0] leading-[1.55]">
                    <span className="shrink-0 mt-[2px] w-[18px] h-[18px] rounded-full bg-primary flex items-center justify-center">
                      <Check size={11} strokeWidth={2.8} className="text-white" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="flex flex-col items-center mt-12 gap-3">
            <a
              href="tel:+13463611599"
              className="inline-flex items-center gap-2.5 bg-foreground hover:bg-[#1E293B] text-white font-semibold text-[15px] px-8 py-[14px] rounded-full no-underline transition-colors"
            >
              <Phone size={16} />
              Call the Demo AI: (346) 361-1599
            </a>
            <p className="text-[13px] text-muted-foreground m-0">Iris answers live. Try to stump her.</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
