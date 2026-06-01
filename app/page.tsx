"use client"

import { Syne, DM_Sans } from "next/font/google"
import Link from "next/link"
import { useEffect } from "react"
import { SiteHeader } from "@/components/layout/SiteHeader"

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
})
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
})

const C = {
  bg:          "#F7F6F3",
  surface:     "#FFFFFF",
  tealFaded:   "#D8E5FF",
  tealLight:   "#EEF4FF",
  navy:        "#0F172A",
  navyMid:     "#1E293B",
  teal:        "#274993",
  tealBright:  "#5B7BD8",
  border:      "#E2E8F0",
  muted:       "#64748B",
}

export default function LandingPage() {
  useEffect(() => {
    const prev = { bg: document.body.style.background, color: document.body.style.color }
    document.body.style.background = C.bg
    document.body.style.color = C.navy
    return () => {
      document.body.style.background = prev.bg
      document.body.style.color = prev.color
    }
  }, [])

  return (
    <div
      className={`${syne.variable} ${dmSans.variable}`}
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        background: C.bg,
        color: C.navy,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <LandingStyles />
      <SiteHeader variant="landing" />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
          opacity: 0.7,
        }} />
        {/* Brand glow */}
        <div style={{
          position: "absolute", top: -160, right: -120, width: 700, height: 700,
          background: `radial-gradient(circle at 55% 45%, ${C.tealFaded} 0%, transparent 65%)`,
          zIndex: 0, pointerEvents: "none",
        }} />
        {/* Amber glow */}
        <div style={{
          position: "absolute", bottom: -80, left: -80, width: 400, height: 400,
          background: `radial-gradient(circle, #FEF9EE 0%, transparent 70%)`,
          zIndex: 0, pointerEvents: "none",
        }} />

        <div className="lp-container lp-hero-grid" style={{ position: "relative", zIndex: 1 }}>
          {/* Copy */}
          <div className="lp-hero-copy" style={{ animation: "lp-fade-up 0.7s ease both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px", background: C.tealFaded,
              borderRadius: 100, marginBottom: 28,
              border: `1px solid ${C.tealBright}40`,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.teal, display: "block", flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.teal, letterSpacing: "0.01em" }}>
                AI voice agent for optometry
              </span>
            </div>

            <h1 style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(44px, 6vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
              color: C.navy,
              margin: "0 0 24px",
            }}>
              Every call<br />
              <em style={{ color: C.teal, fontStyle: "normal" }}>answered.</em><br />
              Every time.
            </h1>

            <p style={{
              fontSize: 18, lineHeight: 1.7,
              color: C.muted, maxWidth: 460,
              margin: "0 0 38px",
            }}>
              Iris is RingIQ&apos;s AI phone agent. She books appointments,
              handles reschedules, and routes urgent calls, live-connected
              to your EHR from the very first ring.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/onboard" className="lp-btn-primary" style={{ padding: "14px 30px", fontSize: 15 }}>
                Sign Up Your Practice
              </Link>
              <a href="#how-it-works" className="lp-btn-ghost" style={{ padding: "14px 28px", fontSize: 15 }}>
                See How It Works
              </a>
            </div>

            <p style={{ fontSize: 13, color: C.muted, marginTop: 18 }}>
              No credit card required for the free tier
            </p>
          </div>

          {/* Visual */}
          <div className="lp-hero-visual" style={{ animation: "lp-fade-up 0.7s 0.15s ease both" }}>
            <IrisVisual />
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section style={{ background: C.navy, padding: "36px 24px" }}>
        <div className="lp-container lp-stats-grid">
          {[
            { num: "24 / 7", label: "Always available" },
            { num: "< 2 s",  label: "First ring answer" },
            { num: "Live",   label: "EHR-connected" },
          ].map(s => (
            <div key={s.num} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-syne)", fontSize: 34, fontWeight: 800,
                color: C.tealBright, letterSpacing: "-0.04em", lineHeight: 1,
              }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "108px 24px", background: C.surface }}>
        <div className="lp-container">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="lp-section-h2">
            From signup to live<br />in under an hour.
          </h2>

          <div className="lp-steps-grid">
            {[
              {
                step: "01",
                title: "Your Practice Signs Up",
                body: "Fill out a short form with your practice details, office hours, and phone numbers. No technical knowledge required.",
              },
              {
                step: "02",
                title: "We Configure Iris",
                body: "Our team reviews your submission, provisions a dedicated Twilio number, and deploys your AI assistant — all before the line goes live.",
              },
              {
                step: "03",
                title: "Patients Call, Iris Answers",
                body: "Within hours Iris is live, scheduling appointments, managing reschedules, and routing urgent calls so your front desk focuses on patients in the office.",
              },
            ].map((s, i) => (
              <div key={i} className="lp-step-card">
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", marginBottom: 28,
                  background: i === 1 ? C.teal : "transparent",
                  border: `2px solid ${i === 1 ? C.teal : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700,
                  color: i === 1 ? "#fff" : C.muted,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.teal, textTransform: "uppercase", marginBottom: 12 }}>{s.step}</div>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 12, letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "108px 24px", background: C.bg }}>
        <div className="lp-container">
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="lp-section-h2">
            Built for how your<br />practice actually runs.
          </h2>

          <div className="lp-features-grid">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                  </svg>
                ),
                title: "Live EHR Scheduling",
                body: "Iris queries Schedule Your Exam in real time. She knows your availability, your providers, and your appointment types. No invented slots, ever.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                ),
                title: "Natural Voice Conversations",
                body: "Deepgram medical transcription plus OpenAI. Iris understands accents, patient hesitation, and natural phrasing, not just keyword commands.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                ),
                title: "Smart Call Routing",
                body: "Urgent calls, billing questions, and prescription requests are instantly transferred to the right person. Never left hanging with an AI that can't help.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                title: "Flexible Coverage Hours",
                body: "Choose when Iris works. Full-service means every call. 3-Ring Backup makes her your safety net. Free tier covers nights and weekends only.",
              },
            ].map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 20,
                  background: C.tealLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 10, letterSpacing: "-0.02em" }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "108px 24px", background: C.surface }}>
        <div className="lp-container">
          <SectionLabel>Service Plans</SectionLabel>
          <h2 className="lp-section-h2">
            Pick the coverage<br />that fits your practice.
          </h2>
          <p style={{ fontSize: 16, color: C.muted, marginBottom: 60, maxWidth: 480 }}>
            Every plan includes a dedicated Twilio number, live EHR
            integration, and Iris&apos;s full scheduling capability.
          </p>

          <div className="lp-pricing-grid">
            {[
              {
                slug:      "nights-weekends",
                name:      "Free Nights & Weekends",
                price:     "Free",
                note:      "during covered hours",
                tag:       null,
                dark:      false,
                body:      "Iris covers after-hours calls only. Perfect for practices that want an AI buffer outside business hours without changing their daytime flow.",
                bullets:   ["After-hours + weekend coverage", "Full appointment scheduling", "Cancellation & rescheduling", "Urgent call transfer"],
                cta:       "Start Free",
              },
              {
                slug:      "backup",
                name:      "3-Ring Backup",
                price:     "$1",
                note:      "per AI call · ~180 calls / mo",
                tag:       "Most Popular",
                dark:      true,
                body:      "Iris picks up after 3 rings. Your staff answers first; she's the backup. Roughly 180 AI-assisted calls per month per office.",
                bullets:   ["All-hours coverage", "Answers after 3 rings", "Full EHR scheduling access", "Overflow + failover protection"],
                cta:       "Get Started",
              },
              {
                slug:      "full-service",
                name:      "Full Service",
                price:     "$1",
                note:      "per AI call · ~850 calls / mo",
                tag:       null,
                dark:      false,
                body:      "Iris answers every inbound call, every time. Designed for high-volume practices that want to eliminate hold times and missed calls entirely.",
                bullets:   ["First-ring answer, every call", "~850 AI calls / month", "Priority transfer routing", "On-call emergency handling"],
                cta:       "Get Started",
              },
            ].map((p, i) => (
              <div key={i} className="lp-price-card" style={{
                background:    p.dark ? C.navy : C.bg,
                border:        p.dark ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
                boxShadow:     p.dark ? `0 24px 64px ${C.teal}20` : "none",
                transform:     p.dark ? "scale(1.02)" : "none",
              }}>
                {p.tag && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: C.teal, color: "#fff",
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    padding: "4px 16px", borderRadius: 100,
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>
                    {p.tag}
                  </div>
                )}

                <div style={{ fontSize: 13, fontWeight: 600, color: p.dark ? C.tealBright : C.teal, marginBottom: 14, fontFamily: "var(--font-syne)", letterSpacing: "-0.01em" }}>{p.name}</div>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: 48, fontWeight: 800, letterSpacing: "-0.05em", color: p.dark ? "#fff" : C.navy, lineHeight: 1, marginBottom: 6 }}>{p.price}</div>
                <div style={{ fontSize: 13, color: p.dark ? "#94A3B8" : C.muted, marginBottom: 22 }}>{p.note}</div>

                <div style={{ height: 1, background: p.dark ? "#1E293B" : C.border, marginBottom: 22 }} />

                <p style={{ fontSize: 14, color: p.dark ? "#CBD5E1" : C.muted, lineHeight: 1.65, marginBottom: 24 }}>{p.body}</p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 11 }}>
                  {p.bullets.map(b => (
                    <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 14, color: p.dark ? "#E2E8F0" : C.navyMid }}>
                      <span style={{ color: C.teal, flexShrink: 0, marginTop: 1 }}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="7.5" fill={C.tealFaded} /><path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <Link href={`/onboard?plan=${p.slug}`} style={{
                  display: "block", textAlign: "center",
                  padding: "13px 24px", borderRadius: 10,
                  background: p.dark ? "#274993" : C.surface,
                  color: p.dark ? "#fff" : C.navy,
                  border: p.dark ? "none" : `1.5px solid ${C.border}`,
                  boxShadow: p.dark ? "0 4px 18px rgba(39,73,147,0.28)" : "none",
                  fontWeight: 600, fontSize: 15,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  fontFamily: "var(--font-dm-sans)",
                  transition: "opacity 0.15s",
                }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 24px", background: C.tealLight, borderTop: `1px solid ${C.tealFaded}`, borderBottom: `1px solid ${C.tealFaded}` }}>
        <div className="lp-container" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", color: C.teal, textTransform: "uppercase", marginBottom: 20 }}>
            A note for your front desk
          </p>
          <p style={{ fontSize: 16, color: C.navyMid, lineHeight: 1.7, maxWidth: 680, margin: "0 auto" }}>
            Before Iris goes live, you&apos;ll need to remove any existing call greeting,
            voicemail pickup, or call-ladder rule from your main line so inbound calls
            reach Iris cleanly from the first ring.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", background: C.bg }}>
        <div className="lp-container" style={{ textAlign: "center" }}>
          <IrisIcon size={52} color={C.teal} style={{ margin: "0 auto 28px" }} />
          <h2 style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(34px, 4.5vw, 58px)",
            fontWeight: 800, letterSpacing: "-0.035em",
            margin: "0 0 20px", lineHeight: 1.06, color: C.navy,
          }}>
            Ready to give your<br />front desk a break?
          </h2>
          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 44px" }}>
            Sign up in minutes. We handle the configuration.
            Iris is live before your next morning shift.
          </p>
          <Link href="/onboard" className="lp-btn-primary" style={{ padding: "17px 40px", fontSize: 16 }}>
            Sign Up Your Practice
          </Link>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 18 }}>
            No credit card required for free tier · Setup in under 10 minutes
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: C.navy, padding: "52px 24px" }}>
        <div className="lp-container lp-footer">
          <div style={{
            display: "inline-flex", alignItems: "center",
            background: "#fff", borderRadius: 10, padding: "8px 12px",
          }}>
            <img src="/assets/logo.png" alt="RingIQ" style={{ height: 28, width: "auto", display: "block" }} />
          </div>
          <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
            © 2026 RingIQ. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 22, height: 2.5, background: C.teal, borderRadius: 2 }} />
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: C.teal, textTransform: "uppercase" }}>{children}</span>
    </div>
  )
}

function IrisIcon({ size = 32, color = C.teal, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={style}>
      <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="1.8" opacity="0.12" />
      <circle cx="20" cy="20" r="13" stroke={color} strokeWidth="1.8" opacity="0.22" />
      <circle cx="20" cy="20" r="8"  stroke={color} strokeWidth="2"   opacity="0.45" />
      <circle cx="20" cy="20" r="4"  fill={color} />
      <circle cx="21.4" cy="18.6" r="1.3" fill="white" opacity="0.75" />
    </svg>
  )
}

function IrisVisual() {
  return (
    <div style={{ position: "relative", width: 400, height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Concentric rings */}
      {[190, 155, 120, 88, 58].map((r, i) => (
        <div key={r} style={{
          position: "absolute",
          width: r * 2, height: r * 2,
          borderRadius: "50%",
          border: `1.5px solid ${C.teal}`,
          opacity: 0.05 + i * 0.055,
          animation: `lp-iris-pulse ${3.2 + i * 0.55}s ease-in-out ${i * 0.28}s infinite`,
        }} />
      ))}

      {/* Slow-rotating dashed ring */}
      <div style={{
        position: "absolute",
        width: 240, height: 240,
        borderRadius: "50%",
        border: `1px dashed ${C.tealBright}`,
        opacity: 0.28,
        animation: "lp-iris-spin 32s linear infinite",
      }} />

      {/* Tick marks on dashed ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <div key={deg} style={{
          position: "absolute",
          width: 1, height: 8,
          background: C.teal,
          opacity: 0.3,
          transform: `rotate(${deg}deg) translateY(-116px)`,
          transformOrigin: "center 116px",
        }} />
      ))}

      {/* Center orb */}
      <div style={{
        position: "relative", zIndex: 2,
        width: 88, height: 88, borderRadius: 22,
        background: `linear-gradient(135deg, ${C.teal} 0%, #18336F 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 20px 56px rgba(39,73,147,0.32), 0 4px 16px rgba(39,73,147,0.22)`,
        animation: "lp-phone-float 4.2s ease-in-out infinite",
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.06 6.06l.97-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </div>

      {/* Floating pill — top right */}
      <div style={{
        position: "absolute", top: "14%", right: "4%", zIndex: 3,
        background: C.surface, borderRadius: 12, padding: "9px 16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.09)",
        border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 8,
        animation: "lp-float-a 5s ease-in-out infinite",
      }}>
        <span style={{ color: C.teal, display: "flex", alignItems: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, lineHeight: 1.2 }}>Appointment booked</div>
          <div style={{ fontSize: 11, color: C.muted }}>Tue, 2:30 PM · Dr. Nguyen</div>
        </div>
      </div>

      {/* Floating pill — bottom left */}
      <div style={{
        position: "absolute", bottom: "16%", left: "2%", zIndex: 3,
        background: C.tealLight, borderRadius: 12, padding: "9px 16px",
        boxShadow: "0 4px 20px rgba(39,73,147,0.12)",
        border: `1px solid ${C.tealFaded}`,
        display: "flex", alignItems: "center", gap: 8,
        animation: "lp-float-b 4.6s ease-in-out infinite",
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal, animation: "lp-blink 1.4s ease-in-out infinite" }} />
        <div style={{ fontSize: 12, fontWeight: 600, color: C.teal }}>Iris is speaking…</div>
      </div>
    </div>
  )
}

/* ── Scoped styles + keyframes ──────────────────────────────────────────── */
function LandingStyles() {
  return (
    <style>{`
      .lp-container {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .lp-nav-link {
        padding: 8px 14px;
        color: ${C.muted};
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        border-radius: 8px;
        transition: color 0.15s;
      }
      .lp-nav-link:hover { color: ${C.navy}; }

      .lp-btn-primary {
        display: inline-block;
        background: #274993;
        color: #fff;
        font-weight: 600;
        text-decoration: none;
        border-radius: 10px;
        letter-spacing: -0.01em;
        box-shadow: 0 4px 18px rgba(39,73,147,0.28);
        transition: opacity 0.15s, transform 0.15s;
        font-family: var(--font-dm-sans), sans-serif;
      }
      .lp-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

      .lp-btn-ghost {
        display: inline-block;
        background: ${C.surface};
        color: ${C.navy};
        font-weight: 600;
        text-decoration: none;
        border-radius: 10px;
        letter-spacing: -0.01em;
        border: 1.5px solid ${C.border};
        transition: border-color 0.15s;
        font-family: var(--font-dm-sans), sans-serif;
      }
      .lp-btn-ghost:hover { border-color: ${C.teal}; }

      .lp-section-h2 {
        font-family: var(--font-syne), sans-serif;
        font-size: clamp(32px, 4vw, 52px);
        font-weight: 800;
        letter-spacing: -0.03em;
        margin: 14px 0 56px;
        line-height: 1.1;
        color: ${C.navy};
      }

      /* Layout grids */
      .lp-hero-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 48px;
      }
      .lp-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      .lp-steps-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .lp-step-card { padding: 0 36px 0 0; }
      .lp-features-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
      .lp-feature-card {
        background: ${C.surface};
        border-radius: 16px;
        padding: 32px;
        border: 1px solid ${C.border};
        transition: border-color 0.2s;
      }
      .lp-feature-card:hover { border-color: ${C.tealBright}80; }

      .lp-pricing-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        align-items: center;
      }
      .lp-price-card {
        border-radius: 20px;
        padding: 32px;
        position: relative;
        transition: transform 0.2s;
      }

      .lp-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
      }

      /* Hero visual on small screens */
      .lp-hero-visual { display: flex; justify-content: center; }

      /* Keyframes */
      @keyframes lp-fade-up {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes lp-iris-pulse {
        0%, 100% { opacity: var(--base-op, 0.1); transform: scale(1); }
        50%       { opacity: calc(var(--base-op, 0.1) * 2.2); transform: scale(1.015); }
      }
      @keyframes lp-iris-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes lp-phone-float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-10px); }
      }
      @keyframes lp-float-a {
        0%, 100% { transform: translateY(0px) rotate(-1deg); }
        50%       { transform: translateY(-7px) rotate(0deg); }
      }
      @keyframes lp-float-b {
        0%, 100% { transform: translateY(0px) rotate(1deg); }
        50%       { transform: translateY(-5px) rotate(0deg); }
      }
      @keyframes lp-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.35; }
      }

      /* Responsive */
      @media (max-width: 900px) {
        .lp-hero-grid { grid-template-columns: 1fr; }
        .lp-hero-visual { display: none; }
        .lp-steps-grid { grid-template-columns: 1fr; gap: 40px; }
        .lp-step-card { padding: 0; }
        .lp-features-grid { grid-template-columns: 1fr; }
        .lp-pricing-grid { grid-template-columns: 1fr; }
        .lp-price-card { transform: none !important; }
        .lp-stats-grid { grid-template-columns: 1fr; gap: 28px; }
        .lp-nav { display: none; }
        .lp-footer { flex-direction: column; text-align: center; }
      }
      @media (max-width: 640px) {
        .lp-container { padding: 0 16px; }
      }
    `}</style>
  )
}
