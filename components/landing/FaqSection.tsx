"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Plus } from "lucide-react"
import { SectionLabel } from "./SectionLabel"
import { Reveal } from "./Reveal"

const FAQS = [
  {
    q: "Do you verify a patient's insurance?",
    a: "For AI-answered calls, Iris verifies the patient's vision insurance is accepted at your practice based on the insurance provisions in your patient management program. If the patient doesn't have insurance or it isn't accepted, they're informed they'll need to pay for the examination — pricing can be discussed on the call.",
  },
  {
    q: "How do I get started?",
    a: "Tell us you want to begin and we'll send you a service agreement. You provide a credit card for the first month's calls. You can stop the program by email before the 25th of the month for the next month's service.",
  },
  {
    q: "Does RingIQ understand that not every doctor has the same appointment schedule?",
    a: "Absolutely. RingIQ adapts to your unique EHR/PMS schedule and each doctor's individual preferences, as learned from the exam schedule in your patient management program.",
  },
  {
    q: "How does RingIQ know what insurance our practice accepts?",
    a: "The RingIQ AI program reads your office's insurance provisions directly from your EHR/PMS platform — no manual setup required.",
  },
  {
    q: "Can Iris make outbound calls?",
    a: "Not at this time. Outbound patient recalls are on the roadmap: Iris will know the patient's insurance, last visit date, and exam details, and immediately schedule a convenient returning-patient exam while calling.",
  },
  {
    q: "How will I know the \"learning calls\" are correct?",
    a: "Your RingIQ dashboard records every call for you to review. All calls are recorded (patients are informed during the call), transcribed, analyzed, and prepared for AI learning. Iris updates your call information daily with new information.",
  },
  {
    q: "How does Iris handle pricing questions?",
    a: "Iris knows the pricing, services, and product information stored in your EHR/PMS, and answers patient pricing questions from that source of truth.",
  },
]

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion()
  return (
    <div className={`rounded-[14px] border-[1.5px] transition-colors ${open ? "border-accent-border bg-white shadow-[0_8px_28px_rgba(15,23,42,0.05)]" : "border-border bg-white"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-[18px] bg-transparent border-none cursor-pointer"
      >
        <span className="font-display text-[15.5px] font-bold text-foreground tracking-[-0.01em] leading-snug">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: "easeOut" }}
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${open ? "bg-primary" : "bg-accent"}`}
        >
          <Plus size={15} strokeWidth={2.4} className={open ? "text-white" : "text-primary"} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 pt-0 m-0 text-[14px] text-muted-foreground leading-[1.75] max-w-[640px]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-[108px] px-6 bg-background">
      <div className="lp-container">
        <div className="lp-faq-grid">
          <Reveal>
            <div>
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="lp-section-h2">
                Questions,<br />answered.
              </h2>
              <p className="text-[15px] text-muted-foreground leading-[1.7] max-w-[340px] m-0">
                Everything you need to know about how Iris works with
                your practice. Still curious? Call the demo line and
                ask her yourself.
              </p>
              <a
                href="tel:+13463611599"
                className="inline-block mt-6 text-[14px] font-bold text-primary no-underline"
              >
                Ask Iris: (346) 361-1599 →
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08} y={24}>
            <div className="flex flex-col gap-3">
              {FAQS.map((f, i) => (
                <FaqItem
                  key={i}
                  q={f.q}
                  a={f.a}
                  open={open === i}
                  onToggle={() => setOpen(open === i ? null : i)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
