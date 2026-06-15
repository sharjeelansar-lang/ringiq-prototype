"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Plus } from "lucide-react"
import { SectionLabel } from "./SectionLabel"
import { Reveal } from "./Reveal"

const FAQS = [
  {
    q: "Are Free Nights and Weekends free?",
    a: [
      "Yes. If that's all you need, we'll help you. However, we expect you may quickly move to the 3-Ring Backup plan.",
      "We'll answer your office phone when your office is closed based on your published office hours. We'll book new appointments directly into your CrystalPM calendar, help patients manage appointment confirmations, cancellations, and rescheduling, and answer \"are my glasses ready\" calls based on your CrystalPM data.",
      "For all other requests, we'll take the caller's information and write a specific task into your EHR/PMS for staff follow-up, accountability, and office manager review.",
    ],
  },
  {
    q: "So, how does the 3-Ring Backup plan work?",
    a: "The RingIQ.ai agent follows your incoming phone calls and waits for the office to answer in 3 rings. If your staff is busy with patients in the office, or it's just a tight staff day, RingIQ answers the call on the 4th ring. You only pay for what you need.",
  },
  {
    q: "What's a chargeable call?",
    a: "Nights and weekend calls are free. 3-Ring Backup calls are $1.50, and Full Service calls are $1.00 per call. Not every call is chargeable: calls under 30 seconds are not charged, most spam calls hang up once they recognize an AI phone agent, 1-800 calls are free, and if your staff answers in fewer than 3 rings there is no charge.",
  },
  {
    q: "How do you bill my office?",
    a: [
      "We need a credit card on file. We'll collect a $300 deposit when you begin either paid service plan, but not for Free Nights and Weekends.",
      "We'll calculate chargeable calls on the 25th of the month for the previous 30 days and bill your card on file. You'll receive advance notice of the calls and amount due, plus email reports on the 10th and 20th of each month.",
      "Your office will also have access to a private webpage showing all calls, charges, and the AI phone agent's work.",
    ],
  },
  {
    q: "Remind me about the terms of service.",
    a: "Service is at will. You only pay for what you need, and you can stop service at any time. We will calculate the remaining service due, deduct it from your deposit, and charge the credit card on file for any remaining balance.",
  },
  {
    q: "How do you answer the phone?",
    a: [
      "You keep your practice's public phone number. No changes. We'll send you instructions to share with your phone service provider for forwarding calls from your phone to RingIQ.ai. If you ever want to stop service, you just stop forwarding calls to RingIQ.ai.",
      "We'll also need two other phone lines. Most offices already have 3-5 existing phone lines, so there is usually no additional expense. The second line lets your office know to pick up 3-Ring calls. The third line is for special calls where the patient asks to speak to the office, so the RingIQ AI phone agent can forward callers to an office staff member.",
    ],
  },
  {
    q: "What about special information and my practice's policies?",
    a: [
      "The RingIQ.ai phone agent, Iris, will know the information in your CrystalPM practice manager program. Iris will know if you have multiple offices, how many doctors you have, what days and times they work, your appointment types and exam times, your insurance provisions, and existing appointments for current patients.",
      "Iris will also learn about your practice from your website and Google reviews. Iris can learn from Word or PDF documents you provide, so special information you want shared with patients can be included in patient conversations.",
    ],
  },
  {
    q: "Do you verify a patient's insurance?",
    a: "For RingIQ AI-answered calls, we verify the patient's vision insurance is accepted at your practice based on the insurance provisions in your patient management program. If the patient does not have insurance, or their insurance is not accepted, they are informed they will need to pay for the examination. Pricing information can be discussed.",
  },
  {
    q: "How does Iris handle pricing questions?",
    a: "Iris knows the pricing, services, and product information in your EHR/PMS, along with documents you share for the AI agent to learn.",
  },
  {
    q: "How does the call assistant handle calls about billing problems?",
    a: "These are usually long calls with extended hold times. Iris will talk to the caller and let them know it will be faster if they explain the problem. Iris will document the issue and the office can call back with an answer. If the caller does not want to tell Iris about the billing problem, they will be connected immediately to the office during business hours.",
  },
  {
    q: "What about special issues not on our website or in the initial learning calls?",
    a: "We have a solution for that too. We will provide an online form for you to describe special situations, and you can update the form at any time. Iris will remember your special instructions and include them as needed in patient conversations. For example, if you require a special $25 deposit for all rescheduled calls, Iris will remember to ask for that deposit when rescheduling appointments.",
  },
  {
    q: "How would RingIQ.ai answer patient questions about walk-in exams?",
    a: "Iris learns everything displayed on your website to provide accurate and up-to-date information about walk-in exams. Iris can also discuss the details of your practice and walk-in exams, and learns from the initial training calls. If a patient calls about a walk-in appointment, Iris will transfer the caller to your office so your staff can confirm availability.",
  },
  {
    q: "How many calls can you answer at one time?",
    a: "RingIQ.ai is designed for efficiency and can handle 25 simultaneous calls, ensuring your patients are promptly attended to.",
  },
  {
    q: "Can the call be transferred to the office if a caller does not want to talk with an AI agent?",
    a: "Yes, during business hours, without delay. After business hours, Iris will take a detailed message and follow your designated instructions for when and where to relay the patient's message.",
  },
]

function FaqItem({ q, a, open, onToggle }: { q: string; a: string | string[]; open: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion()
  const paragraphs = Array.isArray(a) ? a : [a]

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
            <div className="px-6 pb-5 pt-0 max-w-[680px] space-y-3">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="m-0 text-[14px] text-muted-foreground leading-[1.75]">
                  {paragraph}
                </p>
              ))}
            </div>
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
