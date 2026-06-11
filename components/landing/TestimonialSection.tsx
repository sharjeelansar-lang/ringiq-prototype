"use client"

import { SectionLabel } from "./SectionLabel"
import { Reveal } from "./Reveal"

const PRACTICES = [
  "Vision Care Center",
  "EyeCapitol",
  "Angelina Eye Center",
  "Scott Conroy Vision",
  "City of Vision",
  "NW Hills Eye Care",
  "Vision Eye Center",
]

export function TestimonialSection() {
  return (
    <section className="py-[108px] px-6 bg-background">
      <div className="lp-container">
        <Reveal>
          <div className="text-center">
            <SectionLabel>What people say about us</SectionLabel>
          </div>
        </Reveal>

        <Reveal y={24}>
          <figure className="max-w-[780px] mx-auto text-center m-0 mt-6">
            <svg width="40" height="32" viewBox="0 0 40 32" fill="none" className="mx-auto mb-7 opacity-90">
              <path d="M0 32V20.8C0 14.9 1.5 10.2 4.4 6.7 7.4 3.1 11.6.9 17 0l2.6 5.4c-3.4.9-5.9 2.3-7.6 4.2-1.6 1.9-2.5 4-2.7 6.4H17V32H0Zm23 0V20.8c0-5.9 1.5-10.6 4.4-14.1C30.4 3.1 34.6.9 40 0l-2.4 5.4c-3.4.9-5.9 2.3-7.6 4.2-1.6 1.9-2.5 4-2.7 6.4H35V32H23Z" fill="#274993" fillOpacity="0.18"/>
            </svg>
            <blockquote className="font-display text-[clamp(20px,2.6vw,28px)] font-bold leading-[1.45] tracking-[-0.02em] text-foreground m-0">
              RingIQ&apos;s AI call assistant picks up patient calls after the third
              ring, allowing our staff to stay with patients in the office. It has
              significantly smoothed our daily workflow — a worthwhile investment
              for any optometry practice.
            </blockquote>
            <figcaption className="mt-8">
              <div className="w-12 h-12 rounded-full bg-primary text-white font-display font-bold text-[15px] flex items-center justify-center mx-auto mb-3">
                JY
              </div>
              <div className="text-[15px] font-bold text-foreground">Dr. Jeffrey Yonker, OD</div>
              <div className="text-[13px] text-muted-foreground mt-0.5">Owner, TSO — Cedar Park, TX</div>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-[72px] pt-10 border-t border-border">
            <p className="text-center text-[12px] font-bold tracking-[0.12em] uppercase text-light mb-7">
              Trusted by eye doctors &amp; eye care practices across the USA
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {PRACTICES.map(name => (
                <span key={name} className="font-display text-[14.5px] font-bold tracking-[-0.01em] text-[#9AA6B8] whitespace-nowrap select-none">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
