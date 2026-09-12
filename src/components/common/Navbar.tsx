import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react'
import { Logo } from './Logo'
import { NAV_LINKS } from '@/utils/constants'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname.startsWith(path)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 lg:px-6">
      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border transition-all duration-500 ${isScrolled
          ? 'border-white/10 bg-bg-base/80 px-3 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:px-4'
          : 'border-transparent bg-transparent px-1'
          }`}
      >
        {/* =====================================================
            LOGO
        ====================================================== */}
        <Logo
          size="sm"
          showSubtext={false}
          className="shrink-0"
        />

        {/* =====================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <div className="hidden items-center lg:flex">
          <div
            className={`flex items-center gap-1 rounded-xl px-1.5 py-1.5 transition-all duration-500 ${isScrolled
              ? 'border border-white/5 bg-white/[0.025]'
              : ''
              }`}
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.path)

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative rounded-lg px-3.5 py-2 text-sm font-medium outline-none transition-all duration-300 ${active
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                    } focus-visible:ring-2 focus-visible:ring-brand-primary`}
                >
                  {/* Active background */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-lg bg-brand-primary/10"
                    />
                  )}

                  <span className="relative z-10">
                    {link.label}
                  </span>

                  {/* Active indicator */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent shadow-[0_0_8px_rgba(139,92,246,0.7)]"
                    />
                  )}

                  {/* Hover glow */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-lg bg-white/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </Link>
              )
            })}
          </div>
        </div>

        {/* =====================================================
            DESKTOP ACTIONS
        ====================================================== */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Admin */}
          <Link
            to="/login"
            className="group inline-flex min-h-10 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-text-secondary outline-none transition-all duration-300 hover:bg-white/[0.04] hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Admin
          </Link>

          {/* CTA */}
          <Link
            to="/contact"
            className="group relative inline-flex min-h-10 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/15 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
          >
            {/* Shine */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]"
            />

            <span className="relative">
              Start a Project
            </span>

            <ArrowRight
              aria-hidden="true"
              className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* =====================================================
            MOBILE BUTTON
        ====================================================== */}
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border outline-none transition-all duration-300 lg:hidden ${isOpen
            ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
            : 'border-white/10 bg-white/[0.04] text-text-secondary hover:border-white/20 hover:text-text-primary'
            } focus-visible:ring-2 focus-visible:ring-brand-primary`}
        >
          {isOpen ? (
            <X
              aria-hidden="true"
              className="h-5 w-5"
            />
          ) : (
            <Menu
              aria-hidden="true"
              className="h-5 w-5"
            />
          )}
        </button>
      </nav>

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================== */}
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================== */}
      <div
        id="mobile-navigation"
        className={`mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-bg-base/95 shadow-2xl shadow-black/30 backdrop-blur-2xl transition-all duration-500 lg:hidden ${isOpen
          ? 'max-h-[calc(100vh-100px)] translate-y-0 opacity-100'
          : 'pointer-events-none max-h-0 -translate-y-3 opacity-0'
          }`}
      >
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-3">

          {/* Mobile brand header */}
          <div className="mb-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles
                aria-hidden="true"
                className="h-3.5 w-3.5 text-brand-primary"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Sankyuu Production
              </span>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted/50">
              39
            </span>
          </div>

          {/* Links */}
          <div className="space-y-1">
            {NAV_LINKS.map((link, index) => {
              const active = isActive(link.path)

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex min-h-12 items-center justify-between overflow-hidden rounded-xl px-4 py-3 outline-none transition-all duration-300 ${active
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
                    } focus-visible:ring-2 focus-visible:ring-brand-primary`}
                  style={{
                    transitionDelay: isOpen
                      ? `${index * 30}ms`
                      : '0ms',
                  }}
                >
                  <span className="relative z-10 text-sm font-medium">
                    {link.label}
                  </span>

                  {active && (
                    <span
                      aria-hidden="true"
                      className="relative z-10 h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                    />
                  )}

                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                </Link>
              )
            })}
          </div>

          {/* Mobile actions */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <Link
              to="/login"
              className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-medium text-text-secondary outline-none transition-all duration-300 hover:bg-white/[0.05] hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Admin
            </Link>

            <Link
              to="/contact"
              className="group mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/15 outline-none transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Start a Project

              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Mobile footer */}
          <div className="mt-4 flex items-center justify-between px-2 pb-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted/40">
              Creating Digital Works
            </span>

            <span className="font-display text-xs font-bold text-text-muted/40">
              39
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          REDUCED MOTION
      ========================================================== */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </header>
  )
}
