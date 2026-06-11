"use client"

import { Reveal } from "./Reveal"

export function DemoSection() {
  return (
    <section className="pt-8 pb-20 lg:pt-10 lg:pb-24 bg-background relative overflow-hidden">
      <div className="lp-container">

        <Reveal className="text-center mb-10" y={14}>
          <div className="inline-flex items-center gap-2 px-[14px] py-[5px] bg-accent-border rounded-full mb-5 border border-[#5B7BD840]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary block shrink-0" />
            <span className="text-[13px] font-semibold text-primary tracking-[0.01em]">Live demo</span>
          </div>
          <h2 className="font-display text-[clamp(32px,4vw,52px)] font-extrabold tracking-[-0.035em] text-foreground m-0 mb-4 leading-[1.08]">
            Hear Iris in Action
          </h2>
          <p className="text-[17px] text-muted-foreground leading-[1.7] max-w-[460px] mx-auto m-0">
            A real patient call handled end-to-end. No scripts. No hold music. Just Iris.
          </p>
        </Reveal>

        {/* Video + floating badges */}
        <Reveal className="relative max-w-[760px] mx-auto" delay={0.08} y={18}>

          <div className="lp-demo-badge lp-demo-badge-left">
            <p className="text-[12px] font-semibold text-foreground leading-[1.45] m-0">
              Iris is available 24/7 for you to test now
            </p>
          </div>

          <div className="lp-demo-badge lp-demo-badge-right">
            <p className="text-[12px] font-semibold text-foreground leading-[1.45] m-0">
              Listen to Iris work with a patient call
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border shadow-[0_24px_80px_rgba(15,23,42,0.10)] bg-[#0F1929]">
            <video
              src="/assets/videos/Steve-Call-Demo-1.0.mp4"
              controls
              playsInline
              className="w-full block"
            />
          </div>
        </Reveal>

        {/* Arrow + phone CTA */}
        <Reveal className="flex flex-col items-center mt-9 gap-4" delay={0.12} y={12}>
          <svg width="32" height="48" viewBox="0 0 32 48" fill="none" className="text-muted-foreground opacity-50">
            <path d="M16 2 C16 2 16 32 16 38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M8 30 L16 42 L24 30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <a
            href="tel:+13463611599"
            className="inline-flex items-center gap-3 bg-[#3D8B40] hover:bg-[#347536] text-white font-semibold text-[15px] px-8 py-[15px] rounded-full transition-colors shadow-[0_8px_32px_rgba(61,139,64,0.28)]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.72 12 19.79 19.79 0 0 1 1.65 3.38 2 2 0 0 1 3.62 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.06 6.06l.97-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Test Iris Yourself: (346) 361-1599
          </a>
        </Reveal>

      </div>
    </section>
  )
}
