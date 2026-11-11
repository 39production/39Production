import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react'

import heroBackground from '../../assets/hero-background.mp4'

/* ============================================================
   DATA
   Satu service = satu foto. Foto otomatis berganti mengikuti
   service yang sedang aktif di menu bawahnya.

   TODO: `image` di bawah masih placeholder (picsum.photos).
   Ganti dengan foto kamu, misalnya:
     import digitalPhoto from '../../assets/service-digital.jpg'
     image: digitalPhoto
   Kalau gambar gagal dimuat, otomatis tampil panel dummy lokal.
============================================================ */
const SERVICES = [
  {
    no: '01',
    title: 'Digital',
    meta: 'Web · App · Game',
    image: 'https://picsum.photos/seed/39p-digital/1920/820',
    alt: 'Digital — web, app, dan game',
    className: 'md:border-r md:pr-6 lg:pr-8',
  },
  {
    no: '02',
    title: 'Creative',
    meta: 'Design · Animation · Visual',
    image: 'https://picsum.photos/seed/39p-creative/1920/820',
    alt: 'Creative — design, animation, dan visual',
    className: 'md:border-r md:px-6 lg:px-8',
  },
  {
    no: '03',
    title: 'Entertainment',
    meta: 'Music · Idol · Production',
    image: 'https://picsum.photos/seed/39p-entertainment/1920/820',
    alt: 'Entertainment — music, idol, dan production',
    className: 'md:pl-6 lg:pl-8',
  },
]

const STATS = [
  { value: '03', label: 'Divisions' },
  { value: '07', label: 'Disciplines' },
  { value: '01', label: 'Team' },
]

const TAGLINES = [
  'Creating Digital Works',
  'Producing Stories',
  'Sharing Gratitude',
  'Creative × Technology × Entertainment',
]

/* Jeda antar foto (ms) */
const SLIDE_INTERVAL = 5000

/* Delay animasi per elemen lewat CSS variable (lihat <style> di bawah) */
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

const FILTER = 'brightness(1.03) contrast(6.54) saturate(1.88)'

/* ------------------------------------------------------------------ */
/* Foto slide dengan fallback dummy lokal (tanpa API)                  */
/* ------------------------------------------------------------------ */
function SlideImage({
  src,
  eager,
  index,
}: {
  src: string
  eager: boolean
  index: number
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#0d0820]">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 340"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <radialGradient id={`hs-a-${index}`} cx="15%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`hs-b-${index}`} cx="90%" cy="90%" r="60%">
              <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
            </radialGradient>
            <pattern
              id={`hs-g-${index}`}
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path d="M32 0H0V32" fill="none" stroke="#fff" strokeOpacity="0.05" />
            </pattern>
          </defs>
          <rect width="800" height="340" fill={`url(#hs-a-${index})`} />
          <rect width="800" height="340" fill={`url(#hs-b-${index})`} />
          <rect width="800" height="340" fill={`url(#hs-g-${index})`} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <rect
              key={i}
              x={420 + i * 34}
              y={300 - (40 + ((i * 47 + index * 31) % 150))}
              width="18"
              height={40 + ((i * 47 + index * 31) % 150)}
              fill={i % 4 === 0 ? '#E78FBA' : '#7C3AED'}
              opacity={0.4 + (i % 3) * 0.2}
            />
          ))}
          <text
            x="40"
            y="310"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.3"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="150"
            fontWeight="900"
            letterSpacing="-12"
          >
            39
          </text>
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      onError={() => setFailed(true)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setFailed(true)
      }}
      className="hero-kb h-full w-full select-none object-cover"
    />
  )
}

/* ============================================================
   COMPONENT
============================================================ */
export function HeroSection() {
  /* ---------- Video hero ---------- */
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    video.playbackRate = 0.7

    const playVideo = async () => {
      try {
        await video.play()
      } catch {
        // Autoplay may be blocked by the browser.
      }
    }

    playVideo()
  }, [])

  /* ---------- Foto + service otomatis ---------- */
  const count = SERVICES.length

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  // Hormati preferensi reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Ganti otomatis. Di-reset tiap `active` berubah, jadi progress selalu sinkron
  useEffect(() => {
    if (paused || reduceMotion) return

    const timer = setTimeout(
      () => setActive((i) => (i + 1) % count),
      SLIDE_INTERVAL,
    )
    return () => clearTimeout(timer)
  }, [active, paused, reduceMotion, count])

  /* ---------- Tilt 3D mengikuti kursor ---------- */
  const stageRef = useRef<HTMLDivElement | null>(null)

  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType === 'touch') return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
  }

  const onStageLeave = () => {
    const el = stageRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  return (
    <section className="hr relative isolate overflow-hidden bg-white text-black">
      {/* =========================================================
          HERO
      ========================================================= */}
      <div className="relative mx-auto max-w-[1600px] px-5 pb-14 pt-[10px] sm:px-8 sm:pb-20 sm:pt-[20px] lg:px-12 lg:pb-24 lg:pt-[30px]">
        <div className="relative py-6 sm:py-9 lg:py-12">
          {/* -----------------------------------------------------
              TOP BRAND LINE
          ----------------------------------------------------- */}
          <div
            className="hero-item relative z-30 flex items-center justify-between gap-4 border-b border-black/10 pb-4 sm:pb-5"
            style={delay(0)}>
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <span className="shrink-0 text-base font-black tracking-[-0.06em] text-black sm:text-lg">
                39Production
              </span>

              <span className="hr-blink hidden h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600 sm:block sm:h-2 sm:w-2" />

              <span className="hidden truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400 sm:block sm:text-[10px] sm:tracking-[0.2em]">
                Digital Production House
              </span>
            </div>

            <span className="shrink-0 text-right font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px] sm:tracking-[0.2em]">
              Indonesia / 2026
            </span>
          </div>

          {/* -----------------------------------------------------
              MAIN COMPOSITION
              Mobile : headline → stage 3D → deskripsi + CTA
              Desktop: kiri teks, kanan stage 3D
          ----------------------------------------------------- */}
          <div className="relative mt-6 grid items-center gap-y-2 sm:mt-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-8 xl:grid-cols-[0.82fr_1.18fr] xl:gap-x-10">
            {/* ---------------- HEADLINE ---------------- */}
            <div className="relative z-20 lg:col-start-1 lg:row-start-1 lg:self-end">
              <p
                className="hero-item mb-4 flex items-center gap-3 font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:mb-5 sm:text-[10px] sm:tracking-[0.28em]"
                style={delay(80)}
              >
                <span className="hr-grow h-px w-8 bg-violet-600" />
                Creative × Technology × Entertainment
              </p>

              <h1 className="max-w-[760px] text-[2.95rem] font-black leading-[0.9] tracking-[-0.075em] text-black sm:text-6xl md:text-7xl lg:text-[5.4rem] xl:text-[6.8rem]">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="hr-up block" style={delay(160)}>
                    We turn
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="hr-up block" style={delay(260)}>
                    <span className="relative inline-block">
                      <span className="relative z-10">ideas</span>
                      <span
                        aria-hidden="true"
                        className="hr-draw absolute bottom-[0.04em] left-0 right-[-3%] z-0 h-[0.11em] bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-600"
                      />
                    </span>
                    <span className="text-neutral-300">{' '}into</span>
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span
                    className="hr-up block text-neutral-300"
                    style={delay(360)}
                  >
                    experiences.
                  </span>
                </span>
              </h1>
            </div>

            {/* ---------------- STAGE 3D ---------------- */}
            <div
              ref={stageRef}
              onPointerMove={onStageMove}
              onPointerLeave={onStageLeave}
              className="hero-video hr-stage relative lg:col-start-2 lg:row-span-2 lg:row-start-1"
              style={delay(140)}
            >
              <div className="hr-tilt relative">
                {/* Bingkai koordinat */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 inset-y-3 border border-black/[0.07] sm:inset-y-4"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2 top-5 z-10 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 sm:left-3 sm:top-6"
                >
                  Fig.39 / Showreel
                </span>

                <div className="relative flex items-center justify-center py-3 sm:py-4 lg:min-h-[500px] lg:py-0 xl:min-h-[590px]">
                  <div className="relative z-10 flex w-full items-center justify-center">
                    <video
                      ref={videoRef}
                      src={heroBackground}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="block h-auto max-h-[52vh] w-full max-w-none object-contain sm:max-h-[60vh] lg:max-h-[68vh]"
                      style={{ filter: FILTER }}
                    />

                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"
                    />

                    {/* Showreel */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2.5 sm:bottom-4 sm:left-4 lg:bottom-6 lg:left-6">
                      <span className="hr-pulse relative flex h-9 w-9 items-center justify-center bg-black text-white shadow-lg sm:h-10 sm:w-10">
                        <Play size={11} fill="currentColor" />
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-black sm:text-[9px] sm:tracking-[0.2em]">
                        Showreel
                      </span>
                    </div>
                  </div>
                </div>

                {/* ===== Elemen 3D ===== */}

                {/* Kubus berputar */}
                <div
                  aria-hidden="true"
                  className="hr-z-a pointer-events-none absolute right-[3%] top-[6%] z-20"
                >
                  <div className="hr-float">
                    <div className="hr-cube">
                      <i className="hr-f1">39</i>
                      <i className="hr-f2" />
                      <i className="hr-f3">P</i>
                      <i className="hr-f4" />
                      <i className="hr-f5" />
                      <i className="hr-f6" />
                    </div>
                  </div>
                </div>

                {/* Gyroscope kotak */}
                <div
                  aria-hidden="true"
                  className="hr-z-b pointer-events-none absolute bottom-[14%] left-[1%] z-20 hidden sm:block"
                >
                  <div className="hr-float-slow">
                    <div className="hr-gyro">
                      <span className="hr-g1" />
                      <span className="hr-g2" />
                      <span className="hr-g3" />
                      <b />
                    </div>
                  </div>
                </div>

                {/* Bola 3D */}
                <div
                  aria-hidden="true"
                  className="hr-z-c pointer-events-none absolute left-[8%] top-[10%] z-20"
                >
                  <div className="hr-float-slow" style={{ animationDelay: '-2s' }}>
                    <div className="hr-sphere" />
                  </div>
                </div>

                {/* Kartu melayang */}
                <div
                  aria-hidden="true"
                  className="hr-z-d pointer-events-none absolute bottom-[8%] right-[2%] z-20"
                >
                  <div className="hr-float" style={{ animationDelay: '-3s' }}>
                    <div className="hr-plane flex items-center gap-3 border border-black bg-white px-3 py-2.5 shadow-[10px_10px_0_0_rgba(124,58,237,0.9)] sm:px-4 sm:py-3">
                      <div className="flex h-7 items-end gap-[3px]">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className="hr-eq w-[3px] bg-violet-600"
                            style={{
                              height: '100%',
                              animationDelay: `${i * 0.18}s`,
                            }}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="font-mono text-[7px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                          Now producing
                        </p>
                        <p className="text-[11px] font-black tracking-[-0.03em] sm:text-xs">
                          Stories & Digital Works
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- DESCRIPTION + CTA ---------------- */}
            <div className="relative z-20 lg:col-start-1 lg:row-start-2 lg:self-start">
              <div
                className="hero-item mt-4 max-w-[440px] sm:mt-6 lg:mt-7"
                style={delay(300)}
              >
                <p className="max-w-[38rem] text-[13px] leading-6 text-neutral-600 sm:text-sm sm:leading-7 md:text-base md:leading-8">
                  From digital products and creative visuals to entertainment
                  projects — we build ideas into something people can see, use,
                  and remember.
                </p>
              </div>

              <div
                className="hero-item mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
                style={delay(380)}
              >
                <Link
                  to="/contact"
                  className="hr-btn group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden bg-black px-5 py-3.5 text-[11px] font-bold text-white transition-colors duration-300 hover:bg-violet-600 sm:w-auto sm:px-6 sm:text-xs"
                >
                  <span className="hr-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25" />
                  <span className="relative">Start a Project</span>
                  <ArrowUpRight
                    size={14}
                    className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/services"
                  className="group inline-flex w-full items-center justify-center gap-3 border border-black px-5 py-3.5 text-[11px] font-bold text-black transition-all duration-300 hover:bg-black hover:text-white sm:w-auto sm:px-6 sm:text-xs"
                >
                  Explore Services
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* Statistik */}
              <div
                className="hero-item mt-6 grid max-w-[440px] grid-cols-3 border-t border-black/10 sm:mt-7"
                style={delay(460)}
              >
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`pt-3 ${i > 0 ? 'border-l border-black/10 pl-4' : ''}`}
                  >
                    <p className="font-mono text-xl font-black tracking-[-0.05em] text-black sm:text-2xl">
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===================================================
              MARQUEE
          =================================================== */}
          <div
            aria-hidden="true"
            className="hero-item relative z-20 mt-7 overflow-hidden border-y border-black/10 py-2.5 sm:mt-9"
            style={delay(520)}
          >
            <div className="hr-marquee flex w-max items-center gap-8 whitespace-nowrap">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center gap-8">
                  {[...TAGLINES, ...TAGLINES].map((t, i) => (
                    <span key={`${copy}-${i}`} className="flex items-center gap-8">
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                        {t}
                      </span>
                      <span className="h-1 w-1 bg-violet-600" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ===================================================
              SERVICE PHOTOS + SERVICE MENU (satu kesatuan)
          =================================================== */}
          <div
            className="hero-item relative z-30 mt-6 sm:mt-7 lg:mt-8"
            style={delay(560)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              role="img"
              aria-label={SERVICES[active].alt}
              className="relative -mx-4 aspect-[4/3] overflow-hidden bg-neutral-100 sm:-mx-6 sm:aspect-[16/9] md:-mx-8 lg:-mx-12 lg:aspect-[21/9] xl:-mx-16"
            >
              <div
                className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{ transform: `translateX(-${active * 100}%)` }}
              >
                {SERVICES.map((service, i) => (
                  <div
                    key={service.no}
                    aria-hidden="true"
                    className="relative h-full w-full shrink-0 overflow-hidden"
                  >
                    <SlideImage
                      src={service.image}
                      eager={i === 0}
                      index={i}
                    />
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
              <div className="pointer-events-none absolute inset-0 bg-violet-600/10 mix-blend-multiply" />

              {/* Penanda service */}
              <div className="absolute bottom-3 left-4 flex items-center gap-2 bg-white px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-black sm:bottom-5 sm:left-6 md:left-8 lg:bottom-6 lg:left-12 xl:left-16">
                <span className="text-violet-600">{SERVICES[active].no}</span>
                {SERVICES[active].title}
              </div>

              {/* Counter */}
              <div className="absolute right-4 top-3 flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.2em] text-white/90 sm:right-6 sm:top-5 md:right-8 lg:right-12 xl:right-16">
                {SERVICES.map((s, i) => (
                  <span
                    key={s.no}
                    className={`h-[3px] transition-all duration-500 ${i === active ? 'w-8 bg-white' : 'w-3 bg-white/40'
                      }`}
                  />
                ))}
                <span className="ml-1">
                  {SERVICES[active].no} / {String(count).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Menu service */}
            <nav
              aria-label="Layanan"
              className="mt-4 grid grid-cols-1 sm:mt-5 md:grid-cols-3"
            >
              {SERVICES.map((service, i) => {
                const isActive = i === active

                return (
                  <Link
                    key={service.no}
                    to="/services"
                    onMouseEnter={() => setActive(i)}
                    className={`group relative flex min-h-[58px] items-center gap-4 border-t border-black/10 py-3 md:min-h-0 md:items-start md:pb-0 md:pt-5 ${service.className}`}
                  >
                    {isActive && !reduceMotion && (
                      <span
                        key={active}
                        aria-hidden="true"
                        className="hero-slide-progress absolute inset-x-0 top-[-1px] h-[2px] origin-left bg-violet-600"
                        style={{
                          animationDuration: `${SLIDE_INTERVAL}ms`,
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                    )}

                    {isActive && reduceMotion && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-[-1px] h-[2px] bg-violet-600"
                      />
                    )}

                    <span className="w-5 shrink-0 font-mono text-[9px] font-bold text-violet-600">
                      {service.no}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`text-sm font-bold tracking-[-0.02em] transition-colors duration-500 ${isActive ? 'text-black' : 'text-neutral-400'
                            }`}
                        >
                          {service.title}
                        </p>

                        <ArrowUpRight
                          size={14}
                          className={`shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600 ${isActive ? 'text-violet-600' : 'text-neutral-300'
                            }`}
                        />
                      </div>

                      <p className="mt-0.5 text-[10px] text-neutral-400">
                        {service.meta}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom statement */}
          <div
            className="hero-item mt-6 hidden items-center justify-between lg:flex"
            style={delay(620)}
          >
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-400">
              Creating Digital Works. Producing Stories. Sharing Gratitude.
            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-300">
              39P / Creative Production House
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #111 1px, transparent 1px),
              linear-gradient(to bottom, #111 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />

        <div className="hr-float absolute left-[70%] top-[18%] h-2 w-2 rounded-full bg-violet-600 sm:left-[34%] sm:top-[16%] sm:h-3 sm:w-3" />
        <div
          className="hr-float-slow absolute bottom-[26%] right-[6%] h-1.5 w-1.5 rounded-full bg-fuchsia-500"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      {/* =========================================================
          ANIMATION
      ========================================================= */}
      <style>{`
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroVideoReveal {
          from { opacity: 0; transform: translateX(24px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes heroVideoRevealMobile {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSlideProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .hero-item {
          opacity: 0;
          animation: heroReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms) forwards;
        }
        .hero-video {
          opacity: 0;
          animation: heroVideoReveal 1s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 140ms) forwards;
        }
        .hero-slide-progress {
          animation-name: heroSlideProgress;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        /* Headline: naik dari balik garis */
        @keyframes hr-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .hr .hr-up {
          transform: translateY(105%);
          animation: hr-up 0.95s cubic-bezier(0.22, 1, 0.36, 1) var(--d, 0ms) forwards;
        }
        @keyframes hr-draw { to { transform: scaleX(1); } }
        .hr .hr-draw {
          transform: scaleX(0);
          transform-origin: left;
          animation: hr-draw 0.9s cubic-bezier(0.77, 0, 0.18, 1) 1s forwards;
        }
        @keyframes hr-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .hr .hr-grow {
          transform-origin: left;
          animation: hr-grow 0.9s cubic-bezier(0.77, 0, 0.18, 1) 0.4s both;
        }

        /* ---------- Stage 3D ---------- */
        .hr .hr-stage { perspective: 1100px; }
        .hr .hr-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hr .hr-z-a { transform: translateZ(90px); }
        .hr .hr-z-b { transform: translateZ(60px); }
        .hr .hr-z-c { transform: translateZ(120px); }
        .hr .hr-z-d { transform: translateZ(70px); }

        @keyframes hr-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .hr .hr-float { animation: hr-float 6s ease-in-out infinite; }
        .hr .hr-float-slow { animation: hr-float 9s ease-in-out infinite; }

        /* Kubus */
        .hr .hr-cube {
          --s: 54px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: hr-cube 16s linear infinite;
        }
        @media (min-width: 640px) { .hr .hr-cube { --s: 74px; } }
        @media (min-width: 1024px) { .hr .hr-cube { --s: 92px; } }
        @keyframes hr-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .hr .hr-cube i {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-style: normal;
          font-weight: 900;
          font-size: calc(var(--s) * 0.34);
          letter-spacing: -0.06em;
          color: #7C3AED;
          border: 1.5px solid rgba(124, 58, 237, 0.85);
          background: rgba(124, 58, 237, 0.10);
          backdrop-filter: blur(1px);
        }
        .hr .hr-cube .hr-f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.75); }
        .hr .hr-cube .hr-f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.35); }
        .hr .hr-cube .hr-f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.75); }
        .hr .hr-cube .hr-f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.22); }
        .hr .hr-cube .hr-f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.45); }
        .hr .hr-cube .hr-f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.3); }

        /* Gyroscope */
        .hr .hr-gyro {
          position: relative;
          width: 84px;
          height: 84px;
          transform-style: preserve-3d;
        }
        @media (min-width: 1024px) { .hr .hr-gyro { width: 112px; height: 112px; } }
        .hr .hr-gyro span {
          position: absolute;
          inset: 0;
          border: 1.5px solid #111;
          transform-style: preserve-3d;
        }
        .hr .hr-gyro .hr-g1 { animation: hr-gx 9s linear infinite; border-color: #7C3AED; }
        .hr .hr-gyro .hr-g2 { inset: 14%; animation: hr-gy 7s linear infinite; }
        .hr .hr-gyro .hr-g3 { inset: 28%; animation: hr-gz 5s linear infinite; border-color: #E78FBA; }
        .hr .hr-gyro b {
          position: absolute;
          left: 50%; top: 50%;
          width: 8px; height: 8px;
          margin: -4px 0 0 -4px;
          background: #7C3AED;
        }
        @keyframes hr-gx { to { transform: rotateX(360deg); } }
        @keyframes hr-gy { to { transform: rotateY(360deg); } }
        @keyframes hr-gz { to { transform: rotateZ(360deg) rotateX(60deg); } }

        /* Bola */
        .hr .hr-sphere {
          width: 34px;
          height: 34px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 14px 22px -8px rgba(124, 58, 237, 0.55);
        }
        @media (min-width: 640px) { .hr .hr-sphere { width: 46px; height: 46px; } }
        @media (min-width: 1024px) { .hr .hr-sphere { width: 60px; height: 60px; } }

        /* Kartu melayang */
        .hr .hr-plane { transform: rotateY(-16deg) rotateX(6deg); }

        @keyframes hr-eq {
          0%, 100% { transform: scaleY(.3); }
          50% { transform: scaleY(1); }
        }
        .hr .hr-eq {
          transform-origin: bottom;
          animation: hr-eq 1.1s ease-in-out infinite;
        }

        /* Showreel pulse */
        @keyframes hr-pulse {
          0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.55); }
          100% { box-shadow: 0 0 0 16px rgba(124, 58, 237, 0); }
        }
        .hr .hr-pulse { animation: hr-pulse 2.2s ease-out infinite; }

        @keyframes hr-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: .25; }
        }
        .hr .hr-blink { animation: hr-blink 2s ease-in-out infinite; }

        /* Tombol shine */
        @keyframes hr-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .hr .hr-btn:hover .hr-shine { animation: hr-shine .9s ease-out; }
        .hr .hr-shine { opacity: 0; }

        /* Marquee */
        @keyframes hr-marquee { to { transform: translateX(-50%); } }
        .hr .hr-marquee { animation: hr-marquee 38s linear infinite; }

        /* Ken burns foto */
        @keyframes hr-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.08); }
        }
        .hr .hero-kb { animation: hr-kb 14s ease-in-out infinite alternate; }

        @media (max-width: 1023px) {
          .hero-video { animation-name: heroVideoRevealMobile; }
          .hr .hr-z-a, .hr .hr-z-b, .hr .hr-z-c, .hr .hr-z-d { transform: translateZ(30px); }
        }
        @media (max-width: 639px) {
          .hero-item  { animation-duration: 0.7s; }
          .hero-video { animation-duration: 0.8s; }
          .hr .hr-plane { box-shadow: 6px 6px 0 0 rgba(124,58,237,.9); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-item,
          .hero-video {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .hr .hr-up { animation: none !important; transform: none !important; }
          .hr .hr-draw, .hr .hr-grow { animation: none !important; transform: scaleX(1) !important; }
          .hr .hr-tilt { transform: none !important; transition: none !important; }
          .hr .hr-float, .hr .hr-float-slow, .hr .hr-cube, .hr .hr-gyro span,
          .hr .hr-eq, .hr .hr-pulse, .hr .hr-blink, .hr .hr-marquee, .hr .hero-kb,
          .hr .hr-btn:hover .hr-shine { animation: none !important; }
        }
      `}</style>
    </section>
  )
}

export default HeroSection