import Link from "next/link"
import { SectionLabel } from "./SectionLabel"

const STEPS = [
  {
    title: "Your Practice Signs Up",
    body:  "Fill out a short form with your practice details, office hours, and phone numbers. No technical knowledge required.",
    cta:   true,
  },
  {
    title: "We Configure Iris",
    body:  "Our team reviews your submission and deploys your AI assistant, all before the line goes live.",
    cta:   false,
  },
  {
    title: "You Test the AI Agent",
    body:  "Call the test line. See how AI answers your phone. Then talk to us about what's next.",
    cta:   false,
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-[108px] px-6 bg-white">
      <div className="lp-container">
        <SectionLabel>How It Works</SectionLabel>
        <h2 className="lp-section-h2">
          From signup to live<br />in under an hour.
        </h2>

        <div className="lp-steps-grid">
          {STEPS.map((s, i) => (
            <div key={i} className="lp-step-card">
              <div className={`w-12 h-12 rounded-full mb-7 flex items-center justify-center font-display text-[15px] font-bold border-2 ${i === 1 ? "bg-primary border-primary text-white" : "bg-transparent border-border text-muted-foreground"}`}>
                {i + 1}
              </div>
              <h3 className="font-display text-[20px] font-bold text-foreground mb-3 tracking-[-0.02em]">{s.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-[1.7]">{s.body}</p>
              {s.cta && (
                <Link href="/onboard" className="inline-block mt-4 text-[14px] font-bold text-primary no-underline italic">
                  Get Started
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
