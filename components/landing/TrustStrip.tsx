export function TrustStrip() {
  return (
    <section className="py-16 px-6 bg-accent border-y border-accent-border">
      <div className="lp-container text-center">
        <p className="text-[14px] font-semibold tracking-[0.08em] text-primary uppercase mb-5">
          A note for your front desk
        </p>
        <p className="text-[16px] text-navy-mid leading-[1.7] max-w-[680px] mx-auto">
          Before Iris goes live, you&apos;ll need to remove any existing call greeting,
          voicemail pickup, or call-ladder rule from your main line so inbound calls
          reach Iris cleanly from the first ring.
        </p>
      </div>
    </section>
  )
}
