import { useEffect, useRef, useState } from 'react'
import type {
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Home,
  Info,
  Layers,
  LayoutGrid,
  Mail,
  Menu,
  Music,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Logo } from './Logo'
import { NAV_LINKS } from '@/utils/constants'

/* =========================================================
   KONFIGURASI
========================================================== */

/* Jumlah link yang tampil sebagai tab di bottom bar.
   Sisanya masuk ke sheet "Menu". */
const MOBILE_TAB_COUNT = 4

const CUBE_FACES = [
  'rotateY(0deg)',
  'rotateY(90deg)',
  'rotateY(180deg)',
  'rotateY(270deg)',
  'rotateX(90deg)',
  'rotateX(-90deg)',
]

/* Ikon dipilih dari path / label. Sesuaikan kalau path kamu berbeda. */
function getNavIcon(path: string, label: string): LucideIcon {
  const key = `${path} ${label}`.toLowerCase()

  if (path === '/') return Home
  if (/about|tentang|company|profil/.test(key)) return Info
  if (/service|layanan|jasa/.test(key)) return Layers
  if (/portfolio|work|project|karya|case/.test(key)) return Briefcase
  if (/idol|music|entertain|artist/.test(key)) return Music
  if (/blog|news|article|artikel|insight/.test(key)) return BookOpen
  if (/team|tim|career|karir/.test(key)) return Users
  if (/contact|kontak|hubungi/.test(key)) return Mail

  return LayoutGrid
}

/* Kubus wireframe kecil sebagai motif brand */
function NavCube({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`nb-cube-wrap ${className}`}
    >
      <span className="nb-cube">
        {CUBE_FACES.map((transform) => (
          <i
            key={transform}
            style={{
              transform: `${transform} translateZ(calc(var(--s) / 2))`,
            }}
          />
        ))}
      </span>
    </span>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] =
    useState(false)

  const [mobileSecretActive, setMobileSecretActive] =
    useState(false)

  const [dragY, setDragY] = useState(0)

  const location = useLocation()
  const navigate = useNavigate()

  const headerRef =
    useRef<HTMLElement | null>(null)

  const mobileSecretInputRef =
    useRef<HTMLInputElement | null>(null)

  const mobileLogoTapCountRef =
    useRef(0)

  const mobileLogoTapTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  const dragStartRef =
    useRef<number | null>(null)

  /* =========================================================
     FONT (dipakai bersama splash, hero, dan tombol WhatsApp)
  ========================================================== */

  useEffect(() => {
    const fontId = 'splash-fonts'
    if (document.getElementById(fontId)) return

    const link = document.createElement('link')
    link.id = fontId
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
  }, [])

  /* =========================================================
     SCROLL STATE + PROGRESS
  ========================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)

      const max =
        document.documentElement.scrollHeight -
        window.innerHeight

      const progress =
        max > 0
          ? Math.min(1, Math.max(0, window.scrollY / max))
          : 0

      headerRef.current?.style.setProperty(
        '--sp',
        progress.toFixed(4),
      )
    }

    handleScroll()

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true },
    )

    window.addEventListener(
      'resize',
      handleScroll,
    )

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll,
      )
      window.removeEventListener(
        'resize',
        handleScroll,
      )
    }
  }, [location.pathname])

  /* =========================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ========================================================== */

  useEffect(() => {
    setIsOpen(false)
    setMobileSecretActive(false)
  }, [location.pathname])

  /* =========================================================
     LOCK BODY SCROLL + ESCAPE
  ========================================================== */

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [isOpen])

  /* =========================================================
     SECRET ADMIN ACCESS — DESKTOP
     
     Type:
       portal

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

    const SECRET_KEYWORD = 'portal'

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
       * Hanya menerima karakter yang
       * memang diperlukan oleh keyword.
       */
      const key =
        event.key.toLowerCase()

      if (
        !SECRET_KEYWORD.includes(key)
      ) {
        resetSequence()
        return
      }

      /*
       * Karakter harus mengikuti urutan
       * keyword: p → o → r → t → a → l
       */
      const expectedKey =
        SECRET_KEYWORD[
        secretSequence.length
        ]

      if (key !== expectedKey) {
        resetSequence()
        return
      }

      secretSequence += key

      /*
       * Keyword selesai.
       */
      if (
        secretSequence ===
        SECRET_KEYWORD
      ) {
        resetSequence()

        if (
          location.pathname !==
          '/admin/access'
        ) {
          navigate('/admin/access')
        }

        return
      }

      /*
       * Reset apabila terlalu lama
       * antara karakter.
       */
      if (resetTimer) {
        clearTimeout(resetTimer)
      }

      resetTimer = setTimeout(() => {
        resetSequence()
      }, 1500)
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
     MOBILE SECRET ACCESS
     
     Mobile browser tidak selalu mengirim
     keyboard event ke window.

     Flow:
       Sheet Menu
          ↓
       Tap header brand 5x
          ↓
       Hidden input aktif
          ↓
       Keyboard mobile muncul
          ↓
       Ketik "portal"
          ↓
       /admin/access
  ========================================================== */

  const handleMobileLogoSecret = () => {
    if (!isOpen) {
      return
    }

    mobileLogoTapCountRef.current += 1

    if (
      mobileLogoTapTimerRef.current
    ) {
      clearTimeout(
        mobileLogoTapTimerRef.current,
      )
    }

    /*
     * Lima tap dalam waktu singkat
     * mengaktifkan input keyword.
     */
    if (
      mobileLogoTapCountRef.current >=
      5
    ) {
      mobileLogoTapCountRef.current = 0

      setMobileSecretActive(true)

      return
    }

    mobileLogoTapTimerRef.current =
      setTimeout(() => {
        mobileLogoTapCountRef.current = 0
      }, 1500)
  }

  /* =========================================================
     FOCUS MOBILE SECRET INPUT
  ========================================================== */

  useEffect(() => {
    if (!mobileSecretActive) {
      return
    }

    const focusSecretInput = () => {
      const input =
        mobileSecretInputRef.current

      if (!input) {
        return
      }

      input.focus()

      try {
        input.setSelectionRange(
          input.value.length,
          input.value.length,
        )
      } catch {
        // Tidak semua mobile browser mendukung selection range.
      }
    }

    const timer =
      window.setTimeout(
        focusSecretInput,
        50,
      )

    return () => {
      window.clearTimeout(timer)
    }
  }, [mobileSecretActive])

  /* =========================================================
     MOBILE SECRET KEYWORD HANDLER
  ========================================================== */

  const handleMobileSecretInput = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const keyword = 'portal'

    const value =
      event.target.value
        .toLowerCase()
        .replace(/[^a-z]/g, '')

    const normalizedValue =
      value.slice(
        0,
        keyword.length,
      )

    if (
      !keyword.startsWith(
        normalizedValue,
      )
    ) {
      event.target.value = ''
      return
    }

    if (
      normalizedValue === keyword
    ) {
      event.target.value = ''

      setMobileSecretActive(false)
      setIsOpen(false)

      navigate('/admin/access')
    }
  }

  /* =========================================================
     CLEANUP MOBILE SECRET TIMER
  ========================================================== */

  useEffect(() => {
    return () => {
      if (
        mobileLogoTapTimerRef.current
      ) {
        clearTimeout(
          mobileLogoTapTimerRef.current,
        )
      }
    }
  }, [])

  /* =========================================================
     SHEET: GESER KE BAWAH UNTUK MENUTUP
  ========================================================== */

  const onHandleDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    dragStartRef.current = event.clientY
    event.currentTarget.setPointerCapture(
      event.pointerId,
    )
  }

  const onHandleMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (dragStartRef.current === null) return

    setDragY(
      Math.max(
        0,
        event.clientY -
        dragStartRef.current,
      ),
    )
  }

  const onHandleUp = () => {
    if (dragStartRef.current === null) return

    const shouldClose = dragY > 90

    dragStartRef.current = null
    setDragY(0)

    if (shouldClose) {
      setIsOpen(false)
    }
  }

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

  const primaryLinks =
    NAV_LINKS.slice(0, MOBILE_TAB_COUNT)

  const overflowLinks =
    NAV_LINKS.slice(MOBILE_TAB_COUNT)

  const menuActive =
    isOpen ||
    overflowLinks.some((link) =>
      isActive(link.path),
    )

  return (
    <>
      {/* =========================================================
          HEADER (desktop navbar + top bar mobile)
      ========================================================== */}

      <header
        ref={headerRef}
        className="nb-root fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 lg:px-6"
      >
        {/* ---------------------------------------------------
            DESKTOP NAVBAR
        ---------------------------------------------------- */}

        <nav
          aria-label="Navigasi utama"
          className={`nb-shell relative mx-auto hidden max-w-7xl items-center justify-between overflow-hidden rounded-xl border transition-all duration-500 lg:flex ${isScrolled
            ? 'border-neutral-200 bg-white/95 px-4 py-1.5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl'
            : 'border-transparent bg-white/70 px-2 py-1.5 backdrop-blur-md'
            }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo
              size="sm"
              showSubtext={false}
              className="shrink-0"
            />

            <span
              aria-hidden="true"
              className="nb-rec hidden h-1.5 w-1.5 rounded-full bg-fuchsia-500 xl:block"
            />
          </div>

          {/* Links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.path)

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={
                    active ? 'page' : undefined
                  }
                  className={`nb-link group relative rounded-lg px-4 py-2 text-sm font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${active
                    ? 'text-violet-600'
                    : 'text-neutral-500 hover:text-neutral-950'
                    }`}
                >
                  <span className="nb-flip">
                    <span className="nb-flip-in">
                      <span className="nb-f1">
                        {link.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="nb-f2"
                      >
                        {link.label}
                      </span>
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 bottom-0.5 h-[2px] origin-left bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${active
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-50'
                      }`}
                  />
                </Link>
              )
            })}
          </div>

          {/* CTA */}
          <Link
            to="/contact"
            className="nb-cta group relative inline-flex min-h-10 items-center gap-2.5 overflow-hidden bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white outline-none transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-200 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]"
            />

            <span className="relative">
              Start a Project
            </span>

            <NavCube className="relative" />
          </Link>

          {/* Progress scroll */}
          <span
            aria-hidden="true"
            className="nb-progress absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-300"
          />
        </nav>

        {/* ---------------------------------------------------
            MOBILE TOP BAR
        ---------------------------------------------------- */}

        <div
          className={`nb-shell relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden rounded-xl border px-3 py-1.5 transition-all duration-500 lg:hidden ${isScrolled
            ? 'border-neutral-200 bg-white/95 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-xl'
            : 'border-transparent bg-white/70 backdrop-blur-md'
            }`}
        >
          <Logo
            size="sm"
            showSubtext={false}
            className="shrink-0"
          />

          <Link
            to="/contact"
            className="nb-cta group relative inline-flex min-h-9 items-center gap-2 overflow-hidden bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-white outline-none transition-colors duration-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]"
            />
            <span className="relative">Start</span>
            <NavCube className="relative" />
          </Link>

          <span
            aria-hidden="true"
            className="nb-progress absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-300"
          />
        </div>
      </header>

      {/* =========================================================
          MOBILE BOTTOM TAB BAR (ala aplikasi)
      ========================================================== */}

      <nav
        aria-label="Navigasi bawah"
        className="nb-root nb-bar fixed inset-x-3 bottom-3 z-50 lg:hidden"
        style={{
          bottom:
            'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        <div
          className="relative grid items-end rounded-2xl border border-black/10 bg-white/92 px-1.5 pb-1.5 pt-2 shadow-[0_-8px_40px_rgba(15,23,42,0.1),0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          style={{
            gridTemplateColumns: `repeat(${primaryLinks.length + 1}, minmax(0, 1fr))`,
          }}
        >
          {/* Garis aksen atas */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent"
          />

          {primaryLinks.map((link) => {
            const active = isActive(link.path)
            const Icon = getNavIcon(
              link.path,
              link.label,
            )

            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={
                  active ? 'page' : undefined
                }
                data-active={active}
                className="nb-tab group relative flex min-w-0 flex-col items-center gap-1 pb-1 pt-1 outline-none"
              >
                <span className="nb-ico relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-500">
                  <Icon
                    aria-hidden="true"
                    className="h-[19px] w-[19px]"
                    strokeWidth={2}
                  />
                </span>

                <span className="nb-label max-w-full truncate text-[10px] font-semibold text-neutral-400">
                  {link.label}
                </span>
              </Link>
            )
          })}

          {/* Tab Menu */}
          <button
            type="button"
            onClick={() =>
              setIsOpen((value) => !value)
            }
            aria-label={
              isOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            data-active={menuActive}
            className="nb-tab group relative flex min-w-0 flex-col items-center gap-1 pb-1 pt-1 outline-none"
          >
            <span className="nb-ico relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-500">
              {isOpen ? (
                <X
                  aria-hidden="true"
                  className="h-[19px] w-[19px]"
                />
              ) : (
                <Menu
                  aria-hidden="true"
                  className="h-[19px] w-[19px]"
                />
              )}
            </span>

            <span className="nb-label text-[10px] font-semibold text-neutral-400">
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* =========================================================
          BOTTOM SHEET OVERLAY
      ========================================================== */}

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[55] bg-neutral-950/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${isOpen
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* =========================================================
          BOTTOM SHEET MENU
      ========================================================== */}

      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        aria-hidden={!isOpen}
        className={`nb-root nb-sheet fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-lg lg:hidden ${isOpen ? 'visible' : 'invisible'
          }`}
        style={{
          transform: isOpen
            ? `translateY(${dragY}px)`
            : 'translateY(105%) rotateX(14deg)',
          opacity: isOpen ? 1 : 0,
          transition:
            dragY > 0
              ? 'none'
              : 'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease, visibility 0.55s',
        }}
      >
        <div className="relative overflow-hidden rounded-t-3xl border border-b-0 border-black/10 bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.2)]">
          {/* Aksen latar */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-fuchsia-100/60 blur-3xl" />

          {/* Bracket viewfinder */}
          <span aria-hidden="true" className="nb-bracket left-3 top-3 border-l border-t" />
          <span aria-hidden="true" className="nb-bracket right-3 top-3 border-r border-t" />

          {/* Kubus dekorasi */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-10"
          >
            <div className="nb-float">
              <span className="nb-cube-wrap nb-cube-lg">
                <span className="nb-cube">
                  {CUBE_FACES.map((transform) => (
                    <i
                      key={transform}
                      style={{
                        transform: `${transform} translateZ(calc(var(--s) / 2))`,
                      }}
                    />
                  ))}
                </span>
              </span>
            </div>
          </div>

          {/* Handle geser */}
          <div
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={onHandleUp}
            className="relative flex cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
          >
            <span className="h-1 w-10 rounded-full bg-neutral-300" />
          </div>

          <div className="relative max-h-[78vh] overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {/* ===================================================
                BRAND HEADER (tap 5x untuk akses rahasia)
            ==================================================== */}
            <button
              type="button"
              onClick={handleMobileLogoSecret}
              aria-label="Sankyuu Production"
              className="mb-1 flex w-full items-center justify-between py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <div>
                <p className="nb-mono flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-neutral-400">
                  <span className="nb-rec h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                  Navigation
                </p>

                <p className="nb-display mt-1 text-lg font-bold tracking-[-0.04em] text-neutral-950">
                  Sankyuu Production
                </p>
              </div>
            </button>

            {/* Input rahasia (tidak terlihat) */}
            {mobileSecretActive && (
              <div className="relative h-0 overflow-hidden">
                <input
                  ref={mobileSecretInputRef}
                  type="text"
                  inputMode="text"
                  enterKeyHint="done"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-label="Portal keyword"
                  onChange={handleMobileSecretInput}
                  className="absolute left-0 top-0 h-px w-px opacity-0"
                />
              </div>
            )}

            {/* ===================================================
                LINKS — tile 2 kolom
            ==================================================== */}
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {NAV_LINKS.map((link, index) => {
                const active = isActive(link.path)
                const Icon = getNavIcon(
                  link.path,
                  link.label,
                )

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={
                      active ? 'page' : undefined
                    }
                    className={`nb-tile group relative flex min-h-[84px] flex-col justify-between overflow-hidden border p-3.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-500 ${active
                      ? 'border-black bg-black text-white shadow-[4px_4px_0_0_rgba(124,58,237,0.9)]'
                      : 'border-neutral-200 bg-white text-neutral-700 active:scale-[0.97]'
                      }`}
                    style={{
                      animationDelay: isOpen
                        ? `${120 + index * 45}ms`
                        : '0ms',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <Icon
                        aria-hidden="true"
                        className={`h-5 w-5 transition-transform duration-500 group-hover:[transform:rotateY(360deg)] ${active
                          ? 'text-violet-300'
                          : 'text-violet-600'
                          }`}
                      />

                      <span
                        className={`nb-mono text-[9px] tracking-[0.18em] ${active
                          ? 'text-white/50'
                          : 'text-neutral-300'
                          }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <span className="nb-display text-sm font-bold tracking-[-0.02em]">
                      {link.label}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* ===================================================
                CTA
            ==================================================== */}
            <Link
              to="/contact"
              className="nb-cta group relative mt-4 flex min-h-12 items-center justify-center gap-2.5 overflow-hidden bg-neutral-950 px-4 py-3 text-sm font-semibold text-white outline-none transition-colors duration-300 hover:bg-violet-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-violet-500"
            >
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

            {/* ===================================================
                FOOTER
            ==================================================== */}
            <div className="mt-4 flex items-center justify-between px-1">
              <span className="nb-mono text-[9px] uppercase tracking-[0.2em] text-neutral-300">
                Creating Digital Works
              </span>

              <span className="nb-display text-xs font-bold text-neutral-300">
                39
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .nb-root { font-family: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif; }
        .nb-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .nb-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }

        /* ---------- Ruang untuk bottom bar di mobile ---------- */
        @media (max-width: 1023px) {
          body { padding-bottom: calc(84px + env(safe-area-inset-bottom)); }
          /* Geser tombol WhatsApp float agar tidak tertutup bottom bar */
          .wa-float { bottom: calc(5.75rem + env(safe-area-inset-bottom)) !important; }
        }

        /* ---------- Entrance ---------- */
        .nb-shell { animation: nbDrop 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nb-bar {
          animation: nbRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
          transform-origin: 50% 100%;
          perspective: 700px;
        }

        /* ---------- Progress scroll ---------- */
        .nb-progress {
          transform: scaleX(var(--sp, 0));
          transition: transform 0.12s linear;
        }

        .nb-rec {
          animation: nbBlink 1.1s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(217, 70, 239, 0.7);
        }

        /* ---------- Label flip 3D (desktop) ---------- */
        .nb-flip {
          display: block;
          height: 20px;
          line-height: 20px;
          perspective: 500px;
        }
        .nb-flip-in {
          display: block;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nb-f1 {
          display: block;
          transform: translateZ(10px);
        }
        .nb-f2 {
          position: absolute;
          inset: 0;
          display: block;
          color: #7c3aed;
          transform: rotateX(-90deg) translateZ(10px);
        }
        .nb-link:hover .nb-flip-in,
        .nb-link:focus-visible .nb-flip-in {
          transform: rotateX(90deg);
        }

        /* ---------- Kubus wireframe ---------- */
        .nb-cube-wrap {
          display: inline-block;
          width: 14px;
          height: 14px;
          perspective: 200px;
        }
        .nb-cube-lg { width: 44px; height: 44px; perspective: 500px; }
        .nb-cube {
          --s: 14px;
          position: relative;
          display: block;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: nbCube 8s linear infinite;
        }
        .nb-cube-lg .nb-cube { --s: 44px; animation-duration: 14s; }
        .nb-cube i {
          position: absolute;
          inset: 0;
          border: 1px solid currentColor;
          background: rgba(255, 255, 255, 0.08);
        }
        .nb-cube-lg .nb-cube i {
          border-color: rgba(124, 58, 237, 0.8);
          background: rgba(124, 58, 237, 0.07);
        }
        .nb-cta:hover .nb-cube { animation-duration: 2.4s; }

        /* ---------- Bottom tab bar ---------- */
        .nb-ico {
          transition:
            transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
            background-color 0.3s ease,
            color 0.3s ease,
            box-shadow 0.3s ease;
        }
        .nb-label {
          transition:
            color 0.3s ease,
            transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nb-tab:active .nb-ico { transform: scale(0.88); }
        .nb-tab:focus-visible .nb-ico {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }

        .nb-tab[data-active='true'] .nb-ico {
          transform: translateY(-14px) scale(1.06);
          background: #0a0a0a;
          color: #ffffff;
          box-shadow: 0 12px 22px -8px rgba(124, 58, 237, 0.7);
        }
        .nb-tab[data-active='true'] .nb-ico svg {
          animation: nbFlip 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .nb-tab[data-active='true'] .nb-ico::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid #7c3aed;
          animation: nbRipple 0.8s ease-out both;
        }
        .nb-tab[data-active='true'] .nb-label {
          color: #0a0a0a;
          transform: translateY(-10px);
        }

        /* ---------- Bottom sheet ---------- */
        .nb-sheet {
          transform-origin: 50% 100%;
          perspective: 900px;
        }
        .nb-bracket {
          position: absolute;
          z-index: 5;
          width: 12px;
          height: 12px;
          border-color: rgba(124, 58, 237, 0.65);
          pointer-events: none;
        }
        .nb-tile {
          animation: nbTile 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .nb-float { animation: nbFloat 7s ease-in-out infinite; }

        /* ---------- Keyframes ---------- */
        @keyframes nbDrop {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nbRise {
          from { opacity: 0; transform: translateY(40px) rotateX(-35deg); }
          to   { opacity: 1; transform: translateY(0) rotateX(0deg); }
        }
        @keyframes nbBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: .25; }
        }
        @keyframes nbCube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        @keyframes nbFlip {
          from { transform: rotateY(-180deg) scale(0.6); opacity: 0; }
          to   { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes nbRipple {
          from { transform: scale(1); opacity: 0.7; }
          to   { transform: scale(1.9); opacity: 0; }
        }
        @keyframes nbTile {
          from { opacity: 0; transform: translateY(14px) rotateX(-25deg); }
          to   { opacity: 1; transform: translateY(0) rotateX(0deg); }
        }
        @keyframes nbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .nb-shell,
          .nb-bar,
          .nb-rec,
          .nb-cube,
          .nb-tile,
          .nb-float,
          .nb-tab[data-active='true'] .nb-ico svg,
          .nb-tab[data-active='true'] .nb-ico::after {
            animation: none !important;
          }

          .nb-flip-in,
          .nb-ico,
          .nb-label,
          .nb-progress {
            transition: none !important;
          }

          *,
          *::before,
          *::after {
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </>
  )
}