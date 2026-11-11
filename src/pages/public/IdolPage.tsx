import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Loader2,
  Music,
  Play,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL = 'https://39production-api.39production.workers.dev'
const SITE_URL = 'https://39production.github.io/39Production'

interface IdolGroup {
  id: number
  name: string
  description: string
  image_url: string
  status: 'Active' | 'Hiatus'
  member_count: number
  release_count: number
  music_video_count: number
  upcoming_activity_count: number
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
    throw new Error(
      `API mengembalikan response yang tidak valid (${response.status}).`,
    )
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Gagal mengambil data.')
  }

  return result.data
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
   STYLES (keyframes, 3D, fonts) — scoped dengan prefix ip-
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
@keyframes ip-spin-rev{to{transform:rotate(-360deg)}}
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
@keyframes ip-cube{
  from{transform:rotateX(-20deg) rotateY(0deg)}
  to{transform:rotateX(340deg) rotateY(360deg)}
}
@keyframes ip-pulse{
  0%,100%{opacity:.55;transform:scale(1)}
  50%{opacity:.9;transform:scale(1.08)}
}
@keyframes ip-wave{
  0%,100%{transform:scaleY(.25)}
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
.ip-band{
  clip-path:polygon(0 5%,100% 0,100% 95%,0 100%);
}
.ip-vinyl{
  background:
    radial-gradient(circle,var(--pink) 0 13%,#15072f 13.5% 15%,transparent 15.5%),
    repeating-radial-gradient(circle,#0b0420 0 2px,#1b0d3d 2px 4px),
    conic-gradient(from 20deg,transparent 0 20%,rgba(255,255,255,.28) 25%,transparent 32% 70%,rgba(61,224,255,.35) 76%,transparent 84%);
  background-blend-mode:normal,normal,screen;
}
.ip-face{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  border:2px solid rgba(255,255,255,.55);
  backdrop-filter:blur(2px);
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

function GroupArt({
  group,
  className = '',
  iconClass = 'h-12 w-12',
  eager = false,
}: {
  group?: IdolGroup
  className?: string
  iconClass?: string
  eager?: boolean
}) {
  if (group?.image_url) {
    return (
      <img
        src={group.image_url}
        alt={`${group.name} — 39Production Idol`}
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

/** Efek tilt 3D mengikuti pointer */
function Tilt({
  children,
  className = '',
  max = 9,
  style,
}: {
  children: ReactNode
  className?: string
  max?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`
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
      style={style}
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
      const duration = 1400

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

/** Bar equalizer kecil — penanda "musik" */
function Equalizer({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-4 items-end gap-[3px] ${className}`}
    >
      {[0, 0.25, 0.1, 0.4].map((delay, i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-bottom rounded-full bg-current"
          style={{
            animation: `ip-wave ${0.9 + i * 0.15}s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </span>
  )
}

function Star({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={className}
      style={style}
    >
      <path
        d="M50 0 C54 30 70 46 100 50 C70 54 54 70 50 100 C46 70 30 54 0 50 C30 46 46 30 50 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ============================================================
   PAGE
============================================================ */

export function IdolPage() {
  const [groups, setGroups] = useState<IdolGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const heroSceneRef = useRef<HTMLDivElement>(null)

  /* ---------- SEO + data ---------- */
  useEffect(() => {
    const pageTitle = '39Production Idol — Music, Artists & Entertainment'

    const pageDescription =
      'Discover 39Production Idol, an entertainment platform featuring idol groups, artists, original music releases, music videos, performances, and visual stories.'

    const canonicalUrl = `${SITE_URL}/idol`

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

    const loadGroups = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolGroup[]>('/api/idol/groups')

        setGroups(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data idol.')
      } finally {
        setLoading(false)
      }
    }

    void loadGroups()

    return () => {
      document.getElementById('idol-page-structured-data')?.remove()
    }
  }, [])

  /* ---------- Font (Unbounded + Figtree) ---------- */
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

  /* ---------- Structured data ---------- */
  useEffect(() => {
    const pageUrl = `${SITE_URL}/idol`

    const itemList = groups.slice(0, 6).map((group, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: group.name,
      url: `${SITE_URL}/idol/groups/${group.id}`,
    }))

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#collection`,
      url: pageUrl,
      name: '39Production Idol',
      description:
        'Discover idol groups, artists, music releases, music videos, and entertainment projects from 39Production.',
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
      'idol-page-structured-data',
    ) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.id = 'idol-page-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify(structuredData)

    return () => {
      script?.remove()
    }
  }, [groups])

  /* ---------- Derived ---------- */
  const stats = useMemo(
    () =>
      groups.reduce(
        (acc, group) => {
          acc.members += group.member_count || 0
          acc.releases += group.release_count || 0
          acc.videos += group.music_video_count || 0
          acc.activities += group.upcoming_activity_count || 0
          return acc
        },
        { members: 0, releases: 0, videos: 0, activities: 0 },
      ),
    [groups],
  )

  const featuredGroup = groups[0]
  const showcase = useMemo(() => groups.slice(0, 8), [groups])

  /* ---------- Hero parallax ---------- */
  const onHeroMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = heroSceneRef.current
    if (!el || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    el.style.setProperty('--mx', String((e.clientX - r.left) / r.width - 0.5))
    el.style.setProperty('--my', String((e.clientY - r.top) / r.height - 0.5))
  }

  const onHeroLeave = () => {
    heroSceneRef.current?.style.setProperty('--mx', '0')
    heroSceneRef.current?.style.setProperty('--my', '0')
  }

  /* ---------- 3D Ring state ---------- */
  const ringCount = Math.max(6, showcase.length)
  const ringItems = useMemo(
    () =>
      showcase.length
        ? Array.from(
          { length: ringCount },
          (_, i) => showcase[i % showcase.length],
        )
        : [],
    [showcase, ringCount],
  )

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const n = ringItems.length
  const activeIdx = n ? ((active % n) + n) % n : 0
  const activeGroup = n ? ringItems[activeIdx] : undefined

  const CARD_W = 240
  const angle = n ? 360 / n : 0
  const radius = n ? Math.round(CARD_W / 2 / Math.tan(Math.PI / n)) + 70 : 0

  const goTo = useCallback(
    (groupId: number) => {
      if (!n) return
      const target = ringItems.findIndex((g) => g.id === groupId)
      if (target < 0) return
      let delta = target - activeIdx
      if (delta > n / 2) delta -= n
      if (delta < -n / 2) delta += n
      setActive((a) => a + delta)
    },
    [n, ringItems, activeIdx],
  )

  useEffect(() => {
    if (!n || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setInterval(() => setActive((a) => a + 1), 5200)
    return () => window.clearInterval(timer)
  }, [n, paused])

  /* ---------- Marquee words ---------- */
  const marqueeWords = useMemo(() => {
    const names = groups.map((g) => g.name)
    return names.length
      ? names
      : ['New releases', 'Live stages', 'Music videos', 'Fresh debuts']
  }, [groups])

  const marqueeRow = useMemo(() => {
    // pastikan cukup panjang agar loop mulus
    let row = [...marqueeWords]
    while (row.length < 8) row = [...row, ...marqueeWords]
    return row
  }, [marqueeWords])

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <main className="ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
      <style>{PAGE_CSS}</style>

      {/* =======================================================
          HERO — panggung gelap + beam lampu + adegan 3D
      ======================================================= */}
      <section
        aria-labelledby="idol-page-title"
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
        className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
      >
        {/* Lampu panggung */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 70% 40%, rgba(255,61,154,.28), transparent 70%), radial-gradient(45% 45% at 15% 85%, rgba(61,224,255,.18), transparent 70%)',
            }}
          />
          <div
            className="ip-beam left-[2%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,61,154,.6), transparent 80%)',
            }}
          />
          <div
            className="ip-beam left-[28%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(61,224,255,.5), transparent 80%)',
              animationDelay: '-3s',
              animationDuration: '11s',
            }}
          />
          <div
            className="ip-beam left-[54%]"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,228,92,.4), transparent 80%)',
              animationDelay: '-6s',
              animationDuration: '8s',
            }}
          />
          {/* lantai panggung */}
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              background:
                'linear-gradient(to top, rgba(255,61,154,.22), transparent)',
            }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100svh-0px)] max-w-7xl items-center gap-6 px-6 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-24">
          {/* Copy */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-3 pr-4 text-sm font-medium backdrop-blur">
              <Equalizer className="text-[var(--pink)]" />
              39Production Idol is live
            </div>

            <h1
              id="idol-page-title"
              className="ip-display mt-7 text-[clamp(2.4rem,6.4vw,5.6rem)] font-black leading-[0.98]"
              style={{ perspective: 800 }}
            >
              <span className="ip-line" style={{ animationDelay: '.1s' }}>
                Lights up.
              </span>
              <span
                className="ip-line ip-outline text-[var(--lemon)]"
                style={{ animationDelay: '.25s' }}
              >
                Volume up.
              </span>
              <span
                className="ip-line bg-gradient-to-r from-[var(--pink)] via-[var(--lilac)] to-[var(--cyan)] bg-clip-text text-transparent"
                style={{ animationDelay: '.4s' }}
              >
                Idols on.
              </span>
            </h1>

            <p
              className="mt-8 max-w-md text-base leading-7 text-white/75 sm:text-lg"
              style={{ animation: 'ip-pop .8s .7s cubic-bezier(.2,.8,.2,1) both' }}
            >
              Meet the groups, play their originals, and catch every stage and
              music video from 39Production.
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-4"
              style={{ animation: 'ip-pop .8s .85s cubic-bezier(.2,.8,.2,1) both' }}
            >
              <Link
                to="/idol/groups"
                className="ip-focus group inline-flex items-center gap-3 rounded-full bg-[var(--pink)] px-7 py-4 text-sm font-bold text-white shadow-[0_10px_40px_-8px_rgba(255,61,154,.8)] transition hover:-translate-y-0.5 hover:bg-white hover:text-[var(--ink)]"
              >
                Meet the groups
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/idol/music-videos"
                className="ip-focus inline-flex items-center gap-3 rounded-full border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[var(--ink)]">
                  <Play aria-hidden="true" className="h-3 w-3 translate-x-[1px] fill-current" />
                </span>
                Watch music videos
              </Link>
            </div>
          </div>

          {/* Adegan 3D */}
          <div
            className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[540px]"
            style={{ perspective: 1300 }}
          >
            <div
              ref={heroSceneRef}
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
              {/* glow belakang */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--pink)] opacity-50 blur-[90px]"
                style={{ transform: 'translate3d(-50%,-50%,-200px)', animation: 'ip-pulse 6s ease-in-out infinite' }}
              />

              {/* piringan hitam, rebah di lantai */}
              <div
                aria-hidden="true"
                className="ip-3d absolute bottom-[2%] left-1/2 h-[330px] w-[330px] sm:h-[430px] sm:w-[430px]"
                style={{ transform: 'translateX(-50%) translateZ(-60px) rotateX(64deg)' }}
              >
                <div
                  className="ip-vinyl h-full w-full rounded-full shadow-[0_0_80px_rgba(255,61,154,.55)]"
                  style={{ animation: 'ip-spin 9s linear infinite' }}
                />
              </div>

              {/* cincin neon */}
              <div
                aria-hidden="true"
                className="absolute left-[4%] top-[6%] h-28 w-28 rounded-full border-[10px] border-[var(--cyan)] shadow-[0_0_30px_var(--cyan)] sm:h-36 sm:w-36"
                style={{
                  '--z': '140px',
                  transform: 'translateZ(140px) rotateX(65deg)',
                  animation: 'ip-spin 14s linear infinite',
                } as CSSProperties}
              />

              {/* kartu fitur */}
              <div
                className="absolute left-[14%] top-[6%] w-[62%]"
                style={{
                  '--z': '90px',
                  '--ry': '-12deg',
                  '--rx': '4deg',
                  transform: 'translateZ(90px) rotateY(-12deg) rotateX(4deg)',
                  animation: 'ip-bob 7s ease-in-out infinite',
                } as CSSProperties}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] border-4 border-white bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,.7)]">
                  <GroupArt group={featuredGroup} eager iconClass="h-20 w-20" />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-transparent to-transparent"
                  />

                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--lemon)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
                    <Sparkles aria-hidden="true" className="h-3 w-3" />
                    Featured
                  </span>

                  {featuredGroup && (
                    <Link
                      to={`/idol/groups/${featuredGroup.id}`}
                      aria-label={`View ${featuredGroup.name}`}
                      className="ip-focus absolute inset-x-0 bottom-0 block p-4 sm:p-5"
                    >
                      <p className="ip-display text-xl font-bold leading-tight text-white sm:text-2xl">
                        {featuredGroup.name}
                      </p>
                      <p className="mt-1 text-xs text-white/75">
                        {featuredGroup.member_count || 0} members ·{' '}
                        {featuredGroup.release_count || 0} releases
                      </p>
                    </Link>
                  )}
                </div>
              </div>

              {/* kartu kedua (mini) */}
              <div
                aria-hidden="true"
                className="absolute bottom-[10%] right-[2%] w-[34%]"
                style={{
                  '--z': '170px',
                  '--ry': '16deg',
                  '--rx': '-4deg',
                  transform: 'translateZ(170px) rotateY(16deg)',
                  animation: 'ip-bob 8s ease-in-out -2s infinite',
                } as CSSProperties}
              >
                <div className="aspect-square overflow-hidden rounded-3xl border-4 border-[var(--pink)] bg-[var(--ink-2)] shadow-[0_30px_60px_-20px_rgba(255,61,154,.7)]">
                  <GroupArt group={groups[1] || featuredGroup} iconClass="h-10 w-10" />
                </div>
              </div>

              {/* bintang melayang */}
              <Star
                className="absolute right-[10%] top-[4%] h-14 w-14 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
                style={{ '--z': '210px', '--r': '0deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
              />
              <Star
                className="absolute bottom-[30%] left-[0%] h-9 w-9 text-[var(--cyan)]"
                style={{ '--z': '120px', '--r': '20deg', animation: 'ip-float 6.5s ease-in-out -1.5s infinite' } as CSSProperties}
              />
              <Star
                className="absolute right-[34%] top-[44%] h-6 w-6 text-white"
                style={{ '--z': '230px', '--r': '0deg', animation: 'ip-float 4.2s ease-in-out -2s infinite' } as CSSProperties}
              />

              {/* badge putar */}
              <div
                aria-hidden="true"
                className="absolute bottom-[4%] left-[2%] flex h-28 w-28 items-center justify-center rounded-full bg-[var(--lemon)] text-[var(--ink)] sm:h-32 sm:w-32"
                style={{ transform: 'translateZ(200px)' }}
              >
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 h-full w-full"
                  style={{ animation: 'ip-spin 16s linear infinite' }}
                >
                  <defs>
                    <path id="ip-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                  </defs>
                  <text fontSize="11.5" fontWeight="800" fill="currentColor" letterSpacing="2.2">
                    <textPath href="#ip-circle">now on stage • new releases • </textPath>
                  </text>
                </svg>
                <Disc3 className="h-7 w-7" style={{ animation: 'ip-spin 6s linear infinite' }} />
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
        className="relative z-10 -mt-6 -rotate-[1.6deg] overflow-hidden border-y-4 border-[var(--ink)] bg-[var(--lemon)] py-4 text-[var(--ink)]"
      >
        <div
          className="flex w-max items-center gap-8 whitespace-nowrap"
          style={{ animation: 'ip-marquee 38s linear infinite' }}
        >
          {[...marqueeRow, ...marqueeRow].map((word, i) => (
            <span key={i} className="flex items-center gap-8">
              <span
                className={`ip-display text-3xl font-black sm:text-5xl ${i % 2 ? 'ip-outline' : ''
                  }`}
              >
                {word}
              </span>
              <Star className="h-7 w-7 text-[var(--pink)]" />
            </span>
          ))}
        </div>
      </div>

      {/* =======================================================
          SHOWCASE — ring 3D
      ======================================================= */}
      <section
        aria-labelledby="group-roster-title"
        className="relative isolate overflow-hidden bg-gradient-to-b from-[var(--ink)] via-[var(--ink-2)] to-[var(--ink)] pb-24 pt-28 text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--pink)]/25 blur-[120px]"
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2
              id="group-roster-title"
              className="ip-display text-3xl font-black leading-tight sm:text-5xl"
            >
              Pick a group and step into their world.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/70">
              Every group has its own sound, colors, and stage. Spin the ring
              to find yours.
            </p>
          </div>
        </div>

        {loading && (
          <div className="mx-auto mt-16 flex max-w-7xl items-center justify-center gap-3 px-6 py-32 text-white/70">
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-[var(--pink)]" />
            Loading groups…
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-red-300/40 bg-red-500/10 p-8 text-center">
            <p className="font-semibold text-red-200">Groups failed to load</p>
            <p className="mt-2 text-sm text-red-100/80">{error}</p>
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/15 bg-white/5 p-10 text-center">
            <Music aria-hidden="true" className="mx-auto h-10 w-10 text-[var(--pink)]" />
            <p className="mt-5 font-semibold">No groups yet.</p>
            <p className="mt-2 text-sm text-white/65">
              New idol projects are on the way. Check back soon.
            </p>
          </div>
        )}

        {!loading && !error && n > 0 && activeGroup && (
          <div
            className="mx-auto mt-10 max-w-7xl px-6 lg:px-8"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* Ring */}
            <div
              className="relative mx-auto h-[400px] sm:h-[470px]"
              style={{ perspective: 1500 }}
              role="group"
              aria-label="Idol group carousel"
            >
              <div
                className="ip-3d absolute left-1/2 top-1/2 origin-center scale-[.66] sm:scale-100"
                style={{
                  width: CARD_W,
                  height: 320,
                  marginLeft: -CARD_W / 2,
                  marginTop: -160,
                  transform: `translateZ(${-radius}px) rotateX(-6deg) rotateY(${-active * angle}deg)`,
                  transition: 'transform 1.1s cubic-bezier(.22,.9,.24,1)',
                }}
              >
                {ringItems.map((group, i) => {
                  const diff = Math.min(Math.abs(i - activeIdx), n - Math.abs(i - activeIdx))
                  const isActive = diff === 0

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActive((a) => a + (i - activeIdx))}
                      aria-label={`Show ${group.name}`}
                      aria-current={isActive}
                      className="ip-focus absolute inset-0 overflow-hidden rounded-[26px] border-[3px] bg-[var(--ink-2)] text-left"
                      style={{
                        transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                        borderColor: isActive ? 'var(--pink)' : 'rgba(255,255,255,.35)',
                        opacity: isActive ? 1 : diff === 1 ? 0.85 : 0.45,
                        boxShadow: isActive
                          ? '0 0 60px rgba(255,61,154,.6)'
                          : '0 20px 40px -20px rgba(0,0,0,.6)',
                        transition: 'opacity .8s, box-shadow .8s, border-color .8s',
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <GroupArt group={group} iconClass="h-14 w-14" />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-transparent to-transparent"
                      />
                      <span className="ip-display absolute inset-x-4 bottom-4 text-lg font-bold leading-tight text-white">
                        {group.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* kontrol */}
              <button
                type="button"
                aria-label="Previous group"
                onClick={() => setActive((a) => a - 1)}
                className="ip-focus absolute left-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition hover:bg-white hover:text-[var(--ink)] sm:left-4"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next group"
                onClick={() => setActive((a) => a + 1)}
                className="ip-focus absolute right-0 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur transition hover:bg-white hover:text-[var(--ink)] sm:right-4"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {/* Panel detail */}
            <div
              key={activeGroup.id + '-' + active}
              className="mx-auto mt-6 grid max-w-4xl gap-8 rounded-[32px] border border-white/15 bg-white/[0.07] p-7 backdrop-blur-md sm:grid-cols-[1fr_auto] sm:items-center sm:p-9"
              style={{ animation: 'ip-pop .6s cubic-bezier(.2,.8,.2,1) both' }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="ip-display text-2xl font-black sm:text-3xl">
                    {activeGroup.name}
                  </h3>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <span
                      className={`h-2 w-2 rounded-full ${activeGroup.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                    />
                    {activeGroup.status}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-white/70">
                  {activeGroup.description || 'An original idol project from 39Production.'}
                </p>

                <dl className="mt-6 flex flex-wrap gap-3 text-sm">
                  {[
                    ['Members', activeGroup.member_count],
                    ['Releases', activeGroup.release_count],
                    ['Music videos', activeGroup.music_video_count],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-white/10 px-4 py-2.5"
                    >
                      <dt className="text-xs text-white/55">{label}</dt>
                      <dd className="ip-display text-lg font-bold">{value || 0}</dd>
                    </div>
                  ))}
                  {activeGroup.upcoming_activity_count > 0 && (
                    <div className="rounded-2xl bg-[var(--lemon)] px-4 py-2.5 text-[var(--ink)]">
                      <dt className="flex items-center gap-1.5 text-xs font-semibold">
                        <CalendarDays aria-hidden="true" className="h-3 w-3" />
                        Upcoming
                      </dt>
                      <dd className="ip-display text-lg font-bold">
                        {activeGroup.upcoming_activity_count}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <Link
                to={`/idol/groups/${activeGroup.id}`}
                className="ip-focus inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--pink)] hover:text-white"
              >
                View {activeGroup.name}
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            {/* Thumbnail selector */}
            {showcase.length > 1 && (
              <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
                {showcase.map((group) => {
                  const on = group.id === activeGroup.id
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => goTo(group.id)}
                      aria-label={`Show ${group.name}`}
                      aria-pressed={on}
                      className={`ip-focus h-14 w-14 overflow-hidden rounded-2xl border-2 transition ${on
                          ? 'scale-110 border-[var(--pink)] shadow-[0_0_24px_rgba(255,61,154,.7)]'
                          : 'border-white/25 opacity-70 hover:opacity-100'
                        }`}
                    >
                      <GroupArt group={group} iconClass="h-6 w-6" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* =======================================================
          EXPLORE — bento miring dengan tilt 3D
      ======================================================= */}
      <section
        aria-label="39Production Idol categories"
        className="relative bg-[var(--paper)] py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="ip-display max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
            Everything in one place.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--ink)]/65">
            Browse the roster, follow the members, replay the releases, and see
            what is happening next.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {/* Groups */}
            <Tilt className="lg:col-span-3">
              <Link
                to="/idol/groups"
                className="ip-focus group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--pink)] p-8 text-white"
              >
                <Users aria-hidden="true" className="h-9 w-9" />
                <div className="relative z-10">
                  <h3 className="ip-display text-3xl font-black">Groups</h3>
                  <p className="mt-2 max-w-[16rem] text-sm leading-6 text-white/85">
                    Meet every group on the roster and see who is active now.
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="absolute -right-10 -top-10 h-56 w-56 rounded-full border-[28px] border-white/25 transition duration-700 group-hover:scale-110 group-hover:rotate-45"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-12 right-10 h-40 w-40 rounded-full bg-[var(--lemon)] transition duration-700 group-hover:-translate-y-4"
                />
              </Link>
            </Tilt>

            {/* Members */}
            <Tilt className="lg:col-span-3">
              <Link
                to="/idol/members"
                className="ip-focus group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--cyan)] p-8 text-[var(--ink)]"
              >
                <Sparkles aria-hidden="true" className="h-9 w-9" />
                <div className="relative z-10">
                  <h3 className="ip-display text-3xl font-black">Members</h3>
                  <p className="mt-2 max-w-[16rem] text-sm leading-6 text-[var(--ink)]/75">
                    Get to know the people behind each group, one profile at a
                    time.
                  </p>
                </div>
                <div aria-hidden="true" className="absolute right-6 top-6 flex -space-x-5">
                  {[var_('--pink'), var_('--lilac'), var_('--lemon')].map((c, i) => (
                    <span
                      key={i}
                      className="h-20 w-20 rounded-full border-4 border-[var(--cyan)] transition duration-500 group-hover:-translate-y-2"
                      style={{ background: c, transitionDelay: `${i * 70}ms` }}
                    />
                  ))}
                </div>
              </Link>
            </Tilt>

            {/* Releases */}
            <Tilt className="sm:col-span-1 lg:col-span-2">
              <Link
                to="/idol/releases"
                className="ip-focus group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--ink)] p-8 text-white"
              >
                <Disc3 aria-hidden="true" className="h-9 w-9 text-[var(--lemon)]" />
                <div className="relative z-10">
                  <h3 className="ip-display text-3xl font-black">Releases</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Original songs and music projects.
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="ip-vinyl absolute -right-16 top-6 h-48 w-48 rounded-full"
                  style={{ animation: 'ip-spin 7s linear infinite' }}
                />
              </Link>
            </Tilt>

            {/* Events */}
            <Tilt className="sm:col-span-1 lg:col-span-4">
              <Link
                to="/idol/events"
                className="ip-focus group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--lilac)] p-8 text-[var(--ink)]"
              >
                <CalendarDays aria-hidden="true" className="h-9 w-9" />
                <div className="relative z-10">
                  <h3 className="ip-display text-3xl font-black">Events</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--ink)]/75">
                    Performances and activities coming up next.
                  </p>
                </div>

                {/* kubus 3D */}
                <div
                  aria-hidden="true"
                  className="absolute right-12 top-1/2 hidden h-[110px] w-[110px] -translate-y-1/2 sm:block"
                  style={{ perspective: 700 }}
                >
                  <div
                    className="ip-3d relative h-full w-full"
                    style={{ animation: 'ip-cube 16s linear infinite' }}
                  >
                    {[
                      'rotateY(0deg)',
                      'rotateY(90deg)',
                      'rotateY(180deg)',
                      'rotateY(270deg)',
                      'rotateX(90deg)',
                      'rotateX(-90deg)',
                    ].map((t, i) => (
                      <div
                        key={i}
                        className="ip-face rounded-xl bg-white/35"
                        style={{ transform: `${t} translateZ(55px)` }}
                      >
                        <Star className="h-8 w-8 text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </Tilt>
          </div>
        </div>
      </section>

      {/* =======================================================
          STATS — pita miring
      ======================================================= */}
      <section
        aria-label="39Production Idol statistics"
        className="ip-band relative -my-6 bg-[var(--pink)] py-24 text-white sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {[
              ['Idol groups', groups.length],
              ['Members', stats.members],
              ['Releases', stats.releases],
              ['Music videos', stats.videos],
            ].map(([label, value], i) => (
              <div key={label as string} className={i % 2 ? 'lg:translate-y-6' : ''}>
                <dd className="ip-display text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-none">
                  <Counter value={Number(value)} />
                </dd>
                <dt className="mt-3 text-sm font-semibold text-white/85">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* =======================================================
          CTA — kubus 3D
      ======================================================= */}
      <section className="relative isolate overflow-hidden bg-[var(--ink)] py-28 text-white sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-0 -z-10 h-96 w-96 rounded-full bg-[var(--cyan)]/20 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-[var(--pink)]/30 blur-[110px]"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <h2 className="ip-display max-w-2xl text-4xl font-black leading-[1.05] sm:text-6xl">
              Press play on the next release.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Hear the songs first, then watch the stories behind them.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/idol/releases"
                className="ip-focus group inline-flex items-center gap-3 rounded-full bg-[var(--lemon)] px-7 py-4 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Explore releases
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/idol/events"
                className="ip-focus inline-flex items-center rounded-full border border-white/30 px-7 py-4 text-sm font-semibold transition hover:border-[var(--pink)] hover:text-[var(--pink)]"
              >
                See upcoming events
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mx-auto h-[220px] w-[220px] sm:h-[260px] sm:w-[260px]"
            style={{ perspective: 1000 }}
          >
            <div
              className="ip-3d relative mx-auto mt-[50px] h-[150px] w-[150px] sm:mt-[60px] sm:h-[170px] sm:w-[170px]"
              style={{ animation: 'ip-cube 18s linear infinite' }}
            >
              {[
                { t: 'rotateY(0deg)', bg: 'var(--pink)', icon: Music },
                { t: 'rotateY(90deg)', bg: 'var(--cyan)', icon: Disc3 },
                { t: 'rotateY(180deg)', bg: 'var(--lemon)', icon: Play },
                { t: 'rotateY(270deg)', bg: 'var(--lilac)', icon: Users },
                { t: 'rotateX(90deg)', bg: 'var(--pink)', icon: Sparkles },
                { t: 'rotateX(-90deg)', bg: 'var(--cyan)', icon: CalendarDays },
              ].map(({ t, bg, icon: Icon }, i) => (
                <div
                  key={i}
                  className="ip-face rounded-3xl text-[var(--ink)]"
                  style={{ background: bg, transform: `${t} translateZ(85px)` }}
                >
                  <Icon className="h-14 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/** helper kecil: ambil nilai CSS variable sebagai string untuk inline style */
function var_(name: string) {
  return `var(${name})`
}