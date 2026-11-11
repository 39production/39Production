import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  X,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const SITE_URL = 'https://39production.digital'
const PAGE_URL = `${SITE_URL}/portfolio`
const DEFAULT_OG_IMAGE =
  'https://39production.digital/og-image.jpg'

type PortfolioItem = {
  id: number
  title: string
  slug?: string
  category: string
  description?: string
  client?: string
  year?: string | number
  role?: string
  tools?: string[]
  image_url?: string | null
  image_urls?: string[]
  project_url?: string | null
  status?: string
  created_at?: string
  updated_at?: string
}

/* Foto asli saja. Bila kosong → komponen memakai gambar dummy lokal (SVG). */
function getPortfolioImages(item: PortfolioItem) {
  const gallery = Array.isArray(item.image_urls)
    ? item.image_urls.filter(Boolean)
    : []

  if (gallery.length > 0) {
    return gallery
  }

  if (item.image_url) {
    return [item.image_url]
  }

  return []
}

function getCategoryLabel(category?: string) {
  if (!category) return 'Creative'

  return category
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getMetaLine(item: PortfolioItem) {
  return [item.client, item.year, item.role]
    .filter(Boolean)
    .join(' · ')
}

function setMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`,
  ) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)

  return element
}

function setCanonical(url: string) {
  let canonical = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', url)

  return canonical
}

function createJsonLdScript(
  id: string,
  data: Record<string, unknown>,
) {
  const existing = document.getElementById(id)

  existing?.remove()

  const script = document.createElement('script')

  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)

  document.head.appendChild(script)

  return script
}

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

/* ------------------------------------------------------------------ */
/* Tilt 3D mengikuti kursor                                            */
/* ------------------------------------------------------------------ */
function useTilt<T extends HTMLElement>(max = 8) {
  const ref = useRef<T | null>(null)

  const onMove = (e: PointerEvent<T>) => {
    if (e.pointerType === 'touch') return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  return { ref, onMove, onLeave }
}

/* ------------------------------------------------------------------ */
/* Gambar dummy lokal (SVG) — dipakai bila foto kosong / gagal         */
/* ------------------------------------------------------------------ */
function PlaceholderArt({ seed }: { seed: string }) {
  const variant =
    Array.from(seed).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4
  const id = `pf-${variant}-${seed.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <radialGradient id={`${id}-a`} cx="18%" cy="15%" r="70%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx="92%" cy="95%" r="60%">
          <stop offset="0%" stopColor="#E78FBA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E78FBA" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-g`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#fff" strokeOpacity="0.05" />
        </pattern>
      </defs>

      <rect width="400" height="260" fill="#0d0820" />
      <rect width="400" height="260" fill={`url(#${id}-a)`} />
      <rect width="400" height="260" fill={`url(#${id}-b)`} />
      <rect width="400" height="260" fill={`url(#${id}-g)`} />

      {variant === 0 && (
        <g className="pf-art-a">
          {[110, 76, 44].map((r, i) => (
            <circle key={r} cx="290" cy="110" r={r} fill="none" stroke="#fff" strokeOpacity={0.1 + i * 0.08} />
          ))}
          <circle cx="290" cy="110" r="18" fill="#7C3AED" />
          <circle cx="338" cy="60" r="5" fill="#E78FBA" />
          <rect x="36" y="160" width="110" height="6" fill="#fff" opacity="0.25" />
          <rect x="36" y="174" width="72" height="6" fill="#fff" opacity="0.15" />
        </g>
      )}

      {variant === 1 && (
        <g>
          {Array.from({ length: 14 }).map((_, i) => {
            const h = 36 + ((i * 53) % 110)
            return (
              <rect
                key={i}
                x={36 + i * 24}
                y={216 - h}
                width="13"
                height={h}
                fill={i % 5 === 0 ? '#E78FBA' : '#7C3AED'}
                opacity={0.35 + (i % 4) * 0.15}
                className="pf-art-bar"
                style={{ animationDelay: `${(i % 8) * 0.22}s` }}
              />
            )
          })}
          <rect x="36" y="222" width="330" height="1" fill="#fff" opacity="0.25" />
        </g>
      )}

      {variant === 2 && (
        <g className="pf-art-a">
          <rect x="52" y="44" width="296" height="160" fill="none" stroke="#fff" strokeOpacity="0.2" />
          <rect x="52" y="44" width="296" height="20" fill="#fff" opacity="0.08" />
          <circle cx="64" cy="54" r="3" fill="#E78FBA" />
          <rect x="66" y="78" width="116" height="60" fill="#7C3AED" opacity="0.75" />
          <rect x="194" y="78" width="138" height="28" fill="#fff" opacity="0.14" />
          <rect x="194" y="114" width="88" height="24" fill="#E78FBA" opacity="0.6" />
          <rect x="66" y="152" width="266" height="7" fill="#fff" opacity="0.16" />
          <rect x="66" y="167" width="180" height="7" fill="#fff" opacity="0.1" />
        </g>
      )}

      {variant === 3 && (
        <g className="pf-art-a">
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M-20 ${160 + i * 10} C 80 ${100 + i * 6}, 180 ${210 - i * 6}, 420 ${120 + i * 9}`}
              fill="none"
              stroke={i % 3 === 0 ? '#E78FBA' : '#7C3AED'}
              strokeOpacity={0.25 + i * 0.08}
              strokeWidth="1.5"
            />
          ))}
          <circle cx="96" cy="76" r="28" fill="#7C3AED" opacity="0.85" />
          <circle cx="108" cy="68" r="28" fill="none" stroke="#fff" strokeOpacity="0.35" />
        </g>
      )}

      <text
        x="30"
        y="244"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.28"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="56"
        fontWeight="900"
        letterSpacing="-5"
      >
        39
      </text>
    </svg>
  )
}

function ProjectImage({
  src,
  alt,
  seed,
  eager = false,
  className = '',
}: {
  src?: string | null
  alt: string
  seed: string
  eager?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className="absolute inset-0 overflow-hidden bg-[#0d0820]">
        <PlaceholderArt seed={seed} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) setFailed(true)
      }}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Kartu project                                                       */
/* ------------------------------------------------------------------ */
function ProjectCard({
  item,
  index,
  onOpen,
}: {
  item: PortfolioItem
  index: number
  onOpen: (item: PortfolioItem) => void
}) {
  const { ref, onMove, onLeave } = useTilt<HTMLElement>(7)
  const images = getPortfolioImages(item)
  const meta = getMetaLine(item)

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(item)
    }
  }

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={onKey}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-cursor="view"
      data-cursor-label="VIEW"
      className="pf-card group relative flex h-full cursor-pointer overflow-hidden border border-neutral-200 bg-white transition-[border-color,box-shadow] duration-500 hover:border-violet-400 hover:shadow-[6px_6px_0_0_rgba(124,58,237,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 sm:flex-col"
    >
      <div className="absolute left-0 top-0 z-30 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />
      <div className="pf-glare pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Visual */}
      <div
        className="relative w-[104px] shrink-0 overflow-hidden bg-[#0d0820] sm:aspect-[4/3] sm:w-full"
      >
        <ProjectImage
          src={images[0]}
          alt={`${item.title} — 39Production portfolio`}
          seed={item.title}
          eager={index < 3}
          className="pf-kb"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pf-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20 opacity-0" />

        <span className="absolute left-2.5 top-2.5 z-10 bg-black/65 px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[9px]">
          {String(index + 1).padStart(2, '0')}
        </span>

        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-black/70 px-1.5 py-1 text-white backdrop-blur-sm sm:bottom-4 sm:right-4 sm:gap-2 sm:bg-white/90 sm:px-3 sm:py-2 sm:text-neutral-950">
            <ImageIcon size={10} strokeWidth={1.5} />
            <span className="font-mono text-[7px] sm:text-[9px]">
              {String(images.length).padStart(2, '0')}
            </span>
          </span>
        )}

        <span className="absolute bottom-4 left-4 z-10 hidden items-center gap-2 bg-white px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-950 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:inline-flex sm:translate-y-2">
          View project
          <ArrowUpRight size={12} strokeWidth={1.8} />
        </span>
      </div>

      {/* Info */}
      <div className="relative flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-3.5 lg:p-4">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-violet-600 sm:text-[9px]">
              {getCategoryLabel(item.category)}
            </p>
            {item.year && (
              <span className="shrink-0 font-mono text-[8px] text-neutral-400 sm:text-[10px]">
                {item.year}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-[1.1] tracking-[-0.03em] text-neutral-950 transition-transform duration-500 group-hover:translate-x-1 sm:mt-2 sm:text-base">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-1.5 line-clamp-1 text-[10px] leading-4 text-neutral-500 sm:mt-1.5 sm:line-clamp-2 sm:text-xs sm:leading-5">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 border-neutral-200 sm:mt-3 sm:border-t sm:pt-3">
          <span className="min-w-0 truncate font-mono text-[8px] uppercase tracking-[0.14em] text-neutral-400 sm:text-[9px]">
            {meta || 'Selected work'}
          </span>

          <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-neutral-200 text-neutral-500 transition-all group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
            <ArrowUpRight size={13} strokeWidth={1.6} />
          </span>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Spotlight — project unggulan                                        */
/* ------------------------------------------------------------------ */
function Spotlight({
  item,
  onOpen,
}: {
  item: PortfolioItem
  onOpen: (item: PortfolioItem) => void
}) {
  const { ref, onMove, onLeave } = useTilt<HTMLDivElement>(6)
  const images = getPortfolioImages(item)

  const facts: Array<[string, string | number | undefined]> = [
    ['Client', item.client],
    ['Year', item.year],
    ['Role', item.role],
  ]

  return (
    <div className="grid border border-neutral-200 bg-white lg:grid-cols-[1.1fr_1fr]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={() => onOpen(item)}
        data-cursor="view"
        data-cursor-label="VIEW"
        className="pf-card group relative aspect-[16/9] cursor-pointer overflow-hidden bg-[#0d0820] lg:aspect-auto lg:min-h-[320px]"
      >
        <ProjectImage
          src={images[0]}
          alt={`${item.title} — 39Production portfolio`}
          seed={item.title}
          eager
          className="pf-kb"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="pf-glare pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pf-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20 opacity-0" />

        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 bg-violet-600 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.85)] sm:left-6 sm:top-6">
          <span className="pf-blink h-1.5 w-1.5 bg-white" />
          Featured
        </span>

        {images.length > 1 && (
          <span className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-white/90 px-3 py-2 sm:bottom-6 sm:right-6">
            <ImageIcon size={11} strokeWidth={1.5} />
            <span className="font-mono text-[9px]">
              {String(images.length).padStart(2, '0')}
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 lg:p-8">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-[10px]">
            {getCategoryLabel(item.category)} / Case Study
          </p>

          <h2 className="mt-3 text-2xl font-semibold leading-[1] tracking-[-0.05em] sm:text-4xl">
            {item.title}
          </h2>

          {item.description && (
            <p className="mt-3 line-clamp-3 max-w-lg text-[13px] leading-6 text-neutral-500 sm:text-sm">
              {item.description}
            </p>
          )}

          {facts.some(([, v]) => v) && (
            <div className="mt-6 grid grid-cols-3 border-t border-neutral-200">
              {facts
                .filter(([, v]) => v)
                .map(([label, value], i) => (
                  <div
                    key={label}
                    className={`min-w-0 pt-3 ${i > 0 ? 'border-l border-neutral-200 pl-4' : ''
                      }`}
                  >
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400">
                      {label}
                    </p>
                    <p className="mt-1 truncate text-[13px] font-medium text-neutral-900">
                      {value}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {item.tools && item.tools.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {item.tools.slice(0, 6).map((tool) => (
                <span
                  key={tool}
                  className="border border-neutral-200 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-600"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpen(item)}
          className="group/btn relative inline-flex w-full items-center justify-between overflow-hidden bg-neutral-950 px-5 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-violet-600 sm:w-fit sm:min-w-[220px]"
        >
          <span className="pf-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20" />
          <span className="relative">View case study</span>
          <ArrowRight
            size={16}
            strokeWidth={1.6}
            className="relative transition-transform duration-300 group-hover/btn:translate-x-1"
          />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Bingkai gambar di pop up detail (tilt 3D)                           */
/* ------------------------------------------------------------------ */
function ModalShot({
  src,
  title,
  index,
}: {
  src: string | null
  title: string
  index: number
}) {
  const { ref, onMove, onLeave } = useTilt<HTMLDivElement>(7)
  const [failed, setFailed] = useState(false)

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="pf-card relative w-full max-w-[640px]"
    >
      <div className="border-[1.5px] border-white/80 bg-white shadow-[10px_10px_0_0_rgba(124,58,237,0.9)]">
        <div className="flex h-6 items-center gap-1.5 border-b-[1.5px] border-neutral-950 bg-white px-2.5">
          <i className="block h-1.5 w-1.5 bg-violet-600" />
          <i className="block h-1.5 w-1.5 bg-[#E78FBA]" />
          <i className="block h-1.5 w-1.5 bg-neutral-950" />
          <span className="ml-2 truncate font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-500">
            {title}
          </span>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden bg-[#0d0820]">
          {!src || failed ? (
            <PlaceholderArt seed={title} />
          ) : (
            <img
              src={src}
              alt={`${title} — image ${index + 1}`}
              onError={() => setFailed(true)}
              className="pf-fade absolute inset-0 h-full w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   PAGE
============================================================ */
export function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedItem, setSelectedItem] =
    useState<PortfolioItem | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  const rootRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  /*
   * ============================================================
   * SEO
   * ============================================================
   */

  useEffect(() => {
    const previousTitle = document.title

    const description =
      'Explore selected digital works, visual experiences, websites, UI/UX designs, games, animation, graphic design and creative technology projects produced by 39Production.'

    const keywords =
      '39Production, portfolio 39Production, digital production, creative production, digital creative agency, UI UX design, website development, game development, animation, graphic design, creative technology, Indonesia'

    const ogAlt =
      '39Production Portfolio — Digital and Creative Production'

    const metas: Array<['name' | 'property', string, string]> = [
      ['name', 'description', description],
      ['name', 'keywords', keywords],
      [
        'name',
        'robots',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      ],
      ['name', 'theme-color', '#ffffff'],
      ['property', 'og:title', 'Portfolio — 39Production'],
      ['property', 'og:description', description],
      ['property', 'og:url', PAGE_URL],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', '39Production'],
      ['property', 'og:image', DEFAULT_OG_IMAGE],
      ['property', 'og:image:alt', ogAlt],
      ['property', 'og:image:width', '1200'],
      ['property', 'og:image:height', '630'],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', 'Portfolio — 39Production'],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', DEFAULT_OG_IMAGE],
      ['name', 'twitter:image:alt', ogAlt],
    ]

    /* Simpan nilai lama supaya bisa dipulihkan saat halaman ditinggalkan */
    const previous = metas.map(([attribute, key]) => {
      const element = document.head.querySelector(
        `meta[${attribute}="${key}"]`,
      ) as HTMLMetaElement | null

      return {
        attribute,
        key,
        content: element ? element.content : null,
      }
    })

    const previousCanonical = (
      document.head.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement | null
    )?.href

    document.title =
      'Portfolio — 39Production | Digital & Creative Production'

    metas.forEach(([attribute, key, content]) =>
      setMetaTag(attribute, key, content),
    )

    setCanonical(PAGE_URL)

    createJsonLdScript('portfolio-page-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '39Production Portfolio',
      headline:
        'Portfolio — 39Production | Digital & Creative Production',
      description,
      url: PAGE_URL,
      inLanguage: 'en',
      isPartOf: {
        '@type': 'WebSite',
        name: '39Production',
        url: SITE_URL,
      },
      about: {
        '@type': 'Organization',
        name: '39Production',
        url: SITE_URL,
      },
    })

    createJsonLdScript('portfolio-breadcrumb-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Portfolio',
          item: PAGE_URL,
        },
      ],
    })

    return () => {
      document.title = previousTitle

      previous.forEach(({ attribute, key, content }) => {
        if (content !== null) {
          setMetaTag(attribute, key, content)
        } else {
          document.head
            .querySelector(`meta[${attribute}="${key}"]`)
            ?.remove()
        }
      })

      if (previousCanonical) {
        setCanonical(previousCanonical)
      } else {
        document.head
          .querySelector('link[rel="canonical"]')
          ?.remove()
      }

      document.getElementById('portfolio-page-jsonld')?.remove()
      document.getElementById('portfolio-breadcrumb-jsonld')?.remove()
      document.getElementById('portfolio-items-jsonld')?.remove()
    }
  }, [])

  /*
   * ============================================================
   * SEO — DYNAMIC PORTFOLIO STRUCTURED DATA
   * ============================================================
   */

  useEffect(() => {
    if (portfolio.length === 0) return

    const items = portfolio
      .slice(0, 50)
      .map((item, index) => {
        const images = getPortfolioImages(item)

        const itemUrl = item.project_url || PAGE_URL

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'CreativeWork',
            '@id': `${PAGE_URL}#portfolio-${item.id}`,
            name: item.title,
            description:
              item.description ||
              `${item.title} — creative project by 39Production.`,
            url: itemUrl,
            image: images[0] ?? DEFAULT_OG_IMAGE,
            creator: {
              '@type': 'Organization',
              name: '39Production',
              url: SITE_URL,
            },
            publisher: {
              '@type': 'Organization',
              name: '39Production',
              url: SITE_URL,
            },
            ...(item.category
              ? { genre: getCategoryLabel(item.category) }
              : {}),
            ...(item.client
              ? {
                client: {
                  '@type': 'Organization',
                  name: item.client,
                },
              }
              : {}),
            ...(item.year
              ? { dateCreated: String(item.year) }
              : {}),
          },
        }
      })

    const jsonLd = createJsonLdScript('portfolio-items-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '39Production Portfolio',
      url: PAGE_URL,
      numberOfItems: portfolio.length,
      itemListElement: items,
    })

    return () => {
      jsonLd.remove()
    }
  }, [portfolio])

  /*
   * ============================================================
   * FETCH PORTFOLIO
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false

    async function fetchPortfolio() {
      try {
        setLoading(true)

        const response = await fetch(
          `${API_BASE_URL}/api/portfolio`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch portfolio')
        }

        const data = await response.json()

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.portfolio)
              ? data.portfolio
              : []

        if (!cancelled) {
          setPortfolio(items)
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error)

        if (!cancelled) {
          setPortfolio([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPortfolio()

    return () => {
      cancelled = true
    }
  }, [])

  /*
   * ============================================================
   * TURUNAN DATA
   * ============================================================
   */

  const categories = useMemo(() => {
    const uniqueCategories = portfolio
      .map((item) => item.category)
      .filter(Boolean)

    return ['All', ...Array.from(new Set(uniqueCategories))]
  }, [portfolio])

  const filteredPortfolio = useMemo(() => {
    if (activeCategory === 'All') {
      return portfolio
    }

    return portfolio.filter(
      (item) => item.category === activeCategory,
    )
  }, [portfolio, activeCategory])

  const countByCategory = (category: string) =>
    category === 'All'
      ? portfolio.length
      : portfolio.filter((item) => item.category === category).length

  /* Project unggulan: yang punya galeri terbanyak (urutan asli jika sama) */
  const featured = useMemo(() => {
    if (portfolio.length < 3) return null

    return portfolio.reduce((best, item) =>
      getPortfolioImages(item).length > getPortfolioImages(best).length
        ? item
        : best,
    )
  }, [portfolio])

  const showSpotlight =
    activeCategory === 'All' && featured !== null

  const gridItems = useMemo(
    () =>
      showSpotlight && featured
        ? portfolio.filter((item) => item.id !== featured.id)
        : filteredPortfolio,
    [showSpotlight, featured, portfolio, filteredPortfolio],
  )

  const clients = useMemo(
    () =>
      Array.from(
        new Set(
          portfolio
            .map((item) => item.client?.trim())
            .filter((c): c is string => Boolean(c)),
        ),
      ),
    [portfolio],
  )

  const years = useMemo(() => {
    const values = portfolio
      .map((item) => Number(item.year))
      .filter((y) => Number.isFinite(y) && y > 0)

    if (values.length === 0) return null
    const min = Math.min(...values)
    const max = Math.max(...values)
    return min === max ? String(min) : `${min}–${String(max).slice(-2)}`
  }, [portfolio])

  const marqueeItems = useMemo(() => {
    if (clients.length >= 2) return clients
    const cats = categories.filter((c) => c !== 'All').map(getCategoryLabel)
    return cats.length >= 2
      ? cats
      : ['Web', 'UI/UX', 'Graphic', 'Animation', 'Game', 'Production']
  }, [clients, categories])

  /* 5 bingkai untuk cincin 3D di hero (dipadatkan dengan dummy bila perlu) */
  const ringFrames = useMemo(() => {
    const real = portfolio.slice(0, 5).map((item) => ({
      key: `p-${item.id}`,
      title: item.title,
      src: getPortfolioImages(item)[0] ?? null,
    }))

    const fillers = [
      'Website',
      'Interface',
      'Identity',
      'Motion',
      'Game',
    ]

    while (real.length < 5) {
      const i = real.length
      real.push({
        key: `f-${i}`,
        title: fillers[i % fillers.length],
        src: null,
      })
    }

    return real
  }, [portfolio])

  /*
   * ============================================================
   * MOTION
   * ============================================================
   */

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)

    const onChange = (e: MediaQueryListEvent) =>
      setReduceMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const items = root.querySelectorAll(
      '[data-reveal]:not(.is-visible)',
    )

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [loading, activeCategory, portfolio.length])

  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType === 'touch') return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
  }

  const onStageLeave = () => {
    const el = stageRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  /*
   * ============================================================
   * SELECTED PROJECT
   * ============================================================
   */

  const selectedImages = selectedItem
    ? getPortfolioImages(selectedItem)
    : []

  const activeImage =
    selectedImages[activeImageIndex] || selectedImages[0] || null

  function openPortfolio(item: PortfolioItem) {
    setSelectedItem(item)
    setActiveImageIndex(0)
    document.body.style.overflow = 'hidden'
  }

  function closePortfolio() {
    setSelectedItem(null)
    setActiveImageIndex(0)
    document.body.style.overflow = ''
  }

  const selectedIndex = selectedItem
    ? portfolio.findIndex((p) => p.id === selectedItem.id)
    : -1

  function showAdjacentProject(direction: 1 | -1) {
    if (portfolio.length < 2 || selectedIndex < 0) return

    const next =
      portfolio[
      (selectedIndex + direction + portfolio.length) %
      portfolio.length
      ]

    setSelectedItem(next)
    setActiveImageIndex(0)
  }

  function showNextImage() {
    if (selectedImages.length <= 1) return

    setActiveImageIndex((current) =>
      current >= selectedImages.length - 1 ? 0 : current + 1,
    )
  }

  function showPreviousImage() {
    if (selectedImages.length <= 1) return

    setActiveImageIndex((current) =>
      current <= 0 ? selectedImages.length - 1 : current - 1,
    )
  }

  /*
   * ============================================================
   * KEYBOARD NAVIGATION
   * ============================================================
   */

  useEffect(() => {
    if (!selectedItem) return

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        closePortfolio()
      }

      if (event.key === 'ArrowRight') {
        showNextImage()
      }

      if (event.key === 'ArrowLeft') {
        showPreviousImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedItem, selectedImages.length])

  /*
   * ============================================================
   * BODY SCROLL CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <main
      ref={rootRef}
      className="pf min-h-screen overflow-x-hidden bg-white text-neutral-950"
    >
      {/* ======================================================
          GRID BACKGROUND
          ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="relative border-b border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-10 lg:px-12 lg:pb-20 lg:pt-12">
          <div
            className="pf-in mb-8 flex items-center justify-between border-b border-neutral-200 pb-4 sm:mb-12"
            style={delay(0)}
          >
            <span className="font-mono text-[8px] font-medium uppercase tracking-[0.22em] text-neutral-500 sm:text-[9px]">
              39Production • Portfolio
            </span>

            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 sm:block">
              Selected Works
            </span>
          </div>

          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="relative z-10">
              <p
                className="pf-in mb-5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600 sm:mb-6 sm:text-[10px]"
                style={delay(80)}
              >
                <span className="pf-grow h-px w-8 bg-violet-600" />
                04 / Portfolio
              </p>

              <h1 className="max-w-5xl text-[3.1rem] font-medium leading-[0.92] tracking-[-0.065em] sm:text-6xl lg:text-[6.6rem]">
                <span className="block overflow-hidden pb-[0.05em]">
                  <span className="pf-up block" style={delay(160)}>
                    Work that
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.05em]">
                  <span
                    className="pf-up block text-neutral-400"
                    style={delay(260)}
                  >
                    <span className="relative inline-block">
                      speaks for itself.
                      <span
                        aria-hidden="true"
                        className="pf-draw absolute bottom-[0.02em] left-0 right-0 h-[0.06em] bg-violet-600"
                      />
                    </span>
                  </span>
                </span>
              </h1>

              <p
                className="pf-in mt-6 max-w-md text-[13px] leading-6 text-neutral-500 sm:mt-8 sm:text-sm sm:leading-7"
                style={delay(380)}
              >
                A selection of digital works, visual experiences, products,
                and creative projects produced by 39Production — real
                projects, real results.
              </p>

              <div
                className="pf-in mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3"
                style={delay(450)}
              >
                <a
                  href="#works"
                  className="group relative inline-flex items-center justify-between gap-6 overflow-hidden bg-neutral-950 px-5 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-violet-600 sm:min-w-[210px]"
                >
                  <span className="pf-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20" />
                  <span className="relative">Explore the works</span>
                  <ArrowRight
                    size={15}
                    strokeWidth={1.6}
                    className="relative transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-between gap-6 border border-neutral-950 px-5 py-3.5 text-sm font-medium transition-colors duration-300 hover:bg-neutral-950 hover:text-white sm:min-w-[190px]"
                >
                  Start a project
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.6}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              {/* Statistik */}
              <div
                className="pf-in mt-7 grid max-w-xl grid-cols-4 border-t border-neutral-200 sm:mt-9"
                style={delay(520)}
              >
                {[
                  { value: String(portfolio.length).padStart(2, '0'), label: 'Projects' },
                  {
                    value: String(Math.max(categories.length - 1, 0)).padStart(2, '0'),
                    label: 'Disciplines',
                  },
                  {
                    value: String(clients.length).padStart(2, '0'),
                    label: 'Clients',
                  },
                  { value: years ?? '—', label: 'Years' },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`min-w-0 pt-3 ${i > 0 ? 'border-l border-neutral-200 pl-3 sm:pl-4' : ''
                      }`}
                  >
                    <p className="truncate font-mono text-xl font-medium tracking-[-0.05em] text-violet-600 sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------- STAGE 3D: cincin bingkai project ---------------- */}
            <div
              ref={stageRef}
              onPointerMove={onStageMove}
              onPointerLeave={onStageLeave}
              className="pf-in pf-stage relative h-[300px] sm:h-[390px] lg:h-[500px]"
              style={delay(200)}
            >
              <div className="pf-tilt absolute inset-0">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 border border-neutral-200"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-3 font-mono text-[8px] uppercase tracking-[0.2em] text-neutral-400"
                >
                  Fig.39 / Selected Works
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-3 right-3 font-mono text-[8px] uppercase tracking-[0.2em] text-neutral-400"
                >
                  360° / Gallery
                </span>

                <div
                  aria-hidden="true"
                  className="pf-z-a pointer-events-none absolute left-1/2 top-[52%]"
                >
                  <div className="pf-ringwrap">
                    <div className="pf-ring">
                      {ringFrames.map((frame, i) => (
                        <div
                          key={frame.key}
                          className="pf-frame"
                          style={{ ['--i' as string]: i }}
                        >
                          <div className="pf-chrome">
                            <i />
                            <i />
                            <i />
                            <span>{frame.title}</span>
                          </div>
                          <div className="pf-shot">
                            <ProjectImage
                              src={frame.src}
                              alt=""
                              seed={frame.title}
                              eager
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kubus */}
                <div
                  aria-hidden="true"
                  className="pf-z-b pointer-events-none absolute right-[7%] top-[8%]"
                >
                  <div className="pf-float-slow">
                    <div className="pf-cube">
                      <i className="pf-f1">39</i>
                      <i className="pf-f2" />
                      <i className="pf-f3">P</i>
                      <i className="pf-f4" />
                      <i className="pf-f5" />
                      <i className="pf-f6" />
                    </div>
                  </div>
                </div>

                {/* Bola */}
                <div
                  aria-hidden="true"
                  className="pf-z-c pointer-events-none absolute left-[7%] top-[16%]"
                >
                  <div className="pf-float" style={{ animationDelay: '-2s' }}>
                    <div className="pf-sphere" />
                  </div>
                </div>

                {/* Kartu angka */}
                <div
                  aria-hidden="true"
                  className="pf-z-c pointer-events-none absolute bottom-[7%] left-[4%]"
                >
                  <div className="pf-float" style={{ animationDelay: '-3.5s' }}>
                    <div className="pf-plane border border-neutral-950 bg-white px-3 py-2.5 shadow-[8px_8px_0_0_rgba(124,58,237,0.9)] sm:px-4 sm:py-3">
                      <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-neutral-400">
                        Selected works
                      </p>
                      <p className="mt-1 font-mono text-xl font-medium tracking-[-0.05em] text-violet-600 sm:text-2xl">
                        {String(portfolio.length).padStart(2, '0')}
                        <span className="ml-1.5 text-[9px] uppercase tracking-[0.14em] text-neutral-500">
                          projects
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {[
                  ['14%', '70%'],
                  ['88%', '44%'],
                  ['30%', '12%'],
                ].map(([l, t], i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="pf-twinkle pointer-events-none absolute h-1.5 w-1.5 bg-violet-600"
                    style={{ left: l, top: t, animationDelay: `${i * 0.7}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          TRUST STRIP
          ====================================================== */}

      <div
        aria-hidden="true"
        className="relative flex items-center border-b border-neutral-200"
      >
        <span className="relative z-10 hidden shrink-0 self-stretch border-r border-neutral-200 bg-white px-6 py-3 font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 sm:flex sm:items-center">
          {clients.length >= 2 ? 'Worked with' : 'Disciplines'}
        </span>

        <div className="min-w-0 flex-1 overflow-hidden py-3">
          <div className="pf-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-8">
                {[...marqueeItems, ...marqueeItems].map((item, i) => (
                  <span key={`${copy}-${i}`} className="flex items-center gap-8">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-neutral-500">
                      {item}
                    </span>
                    <span className="h-1 w-1 bg-violet-600" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================
          SPOTLIGHT
          ====================================================== */}

      {!loading && showSpotlight && featured && (
        <section
          data-reveal
          className="pf-rv border-b border-neutral-200"
        >
          <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                04.01
              </span>
              <span className="h-px w-10 bg-violet-600" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                Project Spotlight
              </span>
            </div>

            <Spotlight item={featured} onOpen={openPortfolio} />
          </div>
        </section>
      )}

      {/* ======================================================
          FILTER
          ====================================================== */}

      <section
        id="works"
        className="scroll-mt-20 border-b border-neutral-200"
      >
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 lg:h-16 lg:w-56 lg:border-b-0 lg:border-r">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                04.02
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-400 sm:text-[9px]">
                All works
              </span>
            </div>

            <div className="-mx-5 flex overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
              <div className="flex shrink-0">
                {categories.map((category) => {
                  const isActive = activeCategory === category

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`flex shrink-0 items-center gap-2 border-r px-4 py-4 font-mono text-[8px] uppercase tracking-[0.15em] transition-colors first:border-l sm:px-5 sm:py-5 sm:text-[9px] ${isActive
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
                        }`}
                    >
                      {getCategoryLabel(category)}
                      <span
                        className={
                          isActive ? 'text-white/60' : 'text-neutral-400'
                        }
                      >
                        {String(countByCategory(category)).padStart(2, '0')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          PORTFOLIO
          ====================================================== */}

      <section aria-labelledby="portfolio-list-title">
        <h2 id="portfolio-list-title" className="sr-only">
          39Production Portfolio Projects
        </h2>

        <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          {loading ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="pf-skeleton h-[96px] border border-neutral-200 bg-neutral-50 sm:h-[230px]"
                  style={{ animationDelay: `${index * 0.12}s` }}
                />
              ))}
            </div>
          ) : filteredPortfolio.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center border border-dashed border-neutral-300 px-5 text-center sm:min-h-[360px]">
              <ImageIcon
                size={28}
                strokeWidth={1.2}
                className="mb-5 text-neutral-300"
              />

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 sm:text-[10px]">
                No projects found
              </p>
            </div>
          ) : gridItems.length === 0 ? null : (
            <div
              key={activeCategory}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4 2xl:grid-cols-5"
            >
              {gridItems.map((item, index) => (
                <div
                  key={item.id}
                  data-reveal
                  style={delay((index % 4) * 70)}
                  className="pf-rv h-full"
                >
                  <ProjectCard
                    item={item}
                    index={index + (showSpotlight ? 1 : 0)}
                    onOpen={openPortfolio}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          BOTTOM STATEMENT / CTA
          ====================================================== */}

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <div
            data-reveal
            className="pf-rv relative overflow-hidden bg-neutral-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14 lg:py-16"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[-3rem] top-1/2 hidden -translate-y-1/2 text-[15rem] font-black leading-none tracking-[-0.12em] text-white/[0.035] sm:block"
            >
              39
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-8 top-8 hidden lg:block"
              style={{ perspective: '800px' }}
            >
              <div className="pf-float-slow">
                <div className="pf-cube pf-cube-dark">
                  <i className="pf-f1">39</i>
                  <i className="pf-f2" />
                  <i className="pf-f3">P</i>
                  <i className="pf-f4" />
                  <i className="pf-f5" />
                  <i className="pf-f6" />
                </div>
              </div>
            </div>

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                    04.03
                  </span>
                  <span className="h-px w-10 bg-violet-500" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Your project is next
                  </span>
                </div>

                <p className="max-w-4xl text-3xl font-medium leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Like what you see?
                  <span className="block text-violet-400">
                    Let&apos;s build yours.
                  </span>
                </p>

                <p className="mt-5 max-w-xl text-xs leading-6 text-white/55 sm:mt-6 sm:text-base">
                  Every project is an opportunity to turn an idea into
                  something people can see, use, experience, and remember.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                <Link
                  to="/contact"
                  className="group relative inline-flex items-center justify-between gap-6 overflow-hidden bg-violet-600 px-6 py-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-violet-500 sm:min-w-[220px]"
                >
                  <span className="pf-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20" />
                  <span className="relative">Start a project</span>
                  <ArrowRight
                    size={16}
                    strokeWidth={1.6}
                    className="relative transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/services"
                  className="group inline-flex items-center justify-between gap-6 border border-white/20 px-6 py-4 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-violet-400 hover:text-violet-300 sm:min-w-[220px]"
                >
                  Explore services
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.6}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          DETAIL MODAL
          ====================================================== */}

      {selectedItem && (
        <div
          className="pf-modal fixed inset-0 z-[100] bg-black/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePortfolio()
            }
          }}
        >
          <div className="flex h-full w-full items-center justify-center p-2 sm:p-5">
            <div className="pf-modal-panel relative flex max-h-[96vh] w-full max-w-[1120px] flex-col overflow-y-auto overscroll-contain bg-white shadow-2xl lg:grid lg:h-[88vh] lg:max-h-[88vh] lg:grid-cols-[1.3fr_1fr] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
              {/* Tombol tutup */}

              <button
                type="button"
                onClick={closePortfolio}
                aria-label="Close portfolio detail"
                className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center border border-neutral-950 bg-white text-neutral-950 transition-colors hover:bg-violet-600 hover:text-white lg:right-4 lg:top-4"
              >
                <X size={16} strokeWidth={1.6} />
              </button>

              {/* ================= PANGGUNG GAMBAR ================= */}

              <div className="relative flex min-h-[340px] shrink-0 flex-col overflow-hidden bg-[#0d0820] lg:min-h-0 lg:shrink">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 15% 10%, rgba(124,58,237,.55), transparent 55%), radial-gradient(circle at 90% 95%, rgba(231,143,186,.35), transparent 55%), linear-gradient(to right, rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.04) 1px, transparent 1px)',
                    backgroundSize: 'auto, auto, 28px 28px, 28px 28px',
                  }}
                />

                <div className="relative z-10 flex items-center gap-3 px-4 pb-2 pt-4 pr-16 sm:px-6 sm:pt-5">
                  <span className="bg-violet-600 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                    {getCategoryLabel(selectedItem.category)}
                  </span>

                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
                    Project{' '}
                    {String(Math.max(selectedIndex, 0) + 1).padStart(2, '0')}
                    {' / '}
                    {String(portfolio.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-5 sm:px-10 sm:py-8">
                  <ModalShot
                    key={`${selectedItem.id}-${activeImageIndex}`}
                    src={activeImage}
                    title={selectedItem.title}
                    index={activeImageIndex}
                  />

                  {selectedImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        aria-label="Previous image"
                        className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-violet-600 sm:left-4"
                      >
                        <ChevronLeft size={17} strokeWidth={1.5} />
                      </button>

                      <button
                        type="button"
                        onClick={showNextImage}
                        aria-label="Next image"
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/40 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-violet-600 sm:right-4"
                      >
                        <ChevronRight size={17} strokeWidth={1.5} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail */}

                <div className="relative z-10 flex items-center justify-between gap-4 px-4 pb-4 sm:px-6 sm:pb-5">
                  {selectedImages.length > 1 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {selectedImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          aria-label={`View image ${index + 1}`}
                          className={`relative h-11 w-16 shrink-0 overflow-hidden border transition-all sm:h-12 sm:w-[72px] ${activeImageIndex === index
                            ? 'border-violet-400 opacity-100'
                            : 'border-white/20 opacity-50 hover:opacity-100'
                            }`}
                        >
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full bg-[#0d0820] object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                      Single image project
                    </span>
                  )}

                  <span className="shrink-0 font-mono text-[9px] tracking-[0.18em] text-white/60">
                    {String(
                      selectedImages.length === 0 ? 1 : activeImageIndex + 1,
                    ).padStart(2, '0')}{' '}
                    /{' '}
                    {String(Math.max(selectedImages.length, 1)).padStart(
                      2,
                      '0',
                    )}
                  </span>
                </div>
              </div>

              {/* ================= INFORMASI PROJECT ================= */}

              <aside className="flex shrink-0 flex-col bg-white lg:min-h-0 lg:shrink lg:overflow-hidden">
                <div
                  key={selectedItem.id}
                  className="p-5 pt-6 sm:p-7 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:p-8"
                >
                  <p
                    className="pf-in flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600"
                    style={delay(80)}
                  >
                    <span className="h-px w-8 bg-violet-600" />
                    Case Study
                  </p>

                  <h2
                    className="pf-in mt-4 text-3xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-4xl"
                    style={delay(140)}
                  >
                    {selectedItem.title}
                  </h2>

                  {selectedItem.description && (
                    <p
                      className="pf-in mt-4 text-[13px] leading-6 text-neutral-500 sm:text-sm sm:leading-7"
                      style={delay(200)}
                    >
                      {selectedItem.description}
                    </p>
                  )}

                  {(
                    [
                      ['Client', selectedItem.client],
                      ['Year', selectedItem.year],
                      ['Role', selectedItem.role],
                      ['Category', getCategoryLabel(selectedItem.category)],
                    ] as Array<[string, string | number | undefined]>
                  ).some(([, v]) => v) && (
                      <div
                        className="pf-in mt-6 grid grid-cols-2 border-l border-t border-neutral-200"
                        style={delay(260)}
                      >
                        {(
                          [
                            ['Client', selectedItem.client],
                            ['Year', selectedItem.year],
                            ['Role', selectedItem.role],
                            [
                              'Category',
                              getCategoryLabel(selectedItem.category),
                            ],
                          ] as Array<[string, string | number | undefined]>
                        )
                          .filter(([, value]) => value)
                          .map(([label, value]) => (
                            <div
                              key={label}
                              className="min-w-0 border-b border-r border-neutral-200 p-3.5"
                            >
                              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400">
                                {label}
                              </p>
                              <p className="mt-1 truncate text-[13px] font-medium text-neutral-900 sm:text-sm">
                                {value}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}

                  {selectedItem.tools && selectedItem.tools.length > 0 && (
                    <div className="pf-in mt-5" style={delay(320)}>
                      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400">
                        Tools
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedItem.tools.map((tool) => (
                          <span
                            key={tool}
                            className="border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-700"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className="pf-in mt-7 flex flex-col gap-2.5"
                    style={delay(380)}
                  >
                    {selectedItem.project_url && (
                      <a
                        href={selectedItem.project_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between border border-neutral-950 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-neutral-950 hover:text-white"
                      >
                        <span>View live project</span>

                        <ExternalLink
                          size={15}
                          strokeWidth={1.5}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </a>
                    )}

                    <Link
                      to="/contact"
                      onClick={closePortfolio}
                      className="group relative flex items-center justify-between overflow-hidden bg-violet-600 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                    >
                      <span className="pf-shine-loop pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25" />
                      <span className="relative">Start a similar project</span>

                      <ArrowRight
                        size={15}
                        strokeWidth={1.6}
                        className="relative transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>

                {/* Navigasi antar project */}

                <div className="flex shrink-0 items-stretch border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => showAdjacentProject(-1)}
                    disabled={portfolio.length < 2}
                    className="group flex flex-1 items-center gap-3 border-r border-neutral-200 px-4 py-3.5 text-left transition-colors hover:bg-neutral-950 hover:text-white disabled:opacity-40 sm:px-5"
                  >
                    <ArrowRight
                      size={14}
                      strokeWidth={1.6}
                      className="shrink-0 rotate-180 transition-transform duration-300 group-hover:-translate-x-1"
                    />
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
                      Previous project
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showAdjacentProject(1)}
                    disabled={portfolio.length < 2}
                    className="group flex flex-1 items-center justify-end gap-3 px-4 py-3.5 text-right transition-colors hover:bg-neutral-950 hover:text-white disabled:opacity-40 sm:px-5"
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
                      Next project
                    </span>
                    <ArrowRight
                      size={14}
                      strokeWidth={1.6}
                      className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </div>

                <div className="hidden shrink-0 items-center justify-between border-t border-neutral-200 px-5 py-2.5 sm:flex">
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-400">
                    39Production / Portfolio
                  </span>

                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                    ← → Images · ESC Close
                  </span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ---------- Reveal ---------- */
        @keyframes pf-in {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pf .pf-in {
          opacity: 0;
          animation: pf-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }

        .pf .pf-rv {
          opacity: 0;
          transform: translate3d(0, 28px, 0);
          transition:
            opacity .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
        }
        .pf .pf-rv.is-visible { opacity: 1; transform: none; }

        @keyframes pf-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .pf .pf-up {
          transform: translateY(105%);
          animation: pf-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }
        @keyframes pf-draw { to { transform: scaleX(1); } }
        .pf .pf-draw {
          transform: scaleX(0);
          transform-origin: left;
          animation: pf-draw .9s cubic-bezier(.77,0,.18,1) 1.1s forwards;
        }
        @keyframes pf-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .pf .pf-grow {
          transform-origin: left;
          animation: pf-grow .9s cubic-bezier(.77,0,.18,1) .4s both;
        }

        /* ---------- Floating ---------- */
        @keyframes pf-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .pf .pf-float { animation: pf-float 6s ease-in-out infinite; }
        .pf .pf-float-slow { animation: pf-float 9s ease-in-out infinite; }

        @keyframes pf-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .pf .pf-blink { animation: pf-blink 2s ease-in-out infinite; }

        @keyframes pf-twinkle {
          0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
          50% { opacity: 1; transform: scale(1) rotate(45deg); }
        }
        .pf .pf-twinkle { animation: pf-twinkle 3s ease-in-out infinite; }

        @keyframes pf-marquee { to { transform: translateX(-50%); } }
        .pf .pf-marquee { animation: pf-marquee 40s linear infinite; }

        /* ---------- Stage 3D ---------- */
        .pf .pf-stage { perspective: 1100px; }
        .pf .pf-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .pf .pf-z-a { transform: translateZ(0); }
        .pf .pf-z-b { transform: translateZ(100px); }
        .pf .pf-z-c { transform: translateZ(70px); }
        @media (max-width: 1023px) {
          .pf .pf-z-b, .pf .pf-z-c { transform: translateZ(30px); }
        }

        /* Cincin bingkai project */
        .pf .pf-ringwrap {
          --fw: 132px; --fh: 96px; --rad: 150px;
          width: 0; height: 0;
          transform-style: preserve-3d;
          transform: rotateX(-9deg);
        }
        @media (min-width: 640px) { .pf .pf-ringwrap { --fw: 176px; --fh: 126px; --rad: 210px; } }
        @media (min-width: 1024px) { .pf .pf-ringwrap { --fw: 228px; --fh: 162px; --rad: 276px; } }

        .pf .pf-ring {
          position: absolute;
          left: 0; top: 0;
          width: 0; height: 0;
          transform-style: preserve-3d;
          animation: pf-ring 30s linear infinite;
        }
        @keyframes pf-ring {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(-360deg); }
        }
        .pf .pf-frame {
          position: absolute;
          width: var(--fw);
          height: var(--fh);
          left: calc(var(--fw) / -2);
          top: calc(var(--fh) / -2);
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1.5px solid #111;
          box-shadow: 6px 6px 0 0 rgba(124, 58, 237, .85);
          backface-visibility: hidden;
          transform: rotateY(calc(var(--i) * 72deg)) translateZ(var(--rad));
        }
        .pf .pf-chrome {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 16px;
          padding: 0 6px;
          border-bottom: 1.5px solid #111;
          background: #fff;
        }
        .pf .pf-chrome i {
          display: block;
          width: 5px; height: 5px;
          background: #111;
        }
        .pf .pf-chrome i:nth-child(1) { background: #7C3AED; }
        .pf .pf-chrome i:nth-child(2) { background: #E78FBA; }
        .pf .pf-chrome span {
          margin-left: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: ui-monospace, monospace;
          font-size: 7px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #737373;
        }
        .pf .pf-shot { position: relative; flex: 1; overflow: hidden; background: #0d0820; }

        /* Kubus */
        .pf .pf-cube {
          --s: 44px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: pf-cube 14s linear infinite;
        }
        @media (min-width: 640px) { .pf .pf-cube { --s: 58px; } }
        @media (min-width: 1024px) { .pf .pf-cube { --s: 72px; } }
        @keyframes pf-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .pf .pf-cube i {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-style: normal;
          font-weight: 900;
          font-size: calc(var(--s) * .34);
          letter-spacing: -.06em;
          color: #7C3AED;
          border: 1.5px solid rgba(124, 58, 237, .85);
          background: rgba(124, 58, 237, .1);
        }
        .pf .pf-cube .pf-f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.78); }
        .pf .pf-cube .pf-f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
        .pf .pf-cube .pf-f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.78); }
        .pf .pf-cube .pf-f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
        .pf .pf-cube .pf-f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
        .pf .pf-cube .pf-f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }
        .pf .pf-cube-dark { --s: 76px; }
        .pf .pf-cube-dark i { color: #E78FBA; border-color: rgba(231,143,186,.7); background: rgba(124,58,237,.28); }

        /* Bola */
        .pf .pf-sphere {
          width: 30px; height: 30px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 14px 22px -8px rgba(124, 58, 237, .55);
        }
        @media (min-width: 640px) { .pf .pf-sphere { width: 42px; height: 42px; } }
        @media (min-width: 1024px) { .pf .pf-sphere { width: 56px; height: 56px; } }

        .pf .pf-plane { transform: rotateY(16deg) rotateX(6deg); }

        /* ---------- Kartu ---------- */
        .pf .pf-card {
          transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition:
            transform .3s cubic-bezier(.22,1,.36,1),
            border-color .5s, box-shadow .5s;
          will-change: transform;
        }
        .pf .pf-glare {
          background: radial-gradient(
            260px circle at var(--gx, 50%) var(--gy, 0%),
            rgba(124, 58, 237, .14),
            transparent 65%
          );
        }

        @keyframes pf-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        .pf .pf-kb { animation: pf-kb 14s ease-in-out infinite alternate; }

        @keyframes pf-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .pf .group:hover .pf-shine { animation: pf-shine .9s ease-out; }
        .pf .pf-shine-loop { animation: pf-shine 3.4s ease-in-out infinite; }

        @keyframes pf-art-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(8px, -8px, 0); }
        }
        .pf .pf-art-a { animation: pf-art-drift 9s ease-in-out infinite alternate; }

        @keyframes pf-art-bar { 0%,100% { transform: scaleY(.55); } 50% { transform: scaleY(1); } }
        .pf .pf-art-bar {
          transform-box: fill-box;
          transform-origin: bottom;
          animation: pf-art-bar 2.4s ease-in-out infinite;
        }

        @keyframes pf-skeleton { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .pf .pf-skeleton { animation: pf-skeleton 1.4s ease-in-out infinite; }

        /* ---------- Modal ---------- */
        @keyframes pf-modal-bg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pf-modal-panel {
          from { opacity: 0; transform: translateY(24px) scale(.985); }
          to   { opacity: 1; transform: none; }
        }
        .pf .pf-modal { animation: pf-modal-bg .3s ease-out both; }
        .pf .pf-modal-panel { animation: pf-modal-panel .45s cubic-bezier(.22,1,.36,1) both; }
        @keyframes pf-fade { from { opacity: 0; } to { opacity: 1; } }
        .pf .pf-fade { animation: pf-fade .4s ease-out both; }

        @media (prefers-reduced-motion: reduce) {
          .pf *, .pf *::before, .pf *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .pf .pf-in, .pf .pf-rv, .pf .pf-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .pf .pf-draw, .pf .pf-grow { transform: scaleX(1) !important; }
          .pf .pf-tilt, .pf .pf-card { transform: none !important; }
        }
      `}</style>
    </main>
  )
}

export default PortfolioPage