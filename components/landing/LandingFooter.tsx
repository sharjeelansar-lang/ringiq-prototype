"use client"

import Link from "next/link"
import { Mail, Phone, Clock } from "lucide-react"

function LinkedinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

function YoutubeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.5a3 3 0 0 0-2.11-2.12C19.5 3.87 12 3.87 12 3.87s-7.5 0-9.39.51A3 3 0 0 0 .5 6.5 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.5 3 3 0 0 0 2.11 2.12c1.89.51 9.39.51 9.39.51s7.5 0 9.39-.51a3 3 0 0 0 2.11-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.5zM9.6 15.6V8.4l6.27 3.6L9.6 15.6z" />
    </svg>
  )
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07z" />
    </svg>
  )
}

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "RingIQ",
    links: [
      { label: "Our Vision",    href: "#" },
      { label: "Partners",      href: "#" },
      { label: "Testimonials",  href: "#" },
      { label: "Integration",   href: "#features" },
      { label: "Contact Us",    href: "mailto:info@ringiq.ai" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Call Assistant",  href: "#features" },
      { label: "AI Dashboard",    href: "#features" },
      { label: "Getting Started", href: "/onboard" },
      { label: "Sign In",         href: "/login" },
      { label: "Support Desk",    href: "mailto:info@ringiq.ai" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it Works", href: "#how-it-works" },
      { label: "Watch Video",  href: "#demo" },
      { label: "Webinar",      href: "#" },
      { label: "Blog",         href: "#" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Features",     href: "#features" },
      { label: "Case Studies", href: "#" },
      { label: "Pricing",      href: "#pricing" },
      { label: "FAQs",         href: "#faq" },
    ],
  },
]

const SOCIALS = [
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
  { icon: YoutubeIcon,  label: "YouTube",  href: "#" },
  { icon: FacebookIcon, label: "Facebook", href: "#" },
]

export function LandingFooter() {
  return (
    <footer className="bg-foreground pt-[72px] pb-8 px-6">
      <div className="lp-container">

        <div className="lp-footer-grid grid grid-cols-1 gap-8 pb-12 border-b border-[#1E293B] md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] lg:gap-11">
          {/* Brand + contact */}
          <div className="max-w-[280px]">
            <div className="inline-flex items-center bg-white rounded-[10px] p-2.5 mb-5">
              <img src="/assets/logo.png" alt="RingIQ" className="h-6 w-auto block" />
            </div>
            <p className="text-[13px] text-[#94A3B8] leading-[1.7] m-0 mb-6">
              AI-powered optical virtual receptionist.
              Every call answered. Every time.
            </p>
            <div className="flex flex-col gap-2.5 text-[13px] text-[#94A3B8]">
              <a href="mailto:info@ringiq.ai" className="flex items-center gap-2.5 no-underline text-[#94A3B8] hover:text-white transition-colors">
                <Mail size={13} className="shrink-0" /> info@ringiq.ai
              </a>
              <a href="tel:+17133096348" className="flex items-center gap-2.5 no-underline text-[#94A3B8] hover:text-white transition-colors">
                <Phone size={13} className="shrink-0" /> +1 (713) 309-6348
              </a>
              <span className="flex items-center gap-2.5">
                <Clock size={13} className="shrink-0" /> Mon–Fri 9:00 AM – 5:00 PM (EDT)
              </span>
            </div>
            <div className="flex gap-2.5 mt-6">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-[10px] bg-[#1E293B] border border-[#33415566] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#5B7BD8] transition-colors"
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="font-display text-[13px] font-bold tracking-[0.06em] uppercase text-white m-0 mb-4">{col.title}</h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-[10px]">
                {col.links.map(l => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link href={l.href} className="text-[13.5px] text-[#94A3B8] no-underline hover:text-white transition-colors">{l.label}</Link>
                    ) : (
                      <a href={l.href} className="text-[13.5px] text-[#94A3B8] no-underline hover:text-white transition-colors">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="lp-footer-news py-8 border-b border-[#1E293B]">
          <div>
            <h4 className="font-display text-[15px] font-bold text-white m-0 mb-1">Sign up for our newsletter</h4>
            <p className="text-[13px] text-[#94A3B8] m-0">Practice management &amp; AI insights for eye care, monthly.</p>
          </div>
          <form
            className="flex gap-2.5 w-full max-w-[400px]"
            onSubmit={e => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="you@yourpractice.com"
              aria-label="Email address"
              className="flex-1 min-w-0 h-11 px-4 rounded-[10px] bg-[#1E293B] border border-[#33415588] text-[13.5px] text-white placeholder-[#64748B] outline-none focus:border-[#5B7BD8] transition-colors"
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-[10px] bg-primary text-white text-[13.5px] font-semibold border-none cursor-pointer hover:bg-primary-dark transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-7">
          <p className="text-[12.5px] text-[#64748B] m-0">
            © 2026 RingIQ — Optometric AI Phone Solutions. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[12.5px] text-[#64748B] no-underline hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-[12.5px] text-[#64748B] no-underline hover:text-white transition-colors">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
