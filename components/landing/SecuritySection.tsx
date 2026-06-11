"use client"

import { ShieldCheck, Lock, ScanEye } from "lucide-react"
import { Reveal } from "./Reveal"

const ITEMS = [
  {
    icon:  ShieldCheck,
    title: "HIPAA Compliant",
    body:  "Meets all HIPAA regulations, ensuring the highest standards of PHI privacy and security on every call.",
  },
  {
    icon:  Lock,
    title: "Encrypted Data",
    body:  "Advanced encryption protects data at rest and in transit, keeping sensitive patient information secure.",
  },
  {
    icon:  ScanEye,
    title: "Monitored Access",
    body:  "Strict role-based access controls ensure only authorized personnel reach specific patient data.",
  },
]

export function SecuritySection() {
  return (
    <section className="bg-foreground py-16 px-6">
      <div className="lp-container">
        <div className="lp-sec-grid grid grid-cols-1 gap-7 lg:grid-cols-3 lg:gap-11">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08} y={16}>
              <div className="flex items-start gap-4">
                <span className="w-11 h-11 rounded-[12px] bg-[#1E293B] border border-[#33415588] flex items-center justify-center shrink-0">
                  <item.icon size={19} className="text-teal-bright" />
                </span>
                <div>
                  <h3 className="font-display text-[15.5px] font-bold text-white tracking-[-0.01em] m-0 mb-1.5">{item.title}</h3>
                  <p className="text-[13.5px] text-[#94A3B8] leading-[1.65] m-0">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
