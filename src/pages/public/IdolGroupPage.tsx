import {
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
  ExternalLink,
  Loader2,
  MapPin,
  Music,
  Pause,
  Play,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL = 'https://39production-api.39production.workers.dev'
const SITE_URL = 'https://39production.digital'

interface IdolMember {
  id: number
  name: string
  stage_name: string
  position: string
  birth_date: string
  bio: string
  image_url: string
  status: 'Active' | 'Inactive'
}

interface IdolRelease {
  id: number
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

interface IdolMusicVideo {
  id: number
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  youtube_url: string
  release_date: string
  status: 'Published' | 'Upcoming'
}

interface IdolActivity {
  id: number
  title: string
  type: 'Concert' | 'Fan Meeting' | 'Event' | 'Schedule'
  date: string
  location: string
  description: string
  image_url: string
  status: 'Upcoming' | 'Completed' | 'Cancelled'
}

interface IdolGroup {
  id: number
  name: string
  description: string
  image_url: string
  status: 'Active' | 'Hiatus'
  members: IdolMember[]
  releases: IdolRelease[]
  music_videos: IdolMusicVideo[]
  activities: IdolActivity[]
}

const TYPE_STYLE: Record<IdolRelease['type'], string> = {
  Single: 'bg-[var(--pink)] text-white',
  EP: 'bg-[var(--cyan)] text-[var(--ink)]',
  Album: 'bg-[var(--lemon)] text-[var(--ink)]',
}

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
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

function getShortDate(date: string) {
  if (!date) return '-'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function getDateParts(date: string) {
  const parsed = new Date(date)

  if (!date || Number.isNaN(parsed.getTime())) {
    return { day: '—', month: '', year: '' }
  }

  return {
    day: String(parsed.getDate()).padStart(2, '0'),
    month: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(parsed),
    year: String(parsed.getFullYear()),
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
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
      if (parsed.pathname.includes('/embed/')) return parsed.pathname.split('/embed/')[1]
      if (parsed.pathname.includes('/shorts/')) return parsed.pathname.split('/shorts/')[1]
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
  try {
    const parsed = new URL(url)

    if (parsed.pathname.includes('/embed/')) return url
  } catch {
    return url
  }

  const id = getYoutubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : url
}

/* ============================================================
   SEO
============================================================ */

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
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

function setCanonical(url: string) {
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

function setJsonLd(id: string, data: unknown) {
  let script = document.head.querySelector<HTMLScriptElement>(
    `script[data-seo-id="${id}"]`,
  )

  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-seo-id', id)
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(data)
}

function removeJsonLd(id: string) {
  document.head
    .querySelector<HTMLScriptElement>(`script[data-seo-id="${id}"]`)
    ?.remove()
}

function updateSeo(group: IdolGroup | null, id?: string) {
  const isDetail = Boolean(id && group)

  const title = isDetail
    ? `${group?.name} — Idol Group | 39Production`
    : 'Idol Groups — 39Production Entertainment'

  const description = isDetail
    ? `${group?.name} adalah idol group yang dikembangkan dan diproduksi oleh 39Production. Lihat profil member, musik, music video, dan aktivitas terbaru.`
    : 'Discover idol groups, artists, music releases, music videos, and entertainment projects produced by 39Production.'

  const canonicalUrl = isDetail
    ? `${SITE_URL}/idol/groups/${group?.id}`
    : `${SITE_URL}/idol/groups`

  document.title = title

  setMeta('name', 'description', description)
  setMeta('name', 'robots', 'index, follow')
  setMeta('name', 'author', '39Production')

  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', canonicalUrl)
  setMeta('property', 'og:site_name', '39Production')

  if (isDetail && group?.image_url) {
    setMeta('property', 'og:image', group.image_url)
  }

  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)

  if (isDetail && group?.image_url) {
    setMeta('name', 'twitter:image', group.image_url)
  }

  setCanonical(canonicalUrl)

  const breadcrumbItems = isDetail
    ? [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Idol Groups',
        item: `${SITE_URL}/idol/groups`,
      },
      { '@type': 'ListItem', position: 3, name: group?.name, item: canonicalUrl },
    ]
    : [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Idol Groups', item: canonicalUrl },
    ]

  setJsonLd('39production-breadcrumbs', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  })

  if (isDetail && group) {
    setJsonLd('39production-idol-group', {
      '@context': 'https://schema.org',
      '@type': 'MusicGroup',
      name: group.name,
      description: group.description || `Idol group produced by 39Production.`,
      url: canonicalUrl,
      image: group.image_url || undefined,
      member:
        group.members?.map((member) => ({
          '@type': 'Person',
          name: member.stage_name || member.name,
          url: `${SITE_URL}/idol/members/${member.id}`,
        })) || [],
    })
  } else {
    removeJsonLd('39production-idol-group')
  }
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
@keyframes ip-fan{
  0%,100%{transform:translate3d(var(--x),0,var(--z)) rotateZ(var(--rz)) rotateY(var(--ry))}
  50%{transform:translate3d(var(--x),-16px,var(--z)) rotateZ(calc(var(--rz) + 2deg)) rotateY(var(--ry))}
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
@keyframes ip-wave{
  0%,100%{transform:scaleY(.2)}
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
.ip-slip{transition:transform .7s cubic-bezier(.22,.9,.24,1)}
@media (hover:hover) and (min-width:768px){
  .ip-sleeve:hover .ip-slip,
  .ip-sleeve:focus-within .ip-slip{
    transform:translateX(44%) rotate(12deg);
  }
}
.ip-holo-shine{
  position:absolute;
  inset:0;
  pointer-events:none;
  opacity:0;
  transition:opacity .3s;
  mix-blend-mode:overlay;
  background:
    radial-gradient(circle at var(--px,50%) var(--py,50%),rgba(255,255,255,.75),transparent 45%),
    linear-gradient(115deg,transparent 28%,rgba(255,61,154,.5) 42%,rgba(61,224,255,.5) 54%,rgba(255,228,92,.5) 66%,transparent 80%);
}
.ip-holo:hover .ip-holo-shine,
.ip-holo-always .ip-holo-shine{opacity:1}
.ip-rail{scrollbar-width:thin;scrollbar-color:var(--pink) transparent}

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

function GroupArt({
  group,
  className = '',
  iconClass = 'h-16 w-16',
  eager = false,
}: {
  group?: Pick<IdolGroup, 'name' | 'image_url'> | null
  className?: string
  iconClass?: string
  eager?: boolean
}) {
  if (group?.image_url) {
    return (
      <img
        src={group.image_url}
        alt={`${group.name} idol group`}
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

function MemberPhoto({ member, className = '' }: { member: IdolMember; className?: string }) {
  if (member.image_url) {
    return (
      <img
        src={member.image_url}
        alt={`${member.stage_name} - 39Production`}
        loading="lazy"
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
      <span className="ip-display text-4xl font-black text-white/85">
        {getInitials(member.stage_name) || <User className="h-10 w-10" />}
      </span>
    </div>
  )
}

function HoloCard({
  children,
  className = '',
  max = 12,
  always = false,
}: {
  children: ReactNode
  className?: string
  max?: number
  always?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(1.02)`
    el.style.setProperty('--px', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--py', `${(y + 0.5) * 100}%`)
  }

  const reset = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.setProperty('--px', '50%')
    el.style.setProperty('--py', '50%')
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`ip-holo relative overflow-hidden transition-transform duration-300 ease-out will-change-transform ${always ? 'ip-holo-always' : ''
        } ${className}`}
    >
      {children}
      <span aria-hidden="true" className="ip-holo-shine" />
    </div>
  )
}

function Tilt({
  children,
  className = '',
  max = 6,
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
    el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`
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

function StageBackdrop({ tint = 'pink' }: { tint?: 'pink' | 'cyan' }) {
  const main = tint === 'pink' ? 'rgba(255,61,154,.3)' : 'rgba(61,224,255,.28)'
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(50% 50% at 70% 55%, ${main}, transparent 70%), radial-gradient(35% 35% at 5% 90%, rgba(185,166,255,.22), transparent 70%)`,
        }}
      />
      <div
        className="ip-beam left-[-4%]"
        style={{ background: 'linear-gradient(to bottom, rgba(255,61,154,.5), transparent 80%)' }}
      />
      <div
        className="ip-beam left-[30%]"
        style={{
          background: 'linear-gradient(to bottom, rgba(61,224,255,.45), transparent 80%)',
          animationDelay: '-4s',
          animationDuration: '11s',
        }}
      />
      <div
        className="ip-beam left-[58%]"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,228,92,.35), transparent 80%)',
          animationDelay: '-7s',
          animationDuration: '8s',
        }}
      />
    </div>
  )
}

/** Orbit: titik-titik berputar mengelilingi objek, tampak 3D karena dimiringkan */
function Orbit({ size, className = '' }: { size: number; className?: string }) {
  const colors = ['var(--pink)', 'var(--cyan)', 'var(--lemon)', 'var(--lilac)', 'white']

  return (
    <div
      aria-hidden="true"
      className={`ip-3d pointer-events-none absolute ${className}`}
      style={{
        width: size,
        height: size,
        transform: 'rotateX(72deg)',
      }}
    >
      <div
        className="ip-3d absolute inset-0"
        style={{ animation: 'ip-spin 18s linear infinite' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/25" />
        {colors.map((c, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 h-4 w-4 rounded-full"
            style={{
              margin: -8,
              background: c,
              boxShadow: `0 0 18px ${c}`,
              transform: `rotate(${i * 72}deg) translateX(${size / 2}px)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function Vinyl({
  release,
  className = '',
  spin = '12s',
}: {
  release?: IdolRelease | null
  className?: string
  spin?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={`ip-vinyl relative rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,.6)] ${className}`}
      style={{ animation: `ip-spin ${spin} linear infinite` }}
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

/** Thumbnail video dengan fallback bertahap */
function VideoThumb({ video }: { video: IdolMusicVideo }) {
  const sources = useMemo(
    () =>
      [
        video.thumbnail_url,
        getYoutubeThumbnail(video.youtube_url, 'maxresdefault'),
        getYoutubeThumbnail(video.youtube_url, 'hqdefault'),
      ].filter(Boolean),
    [video],
  )

  const [index, setIndex] = useState(0)

  useEffect(() => setIndex(0), [video.id])

  if (index < sources.length) {
    return (
      <img
        src={sources[index]}
        alt={video.title}
        loading="lazy"
        decoding="async"
        onError={() => setIndex((i) => i + 1)}
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff3d9a] via-[#b9a6ff] to-[#3de0ff]">
      <Play aria-hidden="true" className="h-12 w-12 text-white/80" />
    </div>
  )
}

function VideoTile({ video, groupName }: { video: IdolMusicVideo; groupName: string }) {
  const [playing, setPlaying] = useState(false)

  const embed = video.youtube_url ? toYoutubeEmbed(video.youtube_url) : ''
  const canPlay = Boolean(embed || video.video_url)

  return (
    <div className="min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--ink)] shadow-[7px_7px_0_var(--ink)]">
        {playing ? (
          embed ? (
            <iframe
              src={`${embed}${embed.includes('?') ? '&' : '?'}autoplay=1`}
              title={`${video.title} — ${groupName}`}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              autoPlay
              poster={video.thumbnail_url || undefined}
              src={video.video_url}
              className="h-full w-full object-contain"
            />
          )
        ) : (
          <button
            type="button"
            disabled={!canPlay}
            onClick={() => setPlaying(true)}
            aria-label={`Play ${video.title}`}
            className="ip-focus group absolute inset-0 block text-left"
          >
            <VideoThumb video={video} />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/60 via-transparent to-transparent"
            />
            {canPlay && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110">
                <PlayOrb size="h-16 w-16" />
              </span>
            )}
          </button>
        )}

        <span
          className={`pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${video.status === 'Upcoming'
            ? 'bg-[var(--lilac)] text-[var(--ink)]'
            : 'bg-[var(--cyan)] text-[var(--ink)]'
            }`}
        >
          {video.status === 'Upcoming' ? 'Coming soon' : 'Published'}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 pt-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold tracking-[-0.02em]">{video.title}</h3>
          <p className="mt-0.5 text-xs text-[var(--ink)]/55">
            {getShortDate(video.release_date)}
          </p>
          {video.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink)]/65">
              {video.description}
            </p>
          )}
        </div>

        {video.youtube_url && (
          <a
            href={video.youtube_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${video.title} on YouTube`}
            className="ip-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ink)]/15 transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}

function SectionTitle({
  id,
  title,
  note,
  dark = false,
}: {
  id: string
  title: string
  note: string
  dark?: boolean
}) {
  return (
    <div className="max-w-2xl">
      <h2
        id={id}
        className="ip-display text-3xl font-black leading-tight sm:text-5xl"
      >
        {title}
      </h2>
      <p className={`mt-3 max-w-md text-base leading-7 ${dark ? 'text-white/65' : 'text-[var(--ink)]/65'}`}>
        {note}
      </p>
    </div>
  )
}

function Empty({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div
      className={`mt-10 rounded-[32px] border-2 border-dashed p-10 text-center ${dark
        ? 'border-white/20 bg-white/5 text-white/65'
        : 'border-[var(--ink)]/20 bg-white text-[var(--ink)]/60'
        }`}
    >
      <Sparkles aria-hidden="true" className="mx-auto h-8 w-8 text-[var(--pink)]" />
      <p className="mt-3 text-sm font-medium">{text}</p>
    </div>
  )
}

/* ============================================================
   PAGE
============================================================ */

export function IdolGroupPage() {
  const { id } = useParams()

  const [groups, setGroups] = useState<IdolGroup[]>([])
  const [group, setGroup] = useState<IdolGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const sceneRef = useRef<HTMLDivElement>(null)

  /* audio rilisan */
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTrack, setCurrentTrack] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)

  /* ---------- Fonts ---------- */
  useEffect(() => {
    const fontId = 'idol-page-fonts'
    if (document.getElementById(fontId)) return

    const link = document.createElement('link')
    link.id = fontId
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;900&family=Figtree:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])

  /* ---------- Load ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        if (id) {
          const data = await apiRequest<IdolGroup>(`/api/idol/groups/${id}`)
          setGroup(data)
          return
        }

        const data = await apiRequest<IdolGroup[]>('/api/idol/groups')
        setGroups(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat data group.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  /* ---------- SEO ---------- */
  useEffect(() => {
    if (!loading) updateSeo(group, id)
  }, [group, id, loading])

  /* ---------- Hentikan audio saat pindah/keluar ---------- */
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
    }
  }, [id])

  /* ---------- Derived ---------- */
  const marqueeRow = useMemo(() => {
    const names = groups.map((g) => g.name)
    let row = names.length ? names : ['Idol groups', 'New debuts', 'Live stages', 'Fresh sounds']
    while (row.length < 8) row = [...row, ...row]
    return row
  }, [groups])

  const posterFan = useMemo(
    () => Array.from({ length: 3 }, (_, i) => groups[i] ?? null),
    [groups],
  )

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

  const togglePlay = (release: IdolRelease) => {
    const audio = audioRef.current
    if (!audio || !release.audio_url) return

    if (currentTrack === release.id) {
      if (audio.paused) {
        void audio.play().catch(() => setPlaying(false))
      } else {
        audio.pause()
      }
      return
    }

    setCurrentTrack(release.id)
    audio.src = release.audio_url
    void audio.play().catch(() => setPlaying(false))
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const styleTag = <style>{PAGE_CSS}</style>

  /* ============================================================
     LOADING
  ============================================================ */
  if (loading) {
    return (
      <div className="ip-root flex min-h-screen items-center justify-center bg-[var(--ink)] text-white">
        {styleTag}
        <div className="flex items-center gap-3 text-white/75">
          <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-[var(--pink)]" />
          Loading…
        </div>
      </div>
    )
  }

  /* ============================================================
     ERROR
  ============================================================ */
  if (error) {
    return (
      <div className="ip-root relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--ink)] px-6 py-20 text-white">
        {styleTag}
        <StageBackdrop />
        <div className="w-full max-w-lg rounded-[28px] border border-red-300/40 bg-red-500/10 p-8 text-center backdrop-blur">
          <p className="ip-display text-xl font-black text-red-200">Something went wrong</p>
          <p className="mt-3 break-words text-sm leading-6 text-red-100/85">{error}</p>

          <Link
            to="/idol/groups"
            className="ip-focus mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--pink)] hover:text-white"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back to groups
          </Link>
        </div>
      </div>
    )
  }

  /* ============================================================
     DIRECTORY
  ============================================================ */
  if (!id) {
    const fan = [
      { x: '-52%', z: '0px', rz: '-8deg', ry: '16deg', d: '-1s', top: '10%' },
      { x: '0%', z: '90px', rz: '0deg', ry: '0deg', d: '-3s', top: '2%' },
      { x: '52%', z: '0px', rz: '8deg', ry: '-16deg', d: '-2s', top: '14%' },
    ]

    return (
      <main className="ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
        {styleTag}

        {/* =====================================================
            HERO
        ===================================================== */}
        <section
          aria-labelledby="groups-title"
          onPointerMove={onHeroMove}
          onPointerLeave={onHeroLeave}
          className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
        >
          <StageBackdrop />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-24 pt-28 sm:pt-32 lg:grid-cols-[1fr_1fr] lg:px-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-3 pr-4 text-sm font-medium backdrop-blur">
                <Users aria-hidden="true" className="h-4 w-4 text-[var(--pink)]" />
                {groups.length} {groups.length === 1 ? 'group' : 'groups'} on the roster
              </div>

              <h1
                id="groups-title"
                className="ip-display mt-6 text-[clamp(2.4rem,6.4vw,5.4rem)] font-black leading-[0.98]"
                style={{ perspective: 800 }}
              >
                <span className="ip-line" style={{ animationDelay: '.1s' }}>
                  Artists become
                </span>
                <span
                  className="ip-line ip-outline text-[var(--lemon)]"
                  style={{ animationDelay: '.25s' }}
                >
                  a story.
                </span>
              </h1>

              <p
                className="mt-6 max-w-md text-base leading-7 text-white/75 sm:text-lg"
                style={{ animation: 'ip-pop .8s .6s cubic-bezier(.2,.8,.2,1) both' }}
              >
                Meet the idol groups developed, managed, and produced by
                39Production.
              </p>
            </div>

            {/* poster 3D + orbit */}
            <div
              className="relative mx-auto h-[380px] w-full max-w-[560px] sm:h-[480px]"
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
                  className="absolute left-1/2 top-1/2 h-[75%] w-[75%] rounded-full bg-[var(--pink)] opacity-40 blur-[100px]"
                  style={{
                    transform: 'translate3d(-50%,-50%,-220px)',
                    animation: 'ip-pulse 6s ease-in-out infinite',
                  }}
                />

                <Orbit
                  size={440}
                  className="left-1/2 top-1/2 -ml-[220px] -mt-[220px] hidden sm:block"
                />

                {fan.map((f, i) => {
                  const g = posterFan[i]
                  const card = (
                    <HoloCard
                      max={9}
                      className="aspect-[4/5] w-full rounded-3xl border-4 border-white bg-[var(--ink-2)] shadow-[0_40px_80px_-20px_rgba(0,0,0,.8)]"
                    >
                      <GroupArt group={g} eager iconClass="h-14 w-14" />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-transparent to-transparent"
                      />
                      {g && (
                        <span className="ip-display absolute inset-x-3 bottom-3 truncate text-xs font-bold text-white sm:text-base">
                          {g.name}
                        </span>
                      )}
                    </HoloCard>
                  )

                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 -ml-[21%] w-[42%]"
                      style={
                        {
                          top: f.top,
                          '--x': f.x,
                          '--z': f.z,
                          '--rz': f.rz,
                          '--ry': f.ry,
                          transform: `translate3d(${f.x},0,${f.z}) rotateZ(${f.rz}) rotateY(${f.ry})`,
                          animation: `ip-fan ${7 + i}s ease-in-out ${f.d} infinite`,
                        } as CSSProperties
                      }
                    >
                      {g ? (
                        <Link
                          to={`/idol/groups/${g.id}`}
                          aria-label={`View ${g.name}`}
                          className="ip-focus block rounded-3xl"
                        >
                          {card}
                        </Link>
                      ) : (
                        card
                      )}
                    </div>
                  )
                })}

                <Star
                  className="absolute right-[4%] top-[2%] h-12 w-12 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
                  style={{ '--z': '230px', '--r': '0deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
                />
                <Star
                  className="absolute bottom-[8%] left-[2%] h-8 w-8 text-[var(--cyan)]"
                  style={{ '--z': '200px', '--r': '20deg', animation: 'ip-float 6.5s ease-in-out -2s infinite' } as CSSProperties}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MARQUEE
        ===================================================== */}
        <div
          aria-hidden="true"
          className="relative z-10 -mt-6 -rotate-[1.4deg] overflow-hidden border-y-4 border-[var(--ink)] bg-[var(--pink)] py-4 text-white"
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
                <Star className="h-7 w-7 text-[var(--lemon)]" />
              </span>
            ))}
          </div>
        </div>

        {/* =====================================================
            DAFTAR GRUP — billboard zig-zag
        ===================================================== */}
        <section
          aria-labelledby="roster-title"
          className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-8"
        >
          <h2
            id="roster-title"
            className="ip-display max-w-2xl text-3xl font-black leading-tight sm:text-5xl"
          >
            Choose your stage.
          </h2>

          {groups.length === 0 ? (
            <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
              <Music aria-hidden="true" className="mx-auto h-10 w-10 text-[var(--pink)]" />
              <p className="mt-4 font-semibold">No idol groups yet.</p>
              <p className="mt-1 text-sm text-[var(--ink)]/60">
                Artist projects will appear here as they are published.
              </p>
            </div>
          ) : (
            <div className="mt-16 space-y-24">
              {groups.map((item, index) => {
                const flip = index % 2 === 1
                const active = item.status === 'Active'

                return (
                  <article
                    key={item.id}
                    className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
                  >
                    <Link
                      to={`/idol/groups/${item.id}`}
                      aria-label={`View ${item.name}`}
                      className={`ip-focus group relative block rounded-[36px] ${flip ? 'md:order-2' : ''
                        }`}
                    >
                      <div
                        aria-hidden="true"
                        className={`absolute -inset-3 -z-10 rounded-[40px] ${flip ? 'rotate-2 bg-[var(--cyan)]' : '-rotate-2 bg-[var(--lemon)]'
                          }`}
                      />
                      <HoloCard
                        max={7}
                        className="aspect-[4/3] rounded-[32px] border-[3px] border-[var(--ink)] bg-[var(--ink)] shadow-[8px_8px_0_var(--ink)] group-hover:shadow-[12px_12px_0_var(--pink)]"
                      >
                        <GroupArt group={item} eager={index < 2} />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-transparent"
                        />
                        <span
                          className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${active
                            ? 'bg-[var(--cyan)] text-[var(--ink)]'
                            : 'bg-[var(--lemon)] text-[var(--ink)]'
                            }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-[var(--ink)]" />
                          {item.status}
                        </span>
                      </HoloCard>
                    </Link>

                    <div className={flip ? 'md:order-1 md:text-right' : ''}>
                      <h3 className="ip-display break-words text-3xl font-black leading-tight sm:text-5xl">
                        {item.name}
                      </h3>

                      <p
                        className={`mt-5 line-clamp-4 max-w-md text-base leading-7 text-[var(--ink)]/70 ${flip ? 'md:ml-auto' : ''
                          }`}
                      >
                        {item.description || 'Idol group 39Production.'}
                      </p>

                      <Link
                        to={`/idol/groups/${item.id}`}
                        className="ip-focus group/btn mt-7 inline-flex items-center gap-3 rounded-full bg-[var(--ink)] px-7 py-4 text-sm font-bold text-white transition hover:bg-[var(--pink)]"
                      >
                        View {item.name}
                        <ChevronRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                        />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}
        <section className="relative isolate overflow-hidden bg-[var(--ink)] py-24 text-white sm:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-0 -z-10 h-96 w-96 rounded-full bg-[var(--pink)]/30 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-96 w-96 rounded-full bg-[var(--cyan)]/20 blur-[110px]"
          />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_auto] lg:px-8">
            <div>
              <h2 className="ip-display max-w-2xl text-4xl font-black leading-[1.05] sm:text-6xl">
                Building groups. Creating identities.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                Every group is made of people. Meet them one by one.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/idol/members"
                  className="ip-focus group inline-flex items-center gap-3 rounded-full bg-[var(--lemon)] px-7 py-4 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Meet the members
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
              className="relative mx-auto h-[260px] w-[260px] sm:h-[320px] sm:w-[320px]"
              style={{ perspective: 1000 }}
            >
              <div className="ip-3d absolute inset-0 flex items-center justify-center">
                <Orbit size={300} className="left-1/2 top-1/2 -ml-[150px] -mt-[150px]" />
                <div
                  className="ip-3d relative h-32 w-32"
                  style={{ animation: 'ip-spin 10s linear infinite' }}
                >
                  <Star className="h-full w-full text-[var(--pink)] drop-shadow-[0_0_30px_var(--pink)]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  /* ============================================================
     DETAIL — tidak ditemukan
  ============================================================ */
  if (!group) {
    return (
      <div className="ip-root relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--ink)] px-6 text-center text-white">
        {styleTag}
        <StageBackdrop />
        <div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            <Music aria-hidden="true" className="h-9 w-9 text-[var(--pink)]" />
          </div>

          <h1 className="ip-display mt-6 text-2xl font-black sm:text-3xl">
            Group not found.
          </h1>
          <p className="mt-2 text-sm text-white/65">
            This group may have been moved or removed.
          </p>

          <Link
            to="/idol/groups"
            className="ip-focus mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--pink)] hover:text-white"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back to groups
          </Link>
        </div>
      </div>
    )
  }

  /* ============================================================
     DETAIL — profil grup
  ============================================================ */
  const members = group.members || []
  const releases = group.releases || []
  const videos = group.music_videos || []
  const activities = group.activities || []
  const isActive = group.status === 'Active'

  const navItems = [
    { id: 'members', label: 'Members', count: members.length, icon: Users },
    { id: 'releases', label: 'Releases', count: releases.length, icon: Disc3 },
    { id: 'videos', label: 'Videos', count: videos.length, icon: Play },
    { id: 'events', label: 'Events', count: activities.length, icon: CalendarDays },
  ]

  const statusTone = (status: IdolActivity['status']) =>
    status === 'Upcoming'
      ? 'bg-[var(--pink)] text-white'
      : status === 'Completed'
        ? 'bg-[var(--cyan)] text-[var(--ink)]'
        : 'bg-white/20 text-white'

  return (
    <main className="ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
      {styleTag}

      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* =====================================================
          HERO GRUP
      ===================================================== */}
      <section
        aria-labelledby="group-name"
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
        className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
      >
        {group.image_url && (
          <img
            src={group.image_url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
          />
        )}
        <StageBackdrop tint="cyan" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-32 pt-28 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8">
          <div className="relative z-10">
            <div
              className="flex flex-wrap items-center gap-3"
              style={{ animation: 'ip-pop .7s .1s cubic-bezier(.2,.8,.2,1) both' }}
            >
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${isActive ? 'bg-[var(--cyan)] text-[var(--ink)]' : 'bg-[var(--lemon)] text-[var(--ink)]'
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-[var(--ink)]" />
                {group.status}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                39Production Idol
              </span>
            </div>

            <h1
              id="group-name"
              className="ip-display mt-6 break-words text-[clamp(2.6rem,7vw,6rem)] font-black leading-[0.98]"
              style={{ perspective: 800 }}
            >
              <span className="ip-line" style={{ animationDelay: '.15s' }}>
                {group.name}
              </span>
            </h1>

            <p
              className="mt-6 max-w-lg text-base leading-7 text-white/75 sm:text-lg sm:leading-8"
              style={{ animation: 'ip-pop .8s .55s cubic-bezier(.2,.8,.2,1) both' }}
            >
              {group.description || 'Idol group 39Production.'}
            </p>

            <dl
              className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4"
              style={{ animation: 'ip-pop .8s .75s cubic-bezier(.2,.8,.2,1) both' }}
            >
              {[
                ['Members', members.length, Users],
                ['Releases', releases.length, Disc3],
                ['Videos', videos.length, Play],
                ['Events', activities.length, CalendarDays],
              ].map(([label, value, Icon]) => {
                const I = Icon as typeof Users
                return (
                  <div
                    key={label as string}
                    className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur"
                  >
                    <dt className="flex items-center gap-1.5 text-xs text-white/65">
                      <I aria-hidden="true" className="h-3.5 w-3.5 text-[var(--pink)]" />
                      {label as string}
                    </dt>
                    <dd className="ip-display mt-1 text-2xl font-black">
                      <Counter value={Number(value)} />
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>

          {/* Poster 3D */}
          <div
            className="relative mx-auto w-full max-w-[380px]"
            style={{ perspective: 1300 }}
          >
            <div
              ref={sceneRef}
              className="ip-3d relative transition-transform duration-200 ease-out"
              style={
                {
                  '--mx': 0,
                  '--my': 0,
                  transform:
                    'rotateY(calc(var(--mx) * 10deg)) rotateX(calc(var(--my) * -8deg))',
                } as CSSProperties
              }
            >
              <Orbit
                size={520}
                className="left-1/2 top-1/2 -ml-[260px] -mt-[260px] hidden sm:block"
              />

              <div style={{ transform: 'translateZ(80px)' }}>
                <HoloCard
                  max={14}
                  always
                  className="aspect-[4/5] w-full rounded-[32px] border-[5px] border-white bg-[var(--ink-2)] shadow-[0_50px_90px_-20px_rgba(0,0,0,.8),0_0_70px_rgba(255,61,154,.45)]"
                >
                  <GroupArt group={group} eager iconClass="h-24 w-24" />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-transparent to-transparent"
                  />
                  <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <span className="ip-display text-xl font-black">
                      #{String(group.id).padStart(3, '0')}
                    </span>
                    <Sparkles aria-hidden="true" className="h-6 w-6 text-[var(--lemon)]" />
                  </span>
                </HoloCard>
              </div>

              <Star
                className="absolute -right-4 -top-6 h-14 w-14 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
                style={{ '--z': '160px', '--r': '0deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
              />
              <Star
                className="absolute -left-6 bottom-[22%] h-9 w-9 text-[var(--cyan)]"
                style={{ '--z': '140px', '--r': '20deg', animation: 'ip-float 6.5s ease-in-out -2s infinite' } as CSSProperties}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          NAV SEKSI (sticky)
      ===================================================== */}
      <nav
        aria-label="Group sections"
        className="sticky top-3 z-40 mx-auto -mt-8 w-fit max-w-[94vw]"
      >
        <div className="ip-rail flex gap-1.5 overflow-x-auto rounded-full border border-white/15 bg-[var(--ink)]/90 p-1.5 shadow-[0_14px_40px_-10px_rgba(21,10,56,.7)] backdrop-blur-xl">
          {navItems.map(({ id: sid, label, count, icon: Icon }) => (
            <button
              key={sid}
              type="button"
              onClick={() => scrollToSection(sid)}
              className="ip-focus inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-[var(--pink)] hover:text-white"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{count}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* =====================================================
          MEMBERS — rail photocard
      ===================================================== */}
      <section
        id="members"
        aria-labelledby="members-heading"
        className="relative mx-auto max-w-7xl scroll-mt-24 px-6 pb-8 pt-24 lg:px-8"
      >
        <SectionTitle
          id="members-heading"
          title="Meet the members."
          note="The artists behind the group. Tap a card to see their profile."
        />

        {members.length ? (
          <div className="ip-rail -mx-6 mt-12 flex snap-x gap-5 overflow-x-auto px-6 pb-8 pt-2 lg:-mx-8 lg:px-8">
            {members.map((member, index) => {
              const active = member.status === 'Active'
              return (
                <Link
                  key={member.id}
                  to={`/idol/members/${member.id}`}
                  aria-label={`View ${member.stage_name}`}
                  className={`ip-focus group w-[210px] shrink-0 snap-start rounded-3xl sm:w-[240px] ${index % 2 ? 'mt-8' : ''
                    }`}
                >
                  <HoloCard
                    max={10}
                    className="aspect-[3/4] rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--ink)] shadow-[7px_7px_0_var(--ink)] group-hover:shadow-[10px_10px_0_var(--pink)]"
                  >
                    <span className={`block h-full w-full ${active ? '' : 'saturate-[.55]'}`}>
                      <MemberPhoto member={member} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/10 to-transparent"
                    />
                    <span
                      className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${active ? 'bg-[var(--cyan)] text-[var(--ink)]' : 'bg-white/80 text-[var(--ink)]/70'
                        }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]" />
                      {member.status}
                    </span>
                    <span className="absolute inset-x-3 bottom-3 block">
                      <span className="inline-block max-w-full truncate rounded-full bg-[var(--lemon)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink)]">
                        {member.position}
                      </span>
                      <span className="ip-display mt-1.5 block truncate text-xl font-black leading-tight text-white">
                        {member.stage_name}
                      </span>
                    </span>
                  </HoloCard>
                </Link>
              )
            })}
          </div>
        ) : (
          <Empty text="No members yet." />
        )}
      </section>

      {/* =====================================================
          RELEASES — sleeve + vinyl
      ===================================================== */}
      <section
        id="releases"
        aria-labelledby="releases-heading"
        className="relative scroll-mt-24 bg-[var(--ink)] py-24 text-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionTitle
            id="releases-heading"
            title="Play the records."
            note="Singles, EPs, and albums. Press play to hear a preview."
            dark
          />

          {releases.length ? (
            <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-14 pb-6 sm:gap-x-7 lg:grid-cols-4">
              {releases.map((release, index) => {
                const now = currentTrack === release.id && playing
                const upcoming = release.status === 'Upcoming'

                return (
                  <article
                    key={release.id}
                    className={`min-w-0 hover:z-20 focus-within:z-20 ${index % 2 ? 'sm:translate-y-8' : ''
                      }`}
                  >
                    <Tilt max={7}>
                      <div className="ip-sleeve relative">
                        <div className="ip-slip absolute inset-0 translate-x-[14%]">
                          <Vinyl
                            release={release}
                            className="h-full w-full"
                            spin={now ? '2.6s' : '12s'}
                          />
                        </div>

                        <div
                          className={`relative aspect-square overflow-hidden rounded-xl border-[3px] border-white bg-[var(--ink-2)] shadow-[6px_6px_0_var(--pink)] ${upcoming ? 'saturate-[.7]' : ''
                            }`}
                        >
                          {release.cover_url ? (
                            <img
                              src={release.cover_url}
                              alt={`${release.title} cover`}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#ff3d9a] via-[#b9a6ff] to-[#3de0ff]">
                              <Disc3 aria-hidden="true" className="h-12 w-12 text-white/80" />
                            </div>
                          )}

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

                          {now && (
                            <span
                              aria-hidden="true"
                              className="absolute bottom-3 right-3 flex h-6 items-end gap-[3px]"
                            >
                              {[0, 0.2, 0.1, 0.3].map((d, i) => (
                                <span
                                  key={i}
                                  className="h-full w-[4px] origin-bottom rounded-full bg-[var(--lemon)]"
                                  style={{
                                    animation: `ip-wave ${0.7 + i * 0.12}s ease-in-out ${d}s infinite`,
                                  }}
                                />
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                    </Tilt>

                    <div className="pt-5">
                      <h3 className="truncate text-base font-bold tracking-[-0.02em]">
                        {release.title}
                      </h3>
                      <p className="mt-1 text-xs text-white/55">
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
                              className="ip-focus rounded-full border border-white/25 px-3 py-1 text-xs font-bold transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
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
                              className="ip-focus rounded-full border border-white/25 px-3 py-1 text-xs font-bold transition hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
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
          ) : (
            <Empty text="No music releases yet." dark />
          )}
        </div>
      </section>

      {/* =====================================================
          VIDEOS
      ===================================================== */}
      <section
        id="videos"
        aria-labelledby="videos-heading"
        className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-24 lg:px-8"
      >
        <SectionTitle
          id="videos-heading"
          title="Watch the visuals."
          note="Official music videos. Press play and they start right here."
        />

        {videos.length ? (
          <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
            {videos.map((video) => (
              <VideoTile key={video.id} video={video} groupName={group.name} />
            ))}
          </div>
        ) : (
          <Empty text="No music videos yet." />
        )}
      </section>

      {/* =====================================================
          EVENTS — tiket
      ===================================================== */}
      <section
        id="events"
        aria-labelledby="events-heading"
        className="relative isolate scroll-mt-24 overflow-hidden bg-[var(--ink)] py-24 text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-10 -z-10 h-96 w-96 rounded-full bg-[var(--pink)]/25 blur-[110px]"
        />

        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <SectionTitle
            id="events-heading"
            title="See them live."
            note="Concerts, fan meetings, appearances, and what is coming next."
            dark
          />

          {activities.length ? (
            <div className="mt-14 space-y-6">
              {activities.map((activity, index) => {
                const parts = getDateParts(activity.date)
                const cancelled = activity.status === 'Cancelled'
                const upcoming = activity.status === 'Upcoming'

                return (
                  <Tilt key={activity.id} max={3}>
                    <article
                      className={`relative flex overflow-hidden rounded-[28px] bg-[var(--paper)] text-[var(--ink)] shadow-[8px_8px_0_rgba(255,255,255,.12)] ${cancelled ? 'opacity-65' : ''
                        } ${index % 2 ? 'sm:ml-10' : 'sm:mr-10'}`}
                    >
                      {/* takik tiket */}
                      <span
                        aria-hidden="true"
                        className="absolute -left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--ink)]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -right-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--ink)]"
                      />

                      {/* blok tanggal */}
                      <div
                        className={`flex w-24 shrink-0 flex-col items-center justify-center px-2 py-6 text-center sm:w-32 ${upcoming
                          ? 'bg-[var(--pink)] text-white'
                          : 'bg-[var(--lilac)] text-[var(--ink)]'
                          }`}
                      >
                        <span className="ip-display text-4xl font-black leading-none sm:text-5xl">
                          {parts.day}
                        </span>
                        <span className="mt-1.5 text-sm font-bold">{parts.month}</span>
                        <span className="text-xs opacity-75">{parts.year}</span>
                      </div>

                      {/* garis putus-putus */}
                      <div
                        aria-hidden="true"
                        className="my-5 w-0 shrink-0 border-l-2 border-dashed border-[var(--ink)]/25"
                      />

                      {/* info */}
                      <div className="min-w-0 flex-1 px-5 py-5 sm:px-7">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-bold text-white">
                            {activity.type}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${upcoming
                              ? 'bg-[var(--pink)]/15 text-[var(--pink)]'
                              : cancelled
                                ? 'bg-red-100 text-red-600'
                                : 'bg-[var(--cyan)]/30 text-[var(--ink)]'
                              }`}
                          >
                            {activity.status}
                          </span>
                        </div>

                        <h3
                          className={`mt-3 break-words text-lg font-bold tracking-[-0.02em] sm:text-2xl ${cancelled ? 'line-through decoration-2' : ''
                            }`}
                        >
                          {activity.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--ink)]/65">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                            {formatDate(activity.date)}
                          </span>
                          {activity.location && (
                            <span className="flex min-w-0 items-center gap-1.5">
                              <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                              <span className="break-words">{activity.location}</span>
                            </span>
                          )}
                        </div>

                        {activity.description && (
                          <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-[var(--ink)]/60">
                            {activity.description}
                          </p>
                        )}
                      </div>

                      {activity.image_url && (
                        <div className="hidden w-40 shrink-0 md:block">
                          <img
                            src={activity.image_url}
                            alt={`${activity.title} event`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </article>
                  </Tilt>
                )
              })}
            </div>
          ) : (
            <Empty text="No activities yet." dark />
          )}
        </div>
      </section>

      {/* =====================================================
          NAVIGASI BAWAH
      ===================================================== */}
      <section
        aria-label="Continue exploring"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Tilt max={5}>
            <Link
              to="/idol/groups"
              className="ip-focus group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--ink)] p-8 text-white"
            >
              <ChevronLeft
                aria-hidden="true"
                className="h-9 w-9 text-[var(--lemon)] transition-transform group-hover:-translate-x-2"
              />
              <div className="relative z-10">
                <p className="text-sm text-white/60">Directory</p>
                <p className="ip-display mt-1 text-2xl font-black">All groups</p>
              </div>
              <Star
                className="absolute -right-4 -top-4 h-28 w-28 text-white/10"
                style={{ animation: 'ip-spin 20s linear infinite' }}
              />
            </Link>
          </Tilt>

          <Tilt max={5}>
            <Link
              to="/idol/members"
              className="ip-focus group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--pink)] p-8 text-white"
            >
              <ChevronRight
                aria-hidden="true"
                className="ml-auto h-9 w-9 transition-transform group-hover:translate-x-2"
              />
              <div className="relative z-10">
                <p className="text-sm text-white/80">Continue</p>
                <p className="ip-display mt-1 text-2xl font-black">Meet the artists</p>
              </div>
              <div
                aria-hidden="true"
                className="absolute -left-10 -top-10 h-44 w-44 rounded-full border-[24px] border-white/25 transition duration-700 group-hover:rotate-45 group-hover:scale-110"
              />
            </Link>
          </Tilt>
        </div>
      </section>
    </main>
  )
}