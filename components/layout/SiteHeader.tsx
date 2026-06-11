'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import { Menu, X } from 'lucide-react'

const syne   = Bricolage_Grotesque({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-bricolage', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans', display: 'swap' })

interface Props {
  variant?: 'landing' | 'app'
  active?:  'login' | 'onboard'
}

export function SiteHeader({ variant = 'landing', active }: Props) {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else            document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const a = (hash: string) => variant === 'landing' ? hash : `/${hash}`
  const close = () => setMobileOpen(false)

  return (
    <>
      <header
        className={`${syne.variable} ${dmSans.variable} fixed top-0 left-0 right-0 z-50 font-body sh-header-blur border-b ${
          scrolled
            ? 'bg-[rgba(247,246,243,0.96)] border-border shadow-[0_1px_12px_rgba(15,23,42,0.06)]'
            : 'bg-[rgba(247,246,243,0.75)] border-[rgba(226,232,240,0.5)]'
        }`}
      >
        <div className="sh-container h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center no-underline">
            <img src="/assets/logo.png" alt="RingIQ" className="h-7 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <a href={a('#how-it-works')} className="sh-nav-link">How it works</a>
            <a href={a('#features')}     className="sh-nav-link">Features</a>
            <a href={a('#pricing')}      className="sh-nav-link">Pricing</a>
            <div className="w-px h-5 bg-border mx-1.5" />
            <Link href="/login" className={`sh-nav-link${active === 'login' ? ' sh-nav-link--active' : ''}`}>
              Staff Login
            </Link>
            <Link href="/onboard" className="sh-btn-primary py-2.25 px-5 text-[14px]">
              Get Started
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-transparent text-muted-foreground"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className={`${syne.variable} ${dmSans.variable} font-body fixed inset-0 z-40 flex flex-col`}
          style={{ top: 64 }}
        >
          <div className="absolute inset-0 bg-[rgba(15,23,42,0.3)]" onClick={close} />
          <nav className="relative z-10 flex flex-col gap-1 p-5 bg-[#F7F6F3] border-b border-border shadow-lg">
            <a href={a('#how-it-works')} className="sh-nav-link py-3 text-[15px]" onClick={close}>How it works</a>
            <a href={a('#features')}     className="sh-nav-link py-3 text-[15px]" onClick={close}>Features</a>
            <a href={a('#pricing')}      className="sh-nav-link py-3 text-[15px]" onClick={close}>Pricing</a>
            <div className="h-px bg-border my-1" />
            <Link href="/login"   className="sh-nav-link py-3 text-[15px]" onClick={close}>Staff Login</Link>
            <Link href="/onboard" className="lp-btn-primary py-[13px] px-6 text-[15px] text-center mt-1" onClick={close}>
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
