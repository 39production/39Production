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
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

const SITE_NAME = '39Production'
const SITE_URL = 'https://39production.github.io/39Production/'
const EVENTS_PATH = '/idol/events'

interface IdolActivity {
  id: number
  group_id: number
  group_name?: string
  title: string
  type: 'Concert' | 'Fan Meeting' | 'Event' | 'Schedule'
  date: string
  location: string
  description: string
  image_url: string
  status: 'Upcoming' | 'Completed' | 'Cancelled'
}

type EventFilter = 'All' | IdolActivity['type']

const TYPE_STYLE: Record<IdolActivity['type'], string> = {
  Concert: 'bg-[var(--pink)] text-white',
  'Fan Meeting': 'bg-[var(--cyan)] text-[var(--ink)]',
  Event: 'bg-[var(--lemon)] text-[var(--ink)]',
  Schedule: 'bg-[var(--lilac)] text-[var(--ink)]',
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

function formatShort(date: string) {
  if (!date) return '-'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function getDateParts(date: string) {
  const parsed = new Date(date)

  if (!date || Number.isNaN(parsed.getTime())) {
    return { day: '--', month: '---', year: '----' }
  }

  return {
    day: new Intl.DateTimeFormat('id-ID', { day: '2-digit' }).format(parsed),
    month: new Intl.DateTimeFormat('id-ID', { month: 'short' })
      .format(parsed)
      .replace('.', '')
      .toUpperCase(),
    year: new Intl.DateTimeFormat('id-ID', { year: 'numeric' }).format(parsed),
  }
}

function getEventTime(date: string) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return ''

  if (
    parsed.getHours() === 0 &&
    parsed.getMinutes() === 0 &&
    parsed.getSeconds() === 0
  ) {
    return ''
  }

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

function getMonthGroup(date: string) {
  const parsed = new Date(date)

  if (!date || Number.isNaN(parsed.getTime())) {
    return { key: 'unknown', label: 'Date to be announced' }
  }

  return {
    key: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`,
    label: new Intl.DateTimeFormat('id-ID', {
      month: 'long',
      year: 'numeric',
    }).format(parsed),
  }
}

function daysUntilLabel(date: string) {
  const parsed = new Date(date)

  if (!date || Number.isNaN(parsed.getTime())) return ''

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const target = new Date(parsed)
  target.setHours(0, 0, 0, 0)

  const diff = Math.round((target.getTime() - start.getTime()) / 86400000)

  if (diff < 0) return ''
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

function byDateAsc(a: IdolActivity, b: IdolActivity) {
  return new Date(a.date).getTime() - new Date(b.date).getTime()
}

function byDateDesc(a: IdolActivity, b: IdolActivity) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

/* ============================================================
   SEO
============================================================ */

function useEventsSEO(activities: IdolActivity[]) {
  useEffect(() => {
    const title = 'Idol Events & Activities | 39Production Entertainment'

    const description =
      'Discover upcoming concerts, fan meetings, events, schedules, and past activities from 39Production entertainment artists and idol groups.'

    const canonicalUrl = `${SITE_URL.replace(/\/$/, '')}${EVENTS_PATH}`

    document.title = title

    const setMeta = (
      attribute: 'name' | 'property',
      key: string,
      content: string,
    ) => {
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

    const setLink = (rel: string, href: string) => {
      let element = document.head.querySelector<HTMLLinkElement>(
        `link[rel="${rel}"]`,
      )

      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }

      element.setAttribute('href', href)

      return element
    }

    setMeta('name', 'description', description)
    setMeta(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )
    setMeta('name', 'author', SITE_NAME)

    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'id_ID')

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)

    setLink('canonical', canonicalUrl)

    document.head
      .querySelector<HTMLScriptElement>('script[data-seo="idol-events"]')
      ?.remove()

    const upcomingEvents = activities
      .filter((activity) => activity.status === 'Upcoming')
      .sort(byDateAsc)

    const itemList = upcomingEvents.map((activity, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: activity.title,
      url: `${SITE_URL.replace(/\/$/, '')}/idol/groups/${activity.group_id}`,
    }))

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonicalUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: {
        '@type': 'Thing',
        name: '39Production Idol Events',
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: itemList,
      },
    }

    const script = document.createElement('script')

    script.type = 'application/ld+json'
    script.dataset.seo = 'idol-events'
    script.textContent = JSON.stringify(schema)

    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [activities])
}

/* ============================================================
   COUNTDOWN
============================================================ */

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [target])

  if (!target) return null

  const ms = new Date(target).getTime() - now

  if (Number.isNaN(ms)) return null

  const diff = Math.max(0, ms)

  return {
    over: ms <= 0,
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
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
@keyframes ip-bob{
  0%,100%{transform:translate3d(0,0,var(--z,0px)) rotateY(var(--ry,0deg)) rotateX(var(--rx,0deg))}
  50%{transform:translate3d(0,-14px,var(--z,0px)) rotateY(calc(var(--ry,0deg) + 4deg)) rotateX(var(--rx,0deg))}
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
@keyframes ip-tick{
  from{opacity:0;transform:translateY(-60%) rotateX(80deg)}
  to{opacity:1;transform:none}
}
@keyframes ip-blink{
  0%,100%{opacity:1}
  50%{opacity:.25}
}
@keyframes ip-pageflip{
  0%,15%{transform:rotateX(0deg);opacity:1}
  55%{transform:rotateX(-172deg);opacity:1}
  56%,100%{transform:rotateX(-172deg);opacity:0}
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
.ip-backface{backface-visibility:hidden;-webkit-backface-visibility:hidden}

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

function StageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 50% at 72% 55%, rgba(255,61,154,.3), transparent 70%), radial-gradient(35% 35% at 5% 90%, rgba(61,224,255,.2), transparent 70%)',
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

function Orbit({ size, className = '' }: { size: number; className?: string }) {
  const colors = ['var(--pink)', 'var(--cyan)', 'var(--lemon)', 'var(--lilac)', 'white']

  return (
    <div
      aria-hidden="true"
      className={`ip-3d pointer-events-none absolute ${className}`}
      style={{ width: size, height: size, transform: 'rotateX(72deg)' }}
    >
      <div className="ip-3d absolute inset-0" style={{ animation: 'ip-spin 18s linear infinite' }}>
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

function EventImage({
  activity,
  className = '',
  eager = false,
}: {
  activity?: IdolActivity | null
  className?: string
  eager?: boolean
}) {
  if (activity?.image_url) {
    return (
      <img
        src={activity.image_url}
        alt={activity.title}
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
      <Calendar aria-hidden="true" className="h-1/4 w-1/4 text-white/80" />
    </div>
  )
}

function DigitTile({
  value,
  label,
  tick = false,
}: {
  value: number
  label: string
  tick?: boolean
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur sm:px-4">
      <div style={{ perspective: 400 }}>
        <span
          key={tick ? value : 'static'}
          className="ip-display block text-3xl font-black tabular-nums sm:text-4xl"
          style={tick ? { animation: 'ip-tick .45s cubic-bezier(.2,.8,.2,1) both' } : undefined}
        >
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1 block text-[11px] font-semibold text-white/60">{label}</span>
    </div>
  )
}

function SectionTitle({
  id,
  title,
  note,
}: {
  id: string
  title: string
  note: string
}) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="ip-display text-3xl font-black leading-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-3 max-w-md text-base leading-7 text-[var(--ink)]/65">{note}</p>
    </div>
  )
}

/** Kartu event mendatang */
function UpcomingCard({ activity, offset }: { activity: IdolActivity; offset: boolean }) {
  const parts = getDateParts(activity.date)
  const time = getEventTime(activity.date)
  const until = daysUntilLabel(activity.date)

  return (
    <article className={offset ? 'lg:translate-y-12' : ''}>
      <Tilt max={5}>
        <div className="group overflow-hidden rounded-[32px] border-[3px] border-[var(--ink)] bg-white shadow-[8px_8px_0_var(--ink)] transition-shadow hover:shadow-[12px_12px_0_var(--pink)]">
          <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ink)]">
            <EventImage activity={activity} />

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-transparent to-transparent"
            />

            <span
              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${TYPE_STYLE[activity.type]}`}
            >
              {activity.type}
            </span>

            {until && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--ink)]">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-[var(--pink)]"
                  style={{ animation: 'ip-blink 1.4s ease-in-out infinite' }}
                />
                {until}
              </span>
            )}

            {/* stiker tanggal */}
            <div
              className="absolute bottom-4 left-4 -rotate-6 rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--lemon)] px-4 py-2 text-center text-[var(--ink)] shadow-[4px_4px_0_var(--ink)] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105"
            >
              <span className="ip-display block text-3xl font-black leading-none">
                {parts.day}
              </span>
              <span className="mt-0.5 block text-xs font-bold">
                {parts.month} {parts.year}
              </span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="ip-display break-words text-xl font-black leading-tight sm:text-2xl">
              {activity.title}
            </h3>

            {activity.group_name && (
              <Link
                to={`/idol/groups/${activity.group_id}`}
                className="ip-focus mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--pink)] hover:underline"
              >
                {activity.group_name}
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}

            <div className="mt-4 space-y-1.5 text-sm text-[var(--ink)]/65">
              <p className="flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--ink)]/40" />
                {formatDate(activity.date)}
              </p>
              {time && (
                <p className="flex items-center gap-2">
                  <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--ink)]/40" />
                  {time}
                </p>
              )}
              {activity.location && (
                <p className="flex items-start gap-2">
                  <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink)]/40" />
                  <span className="break-words">{activity.location}</span>
                </p>
              )}
            </div>

            {activity.description && (
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--ink)]/60">
                {activity.description}
              </p>
            )}
          </div>
        </div>
      </Tilt>
    </article>
  )
}

/** Kartu arsip bergaya polaroid */
function Polaroid({ activity, index }: { activity: IdolActivity; index: number }) {
  const tilts = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2']
  const cancelled = activity.status === 'Cancelled'

  return (
    <article className={`${tilts[index % tilts.length]} transition-transform duration-300 hover:z-10 hover:rotate-0`}>
      <Tilt max={7}>
        <div className="group rounded-2xl border-[3px] border-[var(--ink)] bg-white p-3 pb-5 shadow-[6px_6px_0_var(--ink)]">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--ink)]">
            <span className="block h-full w-full grayscale transition duration-500 group-hover:grayscale-0">
              <EventImage activity={activity} />
            </span>

            <span
              className={`absolute right-2 top-2 rotate-6 rounded-md border-2 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide ${cancelled
                  ? 'border-red-500 bg-white text-red-500'
                  : 'border-[var(--ink)] bg-[var(--cyan)] text-[var(--ink)]'
                }`}
            >
              {activity.status}
            </span>

            <span
              className={`absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TYPE_STYLE[activity.type]}`}
            >
              {activity.type}
            </span>
          </div>

          <div className="px-1 pt-4">
            <h3
              className={`line-clamp-2 text-base font-bold leading-snug tracking-[-0.02em] ${cancelled ? 'line-through decoration-2' : ''
                }`}
            >
              {activity.title}
            </h3>

            <p className="mt-1.5 text-xs text-[var(--ink)]/55">{formatShort(activity.date)}</p>

            {activity.group_name && (
              <Link
                to={`/idol/groups/${activity.group_id}`}
                className="ip-focus mt-1 inline-block max-w-full truncate text-xs font-bold text-[var(--pink)] hover:underline"
              >
                {activity.group_name}
              </Link>
            )}

            {activity.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink)]/50">
                <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                <span className="truncate">{activity.location}</span>
              </p>
            )}
          </div>
        </div>
      </Tilt>
    </article>
  )
}

/* ============================================================
   PAGE
============================================================ */

export function IdolEventsPage() {
  const [activities, setActivities] = useState<IdolActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<EventFilter>('All')

  const sceneRef = useRef<HTMLDivElement>(null)

  useEventsSEO(activities)

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
    const loadActivities = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolActivity[]>('/api/idol/activities')

        setActivities(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat events.')
      } finally {
        setLoading(false)
      }
    }

    void loadActivities()
  }, [])

  /* ---------- Derived ---------- */
  const filteredActivities = useMemo(
    () => (filter === 'All' ? activities : activities.filter((a) => a.type === filter)),
    [activities, filter],
  )

  const upcoming = useMemo(
    () => filteredActivities.filter((a) => a.status === 'Upcoming').sort(byDateAsc),
    [filteredActivities],
  )

  const past = useMemo(
    () =>
      filteredActivities
        .filter((a) => a.status === 'Completed' || a.status === 'Cancelled')
        .sort(byDateDesc),
    [filteredActivities],
  )

  const monthGroups = useMemo(() => {
    const map = new Map<string, { label: string; items: IdolActivity[] }>()

    upcoming.forEach((activity) => {
      const { key, label } = getMonthGroup(activity.date)
      if (!map.has(key)) map.set(key, { label, items: [] })
      map.get(key)!.items.push(activity)
    })

    return Array.from(map.entries())
  }, [upcoming])

  const totalUpcoming = activities.filter((a) => a.status === 'Upcoming').length
  const totalCompleted = activities.filter((a) => a.status === 'Completed').length
  const totalGroups = new Set(activities.map((a) => a.group_id).filter(Boolean)).size

  const nextEvent = useMemo(
    () => activities.filter((a) => a.status === 'Upcoming').sort(byDateAsc)[0] ?? null,
    [activities],
  )

  const heroEvent = useMemo(
    () => nextEvent ?? [...activities].sort(byDateDesc)[0] ?? null,
    [nextEvent, activities],
  )

  const countdown = useCountdown(nextEvent?.date)

  const marqueeRow = useMemo(() => {
    let row = ['Concerts', 'Fan meetings', 'Special events', 'Schedules']
    while (row.length < 8) row = [...row, ...row]
    return row
  }, [])

  const filters: EventFilter[] = ['All', 'Concert', 'Fan Meeting', 'Event', 'Schedule']

  const countFor = (f: EventFilter) =>
    f === 'All' ? activities.length : activities.filter((a) => a.type === f).length

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

  const heroParts = heroEvent ? getDateParts(heroEvent.date) : null

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <main className="ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
      <style>{PAGE_CSS}</style>

      {/* =====================================================
          HERO — tiket 3D + countdown
      ===================================================== */}
      <section
        aria-labelledby="events-title"
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
        className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
      >
        <StageBackdrop />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8">
          {/* Kiri */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-3 pr-4 text-sm font-medium backdrop-blur">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[var(--pink)]"
                style={{ animation: 'ip-blink 1.4s ease-in-out infinite' }}
              />
              Live schedule
            </div>

            <h1
              id="events-title"
              className="ip-display mt-6 text-[clamp(2.4rem,6.4vw,5.4rem)] font-black leading-[0.98]"
              style={{ perspective: 800 }}
            >
              <span className="ip-line" style={{ animationDelay: '.1s' }}>
                Moments worth
              </span>
              <span
                className="ip-line bg-gradient-to-r from-[var(--pink)] via-[var(--lilac)] to-[var(--cyan)] bg-clip-text text-transparent"
                style={{ animationDelay: '.25s' }}
              >
                showing up for.
              </span>
            </h1>

            <p
              className="mt-6 max-w-md text-base leading-7 text-white/75 sm:text-lg"
              style={{ animation: 'ip-pop .8s .6s cubic-bezier(.2,.8,.2,1) both' }}
            >
              Follow upcoming performances, fan meetings, and special events
              from the 39Production roster.
            </p>

            {/* Countdown */}
            {countdown && nextEvent && !countdown.over && (
              <div
                className="mt-8 max-w-md"
                style={{ animation: 'ip-pop .8s .75s cubic-bezier(.2,.8,.2,1) both' }}
              >
                <p className="mb-3 text-sm font-semibold text-white/70">
                  Next show starts in
                </p>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  <DigitTile value={countdown.d} label="Days" />
                  <DigitTile value={countdown.h} label="Hours" />
                  <DigitTile value={countdown.m} label="Minutes" />
                  <DigitTile value={countdown.s} label="Seconds" tick />
                </div>
              </div>
            )}

            {!loading && !error && activities.length > 0 && (
              <dl
                className="mt-7 flex flex-wrap gap-3"
                style={{ animation: 'ip-pop .8s .9s cubic-bezier(.2,.8,.2,1) both' }}
              >
                {[
                  ['Upcoming', totalUpcoming, 'bg-[var(--lemon)] text-[var(--ink)]'],
                  ['Completed', totalCompleted, 'bg-white/10'],
                  ['Groups', totalGroups, 'bg-white/10'],
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

          {/* Kanan: tiket 3D */}
          <div
            className="relative mx-auto h-[440px] w-full max-w-[460px] sm:h-[520px]"
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
                    'rotateY(calc(var(--mx) * 14deg)) rotateX(calc(var(--my) * -10deg))',
                } as CSSProperties
              }
            >
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[75%] w-[75%] rounded-full bg-[var(--pink)] opacity-45 blur-[100px]"
                style={{
                  transform: 'translate3d(-50%,-50%,-220px)',
                  animation: 'ip-pulse 6s ease-in-out infinite',
                }}
              />

              <Orbit
                size={420}
                className="left-1/2 top-1/2 -ml-[210px] -mt-[210px] hidden sm:block"
              />

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center gap-3 text-white/70">
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-[var(--pink)]" />
                  Loading events…
                </div>
              )}

              {!loading && (
                <div
                  className="absolute left-[8%] top-[4%] w-[78%]"
                  style={
                    {
                      '--z': '90px',
                      '--ry': '-12deg',
                      '--rx': '4deg',
                      transform: 'translateZ(90px) rotateY(-12deg) rotateX(4deg)',
                      animation: 'ip-bob 7s ease-in-out infinite',
                    } as CSSProperties
                  }
                >
                  <HoloCard
                    max={12}
                    always
                    className="aspect-[3/4] w-full rounded-[28px] border-[5px] border-white bg-[var(--ink-2)] shadow-[0_50px_90px_-20px_rgba(0,0,0,.8),0_0_70px_rgba(255,61,154,.45)]"
                  >
                    <EventImage activity={heroEvent} eager />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/10 to-transparent"
                    />

                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--lemon)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
                      <Sparkles aria-hidden="true" className="h-3 w-3" />
                      {nextEvent ? 'Next up' : heroEvent ? 'Latest event' : 'Coming soon'}
                    </span>

                    {heroEvent && (
                      <span className="absolute inset-x-0 bottom-0 block p-5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TYPE_STYLE[heroEvent.type]}`}
                        >
                          {heroEvent.type}
                        </span>
                        <span className="ip-display mt-2 block text-xl font-black leading-tight">
                          {heroEvent.title}
                        </span>
                        {heroEvent.location && (
                          <span className="mt-1.5 flex items-center gap-1.5 text-xs text-white/75">
                            <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                            <span className="truncate">{heroEvent.location}</span>
                          </span>
                        )}
                      </span>
                    )}
                  </HoloCard>
                </div>
              )}

              {/* stiker tanggal melayang */}
              {!loading && heroParts && (
                <div
                  className="absolute bottom-[8%] right-[0%] rotate-6 rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--lemon)] px-5 py-3 text-center text-[var(--ink)] shadow-[5px_5px_0_var(--ink)]"
                  style={
                    {
                      '--z': '200px',
                      '--r': '6deg',
                      animation: 'ip-float 5.5s ease-in-out infinite',
                    } as CSSProperties
                  }
                >
                  <span className="ip-display block text-4xl font-black leading-none">
                    {heroParts.day}
                  </span>
                  <span className="mt-1 block text-xs font-bold">
                    {heroParts.month} {heroParts.year}
                  </span>
                </div>
              )}

              <Star
                className="absolute left-[0%] top-[2%] h-12 w-12 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
                style={{ '--z': '230px', '--r': '0deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
              />
              <Star
                className="absolute bottom-[26%] left-[-2%] h-8 w-8 text-[var(--cyan)]"
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
        className="relative z-10 -mt-6 rotate-[1.4deg] overflow-hidden border-y-4 border-[var(--ink)] bg-[var(--lemon)] py-4 text-[var(--ink)]"
      >
        <div
          className="flex w-max items-center gap-8 whitespace-nowrap"
          style={{ animation: 'ip-marquee 40s linear infinite reverse' }}
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

      {/* =====================================================
          FILTER + DAFTAR
      ===================================================== */}
      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-24 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="ip-display text-3xl font-black leading-tight sm:text-5xl">
            Mark your calendar.
          </h2>

          <div
            role="group"
            aria-label="Filter events"
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0"
          >
            {filters.map((item) => {
              const on = filter === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={on}
                  className={`ip-focus inline-flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition ${on
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-white shadow-[4px_4px_0_var(--pink)]'
                      : 'border-[var(--ink)]/15 bg-white text-[var(--ink)]/70 hover:border-[var(--ink)] hover:text-[var(--ink)]'
                    }`}
                >
                  {item}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${on ? 'bg-white/20' : 'bg-[var(--ink)]/10'
                      }`}
                  >
                    {countFor(item)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* loading */}
        {loading && (
          <div className="flex min-h-[260px] items-center justify-center gap-3 text-[var(--ink)]/60">
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-[var(--pink)]" />
            Loading events…
          </div>
        )}

        {/* error */}
        {!loading && error && (
          <div className="mt-12 rounded-[28px] border-2 border-red-300 bg-red-50 p-8">
            <p className="font-bold text-red-700">Request failed</p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* kosong */}
        {!loading && !error && activities.length === 0 && (
          <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
            <CalendarDays aria-hidden="true" className="mx-auto h-10 w-10 text-[var(--pink)]" />
            <p className="mt-4 font-semibold">No events yet.</p>
            <p className="mt-1 text-sm text-[var(--ink)]/60">
              Upcoming performances and activities will appear here.
            </p>
          </div>
        )}

        {/* filter kosong */}
        {!loading && !error && activities.length > 0 && filteredActivities.length === 0 && (
          <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
            <Sparkles aria-hidden="true" className="mx-auto h-9 w-9 text-[var(--pink)]" />
            <p className="mt-4 font-semibold">No events for this filter.</p>
            <button
              type="button"
              onClick={() => setFilter('All')}
              className="ip-focus mt-4 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--pink)]"
            >
              Show all events
            </button>
          </div>
        )}

        {/* UPCOMING — per bulan */}
        {!loading && !error && upcoming.length > 0 && (
          <section aria-labelledby="upcoming-title" className="mt-16">
            <SectionTitle
              id="upcoming-title"
              title="Coming up."
              note="The next moments on the entertainment calendar."
            />

            <div className="mt-14 space-y-20">
              {monthGroups.map(([key, group]) => (
                <div key={key}>
                  <p
                    aria-hidden="true"
                    className="ip-display ip-outline mb-8 select-none text-[clamp(2.4rem,8vw,6rem)] font-black capitalize leading-none text-[var(--ink)]/25"
                  >
                    {group.label}
                  </p>

                  <div className="grid gap-x-8 gap-y-14 pb-10 lg:grid-cols-2">
                    {group.items.map((activity, index) => (
                      <UpcomingCard
                        key={activity.id}
                        activity={activity}
                        offset={index % 2 === 1}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* =====================================================
          ARSIP — polaroid
      ===================================================== */}
      {!loading && !error && past.length > 0 && (
        <section
          aria-labelledby="past-title"
          className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8"
        >
          <SectionTitle
            id="past-title"
            title="Memory lane."
            note="A record of performances, gatherings, and activities."
          />

          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-7 md:grid-cols-3 lg:grid-cols-4">
            {past.map((activity, index) => (
              <Polaroid key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          CTA — halaman kalender 3D
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

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[auto_1fr] lg:px-8">
          {/* kalender */}
          <div
            aria-hidden="true"
            className="mx-auto h-[260px] w-[220px] sm:h-[320px] sm:w-[270px]"
            style={{ perspective: 1100 }}
          >
            <div
              className="ip-3d relative h-full w-full"
              style={{ transform: 'rotateY(-22deg) rotateX(10deg)' }}
            >
              {/* dasar */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-4 border-white bg-[var(--paper)] text-[var(--ink)] shadow-[0_0_60px_rgba(255,61,154,.45)]">
                <span className="absolute inset-x-0 top-0 h-12 rounded-t-[20px] bg-[var(--pink)]" />
                <span className="ip-display mt-8 text-7xl font-black sm:text-8xl">
                  {heroParts?.day && heroParts.day !== '--' ? heroParts.day : '39'}
                </span>
                <span className="mt-1 text-sm font-bold text-[var(--ink)]/60">
                  {heroParts?.month && heroParts.month !== '---' ? heroParts.month : 'SAVE THE DATE'}
                </span>
              </div>

              {/* halaman yang terbalik */}
              {[0, 1.6].map((delay, i) => (
                <div
                  key={i}
                  className="ip-backface absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-4 border-white bg-[var(--lemon)] text-[var(--ink)]"
                  style={{
                    transformOrigin: '50% 0%',
                    transform: `translateZ(${(i + 1) * 6}px)`,
                    animation: `ip-pageflip 4.8s ease-in-out ${delay}s infinite`,
                  }}
                >
                  <span className="absolute inset-x-0 top-0 h-12 rounded-t-[20px] bg-[var(--cyan)]" />
                  <Star className="mt-8 h-24 w-24 text-[var(--pink)]" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="ip-display max-w-xl text-4xl font-black leading-[1.05] sm:text-6xl">
              Keep the date. We'll handle the story.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
              Every date is a chance to turn an ordinary schedule into a
              memorable moment.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/idol/groups"
                className="ip-focus group inline-flex items-center gap-3 rounded-full bg-[var(--lemon)] px-7 py-4 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Explore groups
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
    </main>
  )
}