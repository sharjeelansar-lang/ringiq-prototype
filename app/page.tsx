"use client"

import { Bricolage_Grotesque, DM_Sans } from "next/font/google"
import { useEffect } from "react"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { HeroSection } from "@/components/landing/HeroSection"
import { DemoSection } from "@/components/landing/DemoSection"
import { StatsStrip } from "@/components/landing/StatsStrip"
import { WorkflowSection } from "@/components/landing/WorkflowSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HumanVsIrisSection } from "@/components/landing/HumanVsIrisSection"
import { TestimonialSection } from "@/components/landing/TestimonialSection"
import { PricingSection } from "@/components/landing/PricingSection"
import { SecuritySection } from "@/components/landing/SecuritySection"
import { FaqSection } from "@/components/landing/FaqSection"
import { CtaSection } from "@/components/landing/CtaSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-bricolage", display: "swap" })
const dmSans  = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" })

export default function LandingPage() {
  useEffect(() => {
    const prev = { bg: document.body.style.background, color: document.body.style.color }
    document.body.style.background = "#F7F6F3"
    document.body.style.color = "#0F172A"
    return () => { document.body.style.background = prev.bg; document.body.style.color = prev.color }
  }, [])

  return (
    <div className={`${display.variable} ${dmSans.variable} font-body bg-background text-foreground min-h-screen overflow-x-hidden`}>
      <SiteHeader variant="landing" />
      <HeroSection />
      <DemoSection />
      <StatsStrip />
      <WorkflowSection />
      <HowItWorksSection />
      <FeaturesSection />
      <HumanVsIrisSection />
      <TestimonialSection />
      <PricingSection />
      <SecuritySection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </div>
  )
}
