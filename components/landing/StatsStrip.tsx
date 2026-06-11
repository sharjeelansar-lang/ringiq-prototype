import { Reveal } from "./Reveal"

const STATS = [
  { num: "24 / 7", label: "Always available" },
  { num: "< 2 s",  label: "First ring answer" },
  { num: "Live",   label: "w/ Crystal Practice Manager" },
]

export function StatsStrip() {
  return (
    <section className="bg-foreground py-9 px-6">
      <div className="lp-container lp-stats-grid">
        {STATS.map((s, i) => (
          <Reveal key={s.num} delay={i * 0.06} y={10}>
          <div className="text-center">
            <div className="font-display text-[34px] font-extrabold text-teal-bright tracking-[-0.04em] leading-none">{s.num}</div>
            <div className="text-[13px] text-[#94A3B8] mt-2 font-medium">{s.label}</div>
          </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
