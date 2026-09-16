import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowRight,
  Menu,
  Sparkles,
  X,
} from 'lucide-react'

import { Logo } from './Logo'
import { NAV_LINKS } from '@/utils/constants'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] =
    useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  /* =========================================================
     SCROLL STATE
  ========================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(
        window.scrollY > 24,
      )
    }

    handleScroll()

    window.addEventListener(
      'scroll',
      handleScroll,
    )

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll,
      )
    }
  }, [])

  /* =========================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ========================================================== */

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  /* =========================================================
     LOCK BODY SCROLL
  ========================================================== */

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow =
        'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  /* =========================================================
     SECRET ADMIN ACCESS
     
     Type:
       3 → 9

     Rules:
     - No Enter required
     - Maximum 1.5 seconds between keys
     - Disabled while typing in form fields
     - Redirects to /admin/access
  ========================================================== */

  useEffect(() => {
    let secretSequence = ''
    let resetTimer: ReturnType<
      typeof setTimeout
    > | null = null

    const resetSequence = () => {
      secretSequence = ''

      if (resetTimer) {
        clearTimeout(resetTimer)
        resetTimer = null
      }
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      const target =
        event.target as HTMLElement | null

      /*
       * Jangan aktifkan secret shortcut
       * ketika user sedang mengetik di form.
       */
      if (
        target &&
        (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        )
      ) {
        resetSequence()
        return
      }

      /*
       * Hanya menerima angka 3 dan 9.
       */
      if (
        event.key !== '3' &&
        event.key !== '9'
      ) {
        resetSequence()
        return
      }

      /*
       * Angka pertama harus 3.
       */
      if (
        secretSequence === '' &&
        event.key === '3'
      ) {
        secretSequence = '3'

        if (resetTimer) {
          clearTimeout(resetTimer)
        }

        resetTimer = setTimeout(() => {
          resetSequence()
        }, 1500)

        return
      }

      /*
       * Setelah 3, angka berikutnya harus 9.
       */
      if (
        secretSequence === '3' &&
        event.key === '9'
      ) {
        resetSequence()

        /*
         * Jangan redirect kalau sudah
         * berada di halaman admin access.
         */
        if (
          location.pathname !==
          '/admin/access'
        ) {
          navigate('/admin/access')
        }

        return
      }

      /*
       * Sequence tidak valid.
       */
      resetSequence()
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      if (resetTimer) {
        clearTimeout(resetTimer)
      }
    }
  }, [
    location.pathname,
    navigate,
  ])

  /* =========================================================
     ACTIVE LINK
  ========================================================== */

  const isActive = (
    path: string,
  ) => {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname.startsWith(
      path,
    )
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 lg:px-6">
      {/* =========================================================
          MAIN NAVBAR
      ========================================================== */}

      <nav
        className={`
          navbarShell
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          rounded-2xl
          border
          transition-all
          duration-500
          ${isScrolled
            ? `
                border-neutral-200
                bg-white/95
                px-3
                shadow-[0_10px_35px_rgba(15,23,42,0.08)]
                backdrop-blur-xl
                sm:px-4
              `
            : `
                border-transparent
                bg-white/70
                px-1
                backdrop-blur-md
              `
          }
        `}
      >
        {/* =======================================================
            LOGO
        ======================================================== */}

        <Logo
          size="sm"
          showSubtext={false}
          className="shrink-0"
        />

        {/* =======================================================
            DESKTOP NAVIGATION
        ======================================================== */}

        <div className="hidden items-center lg:flex">
          <div
            className={`
              flex
              items-center
              gap-0.5
              rounded-xl
              px-1
              py-1
              transition-all
              duration-500
              ${isScrolled
                ? 'border border-neutral-200 bg-neutral-50'
                : ''
              }
            `}
          >
            {NAV_LINKS.map(
              (link) => {
                const active =
                  isActive(
                    link.path,
                  )

                return (
                  <Link
                    key={
                      link.path
                    }
                    to={
                      link.path
                    }
                    aria-current={
                      active
                        ? 'page'
                        : undefined
                    }
                    className={`
                      navbarLink
                      group
                      relative
                      rounded-lg
                      px-3.5
                      py-2
                      text-sm
                      font-medium
                      outline-none
                      transition-all
                      duration-300
                      ${active
                        ? 'text-violet-600'
                        : 'text-neutral-500 hover:text-neutral-950'
                      }
                      focus-visible:ring-2
                      focus-visible:ring-violet-500
                      focus-visible:ring-offset-2
                    `}
                  >
                    {/* Hover background */}
                    <span
                      aria-hidden="true"
                      className={`
                        absolute
                        inset-0
                        rounded-lg
                        bg-neutral-50
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                        ${active
                          ? 'bg-violet-50 opacity-100'
                          : ''
                        }
                      `}
                    />

                    <span className="relative z-10">
                      {
                        link.label
                      }
                    </span>

                    {/* Active indicator */}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="
                          absolute
                          bottom-1
                          left-1/2
                          h-0.5
                          w-4
                          -translate-x-1/2
                          rounded-full
                          bg-gradient-to-r
                          from-violet-600
                          to-pink-500
                        "
                      />
                    )}
                  </Link>
                )
              },
            )}
          </div>
        </div>

        {/* =======================================================
            DESKTOP ACTIONS
        ======================================================== */}

        <div className="hidden items-center gap-1.5 lg:flex">
          {/* CTA */}
          <Link
            to="/contact"
            className="
              navbarCTA
              group
              relative
              inline-flex
              min-h-10
              items-center
              gap-2
              overflow-hidden
              rounded-xl
              bg-neutral-950
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              outline-none
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-violet-600
              hover:shadow-lg
              hover:shadow-violet-100
              focus-visible:ring-2
              focus-visible:ring-violet-500
              focus-visible:ring-offset-2
            "
          >
            <span
              aria-hidden="true"
              className="
                absolute
                inset-y-0
                -left-full
                w-1/2
                -skew-x-12
                bg-white/15
                transition-all
                duration-700
                group-hover:left-[130%]
              "
            />

            <span className="relative">
              Start a Project
            </span>

            <ArrowRight
              aria-hidden="true"
              className="
                relative
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>

        {/* =======================================================
            MOBILE BUTTON
        ======================================================== */}

        <button
          type="button"
          onClick={() =>
            setIsOpen(
              (value) =>
                !value,
            )
          }
          aria-label={
            isOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          }
          aria-expanded={
            isOpen
          }
          aria-controls="mobile-navigation"
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            outline-none
            transition-all
            duration-300
            lg:hidden
            ${isOpen
              ? 'border-violet-200 bg-violet-50 text-violet-600'
              : 'border-neutral-200 bg-white text-neutral-600 hover:border-violet-200 hover:text-violet-600'
            }
            focus-visible:ring-2
            focus-visible:ring-violet-500
            focus-visible:ring-offset-2
          `}
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
        className={`
          fixed
          inset-0
          -z-10
          bg-neutral-950/20
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          lg:hidden
          ${isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
          }
        `}
        onClick={() =>
          setIsOpen(false)
        }
      />

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================== */}

      <div
        id="mobile-navigation"
        className={`
          mx-auto
          mt-2
          max-w-7xl
          overflow-hidden
          rounded-2xl
          border
          border-neutral-200
          bg-white/98
          shadow-[0_20px_60px_rgba(15,23,42,0.12)]
          backdrop-blur-xl
          transition-all
          duration-500
          lg:hidden
          ${isOpen
            ? 'max-h-[calc(100vh-100px)] translate-y-0 opacity-100'
            : 'pointer-events-none max-h-0 -translate-y-3 opacity-0'
          }
        `}
      >
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-3">
          {/* =====================================================
              MOBILE BRAND HEADER
          ====================================================== */}

          <div className="mb-3 flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Sankyuu Production
              </span>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300">
              39
            </span>
          </div>

          {/* =====================================================
              LINKS
          ====================================================== */}

          <div className="space-y-1">
            {NAV_LINKS.map(
              (
                link,
                index,
              ) => {
                const active =
                  isActive(
                    link.path,
                  )

                return (
                  <Link
                    key={
                      link.path
                    }
                    to={
                      link.path
                    }
                    aria-current={
                      active
                        ? 'page'
                        : undefined
                    }
                    className={`
                      group
                      relative
                      flex
                      min-h-12
                      items-center
                      justify-between
                      overflow-hidden
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                      transition-all
                      duration-300
                      ${active
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                      }
                      focus-visible:ring-2
                      focus-visible:ring-violet-500
                    `}
                    style={{
                      transitionDelay:
                        isOpen
                          ? `${index * 30}ms`
                          : '0ms',
                    }}
                  >
                    <span className="relative z-10 text-sm font-medium">
                      {
                        link.label
                      }
                    </span>

                    {active && (
                      <span
                        aria-hidden="true"
                        className="
                          relative
                          z-10
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-violet-600
                        "
                      />
                    )}

                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        inset-0
                        -translate-x-full
                        bg-gradient-to-r
                        from-transparent
                        via-violet-50
                        to-transparent
                        transition-transform
                        duration-700
                        group-hover:translate-x-full
                      "
                    />
                  </Link>
                )
              },
            )}
          </div>

          {/* =====================================================
              MOBILE ACTIONS
          ====================================================== */}

          <div className="mt-4 border-t border-neutral-200 pt-4">
            <Link
              to="/contact"
              className="
                group
                flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-neutral-950
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                outline-none
                transition-all
                duration-300
                hover:bg-violet-600
                hover:shadow-lg
                hover:shadow-violet-100
                focus-visible:ring-2
                focus-visible:ring-violet-500
              "
            >
              Start a Project

              <ArrowRight
                aria-hidden="true"
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {/* =====================================================
              MOBILE FOOTER
          ====================================================== */}

          <div className="mt-4 flex items-center justify-between px-2 pb-1">
            <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-300">
              Creating Digital Works
            </span>

            <span className="font-display text-xs font-bold text-neutral-300">
              39
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .navbarShell {
          animation: navbarReveal 0.55s ease-out both;
        }

        @keyframes navbarReveal {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .navbarShell {
            animation: none !important;
          }

          *,
          *::before,
          *::after {
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </header>
  )
}
