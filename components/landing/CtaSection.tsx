import Link from "next/link"
import { IrisIcon } from "./IrisIcon"

export function CtaSection() {
  return (
    <section className="py-[120px] px-6 bg-background">
      <div className="lp-container text-center">
        <IrisIcon size={52} className="mx-auto mb-7" />
        <h2 className="font-display text-[clamp(34px,4.5vw,58px)] font-extrabold tracking-[-0.035em] m-0 mb-5 leading-[1.06] text-foreground">
          Ready to give your<br />front desk a break?
        </h2>
        <p className="text-[17px] text-muted-foreground leading-[1.7] max-w-[460px] mx-auto mb-11">
          Sign up in minutes. We handle the configuration.
          Iris is live before your next morning shift.
        </p>
        <Link href="/onboard" className="lp-btn-primary py-[17px] px-10 text-base">
          Sign Up Your Practice
        </Link>
        <p className="text-[13px] text-muted-foreground mt-[18px]">
          No credit card required for free tier · Setup in under 10 minutes
        </p>
      </div>
    </section>
  )
}
