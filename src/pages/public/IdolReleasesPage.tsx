import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Disc3,
  ExternalLink,
  Loader2,
  Music,
  Pause,
  Play,
  Sparkles,
  X,
} from 'lucide-react'

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL = 'https://39production-api.39production.workers.dev'
const SITE_URL = 'https://39production.github.io/39Production'

interface IdolRelease {
  id: number
  group_id: number
  group_name?: string
  title: string
  type: 'Single' | 'EP' | 'Album'
  release_date: string
  description: string
  cover_url: string
  audio_url: string
  spotify_url: string
  youtube_url: string
  status: 'Released' | 'Upcoming'
}

type ReleaseFilter = 'All' | 'Single' | 'EP' | 'Album' | 'Upcoming'

const TYPE_STYLE: Record<IdolRelease['type'], string> = {
  Single: 'bg-[var(--pink)] text-white',
  EP: 'bg-[var(--cyan)] text-[var(--ink)]',
  Album: 'bg-[var(--lemon)] text-[var(--ink)]',
}

/* ============================================================
   HELPERS
============================================================ */

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: 'no-store',
  })

  const text = await response.text()

  let result: any

  try {
    result = JSON.parse(text)
  } catch {
    throw new Error(`API response tidak valid (${response.status}).`)
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Gagal mengambil data.')
  }

  return result.data
}

function formatDate(date: string) {
  if (!date) return '-'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function upsertMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  )

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)

  return element
}

function upsertCanonical(url: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', url)

  return canonical
}

/* ============================================================
   STYLES
============================================================ */

const PAGE_CSS = `
.ip-root{
  --ink:#150a38;
  --ink-2:#26104f;
  --pink:#ff3d9a;
  --cyan:#3de0ff;
  --lemon:#ffe45c;
  --lilac:#b9a6ff;
  --paper:#fff7fb;
  font-family:'Figtree',system-ui,-apple-system,'Segoe UI',sans-serif;
}
.ip-display{
  font-family:'Unbounded','Figtree',system-ui,sans-serif;
  letter-spacing:-0.035em;
}
.ip-outline{
  color:transparent;
  -webkit-text-stroke:2px currentColor;
}
.ip-3d{transform-style:preserve-3d}

@keyframes ip-spin{to{transform:rotate(360deg)}}
@keyframes ip-float{
  0%,100%{transform:translate3d(0,0,var(--z,0px)) rotate(var(--r,0deg))}
  50%{transform:translate3d(0,-16px,var(--z,0px)) rotate(calc(var(--r,0deg) + 10deg))}
}
@keyframes ip-bob{
  0%,100%{transform:translate3d(0,0,var(--z,0px)) rotateY(var(--ry,0deg)) rotateX(var(--rx,0deg))}
  50%{transform:translate3d(0,-12px,var(--z,0px)) rotateY(calc(var(--ry,0deg) + 4deg)) rotateX(var(--rx,0deg))}
}
@keyframes ip-marquee{to{transform:translateX(-50%)}}
@keyframes ip-beam{
  0%,100%{transform:rotate(-16deg)}
  50%{transform:rotate(16deg)}
}
@keyframes ip-rise{
  from{opacity:0;transform:translateY(60%) rotateX(-70deg)}
  to{opacity:1;transform:none}
}
@keyframes ip-pop{
  from{opacity:0;transform:translateY(14px) scale(.97)}
  to{opacity:1;transform:none}
}
@keyframes ip-slide-up{
  from{opacity:0;transform:translate(-50%,40px)}
  to{opacity:1;transform:translate(-50%,0)}
}
@keyframes ip-pulse{
  0%,100%{opacity:.55;transform:scale(1)}
  50%{opacity:.9;transform:scale(1.08)}
}
@keyframes ip-wave{
  0%,100%{transform:scaleY(.18)}
  50%{transform:scaleY(1)}
}

.ip-line{
  display:block;
  transform-origin:50% 100%;
  animation:ip-rise 1s cubic-bezier(.2,.8,.2,1) both;
}
.ip-beam{
  position:absolute;
  top:-4%;
  height:95%;
  width:46%;
  transform-origin:50% 0;
  mix-blend-mode:screen;
  filter:blur(10px);
  clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);
  animation:ip-beam 9s ease-in-out infinite;
}
.ip-focus:focus-visible{
  outline:3px solid var(--cyan);
  outline-offset:3px;
}
.ip-vinyl{
  background:
    radial-gradient(circle,transparent 0 17%,#15072f 17.5% 19%,transparent 19.5%),
    repeating-radial-gradient(circle,#0b0420 0 2px,#1b0d3d 2px 4px),
    conic-gradient(from 20deg,transparent 0 20%,rgba(255,255,255,.28) 25%,transparent 32% 70%,rgba(61,224,255,.35) 76%,transparent 84%);
}
.ip-slip{
  transition:transform .7s cubic-bezier(.22,.9,.24,1);
}
@media (hover:hover) and (min-width:768px){
  .ip-sleeve:hover .ip-slip,
  .ip-sleeve:focus-within .ip-slip{
    transform:translateX(44%) rotate(12deg);
  }
}
.ip-range{
  -webkit-appearance:none;
  appearance:none;
  height:6px;
  border-radius:999px;
  background:rgba(255,255,255,.2);
  cursor:pointer;
}
.ip-range::-webkit-slider-thumb{
  -webkit-appearance:none;
  width:14px;height:14px;border-radius:999px;
  background:var(--lemon);
  border:2px solid var(--ink);
}
.ip-range::-moz-range-thumb{
  width:12px;height:12px;border-radius:999px;
  background:var(--lemon);
  border:2px solid var(--ink);
}

@media (prefers-reduced-motion:reduce){
  .ip-root *,.ip-root *::before,.ip-root *::after{
    animation-duration:.001ms!important;
    animation-iteration-count:1!important;
    transition-duration:.001ms!important;
  }
}
`

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function Star({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className} style={style}>
      <path
        d="M50 0 C54 30 70 46 100 50 C70 54 54 70 50 100 C46 70 30 54 0 50 C30 46 46 30 50 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Cover({
  release,
  className = '',
  iconClass = 'h-12 w-12',
  eager = false,
}: {
  release?: IdolRelease | null
  className?: string
  iconClass?: string
  eager?: boolean
}) {
  if (release?.cover_url) {
    return (
      <img
        src={release.cover_url}
        alt={`${release.title} — ${release.group_name || '39Production Idol'}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff3d9a] via-[#b9a6ff] to-[#3de0ff] ${className}`}
    >
      <Music aria-hidden="true" className={`${iconClass} text-white/80`} />
    </div>
  )
}

/** Piringan hitam dengan cover sebagai label tengah */
function Vinyl({
  release,
  className = '',
  style,
  spin = '10s',
}: {
  release?: IdolRelease | null
  className?: string
  style?: CSSProperties
  spin?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`ip-vinyl relative rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,.6)] ${className}`}
      style={{ animation: `ip-spin ${spin} linear infinite`, ...style }}
    >
      <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-[var(--ink)]">
        {release?.cover_url ? (
          <img
            src={release.cover_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[var(--pink)]" />
        )}
        <span className="absolute left-1/2 top-1/2 h-[14%] w-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)]" />
      </div>
    </div>
  )
}

function Tilt({
  children,
  className = '',
  max = 8,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`
  }

  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  )
}

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0

    const run = () => {
      const start = performance.now()
      const duration = 1200

      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }

      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return <span ref={ref}>{display}</span>
}

/* ============================================================
   PAGE
============================================================ */

export function IdolReleasesPage() {
  const [releases, setReleases] = useState<IdolRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<ReleaseFilter>('All')

  /* player global */
  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<IdolRelease | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const sceneRef = useRef<HTMLDivElement>(null)

  /* ---------- SEO ---------- */
  useEffect(() => {
    const pageTitle = 'Music Releases — 39Production Idol'

    const pageDescription =
      'Explore original singles, EPs, albums, and upcoming music releases from 39Production Idol.'

    const canonicalUrl = `${SITE_URL}/idol/releases`

    document.title = pageTitle

    upsertMetaTag('name', 'description', pageDescription)
    upsertMetaTag(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )
    upsertMetaTag('name', 'author', '39Production')

    upsertMetaTag('property', 'og:type', 'website')
    upsertMetaTag('property', 'og:title', pageTitle)
    upsertMetaTag('property', 'og:description', pageDescription)
    upsertMetaTag('property', 'og:url', canonicalUrl)
    upsertMetaTag('property', 'og:site_name', '39Production')
    upsertMetaTag('property', 'og:image', `${SITE_URL}/og-image.png`)

    upsertMetaTag('name', 'twitter:card', 'summary_large_image')
    upsertMetaTag('name', 'twitter:title', pageTitle)
    upsertMetaTag('name', 'twitter:description', pageDescription)
    upsertMetaTag('name', 'twitter:image', `${SITE_URL}/og-image.png`)

    upsertCanonical(canonicalUrl)

    return () => {
      document.getElementById('idol-releases-structured-data')?.remove()
    }
  }, [])

  /* ---------- Fonts ---------- */
  useEffect(() => {
    const id = 'idol-page-fonts'
    if (document.getElementById(id)) return

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=Figtree:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])

  /* ---------- Load ---------- */
  useEffect(() => {
    const loadReleases = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolRelease[]>('/api/idol/releases')

        setReleases(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat releases.')
      } finally {
        setLoading(false)
      }
    }

    void loadReleases()
  }, [])

  /* ---------- Structured data ---------- */
  useEffect(() => {
    const pageUrl = `${SITE_URL}/idol/releases`

    const itemList = releases.slice(0, 20).map((release, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: release.title,
      url: pageUrl,
      item: {
        '@type': 'MusicRelease',
        name: release.title,
        url: pageUrl,
        datePublished: release.release_date || undefined,
        image: release.cover_url || undefined,
        description:
          release.description ||
          `Music release ${release.title} from 39Production Idol.`,
        byArtist: release.group_name
          ? {
            '@type': 'MusicGroup',
            name: release.group_name,
            url: `${SITE_URL}/idol/groups/${release.group_id}`,
          }
          : {
            '@type': 'Organization',
            name: '39Production',
            url: SITE_URL,
          },
      },
    }))

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#collection`,
      url: pageUrl,
      name: '39Production Idol Music Releases',
      description:
        'Original singles, EPs, albums, and upcoming music releases from 39Production Idol.',
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
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: itemList,
      },
    }

    let script = document.getElementById(
      'idol-releases-structured-data',
    ) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.id = 'idol-releases-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify(structuredData)

    return () => {
      script?.remove()
    }
  }, [releases])

  /* ---------- Hentikan audio saat keluar halaman ---------- */
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
    }
  }, [])

  /* ---------- Derived ---------- */
  const featuredRelease = useMemo(() => {
    if (!releases.length) return null
    return releases.find((r) => r.status === 'Released') || releases[0]
  }, [releases])

  const filteredReleases = useMemo(() => {
    if (activeFilter === 'All') return releases
    if (activeFilter === 'Upcoming') {
      return releases.filter((r) => r.status === 'Upcoming')
    }
    return releases.filter((r) => r.type === activeFilter)
  }, [activeFilter, releases])

  const releasedCount = releases.filter((r) => r.status === 'Released').length
  const upcomingCount = releases.filter((r) => r.status === 'Upcoming').length

  const filters: ReleaseFilter[] = ['All', 'Single', 'EP', 'Album', 'Upcoming']

  const countFor = (filter: ReleaseFilter) => {
    if (filter === 'All') return releases.length
    if (filter === 'Upcoming') return upcomingCount
    return releases.filter((r) => r.type === filter).length
  }

  const marqueeRow = useMemo(() => {
    const titles = releases.map((r) => r.title)
    let row = titles.length
      ? titles
      : ['Singles', 'EPs', 'Albums', 'Upcoming drops']
    while (row.length < 8) row = [...row, ...row]
    return row
  }, [releases])

  /* ---------- Player ---------- */
  const togglePlay = (release: IdolRelease) => {
    const audio = audioRef.current
    if (!audio || !release.audio_url) return

    if (current?.id === release.id) {
      if (audio.paused) {
        void audio.play().catch(() => setPlaying(false))
      } else {
        audio.pause()
      }
      return
    }

    setCurrent(release)
    setProgress(0)
    setDuration(0)
    audio.src = release.audio_url
    void audio.play().catch(() => setPlaying(false))
  }

  const closePlayer = () => {
    audioRef.current?.pause()
    setCurrent(null)
    setPlaying(false)
    setProgress(0)
  }

  const isPlaying = (release?: IdolRelease | null) =>
    !!release && current?.id === release.id && playing

  /* ---------- Parallax hero ---------- */
  const onHeroMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = sceneRef.current
    if (!el || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    el.style.setProperty('--mx', String((e.clientX - r.left) / r.width - 0.5))
    el.style.setProperty('--my', String((e.clientY - r.top) / r.height - 0.5))
  }

  const onHeroLeave = () => {
    sceneRef.current?.style.setProperty('--mx', '0')
    sceneRef.current?.style.setProperty('--my', '0')
  }

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <main
      className={`ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)] ${current ? 'pb-28' : ''
        }`}
    >
      <style>{PAGE_CSS}</style>

      {/* audio tunggal untuk seluruh halaman */}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setProgress(0)
        }}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* =======================================================
          HERO — sleeve + vinyl 3D, equalizer
      ======================================================= */}
      <section
        aria-labelledby="releases-page-title"
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
        className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 50% at 72% 45%, rgba(255,61,154,.3), transparent 70%), radial-gradient(40% 40% at 10% 90%, rgba(61,224,255,.18), transparent 70%)',
            }}
          />
          <div
            className="ip-beam left-[6%]"
            style={{ background: 'linear-gradient(to bottom, rgba(61,224,255,.5), transparent 80%)' }}
          />
          <div
            className="ip-beam left-[38%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,61,154,.55), transparent 80%)',
              animationDelay: '-4s',
              animationDuration: '11s',
            }}
          />
          <div
            className="ip-beam left-[60%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,228,92,.35), transparent 80%)',
              animationDelay: '-7s',
              animationDuration: '8s',
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-24 pt-28 sm:pt-32 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:px-8">
          {/* Kiri: judul + panel rilis terbaru */}
          <div className="relative z-10">
            <h1
              id="releases-page-title"
              className="ip-display text-[clamp(2.6rem,7vw,5.8rem)] font-black leading-[0.98]"
              style={{ perspective: 800 }}
            >
              <span className="ip-line" style={{ animationDelay: '.1s' }}>
                Music
              </span>
              <span
                className="ip-line ip-outline text-[var(--lemon)]"
                style={{ animationDelay: '.25s' }}
              >
                releases.
              </span>
            </h1>

            <p
              className="mt-6 max-w-md text-base leading-7 text-white/75 sm:text-lg"
              style={{ animation: 'ip-pop .8s .6s cubic-bezier(.2,.8,.2,1) both' }}
            >
              Original singles, EPs, and albums from 39Production. Press play
              on anything you see.
            </p>

            {!loading && !error && releases.length > 0 && (
              <dl
                className="mt-7 flex flex-wrap gap-3"
                style={{ animation: 'ip-pop .8s .75s cubic-bezier(.2,.8,.2,1) both' }}
              >
                {[
                  ['Total', releases.length, 'bg-white/10'],
                  ['Out now', releasedCount, 'bg-white/10'],
                  ['Coming soon', upcomingCount, 'bg-[var(--lemon)] text-[var(--ink)]'],
                ].map(([label, value, cls]) => (
                  <div
                    key={label as string}
                    className={`rounded-2xl px-4 py-2.5 backdrop-blur ${cls}`}
                  >
                    <dt className="text-xs opacity-70">{label}</dt>
                    <dd className="ip-display text-xl font-bold">
                      <Counter value={Number(value)} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Panel rilis terbaru */}
            {!loading && !error && featuredRelease && (
              <div
                className="mt-9 max-w-lg rounded-[28px] border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md"
                style={{ animation: 'ip-pop .8s .9s cubic-bezier(.2,.8,.2,1) both' }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--lemon)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
                    <Sparkles aria-hidden="true" className="h-3 w-3" />
                    Latest release
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${TYPE_STYLE[featuredRelease.type]}`}
                  >
                    {featuredRelease.type}
                  </span>
                </div>

                <h2 className="ip-display mt-4 break-words text-2xl font-black leading-tight sm:text-3xl">
                  {featuredRelease.title}
                </h2>

                <p className="mt-2 text-sm text-white/65">
                  {featuredRelease.group_name && (
                    <>
                      <Link
                        to={`/idol/groups/${featuredRelease.group_id}`}
                        className="ip-focus font-semibold text-[var(--cyan)] hover:underline"
                      >
                        {featuredRelease.group_name}
                      </Link>{' '}
                      released this on{' '}
                    </>
                  )}
                  {!featuredRelease.group_name && 'Released on '}
                  {formatDate(featuredRelease.release_date)}
                </p>

                {featuredRelease.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">
                    {featuredRelease.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {featuredRelease.audio_url && (
                    <button
                      type="button"
                      onClick={() => togglePlay(featuredRelease)}
                      className="ip-focus inline-flex items-center gap-2.5 rounded-full bg-[var(--pink)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(255,61,154,.8)] transition hover:bg-white hover:text-[var(--ink)]"
                    >
                      {isPlaying(featuredRelease) ? (
                        <Pause aria-hidden="true" className="h-4 w-4 fill-current" />
                      ) : (
                        <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                      )}
                      {isPlaying(featuredRelease) ? 'Pause' : 'Play preview'}
                    </button>
                  )}

                  {featuredRelease.spotify_url && (
                    <a
                      href={featuredRelease.spotify_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ip-focus inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                    >
                      Spotify
                      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  )}

                  {featuredRelease.youtube_url && (
                    <a
                      href={featuredRelease.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ip-focus inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                    >
                      YouTube
                      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-10 flex items-center gap-3 text-white/70">
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-[var(--pink)]" />
                Loading releases…
              </div>
            )}

            {!loading && error && (
              <div className="mt-10 max-w-md rounded-2xl border border-red-300/40 bg-red-500/10 p-5">
                <p className="font-semibold text-red-200">Releases failed to load</p>
                <p className="mt-1 text-sm text-red-100/80">{error}</p>
              </div>
            )}
          </div>

          {/* Kanan: adegan 3D */}
          <div
            className="relative mx-auto h-[400px] w-full max-w-[580px] sm:h-[520px]"
            style={{ perspective: 1300 }}
          >
            <div
              ref={sceneRef}
              className="ip-3d absolute inset-0 transition-transform duration-200 ease-out"
              style={
                {
                  '--mx': 0,
                  '--my': 0,
                  transform:
                    'rotateY(calc(var(--mx) * 16deg)) rotateX(calc(var(--my) * -12deg))',
                } as CSSProperties
              }
            >
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[42%] h-[75%] w-[75%] rounded-full bg-[var(--pink)] opacity-50 blur-[90px]"
                style={{
                  transform: 'translate3d(-50%,-50%,-200px)',
                  animation: 'ip-pulse 6s ease-in-out infinite',
                }}
              />

              {/* Sleeve + vinyl yang keluar dari sleeve */}
              <div
                className="absolute left-[2%] top-[4%] w-[62%]"
                style={
                  {
                    '--z': '90px',
                    '--ry': '-14deg',
                    '--rx': '5deg',
                    transform: 'translateZ(90px) rotateY(-14deg) rotateX(5deg)',
                    animation: 'ip-bob 7s ease-in-out infinite',
                  } as CSSProperties
                }
              >
                <Vinyl
                  release={featuredRelease}
                  className="absolute left-0 top-0 aspect-square w-full"
                  style={{ transform: 'translateX(48%) translateZ(-40px)' }}
                  spin={isPlaying(featuredRelease) ? '2.6s' : '10s'}
                />

                <div className="relative aspect-square overflow-hidden rounded-xl border-4 border-white bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,.75)]">
                  <Cover release={featuredRelease} eager iconClass="h-20 w-20" />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0"
                  />
                </div>
              </div>

              {/* Cincin neon */}
              <div
                aria-hidden="true"
                className="absolute right-[4%] top-[2%] h-28 w-28 rounded-full border-[10px] border-[var(--cyan)] shadow-[0_0_30px_var(--cyan)] sm:h-36 sm:w-36"
                style={{
                  transform: 'translateZ(150px) rotateX(65deg)',
                  animation: 'ip-spin 14s linear infinite',
                }}
              />

              {/* Bintang */}
              <Star
                className="absolute right-[28%] top-[60%] h-12 w-12 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
                style={{ '--z': '210px', '--r': '0deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
              />
              <Star
                className="absolute left-[0%] top-[60%] h-8 w-8 text-[var(--cyan)]"
                style={{ '--z': '120px', '--r': '20deg', animation: 'ip-float 6.5s ease-in-out -1.5s infinite' } as CSSProperties}
              />

              {/* Equalizer 3D */}
              <div
                aria-hidden="true"
                className="absolute inset-x-[2%] bottom-[2%] flex h-24 items-end gap-[5px] sm:h-32"
                style={{ transform: 'translateZ(60px)' }}
              >
                {Array.from({ length: 26 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-full flex-1 origin-bottom rounded-t-full"
                    style={{
                      background:
                        i % 3 === 0
                          ? 'var(--pink)'
                          : i % 3 === 1
                            ? 'var(--lilac)'
                            : 'var(--cyan)',
                      animation: `ip-wave ${(isPlaying(featuredRelease) ? 0.5 : 1.1) + (i % 7) * 0.12}s ease-in-out ${(i % 9) * -0.17}s infinite`,
                      opacity: 0.9,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          MARQUEE
      ======================================================= */}
      <div
        aria-hidden="true"
        className="relative z-10 -mt-6 rotate-[1.4deg] overflow-hidden border-y-4 border-[var(--ink)] bg-[var(--pink)] py-4 text-white"
      >
        <div
          className="flex w-max items-center gap-8 whitespace-nowrap"
          style={{ animation: 'ip-marquee 42s linear infinite reverse' }}
        >
          {[...marqueeRow, ...marqueeRow].map((word, i) => (
            <span key={i} className="flex items-center gap-8">
              <span
                className={`ip-display text-3xl font-black sm:text-5xl ${i % 2 ? 'ip-outline' : ''
                  }`}
              >
                {word}
              </span>
              <Disc3
                className="h-8 w-8 text-[var(--lemon)]"
                style={{ animation: 'ip-spin 6s linear infinite' }}
              />
            </span>
          ))}
        </div>
      </div>

      {/* =======================================================
          KATALOG
      ======================================================= */}
      <section
        aria-labelledby="all-releases-title"
        className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="all-releases-title"
            className="ip-display text-3xl font-black leading-tight sm:text-5xl"
          >
            Crate digging.
          </h2>

          <div
            role="group"
            aria-label="Filter releases"
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0"
          >
            {filters.map((filter) => {
              const on = activeFilter === filter
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={on}
                  className={`ip-focus inline-flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition ${on
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-white shadow-[4px_4px_0_var(--pink)]'
                      : 'border-[var(--ink)]/15 bg-white text-[var(--ink)]/70 hover:border-[var(--ink)] hover:text-[var(--ink)]'
                    }`}
                >
                  {filter}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${on ? 'bg-white/20' : 'bg-[var(--ink)]/8'
                      }`}
                  >
                    {countFor(filter)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* kosong */}
        {!loading && !error && releases.length === 0 && (
          <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
            <Music aria-hidden="true" className="mx-auto h-10 w-10 text-[var(--pink)]" />
            <p className="mt-4 font-semibold">No releases yet.</p>
            <p className="mt-1 text-sm text-[var(--ink)]/60">
              Original releases will appear here as soon as they drop.
            </p>
          </div>
        )}

        {/* filter kosong */}
        {!loading && !error && releases.length > 0 && filteredReleases.length === 0 && (
          <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
            <Sparkles aria-hidden="true" className="mx-auto h-9 w-9 text-[var(--pink)]" />
            <p className="mt-4 font-semibold">Nothing in this category yet.</p>
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className="ip-focus mt-4 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--pink)]"
            >
              Show all releases
            </button>
          </div>
        )}

        {/* grid */}
        {!loading && !error && filteredReleases.length > 0 && (
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 pb-10 sm:gap-x-7 lg:grid-cols-4">
            {filteredReleases.map((release, index) => {
              const now = isPlaying(release)
              const upcoming = release.status === 'Upcoming'

              return (
                <article
                  key={release.id}
                  className={`min-w-0 hover:z-20 focus-within:z-20 ${index % 2 ? 'sm:translate-y-10' : ''
                    }`}
                >
                  <Tilt max={7}>
                    <div className="ip-sleeve relative">
                      {/* vinyl menyembul dari sleeve */}
                      <div className="ip-slip absolute inset-0 translate-x-[14%]">
                        <Vinyl
                          release={release}
                          className="h-full w-full"
                          spin={now ? '2.6s' : '12s'}
                        />
                      </div>

                      {/* sleeve */}
                      <div
                        className={`relative aspect-square overflow-hidden rounded-xl border-[3px] border-[var(--ink)] bg-white shadow-[6px_6px_0_var(--ink)] ${upcoming ? 'saturate-[.7]' : ''
                          }`}
                      >
                        <Cover release={release} />

                        <span
                          className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold ${TYPE_STYLE[release.type]}`}
                        >
                          {release.type}
                        </span>

                        {upcoming && (
                          <span className="absolute right-2 top-2 rounded-full bg-[var(--lilac)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink)]">
                            Coming soon
                          </span>
                        )}

                        {release.audio_url && (
                          <button
                            type="button"
                            onClick={() => togglePlay(release)}
                            aria-label={`${now ? 'Pause' : 'Play'} ${release.title}`}
                            className="ip-focus absolute bottom-2 left-2 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lemon)] text-[var(--ink)] shadow-lg transition hover:scale-110 hover:bg-white"
                          >
                            {now ? (
                              <Pause aria-hidden="true" className="h-4 w-4 fill-current" />
                            ) : (
                              <Play aria-hidden="true" className="ml-0.5 h-4 w-4 fill-current" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </Tilt>

                  <div className="pt-5">
                    <h3 className="truncate text-base font-bold tracking-[-0.02em]">
                      {release.title}
                    </h3>

                    {release.group_name && (
                      <Link
                        to={`/idol/groups/${release.group_id}`}
                        className="ip-focus mt-0.5 block truncate text-sm font-semibold text-[var(--pink)] hover:underline"
                      >
                        {release.group_name}
                      </Link>
                    )}

                    <p className="mt-1 text-xs text-[var(--ink)]/55">
                      {upcoming ? 'Drops ' : ''}
                      {formatDate(release.release_date)}
                    </p>

                    {(release.spotify_url || release.youtube_url) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {release.spotify_url && (
                          <a
                            href={release.spotify_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Listen to ${release.title} on Spotify`}
                            className="ip-focus rounded-full border-2 border-[var(--ink)]/15 px-3 py-1 text-xs font-bold transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
                          >
                            Spotify
                          </a>
                        )}
                        {release.youtube_url && (
                          <a
                            href={release.youtube_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Watch ${release.title} on YouTube`}
                            className="ip-focus rounded-full border-2 border-[var(--ink)]/15 px-3 py-1 text-xs font-bold transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
                          >
                            YouTube
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* =======================================================
          CTA — tumpukan vinyl 3D
      ======================================================= */}
      <section className="relative isolate overflow-hidden bg-[var(--ink)] py-24 text-white sm:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-0 -z-10 h-96 w-96 rounded-full bg-[var(--pink)]/30 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-[var(--cyan)]/20 blur-[110px]"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <h2 className="ip-display max-w-xl text-4xl font-black leading-[1.05] sm:text-6xl">
              More music. More stories.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Every release comes from a group with its own world. Meet them
              next.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/idol/groups"
                className="ip-focus group inline-flex items-center gap-3 rounded-full bg-[var(--lemon)] px-7 py-4 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Meet the groups
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/idol"
                className="ip-focus group inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-4 text-sm font-semibold transition hover:border-[var(--pink)] hover:text-[var(--pink)]"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                />
                Back to Idol home
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mx-auto h-[260px] w-[260px] sm:h-[320px] sm:w-[320px]"
            style={{ perspective: 900 }}
          >
            <div
              className="ip-3d relative h-full w-full"
              style={{ transform: 'rotateX(62deg) rotateZ(-20deg)' }}
            >
              {[
                { z: 0, bg: 'var(--pink)', spin: '12s' },
                { z: 38, bg: 'var(--cyan)', spin: '8s' },
                { z: 76, bg: 'var(--lemon)', spin: '5s' },
              ].map(({ z, bg, spin }, i) => (
                <div
                  key={i}
                  className="absolute inset-0"
                  style={{ transform: `translateZ(${z}px)` }}
                >
                  <div
                    className="ip-vinyl relative h-full w-full rounded-full"
                    style={{ animation: `ip-spin ${spin} linear infinite` }}
                  >
                    <span
                      className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--ink)]"
                      style={{ background: bg }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          NOW PLAYING — pemutar mengambang
      ======================================================= */}
      {current && (
        <div
          role="region"
          aria-label="Now playing"
          className="fixed bottom-4 left-1/2 z-50 w-[min(94vw,580px)] rounded-[28px] border border-white/15 bg-[var(--ink)]/92 p-3 pr-4 text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,.7)] backdrop-blur-xl"
          style={{ animation: 'ip-slide-up .5s cubic-bezier(.2,.8,.2,1) both' }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative h-14 w-14 shrink-0">
              <Vinyl
                release={current}
                className="h-full w-full"
                spin={playing ? '2.6s' : '12s'}
                style={{ animationPlayState: playing ? 'running' : 'paused' }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{current.title}</p>
              <p className="truncate text-xs text-white/60">
                {current.group_name || '39Production'}
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="w-9 text-[11px] tabular-nums text-white/55">
                  {formatTime(progress)}
                </span>
                <input
                  type="range"
                  aria-label="Seek"
                  className="ip-range ip-focus min-w-0 flex-1"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={Math.min(progress, duration || 1)}
                  onChange={(e) => {
                    const t = Number(e.target.value)
                    if (audioRef.current) audioRef.current.currentTime = t
                    setProgress(t)
                  }}
                />
                <span className="w-9 text-right text-[11px] tabular-nums text-white/55">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => togglePlay(current)}
              aria-label={playing ? 'Pause' : 'Play'}
              className="ip-focus flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--pink)] text-white transition hover:bg-white hover:text-[var(--ink)]"
            >
              {playing ? (
                <Pause aria-hidden="true" className="h-5 w-5 fill-current" />
              ) : (
                <Play aria-hidden="true" className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={closePlayer}
              aria-label="Close player"
              className="ip-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}