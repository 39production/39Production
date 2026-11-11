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
  ExternalLink,
  Film,
  Loader2,
  Play,
  Sparkles,
  X,
} from 'lucide-react'

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

const SITE_URL = 'https://39production.digital'

interface IdolMusicVideo {
  id: number
  group_id: number
  group_name?: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  youtube_url: string
  release_date: string
  status: 'Published' | 'Upcoming'
}

type VideoFilter = 'All' | 'Published' | 'Upcoming'

/* ============================================================
   HELPERS
============================================================ */

async function apiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)
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

function getYear(date: string) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.getFullYear().toString()
}

function getYoutubeId(url: string) {
  if (!url) return ''

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '')
    }

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      if (id) return id

      if (parsed.pathname.includes('/embed/')) {
        return parsed.pathname.split('/embed/')[1]
      }

      if (parsed.pathname.includes('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]
      }
    }
  } catch {
    return ''
  }

  return ''
}

function getYoutubeThumbnail(url: string, quality = 'maxresdefault') {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : ''
}

function toYoutubeEmbed(url: string) {
  if (!url) return ''

  try {
    const parsed = new URL(url)

    if (parsed.pathname.includes('/embed/')) return url
  } catch {
    return url
  }

  const id = getYoutubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : url
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
}

function updateCanonical(url: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }

  canonical.href = url
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
@keyframes ip-pulse{
  0%,100%{opacity:.55;transform:scale(1)}
  50%{opacity:.9;transform:scale(1.08)}
}
@keyframes ip-ping{
  0%{transform:scale(.85);opacity:.75}
  100%{transform:scale(1.9);opacity:0}
}
@keyframes ip-film{
  to{background-position:-680px 0}
}
@keyframes ip-blink{
  0%,100%{opacity:1}
  50%{opacity:.25}
}
@keyframes ip-modal{
  from{opacity:0;transform:perspective(1200px) rotateX(16deg) translateY(30px) scale(.92)}
  to{opacity:1;transform:none}
}
@keyframes ip-fade{
  from{opacity:0}
  to{opacity:1}
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
.ip-tri{
  clip-path:polygon(0 0,100% 50%,0 100%);
}
.ip-strip-holes{
  height:12px;
  background-image:repeating-linear-gradient(90deg,var(--paper) 0 16px,transparent 16px 34px);
  background-size:34px 100%;
  animation:ip-film 14s linear infinite;
  opacity:.9;
}
.ip-strip-frames{
  height:70px;
  background-image:repeating-linear-gradient(90deg,var(--pink) 0 90px,var(--ink-2) 90px 100px,var(--cyan) 100px 190px,var(--ink-2) 190px 200px,var(--lemon) 200px 290px,var(--ink-2) 290px 300px,var(--lilac) 300px 390px,var(--ink-2) 390px 400px);
  background-size:400px 100%;
  animation:ip-film 14s linear infinite;
  opacity:.55;
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

/** Thumbnail dengan fallback bertahap: thumbnail_url → maxres → hq → <video> → gradient */
function Thumb({
  video,
  className = '',
  iconClass = 'h-12 w-12',
  eager = false,
}: {
  video?: IdolMusicVideo | null
  className?: string
  iconClass?: string
  eager?: boolean
}) {
  const sources = useMemo(() => {
    if (!video) return []
    return [
      video.thumbnail_url,
      getYoutubeThumbnail(video.youtube_url, 'maxresdefault'),
      getYoutubeThumbnail(video.youtube_url, 'hqdefault'),
    ].filter(Boolean)
  }, [video])

  const [index, setIndex] = useState(0)

  useEffect(() => setIndex(0), [video?.id])

  if (video && index < sources.length) {
    return (
      <img
        src={sources[index]}
        alt={video.title}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={() => setIndex((i) => i + 1)}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  if (video?.video_url) {
    return (
      <video
        muted
        playsInline
        preload="metadata"
        src={video.video_url}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff3d9a] via-[#b9a6ff] to-[#3de0ff] ${className}`}
    >
      <Play aria-hidden="true" className={`${iconClass} text-white/80`} />
    </div>
  )
}

function Tilt({
  children,
  className = '',
  max = 7,
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

/** Tombol play dengan cincin ping */
function PlayOrb({ size = 'h-16 w-16' }: { size?: string }) {
  return (
    <span aria-hidden="true" className={`relative flex ${size} items-center justify-center`}>
      <span
        className="absolute inset-0 rounded-full bg-[var(--pink)]"
        style={{ animation: 'ip-ping 2.2s ease-out infinite' }}
      />
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[var(--pink)] text-white shadow-[0_10px_30px_-6px_rgba(255,61,154,.9)]">
        <Play className="ml-0.5 h-[38%] w-[38%] fill-current" />
      </span>
    </span>
  )
}

/* ============================================================
   PAGE
============================================================ */

export function IdolMusicVideosPage() {
  const [videos, setVideos] = useState<IdolMusicVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeVideo, setActiveVideo] = useState<IdolMusicVideo | null>(null)
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('All')

  const sceneRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /* ---------- SEO ---------- */
  useEffect(() => {
    const title = 'Music Videos — 39Production Entertainment'

    const description =
      'Watch official music videos and visual releases from 39Production entertainment artists and idol groups.'

    const canonicalUrl = `${SITE_URL}/idol/music-videos`

    document.title = title

    upsertMetaTag('name', 'description', description)
    upsertMetaTag('name', 'robots', 'index, follow')
    upsertMetaTag('property', 'og:type', 'website')
    upsertMetaTag('property', 'og:title', title)
    upsertMetaTag('property', 'og:description', description)
    upsertMetaTag('property', 'og:url', canonicalUrl)
    upsertMetaTag('property', 'og:site_name', '39Production')
    upsertMetaTag('name', 'twitter:card', 'summary_large_image')
    upsertMetaTag('name', 'twitter:title', title)
    upsertMetaTag('name', 'twitter:description', description)

    updateCanonical(canonicalUrl)

    return () => {
      document.title = '39Production'
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
    const loadVideos = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolMusicVideo[]>('/api/idol/music-videos')

        setVideos(data || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Gagal memuat music videos.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadVideos()
  }, [])

  /* ---------- Modal ---------- */
  useEffect(() => {
    if (!activeVideo) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveVideo(null)
    }

    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [activeVideo])

  /* ---------- JSON-LD ---------- */
  useEffect(() => {
    if (!videos.length) return

    document.head
      .querySelector('script[data-39production-music-videos]')
      ?.remove()

    const itemList = videos.map((video, index) => ({
      '@type': 'VideoObject',
      position: index + 1,
      name: video.title,
      description:
        video.description ||
        `Official music video ${video.title} from 39Production.`,
      thumbnailUrl:
        video.thumbnail_url ||
        getYoutubeThumbnail(video.youtube_url) ||
        undefined,
      uploadDate: video.release_date || undefined,
      contentUrl: video.video_url || undefined,
      embedUrl: video.youtube_url ? toYoutubeEmbed(video.youtube_url) : undefined,
    }))

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: '39Production Music Videos',
      description:
        'Official music videos and visual releases from 39Production entertainment.',
      url: `${SITE_URL}/idol/music-videos`,
      itemListElement: itemList,
    }

    const script = document.createElement('script')

    script.type = 'application/ld+json'
    script.dataset['39productionMusicVideos'] = 'true'
    script.textContent = JSON.stringify(jsonLd)

    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [videos])

  /* ---------- Derived ---------- */
  const publishedCount = videos.filter((v) => v.status === 'Published').length
  const upcomingCount = videos.filter((v) => v.status === 'Upcoming').length

  const featured = useMemo(() => {
    if (!videos.length) return null
    return videos.find((v) => v.status === 'Published') || videos[0]
  }, [videos])

  const sideVideos = useMemo(
    () => videos.filter((v) => v.id !== featured?.id).slice(0, 2),
    [videos, featured],
  )

  const filteredVideos = useMemo(() => {
    if (activeFilter === 'All') return videos
    return videos.filter((v) => v.status === activeFilter)
  }, [activeFilter, videos])

  const filters: VideoFilter[] = ['All', 'Published', 'Upcoming']

  const countFor = (f: VideoFilter) =>
    f === 'All' ? videos.length : f === 'Published' ? publishedCount : upcomingCount

  const marqueeRow = useMemo(() => {
    const titles = videos.map((v) => v.title)
    let row = titles.length
      ? titles
      : ['Music videos', 'Visual stories', 'Live stages', 'Behind the scenes']
    while (row.length < 8) row = [...row, ...row]
    return row
  }, [videos])

  /* ---------- Parallax ---------- */
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
    <main className="ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
      <style>{PAGE_CSS}</style>

      {/* =======================================================
          HERO — layar 3D + film strip
      ======================================================= */}
      <section
        aria-labelledby="music-videos-title"
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
        className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(50% 45% at 50% 70%, rgba(255,61,154,.3), transparent 70%), radial-gradient(35% 35% at 90% 10%, rgba(61,224,255,.2), transparent 70%)',
            }}
          />
          <div
            className="ip-beam left-[-4%]"
            style={{ background: 'linear-gradient(to bottom, rgba(255,61,154,.5), transparent 80%)' }}
          />
          <div
            className="ip-beam left-[30%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,228,92,.35), transparent 80%)',
              animationDelay: '-4s',
              animationDuration: '11s',
            }}
          />
          <div
            className="ip-beam left-[58%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(61,224,255,.5), transparent 80%)',
              animationDelay: '-7s',
              animationDuration: '8s',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-28 sm:pt-32 lg:px-8">
          {/* Judul + deskripsi */}
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-3 pr-4 text-sm font-medium backdrop-blur">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full bg-[var(--pink)]"
                  style={{ animation: 'ip-blink 1.4s ease-in-out infinite' }}
                />
                Now screening
              </div>

              <h1
                id="music-videos-title"
                className="ip-display mt-6 text-[clamp(2.6rem,7vw,5.8rem)] font-black leading-[0.98]"
                style={{ perspective: 800 }}
              >
                <span className="ip-line" style={{ animationDelay: '.1s' }}>
                  Music,
                </span>
                <span
                  className="ip-line bg-gradient-to-r from-[var(--pink)] via-[var(--lilac)] to-[var(--cyan)] bg-clip-text text-transparent"
                  style={{ animationDelay: '.25s' }}
                >
                  in motion.
                </span>
              </h1>
            </div>

            <div style={{ animation: 'ip-pop .8s .6s cubic-bezier(.2,.8,.2,1) both' }}>
              <p className="max-w-md text-base leading-7 text-white/75 sm:text-lg">
                Official music videos and visual releases from 39Production.
                Hit play and watch right here.
              </p>

              {!loading && !error && videos.length > 0 && (
                <dl className="mt-6 flex flex-wrap gap-3">
                  {[
                    ['Videos', videos.length, 'bg-white/10'],
                    ['Published', publishedCount, 'bg-white/10'],
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
            </div>
          </div>

          {/* Adegan 3D */}
          <div
            className="relative mx-auto mt-10 h-[300px] w-full sm:h-[440px] lg:h-[500px]"
            style={{ perspective: 1400 }}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center gap-3 text-white/70">
                <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-[var(--pink)]" />
                Loading videos…
              </div>
            )}

            {!loading && error && (
              <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-300/40 bg-red-500/10 p-6 text-center">
                <p className="font-semibold text-red-200">Music videos failed to load</p>
                <p className="mt-1 text-sm text-red-100/80">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div
                ref={sceneRef}
                className="ip-3d absolute inset-0 transition-transform duration-200 ease-out"
                style={
                  {
                    '--mx': 0,
                    '--my': 0,
                    transform:
                      'rotateY(calc(var(--mx) * 14deg)) rotateX(calc(var(--my) * -10deg))',
                  } as CSSProperties
                }
              >
                {/* glow */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-[70%] w-[60%] rounded-full bg-[var(--pink)] opacity-45 blur-[100px]"
                  style={{
                    transform: 'translate3d(-50%,-50%,-220px)',
                    animation: 'ip-pulse 6s ease-in-out infinite',
                  }}
                />

                {/* film strip bergerak */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[-10%] bottom-[6%] flex flex-col gap-1.5"
                  style={{ transform: 'translateZ(-120px) rotate(-5deg)' }}
                >
                  <div className="ip-strip-holes" />
                  <div className="ip-strip-frames" />
                  <div className="ip-strip-holes" />
                </div>

                {/* layar kiri */}
                <div
                  className="absolute left-[-1%] top-[20%] hidden w-[30%] sm:block"
                  style={
                    {
                      '--z': '20px',
                      '--ry': '32deg',
                      '--rx': '0deg',
                      transform: 'translateZ(20px) rotateY(32deg)',
                      animation: 'ip-bob 8s ease-in-out -2s infinite',
                    } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    disabled={!sideVideos[0]}
                    onClick={() => sideVideos[0] && setActiveVideo(sideVideos[0])}
                    aria-label={sideVideos[0] ? `Watch ${sideVideos[0].title}` : 'No video'}
                    className="ip-focus block aspect-video w-full overflow-hidden rounded-2xl border-4 border-[var(--cyan)] bg-[var(--ink-2)] shadow-[0_30px_60px_-20px_rgba(61,224,255,.6)]"
                  >
                    <Thumb video={sideVideos[0]} iconClass="h-10 w-10" />
                  </button>
                </div>

                {/* layar kanan */}
                <div
                  className="absolute right-[-1%] top-[28%] hidden w-[30%] sm:block"
                  style={
                    {
                      '--z': '40px',
                      '--ry': '-32deg',
                      '--rx': '0deg',
                      transform: 'translateZ(40px) rotateY(-32deg)',
                      animation: 'ip-bob 9s ease-in-out -4s infinite',
                    } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    disabled={!sideVideos[1]}
                    onClick={() => sideVideos[1] && setActiveVideo(sideVideos[1])}
                    aria-label={sideVideos[1] ? `Watch ${sideVideos[1].title}` : 'No video'}
                    className="ip-focus block aspect-video w-full overflow-hidden rounded-2xl border-4 border-[var(--lemon)] bg-[var(--ink-2)] shadow-[0_30px_60px_-20px_rgba(255,228,92,.5)]"
                  >
                    <Thumb video={sideVideos[1]} iconClass="h-10 w-10" />
                  </button>
                </div>

                {/* layar utama */}
                <div
                  className="absolute left-[10%] top-[4%] w-[80%] sm:left-[24%] sm:w-[52%]"
                  style={
                    {
                      '--z': '110px',
                      '--ry': '0deg',
                      '--rx': '3deg',
                      transform: 'translateZ(110px) rotateX(3deg)',
                      animation: 'ip-bob 7s ease-in-out infinite',
                    } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    disabled={!featured}
                    onClick={() => featured && setActiveVideo(featured)}
                    aria-label={featured ? `Watch ${featured.title}` : 'No video'}
                    className="ip-focus group relative block aspect-video w-full overflow-hidden rounded-[22px] border-4 border-white bg-[var(--ink-2)] text-left shadow-[0_50px_90px_-20px_rgba(0,0,0,.8),0_0_60px_rgba(255,61,154,.45)]"
                  >
                    <Thumb video={featured} eager iconClass="h-16 w-16" />

                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-transparent to-[var(--ink)]/20"
                    />

                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--lemon)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
                      <Sparkles aria-hidden="true" className="h-3 w-3" />
                      Featured
                    </span>

                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
                      <PlayOrb size="h-14 w-14 sm:h-20 sm:w-20" />
                    </span>

                    {featured && (
                      <span className="absolute inset-x-0 bottom-0 block p-3 sm:p-5">
                        <span className="ip-display block truncate text-sm font-bold text-white sm:text-xl">
                          {featured.title}
                        </span>
                        {featured.group_name && (
                          <span className="mt-0.5 block truncate text-xs text-white/70">
                            {featured.group_name}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                </div>

                {/* segitiga play melayang */}
                <span
                  aria-hidden="true"
                  className="ip-tri absolute left-[6%] top-[4%] h-10 w-9 bg-[var(--pink)] sm:h-14 sm:w-12"
                  style={{ '--z': '190px', '--r': '-10deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
                />
                <span
                  aria-hidden="true"
                  className="ip-tri absolute bottom-[14%] right-[8%] h-8 w-7 bg-[var(--cyan)] sm:h-12 sm:w-10"
                  style={{ '--z': '170px', '--r': '12deg', animation: 'ip-float 6.5s ease-in-out -2s infinite' } as CSSProperties}
                />
                <Star
                  className="absolute right-[18%] top-[2%] h-10 w-10 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
                  style={{ '--z': '220px', '--r': '0deg', animation: 'ip-float 4.6s ease-in-out -1s infinite' } as CSSProperties}
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-[6%] left-[6%] h-20 w-20 rounded-full border-[8px] border-[var(--cyan)] shadow-[0_0_26px_var(--cyan)] sm:h-28 sm:w-28"
                  style={{
                    transform: 'translateZ(150px) rotateX(65deg)',
                    animation: 'ip-spin 14s linear infinite',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =======================================================
          MARQUEE
      ======================================================= */}
      <div
        aria-hidden="true"
        className="relative z-10 -mt-6 -rotate-[1.4deg] overflow-hidden border-y-4 border-[var(--ink)] bg-[var(--cyan)] py-4 text-[var(--ink)]"
      >
        <div
          className="flex w-max items-center gap-8 whitespace-nowrap"
          style={{ animation: 'ip-marquee 40s linear infinite' }}
        >
          {[...marqueeRow, ...marqueeRow].map((word, i) => (
            <span key={i} className="flex items-center gap-8">
              <span
                className={`ip-display text-3xl font-black sm:text-5xl ${i % 2 ? 'ip-outline' : ''
                  }`}
              >
                {word}
              </span>
              <Film aria-hidden="true" className="h-8 w-8 text-[var(--pink)]" />
            </span>
          ))}
        </div>
      </div>

      {/* =======================================================
          KATALOG VIDEO
      ======================================================= */}
      <section
        aria-labelledby="video-catalog-title"
        className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="video-catalog-title"
            className="ip-display text-3xl font-black leading-tight sm:text-5xl"
          >
            Pick a screen.
          </h2>

          <div
            role="group"
            aria-label="Filter videos"
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
                    className={`rounded-full px-2 py-0.5 text-xs ${on ? 'bg-white/20' : 'bg-[var(--ink)]/10'
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
        {!loading && !error && videos.length === 0 && (
          <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
            <Play aria-hidden="true" className="mx-auto h-10 w-10 text-[var(--pink)]" />
            <p className="mt-4 font-semibold">No music videos yet.</p>
            <p className="mt-1 text-sm text-[var(--ink)]/60">
              Official visual releases will appear here as soon as they premiere.
            </p>
          </div>
        )}

        {/* filter kosong */}
        {!loading && !error && videos.length > 0 && filteredVideos.length === 0 && (
          <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
            <Sparkles aria-hidden="true" className="mx-auto h-9 w-9 text-[var(--pink)]" />
            <p className="mt-4 font-semibold">Nothing in this category yet.</p>
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className="ip-focus mt-4 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--pink)]"
            >
              Show all videos
            </button>
          </div>
        )}

        {/* grid */}
        {!loading && !error && filteredVideos.length > 0 && (
          <div className="mt-14 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video, index) => {
              const big = index === 0
              const upcoming = video.status === 'Upcoming'

              return (
                <article
                  key={video.id}
                  className={`min-w-0 ${big ? 'sm:col-span-2' : ''}`}
                >
                  <Tilt max={big ? 4 : 7}>
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      aria-label={`Watch ${video.title}`}
                      className="ip-focus group relative block aspect-video w-full overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--ink)] text-left shadow-[7px_7px_0_var(--ink)] transition-shadow hover:shadow-[10px_10px_0_var(--pink)]"
                    >
                      <span className={upcoming ? 'saturate-[.6]' : ''}>
                        <span className="block aspect-video w-full">
                          <Thumb video={video} />
                        </span>
                      </span>

                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/60 via-transparent to-transparent transition-opacity group-hover:opacity-70"
                      />

                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${upcoming
                          ? 'bg-[var(--lilac)] text-[var(--ink)]'
                          : 'bg-[var(--cyan)] text-[var(--ink)]'
                          }`}
                      >
                        {upcoming ? 'Coming soon' : 'Published'}
                      </span>

                      {getYear(video.release_date) && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                          {getYear(video.release_date)}
                        </span>
                      )}

                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
                        <PlayOrb size={big ? 'h-20 w-20' : 'h-14 w-14'} />
                      </span>
                    </button>
                  </Tilt>

                  <div className="pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3
                          className={`truncate font-bold tracking-[-0.02em] ${big ? 'ip-display text-2xl' : 'text-lg'
                            }`}
                        >
                          {video.title}
                        </h3>

                        {video.group_name && (
                          <Link
                            to={`/idol/groups/${video.group_id}`}
                            className="ip-focus mt-0.5 inline-block max-w-full truncate text-sm font-semibold text-[var(--pink)] hover:underline"
                          >
                            {video.group_name}
                          </Link>
                        )}
                      </div>

                      <span className="shrink-0 pt-1 text-xs text-[var(--ink)]/55">
                        {upcoming ? 'Premieres ' : ''}
                        {formatDate(video.release_date)}
                      </span>
                    </div>

                    {video.description && (
                      <p
                        className={`mt-3 line-clamp-2 text-sm leading-6 text-[var(--ink)]/65 ${big ? 'max-w-2xl' : ''
                          }`}
                      >
                        {video.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveVideo(video)}
                        className="ip-focus inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--pink)]"
                      >
                        <Play aria-hidden="true" className="h-3 w-3 fill-current" />
                        Watch video
                      </button>

                      {video.youtube_url && (
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${video.title} on YouTube`}
                          className="ip-focus inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--ink)]/15 px-4 py-2 text-xs font-bold transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
                        >
                          YouTube
                          <ExternalLink aria-hidden="true" className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* =======================================================
          CTA — roll film 3D
      ======================================================= */}
      <section className="relative isolate overflow-hidden bg-[var(--ink)] py-24 text-white sm:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-0 -z-10 h-96 w-96 rounded-full bg-[var(--pink)]/30 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-[var(--cyan)]/20 blur-[110px]"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[auto_1fr] lg:px-8">
          {/* Roll film */}
          <div
            aria-hidden="true"
            className="mx-auto h-[260px] w-[260px] sm:h-[320px] sm:w-[320px]"
            style={{ perspective: 1000 }}
          >
            <div
              className="ip-3d relative h-full w-full"
              style={{ transform: 'rotateY(-32deg) rotateX(14deg)' }}
            >
              {[
                { z: -30, c: 'var(--ink-2)' },
                { z: 0, c: 'var(--pink)' },
                { z: 30, c: 'var(--ink-2)' },
              ].map(({ z, c }, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-[6px] border-white/80"
                  style={{
                    background: c,
                    transform: `translateZ(${z}px)`,
                    animation: 'ip-spin 12s linear infinite',
                  }}
                >
                  {i === 1 &&
                    Array.from({ length: 6 }).map((_, h) => (
                      <span
                        key={h}
                        className="absolute left-1/2 top-1/2 h-[24%] w-[24%] rounded-full bg-[var(--ink)]"
                        style={{
                          transform: `translate(-50%,-50%) rotate(${h * 60}deg) translateY(-92%)`,
                        }}
                      />
                    ))}
                  {i === 1 && (
                    <span className="absolute left-1/2 top-1/2 h-[16%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[var(--lemon)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="ip-display max-w-xl text-4xl font-black leading-[1.05] sm:text-6xl">
              Songs have a sound. Stories have a look.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Watch the videos, then hear the full releases behind them.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/idol/releases"
                className="ip-focus group inline-flex items-center gap-3 rounded-full bg-[var(--lemon)] px-7 py-4 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Explore music releases
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
        </div>
      </section>

      {/* =======================================================
          MODAL VIDEO
      ======================================================= */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[var(--ink)]/95 p-4 backdrop-blur-md sm:p-6"
          style={{ animation: 'ip-fade .3s ease both' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveVideo(null)
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none fixed left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--pink)]/25 blur-[120px]"
          />

          <div
            className="relative my-auto w-full max-w-5xl text-white"
            style={{ animation: 'ip-modal .6s cubic-bezier(.2,.8,.2,1) both' }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[var(--pink)]"
                    style={{ animation: 'ip-blink 1.4s ease-in-out infinite' }}
                  />
                  Now playing
                </span>

                <h2 className="ip-display mt-3 truncate text-xl font-black sm:text-3xl">
                  {activeVideo.title}
                </h2>

                {activeVideo.group_name && (
                  <p className="mt-1 truncate text-sm text-white/60">
                    {activeVideo.group_name}
                  </p>
                )}
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                className="ip-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 transition hover:bg-[var(--pink)]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-3xl border-4 border-[var(--pink)] bg-black shadow-[0_0_80px_rgba(255,61,154,.45)]">
              {activeVideo.youtube_url ? (
                <iframe
                  src={toYoutubeEmbed(activeVideo.youtube_url)}
                  title={activeVideo.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeVideo.video_url ? (
                <video
                  controls
                  autoPlay
                  poster={activeVideo.thumbnail_url || undefined}
                  src={activeVideo.video_url}
                  className="h-full w-full object-contain"
                />
              ) : activeVideo.thumbnail_url ? (
                <img
                  src={activeVideo.thumbnail_url}
                  alt={activeVideo.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Play aria-hidden="true" className="h-12 w-12 text-white/25" />
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/65">
                {activeVideo.status === 'Upcoming' ? 'Premieres' : 'Released'}{' '}
                <span className="font-semibold text-white">
                  {formatDate(activeVideo.release_date)}
                </span>
              </p>

              <div className="flex flex-wrap gap-2">
                {activeVideo.group_id && (
                  <Link
                    to={`/idol/groups/${activeVideo.group_id}`}
                    onClick={() => setActiveVideo(null)}
                    className="ip-focus inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--pink)] hover:text-white"
                  >
                    View group
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                )}

                {activeVideo.youtube_url && (
                  <a
                    href={activeVideo.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ip-focus inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                  >
                    Open on YouTube
                    <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}