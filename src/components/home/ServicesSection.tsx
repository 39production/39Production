import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Gamepad2,
  Layers3,
  MonitorPlay,
  MoveUpRight,
  Palette,
  PenTool,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * FOTO — letakkan file di /public/images/services/ (atau ganti path di bawah).
 * Rekomendasi: JPG/WebP, lebar min. 1200px, subjek jelas (teks ditaruh di atas
 * overlay gelap, jadi foto terang pun aman).
 * Kalau file belum ada, otomatis tampil placeholder gradient ungu.
 */
const IMAGES = {
  intro: '', // KOSONG = pakai foto dummy studio. Isi '/images/services/intro.jpg' bila foto asli sudah ada
  web: '/images/services/web.jpg', // layar coding / laptop
  uiux: '/images/services/uiux.jpg', // wireframe / figma
  graphic: '/images/services/graphic.jpg', // poster / branding
  illustration: '/images/services/illustration.jpg', // gambar / tablet
  animation: '/images/services/animation.jpg', // storyboard / timeline
  game: '/images/services/game.jpg', // game / controller
  production: '/images/services/production.jpg', // shooting / produksi
  cta: '/images/services/cta.jpg', // 16:10 — tim / kolaborasi
}

const services = [
  {
    number: '01',
    title: 'Web Development',
    shortTitle: 'Technology',
    description:
      'Build websites and web applications yang fast, structured, dan siap dikembangkan sesuai kebutuhan bisnis atau digital product.',
    icon: Code2,
    image: IMAGES.web,
    className: 'lg:col-span-2',
  },
  {
    number: '02',
    title: 'UI/UX Design',
    shortTitle: 'Design',
    description:
      'From wireframe to final interface. Kami merancang user experience yang clear, intuitive, dan tetap punya karakter visual.',
    icon: Layers3,
    image: IMAGES.uiux,
    className: 'lg:col-span-1',
  },
  {
    number: '03',
    title: 'Graphic Design',
    shortTitle: 'Visual',
    description:
      'Visual identity, campaign, social media, hingga promotional material untuk membuat brand tampil lebih konsisten dan memorable.',
    icon: Palette,
    image: IMAGES.graphic,
    className: 'lg:col-span-1',
  },
  {
    number: '04',
    title: 'Digital Illustration',
    shortTitle: 'Illustration',
    description:
      'Custom illustration untuk character, campaign, merchandise, storytelling, atau visual direction yang membutuhkan sentuhan khusus.',
    icon: PenTool,
    image: IMAGES.illustration,
    className: 'lg:col-span-2',
  },
  {
    number: '05',
    title: 'Animation',
    shortTitle: 'Motion',
    description:
      'Motion graphics and animation untuk promotional content, storytelling, campaign, maupun digital media yang lebih dynamic.',
    icon: MonitorPlay,
    image: IMAGES.animation,
    className: 'lg:col-span-1',
  },
  {
    number: '06',
    title: 'Game Development',
    shortTitle: 'Interactive',
    description:
      'Game experience yang menggabungkan gameplay, visual, interaction, dan storytelling menjadi satu konsep yang engaging.',
    icon: Gamepad2,
    image: IMAGES.game,
    className: 'lg:col-span-2',
  },
  {
    number: '07',
    title: 'Creative Production',
    shortTitle: 'Production',
    description:
      'End-to-end digital production untuk content, entertainment, talent, campaign, dan creative projects lintas bidang.',
    icon: Sparkles,
    image: IMAGES.production,
    className: 'lg:col-span-3',
  },
]

const MARQUEE = [
  'Web Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Illustration',
  'Animation',
  'Game Development',
  'Creative Production',
]

/* ------------------------------------------------------------------ */
/* Gambar dummy lokal (SVG) — tampil bila foto belum ada               */
/* Tanpa API / tanpa file eksternal                                    */
/* ------------------------------------------------------------------ */
function PlaceholderArt({ seed }: { seed: string }) {
  const variant =
    Array.from(seed).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4
  const id = `ph-${variant}-${seed.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id={`${id}-a`} cx="20%" cy="15%" r="70%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx="90%" cy="95%" r="60%">
          <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
        </radialGradient>
        <pattern
          id={`${id}-grid`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path d="M20 0H0V20" fill="none" stroke="#fff" strokeOpacity="0.05" />
        </pattern>
      </defs>

      <rect width="400" height="300" fill="#0d0820" />
      <rect width="400" height="300" fill={`url(#${id}-a)`} />
      <rect width="400" height="300" fill={`url(#${id}-b)`} />
      <rect width="400" height="300" fill={`url(#${id}-grid)`} />

      {variant === 0 && (
        <g className="sv-art-a">
          {[130, 92, 56].map((r, i) => (
            <circle
              key={r}
              cx="285"
              cy="105"
              r={r}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.1 + i * 0.07}
            />
          ))}
          <circle cx="285" cy="105" r="22" fill="#7C3AED" />
          <circle cx="330" cy="60" r="6" fill="#E78FBA" />
          <rect x="40" y="200" width="120" height="6" fill="#fff" opacity="0.25" />
          <rect x="40" y="216" width="80" height="6" fill="#fff" opacity="0.15" />
        </g>
      )}

      {variant === 1 && (
        <g>
          {Array.from({ length: 16 }).map((_, i) => {
            const h = 40 + ((i * 53) % 120)
            return (
              <rect
                key={i}
                x={36 + i * 21}
                y={250 - h}
                width="12"
                height={h}
                fill={i % 5 === 0 ? '#E78FBA' : '#7C3AED'}
                opacity={0.35 + (i % 4) * 0.15}
                className="sv-art-bar"
                style={{ animationDelay: `${(i % 8) * 0.22}s` }}
              />
            )
          })}
          <rect x="36" y="256" width="330" height="1" fill="#fff" opacity="0.25" />
        </g>
      )}

      {variant === 2 && (
        <g className="sv-art-a">
          <rect x="48" y="52" width="300" height="196" fill="none" stroke="#fff" strokeOpacity="0.18" />
          <rect x="48" y="52" width="300" height="24" fill="#fff" opacity="0.08" />
          <circle cx="62" cy="64" r="3" fill="#E78FBA" />
          <circle cx="74" cy="64" r="3" fill="#fff" opacity="0.4" />
          <rect x="64" y="96" width="120" height="70" fill="#7C3AED" opacity="0.75" />
          <rect x="196" y="96" width="136" height="32" fill="#fff" opacity="0.14" />
          <rect x="196" y="138" width="90" height="28" fill="#E78FBA" opacity="0.6" />
          <rect x="64" y="180" width="268" height="8" fill="#fff" opacity="0.16" />
          <rect x="64" y="198" width="190" height="8" fill="#fff" opacity="0.1" />
          <rect x="64" y="216" width="140" height="8" fill="#fff" opacity="0.08" />
        </g>
      )}

      {variant === 3 && (
        <g className="sv-art-a">
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M-20 ${190 + i * 12} C 80 ${120 + i * 6}, 180 ${260 - i * 6}, 420 ${150 + i * 10}`}
              fill="none"
              stroke={i % 3 === 0 ? '#E78FBA' : '#7C3AED'}
              strokeOpacity={0.25 + i * 0.07}
              strokeWidth="1.5"
            />
          ))}
          <circle cx="92" cy="86" r="30" fill="#7C3AED" opacity="0.85" />
          <circle cx="104" cy="78" r="30" fill="none" stroke="#fff" strokeOpacity="0.35" />
        </g>
      )}

      <text
        x="36"
        y="282"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.28"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="64"
        fontWeight="900"
        letterSpacing="-6"
      >
        39
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Foto dummy "suasana studio" (SVG lokal, tanpa API)                  */
/* ------------------------------------------------------------------ */
function StudioArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="st-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0f3a" />
          <stop offset="100%" stopColor="#0d0820" />
        </linearGradient>
        <radialGradient id="st-glow-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="st-glow-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
        </radialGradient>
        <pattern id="st-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="#fff" strokeOpacity="0.04" />
        </pattern>
      </defs>

      <rect width="800" height="320" fill="url(#st-wall)" />
      <rect width="800" height="320" fill="url(#st-grid)" />

      {/* cahaya softbox */}
      <g className="sv-art-glow">
        <circle cx="120" cy="70" r="150" fill="url(#st-glow-a)" />
        <circle cx="690" cy="80" r="140" fill="url(#st-glow-b)" />
      </g>

      {/* softbox kiri & kanan */}
      <g>
        <rect x="96" y="30" width="48" height="64" fill="#fff" opacity="0.9" />
        <rect x="118" y="94" width="4" height="150" fill="#fff" opacity="0.18" />
        <rect x="666" y="38" width="48" height="64" fill="#E78FBA" opacity="0.9" />
        <rect x="688" y="102" width="4" height="142" fill="#fff" opacity="0.18" />
      </g>

      {/* lampu gantung */}
      <g>
        <rect x="399" y="0" width="2" height="46" fill="#fff" opacity="0.25" />
        <path d="M380 70 L420 70 L410 46 L390 46 Z" fill="#7C3AED" />
        <rect x="388" y="70" width="24" height="3" fill="#fff" opacity="0.7" />
      </g>

      {/* poster di dinding */}
      <g opacity="0.9">
        <rect x="250" y="50" width="70" height="92" fill="none" stroke="#fff" strokeOpacity="0.25" />
        <rect x="258" y="58" width="54" height="40" fill="#7C3AED" opacity="0.7" />
        <rect x="258" y="106" width="40" height="4" fill="#fff" opacity="0.35" />
        <rect x="258" y="116" width="28" height="4" fill="#fff" opacity="0.2" />
        <rect x="480" y="58" width="90" height="62" fill="none" stroke="#fff" strokeOpacity="0.25" />
        <circle cx="525" cy="89" r="16" fill="none" stroke="#E78FBA" strokeWidth="2" />
        <circle cx="525" cy="89" r="5" fill="#E78FBA" />
      </g>

      {/* meja panjang */}
      <rect x="0" y="236" width="800" height="14" fill="#2a1a55" />
      <rect x="0" y="250" width="800" height="70" fill="#080414" />
      <rect x="60" y="250" width="6" height="70" fill="#2a1a55" />
      <rect x="734" y="250" width="6" height="70" fill="#2a1a55" />

      {/* orang 1 (siluet) */}
      <g className="sv-art-a" opacity="0.95">
        <circle cx="245" cy="126" r="17" fill="#2a1a55" stroke="#fff" strokeOpacity="0.4" />
        <path d="M205 238 C205 118 285 118 285 238 Z" fill="#2a1a55" stroke="#fff" strokeOpacity="0.4" />
      </g>

      {/* orang 2 (siluet) */}
      <g className="sv-art-a" style={{ animationDelay: '-3s' }} opacity="0.95">
        <circle cx="560" cy="118" r="18" fill="#2a1a55" stroke="#fff" strokeOpacity="0.4" />
        <path d="M518 238 C518 112 602 112 602 238 Z" fill="#2a1a55" stroke="#fff" strokeOpacity="0.4" />
      </g>

      {/* monitor kiri */}
      <g>
        <rect x="170" y="156" width="150" height="82" fill="#0b0618" stroke="#fff" strokeOpacity="0.3" />
        <rect x="176" y="162" width="138" height="70" fill="#7C3AED" opacity="0.35" />
        <rect x="184" y="172" width="60" height="6" fill="#fff" opacity="0.7" className="sv-art-bar" />
        <rect x="184" y="184" width="100" height="4" fill="#fff" opacity="0.35" />
        <rect x="184" y="194" width="84" height="4" fill="#fff" opacity="0.25" />
        <rect x="184" y="208" width="40" height="16" fill="#E78FBA" opacity="0.85" />
        <rect x="241" y="238" width="8" height="0" />
      </g>

      {/* monitor kanan (timeline) */}
      <g>
        <rect x="470" y="150" width="170" height="88" fill="#0b0618" stroke="#fff" strokeOpacity="0.3" />
        <rect x="476" y="156" width="158" height="76" fill="#E78FBA" opacity="0.18" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={484 + i * 20}
            y={206 - ((i * 37) % 36)}
            width="12"
            height={20 + ((i * 37) % 36)}
            fill={i % 3 === 0 ? '#E78FBA' : '#7C3AED'}
            opacity="0.9"
            className="sv-art-bar"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
        <rect x="484" y="214" width="140" height="1" fill="#fff" opacity="0.4" />
      </g>

      {/* kamera di tripod */}
      <g>
        <rect x="360" y="170" width="46" height="30" fill="#14102a" stroke="#fff" strokeOpacity="0.4" />
        <circle cx="383" cy="185" r="9" fill="#7C3AED" />
        <circle cx="383" cy="185" r="3" fill="#fff" />
        <path d="M383 200 L362 246 M383 200 L404 246 M383 200 L383 246" stroke="#fff" strokeOpacity="0.35" fill="none" />
        <circle cx="400" cy="174" r="2.5" fill="#E78FBA" className="sv-art-blink" />
      </g>

      {/* debu cahaya */}
      {[
        [60, 140],
        [330, 90],
        [430, 130],
        [640, 190],
        [740, 150],
        [190, 100],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="2"
          fill="#fff"
          opacity="0.5"
          className="sv-art-blink"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Image dengan fallback placeholder                                   */
/* ------------------------------------------------------------------ */
function Photo({
  src,
  alt,
  className = '',
  label,
  scene,
}: {
  src?: string
  alt: string
  className?: string
  label?: string
  scene?: 'studio'
}) {
  const [failed, setFailed] = useState(false)

  /* src kosong / gagal dimuat → tampilkan foto dummy lokal */
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative overflow-hidden bg-[#0d0820] ${className}`}
      >
        {scene === 'studio' ? (
          <StudioArt />
        ) : (
          <PlaceholderArt seed={label ?? alt} />
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setFailed(true)
      }}
      className={`object-cover ${className}`}
    />
  )
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null)

  /* Reveal on scroll */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const items = section.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  /* Parallax ringan untuk foto */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const els = Array.from(
      section.querySelectorAll<HTMLElement>('[data-parallax]'),
    )
    let ticking = false

    const update = () => {
      const vh = window.innerHeight
      els.forEach((el) => {
        const speed = Number(el.getAttribute('data-parallax')) || 0.06
        const rect = el.parentElement!.getBoundingClientRect()
        if (rect.bottom < -200 || rect.top > vh + 200) return
        const offset = (rect.top + rect.height / 2 - vh / 2) * speed
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.14)`
      })
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="services"
      className="sv relative overflow-hidden bg-white text-zinc-950"
    >
      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />
        <div className="sv-float absolute right-[9%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />
        <div
          className="sv-float absolute bottom-[20%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
          style={{ animationDelay: '-2.5s' }}
        />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        {/* Section Header */}
        <div
          data-reveal
          className="rv flex items-center justify-between border-t border-black/10 pt-4"
        >
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
              39Production / What We Do
            </span>
          </div>
          <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
            39 / 03
          </span>
        </div>

        {/* ============================ INTRO ============================ */}
        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p
              data-reveal
              className="rv text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]"
            >
              What We Build
            </p>

            <h2
              data-reveal
              style={{ ['--d' as string]: '80ms' }}
              className="rv mt-3 text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
            >
              Ideas into
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-neutral-300">
                  digital works.
                </span>
                <span
                  aria-hidden="true"
                  className="draw absolute bottom-[2%] left-0 right-[-2%] z-0 h-[0.09em] bg-[#7C3AED]"
                />
              </span>
            </h2>
          </div>

          <div
            data-reveal
            style={{ ['--d' as string]: '160ms' }}
            className="rv lg:col-span-5"
          >
            <p className="max-w-md text-sm font-medium leading-7 text-neutral-600 sm:text-[15px]">
              One team, multiple disciplines. Kami menggabungkan technology,
              design, dan creative production untuk membangun sesuatu yang punya
              purpose.
            </p>
            <p className="mt-3 max-w-md text-sm font-medium leading-7 text-neutral-500">
              Dari sebuah konsep sampai ready to launch. Pilih kebutuhanmu, atau{' '}
              <span className="font-semibold text-black">
                let&apos;s figure it out together.
              </span>
            </p>
          </div>
        </div>

        {/* Foto wide + badge */}
        <div className="relative mt-6 sm:mt-8">
          <div
            data-reveal
            className="mask relative aspect-[16/8] w-full overflow-hidden bg-neutral-100 sm:aspect-[21/8]"
          >
            <div
              data-parallax="0.06"
              className="absolute inset-0 will-change-transform"
            >
              <Photo
                src={IMAGES.intro}
                alt="Suasana kerja tim 39Production"
                label="intro.jpg"
                scene="studio"
                className="sv-kb h-full w-full"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white sm:inset-x-6 sm:bottom-5">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Digital / Creative / Entertainment
              </span>
              <span className="hidden font-mono text-[9px] tracking-[0.18em] text-white/60 sm:block">
                07 Disciplines
              </span>
            </div>
          </div>

          {/* Badge berputar */}
          <div
            aria-hidden="true"
            className="sv-float absolute -top-6 right-3 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-lg sm:-top-8 sm:right-8 sm:h-24 sm:w-24"
          >
            <svg
              viewBox="0 0 100 100"
              className="sv-spin absolute inset-0 h-full w-full"
            >
              <defs>
                <path
                  id="sv-circle"
                  d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
                />
              </defs>
              <text
                fill="white"
                fontSize="9.5"
                fontWeight="700"
                letterSpacing="3.2"
              >
                <textPath href="#sv-circle">
                  ONE TEAM • MANY DISCIPLINES •
                </textPath>
              </text>
            </svg>
            <span className="text-base font-black tracking-tight sm:text-lg">
              39
            </span>
          </div>
        </div>

        {/* ============================ CAPABILITIES ============================ */}
        <div
          data-reveal
          className="rv mt-8 flex flex-col gap-2 border-t border-black/10 pt-4 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-3 sm:pt-5"
        >
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
              Our Capabilities
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
              Different disciplines.
              <span className="text-neutral-300"> One production team.</span>
            </h3>
          </div>

          <Link
            to="/contact"
            className="group inline-flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
          >
            Discuss a Project
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Services Grid — foto sebagai latar tiap kartu */}
        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {services.map((service, index) => {
            const Icon = service.icon

            return (
              <Link
                key={service.title}
                to="/contact"
                data-reveal
                style={{ ['--d' as string]: `${(index % 3) * 90}ms` }}
                className={`rv group relative block min-h-[230px] overflow-hidden bg-neutral-900 sm:min-h-[260px] lg:min-h-[290px] ${service.className} ${index === 6 ? 'sm:col-span-2' : ''
                  }`}
              >
                {/* Foto */}
                <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]">
                  <Photo
                    src={service.image}
                    alt={service.title}
                    label={`${service.title}`}
                    className="sv-kb h-full w-full"
                  />
                </div>

                {/* Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity duration-500" />
                <div className="pointer-events-none absolute inset-0 bg-[#7C3AED]/0 mix-blend-multiply transition-colors duration-500 group-hover:bg-[#7C3AED]/25" />

                {/* Kilau saat hover */}
                <div className="sv-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20 opacity-0" />

                {/* Hover Accent */}
                <div className="absolute left-0 top-0 z-10 h-0.5 w-0 bg-[#7C3AED] transition-all duration-700 group-hover:w-full" />

                <article className="relative z-10 flex h-full min-h-[inherit] flex-col justify-between p-5 text-white sm:p-6">
                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center border border-white/25 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED]">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </div>

                    <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-white/60 transition-colors duration-300 group-hover:text-white">
                      {service.number}
                    </span>
                  </div>

                  {/* Bottom */}
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#E78FBA]">
                      {service.shortTitle}
                    </p>

                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
                      {service.title}
                    </h3>

                    <p className="mt-2 max-w-md text-xs font-medium leading-6 text-white/70 sm:text-[13px]">
                      {service.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                      <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/60 transition-colors duration-300 group-hover:text-white">
                        Explore Service
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center border border-white/25 text-white/70 transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
                        <ArrowUpRight
                          size={13}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        {/* ============================ MARQUEE ============================ */}
        <div
          aria-hidden="true"
          className="mt-6 overflow-hidden border-y border-black/10 py-3 sm:mt-8"
        >
          <div className="sv-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-8">
                {[...MARQUEE, ...MARQUEE].map((item, i) => (
                  <span key={`${copy}-${i}`} className="flex items-center gap-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                      {item}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-[#7C3AED]" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ============================ BOTTOM CTA ============================ */}
        <div
          data-reveal
          className="rv mt-6 grid overflow-hidden border border-black/10 bg-white sm:mt-8 lg:grid-cols-12"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 lg:col-span-5 lg:aspect-auto lg:min-h-[260px]">
            <div
              data-parallax="0.05"
              className="absolute inset-0 will-change-transform"
            >
              <Photo
                src={IMAGES.cta}
                alt="Diskusi project bersama tim"
                label="cta.jpg"
                className="h-full w-full"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[#7C3AED]/15 mix-blend-multiply" />
            <div className="absolute left-0 top-0 h-0.5 w-full bg-[#7C3AED]" />
          </div>

          <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 lg:col-span-7 lg:p-9">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                  Beyond The Services
                </p>
              </div>

              <h3 className="mt-4 max-w-xl text-3xl font-black leading-[0.94] tracking-[-0.05em] text-black sm:text-4xl">
                Not every project
                <span className="text-neutral-300"> fits a category.</span>
              </h3>

              <p className="mt-4 max-w-md text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                Kalau kebutuhanmu belum ada di list, tell us what you have in
                mind. Kami bisa mulai dari problem dan tujuan, bukan hanya dari
                service.
              </p>
            </div>

            <Link
              to="/contact"
              className="group inline-flex w-full items-center justify-center gap-3 bg-black px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED] sm:w-fit"
            >
              Start a Project
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Section Signature */}
        <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
            39PRODUCTION
          </span>
          <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
            Digital / Creative / Entertainment
          </span>
          <MoveUpRight size={13} className="text-neutral-400" />
        </div>
      </div>

      <style>{`
        .sv .rv {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
          transition:
            opacity .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
          will-change: transform, opacity;
        }
        .sv .rv.is-visible { opacity: 1; transform: none; }

        .sv .mask {
          clip-path: inset(0 0 100% 0);
          transition: clip-path 1.2s cubic-bezier(.77,0,.18,1) var(--d, 0ms);
        }
        .sv .mask.is-visible { clip-path: inset(0 0 0% 0); }

        .sv .draw {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1s cubic-bezier(.77,0,.18,1) .7s;
        }
        .sv .rv.is-visible .draw { transform: scaleX(1); }

        @keyframes sv-drift {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(8px, -8px, 0); }
        }
        .sv .sv-art-a { animation: sv-drift 9s ease-in-out infinite alternate; }

        @keyframes sv-bar {
          0%, 100% { transform: scaleY(.55); }
          50% { transform: scaleY(1); }
        }
        .sv .sv-art-bar {
          transform-box: fill-box;
          transform-origin: bottom;
          animation: sv-bar 2.4s ease-in-out infinite;
        }

        @keyframes sv-glow {
          0%, 100% { opacity: .75; }
          50% { opacity: 1; }
        }
        .sv .sv-art-glow { animation: sv-glow 5s ease-in-out infinite; }

        @keyframes sv-blink {
          0%, 100% { opacity: .15; }
          50% { opacity: .9; }
        }
        .sv .sv-art-blink { animation: sv-blink 2.6s ease-in-out infinite; }

        @keyframes sv-kb {
          from { transform: scale(1) translateX(0); }
          to { transform: scale(1.07) translateX(-1.2%); }
        }
        .sv .sv-kb { animation: sv-kb 16s ease-in-out infinite alternate; }

        @keyframes sv-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .sv .group:hover .sv-shine { animation: sv-shine .9s ease-out; }

        @keyframes sv-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .sv .sv-float { animation: sv-float 6s ease-in-out infinite; }

        @keyframes sv-spin { to { transform: rotate(360deg); } }
        .sv .sv-spin { animation: sv-spin 18s linear infinite; }

        @keyframes sv-marquee { to { transform: translateX(-50%); } }
        .sv .sv-marquee { animation: sv-marquee 40s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .sv .rv, .sv .mask {
            opacity: 1 !important;
            transform: none !important;
            clip-path: none !important;
            transition: none !important;
          }
          .sv .draw { transform: scaleX(1) !important; transition: none !important; }
          .sv .sv-float, .sv .sv-spin, .sv .sv-marquee, .sv .sv-kb,
          .sv .sv-art-a, .sv .sv-art-bar, .sv .sv-art-glow, .sv .sv-art-blink,
          .sv .group:hover .sv-shine { animation: none !important; }
        }
      `}</style>
    </section>
  )
}

export default ServicesSection