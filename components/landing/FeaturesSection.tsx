import { SectionLabel } from "./SectionLabel"

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#274993" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    ),
    title: "Live EHR Scheduling",
    body:  "Iris queries Schedule Your Exam in real time. She knows your availability, your providers, and your appointment types. She even knows your insurance provisions and if the caller is a new patient.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#274993" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
    title: "Multi-lingual Natural Voice Conversations",
    body:  "Deepgram medical transcription plus OpenAI. Iris understands accents, patient hesitation, and natural phrasing, not just keyword commands. Supports English, Spanish, French, and more.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#274993" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
    title: "Smart Calls",
    body:  "Urgent calls, billing questions, and prescription requests are instantly transferred to the right person. RingIQ AI phone agent can even answer your patient's \"are my glasses ready\" calls.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#274993" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Flexible Coverage Hours",
    body:  "Choose when Iris works. Full-service means every call. 3-Ring Backup makes her your safety net. Free tier covers nights and weekends only.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-[108px] px-6 bg-background">
      <div className="lp-container">
        <SectionLabel>Capabilities</SectionLabel>
        <h2 className="lp-section-h2">
          Built for how your<br />practice actually runs.
        </h2>

        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="lp-feature-card">
              <div className="w-12 h-12 rounded-[12px] mb-5 bg-accent flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <h3 className="font-display text-[18px] font-bold text-foreground mb-[10px] tracking-[-0.02em]">{f.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-[1.7]">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
