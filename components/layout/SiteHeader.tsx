'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Syne, DM_Sans } from 'next/font/google';

const syne   = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-syne',   display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-dm-sans', display: 'swap' });

const C = {
  bg:     '#F7F6F3',
  border: '#E2E8F0',
  navy:   '#0F172A',
  teal:   '#274993',
  brand:  '#274993',
  muted:  '#64748B',
};

interface Props {
  // 'landing' — anchor hrefs scroll within the page
  // 'app'     — anchor hrefs navigate back to landing page with hash
  variant?: 'landing' | 'app';
  // highlight which nav item is "current"
  active?: 'login' | 'onboard';
}

export function SiteHeader({ variant = 'landing', active }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const a = (hash: string) => variant === 'landing' ? hash : `/${hash}`;

  return (
    <header
      className={`${syne.variable} ${dmSans.variable}`}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'background 0.25s, box-shadow 0.25s',
        background: scrolled ? 'rgba(247,246,243,0.96)' : 'rgba(247,246,243,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? C.border : 'rgba(226,232,240,0.5)'}`,
        boxShadow: scrolled ? '0 1px 12px rgba(15,23,42,0.06)' : 'none',
        fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
      }}
    >
      <SiteHeaderStyles />
      <div className="sh-container" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/assets/logo.png" alt="RingIQ" style={{ height: 28, width: 'auto' }} />
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a href={a('#how-it-works')} className="sh-nav-link">How it works</a>
          <a href={a('#features')}     className="sh-nav-link">Features</a>
          <a href={a('#pricing')}      className="sh-nav-link">Pricing</a>
          <div style={{ width: 1, height: 20, background: C.border, margin: '0 6px' }} />
          <Link
            href="/login"
            className={`sh-nav-link${active === 'login' ? ' sh-nav-link--active' : ''}`}
          >
            Staff Login
          </Link>
          <Link
            href="/onboard"
            className="sh-btn-primary"
            style={{ padding: '9px 20px', fontSize: 14 }}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteHeaderStyles() {
  return (
    <style>{`
      .sh-container {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0 24px;
      }
      .sh-nav-link {
        padding: 8px 14px;
        color: ${C.muted};
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        border-radius: 8px;
        transition: color 0.15s;
        font-family: var(--font-dm-sans), sans-serif;
      }
      .sh-nav-link:hover { color: ${C.navy}; }
      .sh-nav-link--active { color: ${C.teal} !important; }
      .sh-btn-primary {
        display: inline-block;
        background: ${C.brand};
        color: #fff;
        font-weight: 600;
        text-decoration: none;
        border-radius: 10px;
        letter-spacing: -0.01em;
        box-shadow: 0 4px 18px rgba(39,73,147,0.28);
        transition: opacity 0.15s, transform 0.15s;
        font-family: var(--font-dm-sans), sans-serif;
      }
      .sh-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
    `}</style>
  );
}
