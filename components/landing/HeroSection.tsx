import Link from "next/link"

export function HeroSection() {
  return (
    <section className="pt-[104px] pb-10 lg:pt-[116px] lg:pb-14 relative overflow-hidden">
      <div className="lp-dot-grid" />
      <div className="lp-hero-glow" />
      <div className="lp-hero-amber" />

      <div className="lp-container lp-hero-grid relative z-[1]">
        <div className="animate-lp-fade-up">
          <div className="inline-flex items-center gap-2 px-[14px] py-[5px] bg-accent-border rounded-full mb-7 border border-[#5B7BD840]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary block shrink-0" />
            <span className="text-[13px] font-semibold text-primary tracking-[0.01em]">
              AI voice agent for optometry
            </span>
          </div>

          <h1 className="font-display text-[clamp(44px,6vw,72px)] font-extrabold leading-[1.04] tracking-[-0.035em] text-foreground m-0 mb-6">
            Every call<br />
            <em className="text-primary not-italic">answered.</em><br />
            Every time.
          </h1>

          <p className="text-[18px] leading-[1.7] text-muted-foreground max-w-[460px] m-0 mb-[38px]">
            Iris is RingIQ&apos;s AI phone agent. She books appointments,
            handles reschedules, and routes urgent calls, live-connected
            to your EHR from the very first ring.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link href="/onboard" className="lp-btn-primary lp-soft-lift py-[14px] px-[30px] text-[15px]">
              Sign Up Your Practice
            </Link>
            <a href="#how-it-works" className="lp-btn-ghost lp-soft-lift py-[14px] px-7 text-[15px]">
              See How It Works
            </a>
          </div>

          <p className="text-[13px] text-muted-foreground mt-[18px]">
            No credit card required for the free tier
          </p>
        </div>

        <HeroPromoBurst />

        <div className="lp-hero-visual animate-lp-fade-up-delayed">
          <IrisVisual />
        </div>
      </div>
    </section>
  )
}

function HeroPromoBurst() {
  return (
    <Link
      href="#pricing"
      className="lp-hero-promo"
      aria-label="View pricing for the Free Nights and Weekends plan"
    >
      <span className="lp-hero-promo__burst" aria-hidden="true" />
      <span className="lp-hero-promo__shine" aria-hidden="true" />
      <span className="lp-hero-promo__content">
        Free Nights &amp; Weekends
      </span>
    </Link>
  )
}


function IrisVisual() {
  return (
    <div className="lp-iris-visual relative w-[400px] h-[400px] flex items-center justify-center">
      {[190, 155, 120, 88, 58].map((r, i) => (
        <div
          key={r}
          className="lp-iris-ring"
          style={{
            width:  r * 2,
            height: r * 2,
            "--base-op": 0.05 + i * 0.055,
            animation: `lp-iris-pulse ${3.2 + i * 0.55}s ease-in-out ${i * 0.28}s infinite`,
          } as React.CSSProperties}
        />
      ))}

      <div className="lp-dashed-ring" />

      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <div
          key={deg}
          className="absolute w-px h-2 bg-primary opacity-30"
          style={{ transform: `rotate(${deg}deg) translateY(-116px)`, transformOrigin: "center 116px" }}
        />
      ))}

      <div className="lp-center-orb">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.06 6.06l.97-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </div>

      <div className="lp-pill-a">
        <span className="text-primary flex items-center">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <div>
          <div className="text-[12px] font-semibold text-foreground leading-[1.2]">Appointment booked</div>
          <div className="text-[11px] text-muted-foreground">Tue, 2:30 PM · Dr. Nguyen</div>
        </div>
      </div>

      <div className="lp-pill-b">
        <div className="lp-blink-dot" />
        <div className="text-[12px] font-semibold text-primary">Iris is speaking…</div>
      </div>
    </div>
  )
}
