import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  FileText,
  Loader2,
  Newspaper,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const SITE_URL = 'https://39production.digital'
const PAGE_URL = `${SITE_URL}/news`
const DEFAULT_OG_IMAGE =
  'https://39production.digital/og-image.jpg'

interface News {
  id: number
  title: string
  category: string
  author: string
  excerpt: string
  content: string
  date: string
  status: 'Published' | 'Draft'
  image_url?: string | null
}

async function apiRequest<T>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
  )

  const text = await response.text()

  let result: any

  try {
    result = JSON.parse(text)
  } catch {
    throw new Error(
      `API response tidak valid (${response.status}).`,
    )
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || 'Gagal mengambil data.',
    )
  }

  return result.data
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

function getDateParts(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      day: '--',
      month: '---',
      year: '----',
    }
  }

  return {
    day: new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
    }).format(parsedDate),
    month: new Intl.DateTimeFormat('id-ID', {
      month: 'short',
    })
      .format(parsedDate)
      .replace('.', '')
      .toUpperCase(),
    year: new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
    }).format(parsedDate),
  }
}

function shortDate(date: string) {
  const parts = getDateParts(date)
  return `${parts.day} ${parts.month} ${parts.year}`
}

function timestamp(date: string) {
  const value = new Date(`${date}T00:00:00`).getTime()
  return Number.isNaN(value) ? 0 : value
}

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

/*
 * ============================================================
 * SEO HELPERS
 * ============================================================
 */

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

/* ------------------------------------------------------------------ */
/* Tilt 3D mengikuti kursor                                            */
/* ------------------------------------------------------------------ */
function useTilt<T extends HTMLElement>(max = 5) {
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
  const id = `nw-${variant}-${seed.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`

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
        <g className="nw-art-a">
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
                className="nw-art-bar"
                style={{ animationDelay: `${(i % 8) * 0.22}s` }}
              />
            )
          })}
          <rect x="36" y="222" width="330" height="1" fill="#fff" opacity="0.25" />
        </g>
      )}

      {variant === 2 && (
        <g className="nw-art-a">
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
        <g className="nw-art-a">
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

function NewsImage({
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
/* Label kategori                                                      */
/* ------------------------------------------------------------------ */
function Tag({
  children,
  dark = false,
}: {
  children: ReactNode
  dark?: boolean
}) {
  return (
    <span
      className={`inline-flex w-fit items-center px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] sm:text-[9px] ${dark
        ? 'bg-white text-violet-700'
        : 'bg-violet-600 text-white'
        }`}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Berita utama (lead)                                                 */
/* ------------------------------------------------------------------ */
function LeadStory({ item }: { item: News }) {
  const { ref, onMove, onLeave } = useTilt<HTMLAnchorElement>(4)

  return (
    <Link
      ref={ref}
      to={`/news/${item.id}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="nw-card group relative block h-full min-h-[320px] overflow-hidden bg-[#0d0820] sm:min-h-[420px] lg:min-h-[480px]"
    >
      <NewsImage
        src={item.image_url}
        alt={item.title}
        seed={item.title}
        eager
        className="nw-kb transition-transform duration-700 group-hover:scale-[1.04]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
      <div className="nw-glare pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="nw-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/20 opacity-0" />

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 sm:left-6 sm:top-6">
        <span className="inline-flex items-center gap-2 bg-violet-600 px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.85)]">
          <span className="nw-blink h-1.5 w-1.5 bg-white" />
          Top story
        </span>
        <Tag dark>{item.category}</Tag>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-7 lg:p-9">
        <h2 className="nw-ul max-w-3xl text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-4xl lg:text-[2.7rem]">
          <span>{item.title}</span>
        </h2>

        {item.excerpt && (
          <p className="mt-3 hidden max-w-2xl line-clamp-2 text-sm leading-6 text-white/75 sm:block">
            {item.excerpt}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/20 pt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-white/70 sm:text-[10px]">
          <span>By {item.author}</span>
          <span className="h-1 w-1 bg-white/40" />
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {formatDate(item.date)}
          </span>
          <span className="ml-auto flex items-center gap-2 font-bold text-white">
            Read story
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Berita samping (di sebelah lead)                                    */
/* ------------------------------------------------------------------ */
function SideStory({ item, index }: { item: News; index: number }) {
  return (
    <Link
      to={`/news/${item.id}`}
      className="group relative flex flex-1 gap-3.5 border border-zinc-200 bg-white p-3 transition-[border-color,box-shadow] duration-500 hover:border-violet-400 hover:shadow-[6px_6px_0_0_rgba(124,58,237,0.9)] sm:gap-4 sm:p-3.5"
    >
      <div className="absolute left-0 top-0 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

      <div className="relative aspect-[4/3] w-[104px] shrink-0 overflow-hidden bg-[#0d0820] sm:w-[148px]">
        <NewsImage
          src={item.image_url}
          alt={item.title}
          seed={item.title}
          className="transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <span className="absolute left-0 top-0 z-10 bg-zinc-950 px-1.5 py-1 font-mono text-[8px] font-bold text-white">
          {String(index).padStart(2, '0')}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-violet-600 sm:text-[9px]">
            {item.category}
          </p>
          <h3 className="mt-1.5 line-clamp-3 text-[14px] font-semibold leading-[1.18] tracking-[-0.03em] text-zinc-950 transition-colors group-hover:text-violet-600 sm:text-base">
            {item.title}
          </h3>
        </div>

        <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400 sm:text-[9px]">
          {shortDate(item.date)} · {item.author}
        </p>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Baris berita (daftar utama)                                         */
/* ------------------------------------------------------------------ */
function StoryRow({ item }: { item: News }) {
  return (
    <Link
      to={`/news/${item.id}`}
      className="group relative flex gap-4 border-b border-zinc-200 py-4 transition-colors hover:bg-violet-50/40 sm:gap-6 sm:py-6"
    >
      <div className="absolute bottom-[-1px] left-0 h-px w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Tag>{item.category}</Tag>
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400 sm:text-[9px]">
            {shortDate(item.date)}
          </span>
        </div>

        <h3 className="nw-ul mt-2.5 text-[16px] font-semibold leading-[1.15] tracking-[-0.035em] text-zinc-950 sm:mt-3 sm:text-2xl">
          <span>{item.title}</span>
        </h3>

        {item.excerpt && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500 sm:mt-3 sm:text-sm sm:leading-6">
            {item.excerpt}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
          <span className="truncate text-[10px] text-zinc-500 sm:text-xs">
            By <span className="font-medium text-zinc-800">{item.author}</span>
          </span>

          <span className="flex shrink-0 items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-violet-600 sm:text-[9px]">
            Read
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      <div className="relative aspect-[4/3] w-[104px] shrink-0 self-start overflow-hidden bg-[#0d0820] sm:w-[220px]">
        <NewsImage
          src={item.image_url}
          alt={item.title}
          seed={item.title}
          className="transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="nw-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-white/25 opacity-0" />
      </div>
    </Link>
  )
}

/* ============================================================
   PAGE
============================================================ */
export function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [reduceMotion, setReduceMotion] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  /*
   * ============================================================
   * SEO — NEWS INDEX
   * ============================================================
   */

  useEffect(() => {
    const previousTitle = document.title

    const description =
      'Read the latest stories, creative insights, project updates, announcements, and ideas from 39Production.'

    const keywords =
      '39Production, 39Production Journal, creative studio, digital production, creative technology, design, development, animation, UI UX, project updates, Indonesia'

    const metas: Array<['name' | 'property', string, string]> = [
      ['name', 'description', description],
      ['name', 'keywords', keywords],
      [
        'name',
        'robots',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      ],
      ['property', 'og:title', 'Journal — 39Production'],
      ['property', 'og:description', description],
      ['property', 'og:url', PAGE_URL],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', '39Production'],
      ['property', 'og:image', DEFAULT_OG_IMAGE],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', 'Journal — 39Production'],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', DEFAULT_OG_IMAGE],
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
      'Journal — 39Production | Ideas, Stories & Updates'

    metas.forEach(([attribute, key, content]) =>
      setMetaTag(attribute, key, content),
    )

    setCanonical(PAGE_URL)

    document.getElementById('news-page-jsonld')?.remove()

    const jsonLd = document.createElement('script')

    jsonLd.id = 'news-page-jsonld'
    jsonLd.type = 'application/ld+json'

    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '39Production Journal',
      description,
      url: PAGE_URL,
      isPartOf: {
        '@type': 'WebSite',
        name: '39Production',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: '39Production',
        url: SITE_URL,
      },
    })

    document.head.appendChild(jsonLd)

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

      jsonLd.remove()
      document.getElementById('news-items-jsonld')?.remove()
    }
  }, [])

  /*
   * ============================================================
   * SEO — DYNAMIC NEWS ITEMLIST
   * ============================================================
   */

  useEffect(() => {
    if (news.length === 0) return

    const existing =
      document.getElementById('news-items-jsonld')

    existing?.remove()

    const jsonLd = document.createElement('script')

    jsonLd.id = 'news-items-jsonld'
    jsonLd.type = 'application/ld+json'

    jsonLd.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '39Production Journal',
      url: PAGE_URL,
      numberOfItems: news.length,
      itemListElement: news
        .slice(0, 50)
        .map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Article',
            headline: item.title,
            description:
              item.excerpt ||
              `Latest story from 39Production: ${item.title}`,
            url: `${SITE_URL}/news/${item.id}`,
            ...(item.image_url
              ? { image: item.image_url }
              : {}),
            datePublished: item.date,
            author: {
              '@type': 'Person',
              name: item.author,
            },
            publisher: {
              '@type': 'Organization',
              name: '39Production',
              url: SITE_URL,
            },
            ...(item.category
              ? { articleSection: item.category }
              : {}),
          },
        })),
    })

    document.head.appendChild(jsonLd)

    return () => {
      jsonLd.remove()
    }
  }, [news])

  /*
   * ============================================================
   * LOAD NEWS
   * ============================================================
   */

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<News[]>('/api/news')

        setNews(
          (data || []).filter(
            (item) => item.status === 'Published',
          ),
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil berita.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadNews()
  }, [])

  /*
   * ============================================================
   * TURUNAN DATA
   * ============================================================
   */

  /* Berita terbaru di depan, seperti halaman berita pada umumnya */
  const sortedNews = useMemo(
    () =>
      [...news].sort(
        (a, b) => timestamp(b.date) - timestamp(a.date),
      ),
    [news],
  )

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          sortedNews
            .map((item) => item.category)
            .filter(Boolean),
        ),
      ),
    [sortedNews],
  )

  const filteredNews =
    category === 'All'
      ? sortedNews
      : sortedNews.filter(
        (item) => item.category === category,
      )

  const lead = filteredNews[0]
  const sideStories = filteredNews.slice(1, 4)
  const restStories = filteredNews.slice(4)

  const countByCategory = (name: string) =>
    sortedNews.filter((item) => item.category === name).length

  const tickerItems = sortedNews.slice(0, 8)

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [],
  )

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
      { threshold: 0.06, rootMargin: '0px 0px -4% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [loading, error, category, news.length])

  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType === 'touch') return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
  }

  const onStageLeave = () => {
    const el = stageRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  return (
    <div
      ref={rootRef}
      className="nw min-h-screen overflow-x-hidden bg-white text-zinc-900"
    >
      {/* EDITORIAL GRID */}

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
          MASTHEAD
          ====================================================== */}

      <header className="relative border-b-2 border-zinc-950">
        <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-6 sm:pt-8 lg:px-8">
          {/* Utility bar */}
          <div
            className="nw-in flex items-center justify-between gap-4 border-b border-zinc-200 pb-3"
            style={delay(0)}
          >
            <p className="truncate font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px] sm:tracking-[0.22em]">
              {todayLabel}
            </p>

            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:flex">
              <span>Stories</span>
              <span className="text-zinc-300">/</span>
              <span>Ideas</span>
              <span className="text-zinc-300">/</span>
              <span>Updates</span>
            </div>

            <p className="flex shrink-0 items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-violet-600 sm:hidden">
              <span className="nw-blink h-1.5 w-1.5 bg-violet-600" />
              Live
            </p>
          </div>

          <div className="grid items-center gap-2 py-5 sm:py-7 lg:grid-cols-[1fr_340px] lg:gap-10">
            {/* Wordmark */}
            <div className="relative z-10">
              <p
                className="nw-in flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-[10px]"
                style={delay(80)}
              >
                <span className="nw-grow h-px w-8 bg-violet-600" />
                39Production • Publication
              </p>

              <h1 className="mt-3 text-[3.3rem] font-semibold leading-[0.88] tracking-[-0.075em] text-zinc-950 sm:text-7xl lg:text-[6.4rem]">
                <span className="block overflow-hidden pb-[0.05em]">
                  <span className="nw-up block" style={delay(140)}>
                    The Journal
                    <span className="text-violet-600">.</span>
                  </span>
                </span>
              </h1>

              <p
                className="nw-in mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:mt-4 sm:text-base sm:leading-7"
                style={delay(300)}
              >
                Stories behind what we create — ideas, projects, releases,
                and creative experiments from 39Production.
              </p>

              {!loading && !error && (
                <div
                  className="nw-in mt-5 flex items-center gap-5 sm:gap-7"
                  style={delay(380)}
                >
                  <div>
                    <p className="font-mono text-2xl font-medium tracking-[-0.05em] text-zinc-950 sm:text-3xl">
                      {String(news.length).padStart(2, '0')}
                    </p>
                    <p className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px]">
                      Published
                    </p>
                  </div>

                  <span className="h-9 w-px bg-zinc-200" />

                  <div>
                    <p className="font-mono text-2xl font-medium tracking-[-0.05em] text-zinc-950 sm:text-3xl">
                      {String(categories.length).padStart(2, '0')}
                    </p>
                    <p className="mt-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px]">
                      Topics
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stage 3D: tumpukan koran */}
            <div
              ref={stageRef}
              onPointerMove={onStageMove}
              onPointerLeave={onStageLeave}
              className="nw-in nw-stage relative h-[170px] sm:h-[210px] lg:h-[230px]"
              style={delay(200)}
            >
              <div className="nw-tilt absolute inset-0">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 border border-zinc-200"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-2 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400"
                >
                  Fig.39 / Edition
                </span>

                {/* Tumpukan koran isometrik */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -ml-[52px] -mt-[38px] sm:-ml-[62px] sm:-mt-[44px] lg:-ml-[74px] lg:-mt-[52px]"
                >
                  <div className="nw-iso">
                    <span className="nw-shadow" />
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="nw-sheet"
                        style={{ ['--i' as string]: i }}
                      >
                        {i === 3 && <i />}
                        {i === 3 && <strong>39</strong>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kubus */}
                <div
                  aria-hidden="true"
                  className="nw-z-a pointer-events-none absolute right-[8%] top-[10%]"
                >
                  <div className="nw-float-slow">
                    <div className="nw-cube">
                      <i className="nw-f1">N</i>
                      <i className="nw-f2" />
                      <i className="nw-f3">39</i>
                      <i className="nw-f4" />
                      <i className="nw-f5" />
                      <i className="nw-f6" />
                    </div>
                  </div>
                </div>

                {/* Bola */}
                <div
                  aria-hidden="true"
                  className="nw-z-b pointer-events-none absolute bottom-[14%] left-[8%]"
                >
                  <div className="nw-float" style={{ animationDelay: '-2s' }}>
                    <div className="nw-sphere" />
                  </div>
                </div>

                {/* Label melayang */}
                <div
                  aria-hidden="true"
                  className="nw-z-b pointer-events-none absolute bottom-[10%] right-[5%]"
                >
                  <div className="nw-float" style={{ animationDelay: '-3.5s' }}>
                    <div className="nw-plane border border-zinc-950 bg-white px-2.5 py-1.5 shadow-[5px_5px_0_0_rgba(124,58,237,0.9)]">
                      <p className="flex items-center gap-1.5 font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-violet-600">
                        <span className="nw-blink h-1 w-1 bg-violet-600" />
                        Breaking
                      </p>
                    </div>
                  </div>
                </div>

                {[
                  ['14%', '22%'],
                  ['84%', '58%'],
                  ['44%', '84%'],
                ].map(([l, t], i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="nw-twinkle pointer-events-none absolute h-1.5 w-1.5 bg-violet-600"
                    style={{ left: l, top: t, animationDelay: `${i * 0.7}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigasi kategori */}
        <nav
          aria-label="Kategori"
          className="nw-in border-t border-zinc-950 bg-white"
          style={delay(440)}
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="nw-scroll -mx-5 flex overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <NavTab
                active={category === 'All'}
                onClick={() => setCategory('All')}
                count={news.length}
              >
                All Stories
              </NavTab>

              {categories.map((item) => (
                <NavTab
                  key={item}
                  active={category === item}
                  onClick={() => setCategory(item)}
                  count={countByCategory(item)}
                >
                  {item}
                </NavTab>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* ======================================================
          TICKER — BERITA TERBARU
          ====================================================== */}

      {!loading && !error && tickerItems.length > 0 && (
        <div className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto flex max-w-7xl items-stretch px-5 sm:px-6 lg:px-8">
            <span className="relative z-10 flex shrink-0 items-center gap-2 bg-violet-600 px-3 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white">
              <span className="nw-blink h-1.5 w-1.5 bg-white" />
              Latest
            </span>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="nw-marquee flex w-max items-center py-2.5">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1}
                    className="flex items-center"
                  >
                    {tickerItems.map((item) => (
                      <Link
                        key={`${copy}-${item.id}`}
                        to={`/news/${item.id}`}
                        tabIndex={copy === 1 ? -1 : 0}
                        className="flex items-center gap-4 whitespace-nowrap px-5 text-xs font-medium text-zinc-700 transition-colors hover:text-violet-600"
                      >
                        <span className="font-mono text-[9px] text-zinc-400">
                          {shortDate(item.date)}
                        </span>
                        {item.title}
                        <span className="h-1 w-1 bg-violet-600" />
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* LOADING */}

        {loading && (
          <div className="py-6 sm:py-8">
            <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              Loading the journal
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.7fr_1fr] lg:gap-5">
              <div className="nw-skeleton h-[300px] bg-zinc-100 sm:h-[420px]" />
              <div className="grid gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="nw-skeleton h-[92px] bg-zinc-100"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="my-10 border border-red-200 bg-red-50/60 p-6 sm:my-14 sm:p-8">
            <div className="flex items-start gap-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-500">
                  Request failed
                </p>

                <p className="mt-3 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* EMPTY */}

            {filteredNews.length === 0 && (
              <section className="py-14 sm:py-24">
                <div className="border border-zinc-200 bg-zinc-50 px-5 py-14 text-center sm:px-6 sm:py-20">
                  <Newspaper className="mx-auto h-8 w-8 text-zinc-300" />

                  <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[10px]">
                    Empty index
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                    No stories yet.
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                    There are currently no published stories in this
                    category. Check back soon for new updates from
                    39Production.
                  </p>
                </div>
              </section>
            )}

            {/* ================= BERITA UTAMA ================= */}

            {lead && (
              <section
                key={category}
                className="py-6 sm:py-8"
              >
                <div
                  className={`grid gap-3 lg:gap-5 ${sideStories.length > 0
                    ? 'lg:grid-cols-[1.7fr_1fr]'
                    : ''
                    }`}
                >
                  <div data-reveal className="nw-rv">
                    <LeadStory item={lead} />
                  </div>

                  {sideStories.length > 0 && (
                    <div className="flex flex-col gap-3 lg:gap-4">
                      {sideStories.map((item, index) => (
                        <div
                          key={item.id}
                          data-reveal
                          style={delay(index * 100 + 80)}
                          className="nw-rv flex flex-1 flex-col"
                        >
                          <SideStory item={item} index={index + 2} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ================= DAFTAR + SIDEBAR ================= */}

            {lead && restStories.length > 0 && (
              <section className="border-t-2 border-zinc-950 py-8 sm:py-12">
                <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-12">
                  <div>
                    <div
                      data-reveal
                      className="nw-rv flex items-end justify-between border-b border-zinc-200 pb-3"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-600">
                            02
                          </span>
                          <span className="h-px w-8 bg-violet-600" />
                          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Latest updates
                          </p>
                        </div>

                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
                          More from the journal.
                        </h2>
                      </div>

                      <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
                        {restStories.length} stories
                      </span>
                    </div>

                    <div>
                      {restStories.map((item, index) => (
                        <div
                          key={item.id}
                          data-reveal
                          style={delay((index % 3) * 70)}
                          className="nw-rv"
                        >
                          <StoryRow item={item} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SIDEBAR */}

                  <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    {/* Pilihan editor */}
                    <div
                      data-reveal
                      className="nw-rv border border-zinc-950"
                    >
                      <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-white">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                          Editor&apos;s picks
                        </p>
                        <span className="nw-blink h-1.5 w-1.5 bg-violet-400" />
                      </div>

                      <ol>
                        {sortedNews.slice(0, 5).map((item, index) => (
                          <li key={item.id}>
                            <Link
                              to={`/news/${item.id}`}
                              className="group flex gap-4 border-b border-zinc-200 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-violet-50/50"
                            >
                              <span className="w-8 shrink-0 font-mono text-2xl font-medium leading-none tracking-[-0.06em] text-zinc-300 transition-colors group-hover:text-violet-600">
                                {String(index + 1).padStart(2, '0')}
                              </span>

                              <span className="min-w-0">
                                <span className="line-clamp-2 text-[13px] font-semibold leading-[1.25] tracking-[-0.02em] text-zinc-950 transition-colors group-hover:text-violet-600">
                                  {item.title}
                                </span>
                                <span className="mt-1.5 block font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-400">
                                  {item.category} · {shortDate(item.date)}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Topik */}
                    {categories.length > 0 && (
                      <div
                        data-reveal
                        style={delay(80)}
                        className="nw-rv border border-zinc-200"
                      >
                        <div className="border-b border-zinc-200 px-4 py-3">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                            Browse by topic
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 p-4">
                          {categories.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setCategory(item)
                                window.scrollTo({
                                  top: 0,
                                  behavior: reduceMotion ? 'auto' : 'smooth',
                                })
                              }}
                              className="flex items-center gap-2 border border-zinc-200 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-600 transition-colors hover:border-violet-600 hover:bg-violet-600 hover:text-white"
                            >
                              {item}
                              <span className="text-zinc-400">
                                {String(countByCategory(item)).padStart(2, '0')}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tentang */}
                    <div
                      data-reveal
                      style={delay(160)}
                      className="nw-rv relative overflow-hidden bg-zinc-950 p-5 text-white"
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-6 right-0 text-[8rem] font-black leading-none tracking-[-0.12em] text-white/[0.05]"
                      >
                        39
                      </div>

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-5 top-5"
                        style={{ perspective: '600px' }}
                      >
                        <div className="nw-float-slow">
                          <div className="nw-cube nw-cube-dark">
                            <i className="nw-f1">39</i>
                            <i className="nw-f2" />
                            <i className="nw-f3">N</i>
                            <i className="nw-f4" />
                            <i className="nw-f5" />
                            <i className="nw-f6" />
                          </div>
                        </div>
                      </div>

                      <p className="relative font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-400">
                        About the journal
                      </p>

                      <p className="relative mt-3 max-w-[200px] text-lg font-semibold leading-[1.15] tracking-[-0.03em]">
                        We document the ideas behind the work.
                      </p>

                      <div className="relative mt-5 flex flex-col gap-2">
                        <Link
                          to="/portfolio"
                          className="group flex items-center justify-between bg-violet-600 px-4 py-3 text-xs font-semibold transition-colors hover:bg-violet-500"
                        >
                          Explore our work
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link
                          to="/contact"
                          className="group flex items-center justify-between border border-white/20 px-4 py-3 text-xs font-semibold text-white/80 transition-colors hover:border-violet-400 hover:text-violet-300"
                        >
                          Start a project
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            )}

            {/* FOOTER STATEMENT */}

            {filteredNews.length > 0 && (
              <section className="border-t border-zinc-200 py-10 sm:py-16">
                <div className="grid gap-5 sm:grid-cols-[120px_1fr] sm:gap-8">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[10px]">
                    06.01
                  </div>

                  <div className="max-w-3xl">
                    <p className="text-2xl font-medium leading-tight tracking-[-0.03em] text-zinc-900 sm:text-3xl">
                      We document the ideas, experiments, and stories that
                      become part of the work.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 sm:mt-7">
                      <Link
                        to="/portfolio"
                        className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600 sm:text-xs"
                      >
                        Explore our work

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>

                      <Link
                        to="/contact"
                        className="group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-zinc-900 sm:text-xs"
                      >
                        Start a project

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <style>{`
        .nw .nw-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .nw .nw-scroll::-webkit-scrollbar { display: none; }

        /* ---------- Reveal ---------- */
        @keyframes nw-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nw .nw-in {
          opacity: 0;
          animation: nw-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }

        .nw .nw-rv {
          opacity: 0;
          transform: translate3d(0, 26px, 0);
          transition:
            opacity .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
        }
        .nw .nw-rv.is-visible { opacity: 1; transform: none; }

        @keyframes nw-up {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .nw .nw-up {
          transform: translateY(105%);
          animation: nw-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
        }
        @keyframes nw-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .nw .nw-grow {
          transform-origin: left;
          animation: nw-grow .9s cubic-bezier(.77,0,.18,1) .4s both;
        }

        /* Judul: garis bawah menyapu saat hover */
        .nw .nw-ul span {
          background-image: linear-gradient(currentColor, currentColor);
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 0% 2px;
          transition: background-size .6s cubic-bezier(.22,1,.36,1);
          padding-bottom: 2px;
        }
        .nw .group:hover .nw-ul span { background-size: 100% 2px; }

        /* ---------- Floating ---------- */
        @keyframes nw-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .nw .nw-float { animation: nw-float 6s ease-in-out infinite; }
        .nw .nw-float-slow { animation: nw-float 9s ease-in-out infinite; }

        @keyframes nw-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .nw .nw-blink { animation: nw-blink 1.6s ease-in-out infinite; }

        @keyframes nw-twinkle {
          0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
          50% { opacity: 1; transform: scale(1) rotate(45deg); }
        }
        .nw .nw-twinkle { animation: nw-twinkle 3s ease-in-out infinite; }

        @keyframes nw-marquee { to { transform: translateX(-50%); } }
        .nw .nw-marquee { animation: nw-marquee 60s linear infinite; }
        .nw .nw-marquee:hover { animation-play-state: paused; }

        /* ---------- Stage 3D ---------- */
        .nw .nw-stage { perspective: 1000px; }
        .nw .nw-tilt {
          transform-style: preserve-3d;
          transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .35s cubic-bezier(.22,1,.36,1);
        }
        .nw .nw-z-a { transform: translateZ(70px); }
        .nw .nw-z-b { transform: translateZ(50px); }
        @media (max-width: 1023px) {
          .nw .nw-z-a, .nw .nw-z-b { transform: translateZ(24px); }
        }

        /* Tumpukan koran isometrik */
        .nw .nw-iso {
          --size: 104px;
          position: relative;
          width: var(--size);
          height: var(--size);
          transform-style: preserve-3d;
          transform: rotateX(58deg) rotateZ(-38deg);
        }
        @media (min-width: 640px) { .nw .nw-iso { --size: 124px; } }
        @media (min-width: 1024px) { .nw .nw-iso { --size: 148px; } }

        .nw .nw-sheet {
          position: absolute;
          inset: 0;
          border: 1.5px solid #111;
          background: #fff;
          transform: translateZ(calc(var(--i) * 20px));
          animation: nw-sheet 5.5s ease-in-out infinite alternate;
          animation-delay: calc(var(--i) * -.7s);
        }
        .nw .nw-sheet::before {
          content: '';
          position: absolute;
          left: 8%; right: 8%; top: 8%;
          height: 14%;
          background: #111;
        }
        .nw .nw-sheet::after {
          content: '';
          position: absolute;
          left: 8%; right: 8%; top: 30%; bottom: 8%;
          background:
            repeating-linear-gradient(
              to bottom,
              rgba(0,0,0,.18) 0 2px,
              transparent 2px 7px
            );
        }
        .nw .nw-sheet:nth-of-type(2) { background: #f5f3ff; }
        .nw .nw-sheet:nth-of-type(3) { background: #fdf2f8; }
        .nw .nw-sheet:nth-of-type(4) { background: #fff; }
        .nw .nw-sheet i {
          position: absolute;
          left: 8%; top: 30%;
          width: 46%; height: 34%;
          background: linear-gradient(135deg, #7C3AED, #E78FBA);
          z-index: 2;
        }
        .nw .nw-sheet strong {
          position: absolute;
          right: 10%; top: 28%;
          z-index: 2;
          font-size: 40px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -.08em;
          color: transparent;
          -webkit-text-stroke: 1.5px #7C3AED;
        }
        @keyframes nw-sheet {
          from { transform: translateZ(calc(var(--i) * 14px)); }
          to   { transform: translateZ(calc(var(--i) * 30px)); }
        }
        .nw .nw-shadow {
          position: absolute;
          inset: 0;
          background: rgba(124, 58, 237, .2);
          filter: blur(10px);
          transform: translateZ(-8px) scale(1.05);
        }

        /* Kubus */
        .nw .nw-cube {
          --s: 34px;
          position: relative;
          width: var(--s);
          height: var(--s);
          transform-style: preserve-3d;
          animation: nw-cube 14s linear infinite;
        }
        @media (min-width: 640px) { .nw .nw-cube { --s: 42px; } }
        @media (min-width: 1024px) { .nw .nw-cube { --s: 50px; } }
        @keyframes nw-cube {
          from { transform: rotateX(-24deg) rotateY(0deg); }
          to   { transform: rotateX(-24deg) rotateY(360deg); }
        }
        .nw .nw-cube i {
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
        .nw .nw-cube .nw-f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.8); }
        .nw .nw-cube .nw-f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
        .nw .nw-cube .nw-f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.8); }
        .nw .nw-cube .nw-f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
        .nw .nw-cube .nw-f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
        .nw .nw-cube .nw-f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }
        .nw .nw-cube-dark { --s: 44px; }
        .nw .nw-cube-dark i { color: #E78FBA; border-color: rgba(231,143,186,.7); background: rgba(124,58,237,.28); }

        /* Bola */
        .nw .nw-sphere {
          width: 22px; height: 22px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
          box-shadow: 0 10px 16px -6px rgba(124, 58, 237, .55);
        }
        @media (min-width: 640px) { .nw .nw-sphere { width: 28px; height: 28px; } }
        @media (min-width: 1024px) { .nw .nw-sphere { width: 34px; height: 34px; } }

        .nw .nw-plane { transform: rotateY(-14deg) rotateX(6deg); }

        /* ---------- Kartu lead ---------- */
        .nw .nw-card {
          transform: perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform .3s cubic-bezier(.22,1,.36,1);
          will-change: transform;
        }
        .nw .nw-glare {
          background: radial-gradient(
            320px circle at var(--gx, 50%) var(--gy, 0%),
            rgba(255, 255, 255, .16),
            transparent 65%
          );
        }

        @keyframes nw-kb {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        .nw .nw-kb { animation: nw-kb 16s ease-in-out infinite alternate; }

        @keyframes nw-shine {
          0% { left: -50%; opacity: 0; }
          30% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .nw .group:hover .nw-shine { animation: nw-shine .9s ease-out; }

        @keyframes nw-art-drift {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(8px, -8px, 0); }
        }
        .nw .nw-art-a { animation: nw-art-drift 9s ease-in-out infinite alternate; }

        @keyframes nw-art-bar { 0%,100% { transform: scaleY(.55); } 50% { transform: scaleY(1); } }
        .nw .nw-art-bar {
          transform-box: fill-box;
          transform-origin: bottom;
          animation: nw-art-bar 2.4s ease-in-out infinite;
        }

        @keyframes nw-skeleton { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        .nw .nw-skeleton { animation: nw-skeleton 1.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .nw *, .nw *::before, .nw *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
          .nw .nw-in, .nw .nw-rv, .nw .nw-up {
            opacity: 1 !important;
            transform: none !important;
          }
          .nw .nw-grow { transform: scaleX(1) !important; }
          .nw .nw-tilt, .nw .nw-card { transform: none !important; }
        }
      `}</style>
    </div>
  )
}

/*
 * ============================================================
 * NAV TAB (kategori)
 * ============================================================
 */

function NavTab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex shrink-0 items-center gap-2 px-4 py-3.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition-colors sm:px-5 sm:text-[10px] ${active
        ? 'text-violet-600'
        : 'text-zinc-500 hover:text-zinc-950'
        }`}
    >
      {children}
      <span
        className={`text-[8px] ${active ? 'text-violet-400' : 'text-zinc-300'
          }`}
      >
        {String(count).padStart(2, '0')}
      </span>

      <span
        className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-violet-600 transition-transform duration-500 ${active ? 'scale-x-100' : 'scale-x-0'
          }`}
      />
    </button>
  )
}

export default NewsPage