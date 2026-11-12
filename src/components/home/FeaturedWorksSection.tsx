import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  MoveUpRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import stripDigital from '../../assets/strip-digital.jpg'
import stripCreative from '../../assets/strip-creative.jpg'
import stripEntertainment from '../../assets/strip-entertainment.jpg'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

/* Jeda antar foto pada slider (ms) */
const SLIDE_INTERVAL = 5500

/*
  Foto cadangan: dipakai kalau sebuah project belum punya `image_url`
  dari API, supaya section tidak jadi teks semua.
  TODO: ini placeholder (picsum.photos). Ganti dengan foto kamu, misalnya:
    import work1 from '../../assets/work-1.jpg'
    const FALLBACK_IMAGES = [work1, work2, ...]
*/
const FALLBACK_IMAGES = [
  'https://picsum.photos/seed/39p-work-1/1600/900',
  'https://picsum.photos/seed/39p-work-2/1600/900',
  'https://picsum.photos/seed/39p-work-3/1600/900',
  'https://picsum.photos/seed/39p-work-4/1600/900',
  'https://picsum.photos/seed/39p-work-5/1600/900',
  'https://picsum.photos/seed/39p-work-6/1600/900',
]

/*
  Foto untuk strip di bawah intro.
  TODO: ganti `src` dengan foto kamu (portrait lebih bagus).
*/
const PHOTO_STRIP = [
  {
    src: stripDigital,
    alt: 'Digital — proses dan hasil karya',
    label: '01 / Digital',
  },
  {
    src: stripCreative,
    alt: 'Creative — proses dan hasil karya',
    label: '02 / Creative',
  },
  {
    src: stripEntertainment,
    alt: 'Entertainment — proses dan hasil karya',
    label: '03 / Entertainment',
  },
]

const getImage = (work: { image_url?: string | null }, index: number) =>
  work.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]

interface Portfolio {
  id: number
  title: string
  category: string
  client: string
  description: string
  year: string
  status: 'Published' | 'Draft'
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

/* ============================================================
   HELPERS
============================================================ */

const pad = (n: number) => String(n).padStart(2, '0')

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/** Menandai elemen sudah masuk layar (sekali saja). */
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}

/** Fade + naik pelan saat masuk layar. */
function Reveal({
  children,
  delayMs = 0,
  className = '',
}: {
  children: ReactNode
  delayMs?: number
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      data-in={inView}
      className={`fw-up ${className}`}
      style={delay(delayMs)}
    >
      {children}
    </div>
  )
}

/** Garis pembatas yang "ditarik" dari kiri saat masuk layar. */
function Rule({ delayMs = 0, className = '' }: { delayMs?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.5)

  return (
    <div
      ref={ref}
      data-in={inView}
      aria-hidden="true"
      className={`fw-line h-px w-full bg-black/10 ${className}`}
      style={delay(delayMs)}
    />
  )
}

/* ============================================================
   SPOTLIGHT SLIDER (foto otomatis berganti)
============================================================ */

function Placeholder() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="absolute right-[-10%] top-[-30%] h-52 w-52 rounded-full bg-[#7C3AED]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-30%] left-[-10%] h-44 w-44 rounded-full bg-white/[0.04] blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute h-24 w-24 rounded-full border border-white/10"
      />
      <span className="relative text-5xl font-black tracking-[-0.1em] text-white/[0.09]">
        39
      </span>
    </div>
  )
}

/** Foto dengan cadangan: kalau gagal dimuat, tampil blok hitam "39". */
function Photo({
  src,
  alt,
  eager = false,
  className = '',
}: {
  src?: string | null
  alt: string
  eager?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) return <Placeholder />

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onError={() => setFailed(true)}
      className={`h-full w-full select-none object-cover ${className}`}
    />
  )
}

/** Foto di strip bawah intro: terbuka bertahap saat masuk layar. */
function PhotoTile({
  photo,
  delayMs,
  className = '',
  aspect,
}: {
  photo: (typeof PHOTO_STRIP)[number]
  delayMs: number
  /** Kelas untuk <figure> (margin, col-span, dll.) */
  className?: string
  /** Kelas rasio untuk kotak foto saja, bukan caption */
  aspect: string
}) {
  const [ref, inView] = useInView<HTMLElement>(0.12)

  return (
    <figure ref={ref} data-in={inView} className={`group ${className}`}>
      <div
        className={`fw-clip relative w-full overflow-hidden bg-neutral-100 ${aspect}`}
        style={delay(delayMs)}
      >
        <div className="fw-clip-inner h-full w-full" style={delay(delayMs)}>
          <Photo
            src={photo.src}
            alt={photo.alt}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </div>
      </div>

      <figcaption
        className="fw-up mt-3 flex items-center gap-3"
        style={delay(delayMs + 350)}
      >
        <span className="h-px w-6 bg-black/10 transition-all duration-300 group-hover:w-10 group-hover:bg-[#7C3AED]" />

        <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          {photo.label}
        </span>
      </figcaption>
    </figure>
  )
}

function SpotlightSlider({ works }: { works: Portfolio[] }) {
  const count = works.length

  const [active, setActive] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Ganti otomatis. Di-reset tiap `active` berubah, jadi progress selalu sinkron
  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return

    const timer = setTimeout(() => {
      setPrev(active)
      setActive((active + 1) % count)
    }, SLIDE_INTERVAL)

    return () => clearTimeout(timer)
  }, [active, paused, reduceMotion, count])

  const current = works[active]

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Label */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
          Spotlight
        </p>

        <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
          {pad(active + 1)}
          <span className="text-neutral-300"> / {pad(count)}</span>
        </span>
      </div>

      {/* Foto */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-neutral-100 sm:aspect-[16/9] lg:aspect-[21/9]"
        role="img"
        aria-label={`${current.title} — ${current.client}`}
      >
        {works.map((work, i) => {
          const isActive = i === active
          const isPrev = i === prev

          return (
            <div
              key={work.id}
              aria-hidden="true"
              className={`absolute inset-0 ${isActive
                ? 'fw-slide-in z-20'
                : isPrev
                  ? 'z-10'
                  : 'invisible z-0'
                }`}
            >
              <div
                className={`h-full w-full ${isActive || isPrev ? 'fw-ken' : ''}`}
                style={{ animationDuration: `${SLIDE_INTERVAL + 1200}ms` }}
              >
                <Photo src={getImage(work, i)} alt="" eager={i === 0} />
              </div>

              {/* Category */}
              <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                <span className="inline-flex items-center border border-white/20 bg-black/60 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {work.category}
                </span>
              </div>

              {/* Year */}
              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <span className="inline-flex border border-black/10 bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-black backdrop-blur-sm">
                  {work.year}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info — di-remount tiap slide supaya teks masuk lagi */}
      <div
        key={current.id}
        className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end md:gap-10"
      >
        <div className="min-w-0">
          <p
            className="fw-text-in mb-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]"
            style={delay(0)}
          >
            {current.client}
          </p>

          <h3
            className="fw-text-in max-w-3xl text-2xl font-black leading-[1] tracking-[-0.045em] text-black sm:text-4xl"
            style={delay(90)}
          >
            {current.title}
          </h3>
        </div>

        <Link
          to="/portfolio"
          className="fw-text-in group inline-flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
          style={delay(180)}
        >
          View Project
          <ArrowUpRight
            size={14}
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* Progress (tanpa tombol manual) */}
      {count > 1 && (
        <div aria-hidden="true" className="mt-6 flex gap-2">
          {works.map((work, i) => (
            <span
              key={work.id}
              className="relative h-[2px] flex-1 overflow-hidden bg-black/10"
            >
              {i < active && <span className="absolute inset-0 bg-black/30" />}

              {i === active && !reduceMotion && (
                <span
                  key={active}
                  className="fw-progress absolute inset-0 origin-left bg-[#7C3AED]"
                  style={{
                    animationDuration: `${SLIDE_INTERVAL}ms`,
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                />
              )}

              {i === active && reduceMotion && (
                <span className="absolute inset-0 bg-[#7C3AED]" />
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   WORK ROW (baris project, kiri-kanan bergantian)
============================================================ */

function WorkRow({ portfolio, index }: { portfolio: Portfolio; index: number }) {
  const [ref, inView] = useInView<HTMLElement>(0.18)
  const flip = index % 2 === 1
  const number = pad(index + 1)

  return (
    <article ref={ref} data-in={inView} className="group relative">
      <Rule />

      <div
        className={`grid gap-6 py-7 md:items-center md:gap-8 lg:py-8 ${flip
          ? 'md:grid-cols-[56px_1.1fr_0.9fr]'
          : 'md:grid-cols-[56px_0.9fr_1.1fr]'
          }`}
      >
        {/* Number */}
        <div className="fw-up flex items-center gap-3" style={delay(0)}>
          <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#7C3AED]">
            {number}
          </span>

          <span className="h-px w-5 bg-black/10 md:hidden" />
        </div>

        {/* Image */}
        <div
          className={`fw-clip relative overflow-hidden bg-neutral-100 ${flip ? 'md:order-3' : ''
            }`}
          style={delay(120)}
        >
          <div className="fw-clip-inner aspect-[16/9]" style={delay(120)}>
            <Photo
              src={getImage(portfolio, index)}
              alt={portfolio.title}
              className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </div>

          {/* Category */}
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center border border-white/20 bg-black/60 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              {portfolio.category}
            </span>
          </div>

          {/* Year */}
          <div className="absolute right-3 top-3">
            <span className="inline-flex border border-black/10 bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-black backdrop-blur-sm">
              {portfolio.year}
            </span>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-3 right-3 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ExternalLink size={13} />
          </div>
        </div>

        {/* Content */}
        <div className={`relative ${flip ? 'md:order-2' : ''}`}>
          <div className="flex items-start justify-between gap-5">
            <div>
              <p
                className="fw-up mb-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]"
                style={delay(220)}
              >
                {portfolio.client}
              </p>

              <h3
                className="fw-up max-w-xl text-2xl font-black leading-[1] tracking-[-0.045em] text-black transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl"
                style={delay(300)}
              >
                {portfolio.title}
              </h3>
            </div>

            <span className="hidden font-mono text-[9px] font-bold tracking-[0.16em] text-neutral-300 sm:block">
              {number}
            </span>
          </div>

          <p
            className="fw-up mt-4 max-w-xl text-sm font-medium leading-6 text-neutral-500"
            style={delay(380)}
          >
            {portfolio.description}
          </p>

          <div
            className="fw-up mt-6 flex items-center gap-3"
            style={delay(460)}
          >
            <span className="h-px w-8 bg-black/10 transition-all duration-300 group-hover:w-12 group-hover:bg-[#7C3AED]" />

            <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
              Featured Project
            </span>

            <ArrowUpRight
              size={13}
              className="text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7C3AED]"
            />
          </div>
        </div>
      </div>
    </article>
  )
}

/* ============================================================
   SECTION
============================================================ */

export function FeaturedWorksSection() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [headlineRef, headlineIn] = useInView<HTMLHeadingElement>(0.3)

  useEffect(() => {
    let mounted = true

    const fetchPortfolios = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch portfolio (${response.status})`)
        }

        const result: ApiResponse<Portfolio[]> = await response.json()

        if (!result.success) {
          throw new Error(result.message || 'Failed to load portfolio.')
        }

        if (mounted) {
          setPortfolios(result.data || [])
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load portfolio.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchPortfolios()

    return () => {
      mounted = false
    }
  }, [])

  const featuredWorks = useMemo(() => {
    return portfolios
      .filter((portfolio) => portfolio.status === 'Published')
      .slice(0, 6)
  }, [portfolios])

  const hasWorks = !loading && !error && featuredWorks.length > 0

  return (
    <section
      id="portfolio"
      className="relative overflow-hidden bg-white text-zinc-950"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />

        <div
          className="fw-float absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]"
          style={delay(0)}
        />

        <div
          className="fw-float absolute bottom-[22%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
          style={delay(1800)}
        />
      </div>

      {/* =========================================================
          MAIN
      ========================================================== */}

      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        {/* =======================================================
            SECTION HEADER
        ======================================================== */}

        <div className="mb-12 sm:mb-14">
          <Rule />

          <Reveal className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                  39Production / Selected Works
                </span>
              </div>

              <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
                39 / 04
              </span>
            </div>
          </Reveal>
        </div>

        {/* =======================================================
            INTRO
        ======================================================== */}

        <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:gap-16">
          {/* Left */}
          <Reveal delayMs={200} className="max-w-md">
            <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
              A selection of projects we&apos;ve worked on across technology,
              design, visual, animation, games, and creative production.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#7C3AED]" />

              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Selected / Recent / Published
              </span>
            </div>
          </Reveal>

          {/* Right */}
          <div className="max-w-5xl">
            <Reveal>
              <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                Selected Works
              </p>
            </Reveal>

            <h2
              ref={headlineRef}
              data-in={headlineIn}
              className="text-[clamp(2.6rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
            >
              <span className="fw-mask block">
                <span style={delay(80)}>Work that</span>
              </span>

              <span className="fw-mask block">
                <span className="text-neutral-300" style={delay(200)}>
                  speaks for itself.
                </span>
              </span>
            </h2>

            <Reveal delayMs={320}>
              <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
                Setiap project punya konteks dan tujuan yang berbeda. Berikut
                beberapa karya yang merepresentasikan cara kami bekerja.
              </p>
            </Reveal>
          </div>
        </div>

        {/* =======================================================
            PHOTO STRIP
            Mobile: 1 foto lebar + 2 foto kecil · Tablet+: 3 foto
            dengan tinggi berbeda supaya tidak kaku
        ======================================================== */}

        <div className="mt-14 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-4 md:grid-cols-3 md:items-start md:gap-6">
          <PhotoTile
            photo={PHOTO_STRIP[0]}
            delayMs={0}
            className="col-span-2 md:col-span-1"
            aspect="aspect-[16/10] md:aspect-[4/5]"
          />

          <PhotoTile
            photo={PHOTO_STRIP[1]}
            delayMs={150}
            className="md:mt-14"
            aspect="aspect-[4/5] md:aspect-[3/4]"
          />

          <PhotoTile
            photo={PHOTO_STRIP[2]}
            delayMs={300}
            className="md:mt-6"
            aspect="aspect-[4/5]"
          />
        </div>

        {/* =======================================================
            WORK HEADER
        ======================================================== */}

        <div className="mt-16 sm:mt-20">
          <Rule />

          <Reveal className="pt-7">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                  Featured Projects
                </p>

                <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
                  A closer look at
                  <span className="text-neutral-300"> what we make.</span>
                </h3>
              </div>

              <Link
                to="/portfolio"
                className="group inline-flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
              >
                View All Works

                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* =======================================================
            LOADING
        ======================================================== */}

        {loading && (
          <div className="mt-7 border-t border-black/10">
            <div className="flex min-h-[280px] items-center justify-center border-b border-black/10">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#7C3AED]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Loading selected works
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            ERROR
        ======================================================== */}

        {!loading && error && (
          <div className="mt-7 border-t border-black/10">
            <div className="border-b border-black/10 py-14 text-center">
              <p className="text-sm font-bold text-black">
                Unable to load portfolio
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-neutral-500">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            EMPTY
        ======================================================== */}

        {!loading && !error && featuredWorks.length === 0 && (
          <div className="mt-7 border-t border-black/10">
            <div className="flex flex-col items-center justify-center border-b border-black/10 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10">
                <Sparkles className="h-4 w-4 text-[#7C3AED]" />
              </div>

              <h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-black">
                More work is coming.
              </h3>

              <p className="mt-2 max-w-md text-xs leading-6 text-neutral-500">
                We&apos;re currently preparing more projects to showcase here.
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            SPOTLIGHT SLIDER
        ======================================================== */}

        {hasWorks && (
          <Reveal className="mt-8 sm:mt-10">
            <SpotlightSlider works={featuredWorks} />
          </Reveal>
        )}

        {/* =======================================================
            PROJECT LIST
        ======================================================== */}

        {hasWorks && (
          <div className="mt-14 sm:mt-16">
            {featuredWorks.map((portfolio, index) => (
              <WorkRow
                key={portfolio.id}
                portfolio={portfolio}
                index={index}
              />
            ))}
          </div>
        )}

        {/* =======================================================
            BOTTOM CTA
        ======================================================== */}

        {hasWorks && (
          <div className="mt-14 sm:mt-16">
            <Rule />

            <Reveal className="pt-8">
              <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                    Explore More
                  </p>

                  <h3 className="mt-3 max-w-3xl text-3xl font-black leading-[0.94] tracking-[-0.05em] text-black sm:text-4xl">
                    There&apos;s more
                    <span className="text-neutral-300"> behind the work.</span>
                  </h3>

                  <p className="mt-4 max-w-xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                    Lihat lebih banyak project, eksperimen, dan karya yang
                    pernah kami kerjakan.
                  </p>
                </div>

                <Link
                  to="/portfolio"
                  className="group inline-flex w-fit items-center gap-3 rounded-full bg-black px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED]"
                >
                  Explore Portfolio

                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        )}

        {/* =======================================================
            SIGNATURE
        ======================================================== */}

        <div className="mt-10">
          <Rule />

          <Reveal className="pt-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
                39PRODUCTION
              </span>

              <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
                Selected Works / 2026
              </span>

              <MoveUpRight size={13} className="text-neutral-400" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* =========================================================
          ANIMATION
      ========================================================== */}

      <style>{`
        /* ---------- Scroll reveal ---------- */
        .fw-up {
          opacity: 0;
          transform: translateY(26px);
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms),
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
        }

        .fw-up[data-in='true'],
        [data-in='true'] .fw-up {
          opacity: 1;
          transform: none;
        }

        /* Garis ditarik dari kiri */
        .fw-line {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1.3s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
        }

        .fw-line[data-in='true'] {
          transform: scaleX(1);
        }

        /* Judul naik dari balik masker */
        .fw-mask {
          overflow: hidden;
          padding-bottom: 0.1em;
          margin-bottom: -0.1em;
        }

        .fw-mask > span {
          display: inline-block;
          transform: translateY(110%);
          transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
        }

        [data-in='true'] .fw-mask > span {
          transform: none;
        }

        /* Foto terbuka dari atas ke bawah + zoom-out halus */
        .fw-clip {
          clip-path: inset(0 0 100% 0);
          transition: clip-path 1.2s cubic-bezier(0.77, 0, 0.18, 1) var(--d, 0ms);
        }

        .fw-clip-inner {
          transform: scale(1.18);
          transition: transform 1.8s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms);
        }

        [data-in='true'] .fw-clip {
          clip-path: inset(0 0 0 0);
        }

        [data-in='true'] .fw-clip-inner {
          transform: scale(1);
        }

        /* ---------- Slider ---------- */
        @keyframes fwSlideIn {
          from { clip-path: inset(0 0 0 100%); }
          to   { clip-path: inset(0 0 0 0); }
        }

        @keyframes fwKen {
          from { transform: scale(1.14); }
          to   { transform: scale(1); }
        }

        @keyframes fwTextIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: none; }
        }

        @keyframes fwProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .fw-slide-in {
          animation: fwSlideIn 1.1s cubic-bezier(0.77, 0, 0.18, 1) both;
        }

        .fw-ken {
          animation: fwKen 6.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .fw-text-in {
          opacity: 0;
          animation: fwTextIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms) forwards;
        }

        .fw-progress {
          animation-name: fwProgress;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        /* ---------- Titik dekoratif melayang pelan ---------- */
        @keyframes fwFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }

        .fw-float {
          animation: fwFloat 7s ease-in-out var(--d, 0ms) infinite;
        }

        /* ---------- Reduced motion ---------- */
        @media (prefers-reduced-motion: reduce) {
          .fw-up,
          .fw-line,
          .fw-mask > span,
          .fw-clip,
          .fw-clip-inner,
          .fw-text-in {
            opacity: 1 !important;
            transform: none !important;
            clip-path: none !important;
            transition: none !important;
            animation: none !important;
          }

          .fw-slide-in,
          .fw-ken,
          .fw-float {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}