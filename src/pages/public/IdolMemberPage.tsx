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
  Loader2,
  Mail,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

/* ============================================================
   CONFIG
============================================================ */

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

interface IdolMember {
  id: number
  name: string
  stage_name: string
  position: string
  birth_date: string
  email: string
  bio: string
  image_url: string
  status: 'Active' | 'Inactive'
  group_id?: number
  group_name?: string
  group_image_url?: string
}

type MemberFilter = 'All' | 'Active' | 'Inactive'

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

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/* ============================================================
   SEO
============================================================ */

function setMeta(
  name: string,
  content: string,
  attribute: 'name' | 'property' = 'name',
) {
  let element = document.head.querySelector(
    `meta[${attribute}="${name}"]`,
  ) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
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

  canonical.href = url
}

function setJsonLd(data: Record<string, unknown>) {
  const existing = document.head.querySelector(
    'script[data-39production-seo="idol-member"]',
  )

  if (existing) existing.remove()

  const script = document.createElement('script')

  script.type = 'application/ld+json'
  script.setAttribute('data-39production-seo', 'idol-member')
  script.textContent = JSON.stringify(data)

  document.head.appendChild(script)

  return () => {
    script.remove()
  }
}

function useMemberSeo(member: IdolMember | null, isDirectory: boolean) {
  useEffect(() => {
    const siteName = '39Production'
    const origin = window.location.origin

    if (isDirectory) {
      const title = `Idol Members | ${siteName}`
      const description =
        'Explore the artists and performers shaping the 39Production entertainment roster.'

      document.title = title

      setMeta('description', description)
      setMeta('robots', 'index, follow, max-image-preview:large')

      setMeta('og:title', title, 'property')
      setMeta('og:description', description, 'property')
      setMeta('og:type', 'website', 'property')
      setMeta('og:url', `${origin}/idol/members`, 'property')
      setMeta('og:site_name', siteName, 'property')

      setMeta('twitter:card', 'summary_large_image')
      setMeta('twitter:title', title)
      setMeta('twitter:description', description)

      setCanonical(`${origin}/idol/members`)

      return setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: `${origin}/idol/members`,
        isPartOf: {
          '@type': 'WebSite',
          name: siteName,
          url: origin,
        },
      })
    }

    if (!member) {
      document.title = `Member | ${siteName}`

      setMeta(
        'description',
        'Artist profile from the 39Production entertainment roster.',
      )

      setMeta('robots', 'noindex, follow')

      return
    }

    const title = `${member.stage_name} | 39Production`
    const description = member.bio
      ? member.bio.slice(0, 155)
      : `${member.stage_name}, ${member.position}, artist profile from the 39Production entertainment roster.`

    const memberUrl = `${origin}/idol/members/${member.id}`

    document.title = title

    setMeta('description', description)
    setMeta('robots', 'index, follow, max-image-preview:large')

    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:type', 'profile', 'property')
    setMeta('og:url', memberUrl, 'property')
    setMeta('og:site_name', siteName, 'property')

    if (member.image_url) {
      setMeta('og:image', member.image_url, 'property')
      setMeta('twitter:image', member.image_url)
    }

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)

    setCanonical(memberUrl)

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: member.stage_name,
      alternateName: member.name !== member.stage_name ? member.name : undefined,
      jobTitle: member.position,
      description: member.bio || undefined,
      image: member.image_url || undefined,
      url: memberUrl,
      worksFor: {
        '@type': 'Organization',
        name: siteName,
        url: origin,
      },
    }

    if (member.group_name) {
      jsonLd.memberOf = {
        '@type': 'Organization',
        name: member.group_name,
        ...(member.group_id
          ? { url: `${origin}/idol/groups/${member.group_id}` }
          : {}),
      }
    }

    return setJsonLd(jsonLd)
  }, [member, isDirectory])
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
@keyframes ip-flip{
  to{transform:rotateY(360deg)}
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

/** Foto member dengan fallback inisial */
function Photo({
  member,
  className = '',
  eager = false,
  big = false,
}: {
  member?: IdolMember | null
  className?: string
  eager?: boolean
  big?: boolean
}) {
  if (member?.image_url) {
    return (
      <img
        src={member.image_url}
        alt={`${member.stage_name} - 39Production`}
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
      {member ? (
        <span
          className={`ip-display font-black text-white/85 ${big ? 'text-6xl' : 'text-4xl'}`}
        >
          {getInitials(member.stage_name)}
        </span>
      ) : (
        <User aria-hidden="true" className="h-1/4 w-1/4 text-white/80" />
      )}
    </div>
  )
}

/** Kartu foto bergaya photocard: tilt 3D + kilau holografik mengikuti pointer */
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

function StageBackdrop({ tint = 'pink' }: { tint?: 'pink' | 'cyan' }) {
  const main = tint === 'pink' ? 'rgba(255,61,154,.3)' : 'rgba(61,224,255,.28)'
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(50% 50% at 50% 60%, ${main}, transparent 70%), radial-gradient(35% 35% at 92% 8%, rgba(185,166,255,.22), transparent 70%)`,
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

/* ============================================================
   PAGE
============================================================ */

export function IdolMemberPage() {
  const { id } = useParams()

  const [members, setMembers] = useState<IdolMember[]>([])
  const [member, setMember] = useState<IdolMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<MemberFilter>('All')

  const sceneRef = useRef<HTMLDivElement>(null)

  useMemberSeo(member, !id)

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
          const data = await apiRequest<IdolMember>(`/api/idol/members/${id}`)
          setMember(data)
        } else {
          const groups = await apiRequest<Array<{ id: number }>>('/api/idol/groups')

          const results = await Promise.all(
            groups.map((group) =>
              apiRequest<IdolMember[]>(`/api/idol/groups/${group.id}/members`),
            ),
          )

          setMembers(results.flat())
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat member.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  /* ---------- Derived ---------- */
  const filteredMembers = useMemo(
    () => (filter === 'All' ? members : members.filter((m) => m.status === filter)),
    [filter, members],
  )

  const activeCount = members.filter((m) => m.status === 'Active').length
  const inactiveCount = members.filter((m) => m.status === 'Inactive').length

  const fanMembers = useMemo(
    () => members.slice(0, 7),
    [members],
  )

  const marqueeRow = useMemo(() => {
    const names = members.map((m) => m.stage_name)
    let row = names.length
      ? names
      : ['Artists', 'Performers', 'Dancers', 'Vocalists']
    while (row.length < 8) row = [...row, ...row]
    return row
  }, [members])

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
          Loading profile…
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
          <p className="mt-3 text-sm leading-6 text-red-100/85">{error}</p>

          <Link
            to="/idol/members"
            className="ip-focus mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--pink)] hover:text-white"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back to members
          </Link>
        </div>
      </div>
    )
  }

  /* ============================================================
     DIRECTORY
  ============================================================ */
  if (!id) {
    const filters: MemberFilter[] = ['All', 'Active', 'Inactive']

    const countFor = (f: MemberFilter) =>
      f === 'All' ? members.length : f === 'Active' ? activeCount : inactiveCount

    const fan = [
      { x: '-150%', z: '0px', rz: '-18deg', ry: '25deg', d: '-1s' },
      { x: '-100%', z: '70px', rz: '-12deg', ry: '18deg', d: '-3s' },
      { x: '-50%', z: '130px', rz: '-6deg', ry: '9deg', d: '-2s' },
      { x: '0%', z: '180px', rz: '0deg', ry: '0deg', d: '0s' },
      { x: '50%', z: '130px', rz: '6deg', ry: '-9deg', d: '-4s' },
      { x: '100%', z: '70px', rz: '12deg', ry: '-18deg', d: '-2s' },
      { x: '150%', z: '0px', rz: '18deg', ry: '-25deg', d: '-5s' },
    ]

    return (
      <main className="ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
        {styleTag}

        {/* =====================================================
            HERO — kipas photocard 3D
        ===================================================== */}
        <section
          aria-labelledby="members-title"
          onPointerMove={onHeroMove}
          onPointerLeave={onHeroLeave}
          className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
        >
          <StageBackdrop />

          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-28 sm:pt-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-3 pr-4 text-sm font-medium backdrop-blur">
                <Users aria-hidden="true" className="h-4 w-4 text-[var(--pink)]" />
                39Production roster
              </div>

              <h1
                id="members-title"
                className="ip-display mt-6 text-[clamp(2.4rem,6.4vw,5.4rem)] font-black leading-[0.98]"
                style={{ perspective: 800 }}
              >
                <span className="ip-line" style={{ animationDelay: '.1s' }}>
                  The people behind
                </span>
                <span
                  className="ip-line bg-gradient-to-r from-[var(--pink)] via-[var(--lilac)] to-[var(--cyan)] bg-clip-text text-transparent"
                  style={{ animationDelay: '.25s' }}
                >
                  the stories.
                </span>
              </h1>

              <p
                className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/75 sm:text-lg"
                style={{ animation: 'ip-pop .8s .6s cubic-bezier(.2,.8,.2,1) both' }}
              >
                Meet the artists and performers shaping the 39Production
                entertainment roster.
              </p>

              {members.length > 0 && (
                <dl
                  className="mt-7 flex flex-wrap justify-center gap-3"
                  style={{ animation: 'ip-pop .8s .75s cubic-bezier(.2,.8,.2,1) both' }}
                >
                  {[
                    ['Members', members.length, 'bg-white/10'],
                    ['Active', activeCount, 'bg-[var(--lemon)] text-[var(--ink)]'],
                    ['Inactive', inactiveCount, 'bg-white/10'],
                  ].map(([label, value, cls]) => (
                    <div
                      key={label as string}
                      className={`rounded-2xl px-5 py-2.5 backdrop-blur ${cls}`}
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

            {/* Kipas kartu */}
            <div
              className="relative mx-auto mt-12 h-[300px] w-full max-w-4xl sm:h-[440px]"
              style={{ perspective: 1400 }}>
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
                  className="absolute left-1/2 top-1/2 h-[70%] w-[60%] rounded-full bg-[var(--pink)] opacity-40 blur-[100px]"
                  style={{
                    transform: 'translate3d(-50%,-50%,-220px)',
                    animation: 'ip-pulse 6s ease-in-out infinite',
                  }}
                />

                {fan.map((f, i) => {
                  const m = fanMembers[i]
                  const inner = (
                    <HoloCard
                      max={10}
                      className="aspect-[3/4] w-full rounded-2xl border-4 border-white bg-[var(--ink-2)] shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)]"
                    >
                      <Photo member={m} eager />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-transparent to-transparent"
                      />
                      {m && (
                        <span className="ip-display absolute inset-x-2 bottom-2 truncate text-[11px] font-bold text-white sm:inset-x-3 sm:bottom-3 sm:text-sm">
                          {m.stage_name}
                        </span>
                      )}
                    </HoloCard>
                  )

                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-[6%] -ml-[15%] w-[30%] sm:-ml-[11%] sm:w-[22%]"
                      style={
                        {
                          '--x': f.x,
                          '--z': f.z,
                          '--rz': f.rz,
                          '--ry': f.ry,
                          transform: `translate3d(${f.x},0,${f.z}) rotateZ(${f.rz}) rotateY(${f.ry})`,
                          animation: `ip-fan ${6 + i}s ease-in-out ${f.d} infinite`,
                        } as CSSProperties
                      }
                    >
                      {m ? (
                        <Link
                          to={`/idol/members/${m.id}`}
                          aria-label={`View ${m.stage_name}`}
                          className="ip-focus block rounded-2xl"
                        >
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </div>
                  )
                })}

                <Star
                  className="absolute left-[4%] top-[2%] h-12 w-12 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
                  style={{ '--z': '230px', '--r': '0deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
                />
                <Star
                  className="absolute right-[6%] top-[10%] h-8 w-8 text-[var(--cyan)]"
                  style={{ '--z': '200px', '--r': '20deg', animation: 'ip-float 6.5s ease-in-out -2s infinite' } as CSSProperties}
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-[4%] right-[4%] h-20 w-20 rounded-full border-[8px] border-[var(--pink)] shadow-[0_0_26px_var(--pink)] sm:h-28 sm:w-28"
                  style={{
                    transform: 'translateZ(160px) rotateX(65deg)',
                    animation: 'ip-spin 14s linear infinite',
                  }}
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
            ROSTER
        ===================================================== */}
        <section
          aria-labelledby="roster-title"
          className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2
              id="roster-title"
              className="ip-display text-3xl font-black leading-tight sm:text-5xl"
            >
              Find your Favorite.
            </h2>

            <div
              role="group"
              aria-label="Filter members"
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

          {filteredMembers.length === 0 ? (
            <div className="mt-12 rounded-[32px] border-2 border-dashed border-[var(--ink)]/20 bg-white p-12 text-center">
              <User aria-hidden="true" className="mx-auto h-10 w-10 text-[var(--pink)]" />
              <p className="mt-4 font-semibold">No members here yet.</p>
              <p className="mt-1 text-sm text-[var(--ink)]/60">
                Idol members will appear on this page.
              </p>
              {filter !== 'All' && (
                <button
                  type="button"
                  onClick={() => setFilter('All')}
                  className="ip-focus mt-4 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--pink)]"
                >
                  Show all members
                </button>
              )}
            </div>
          ) : (
            <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 pb-10 sm:gap-x-7 md:grid-cols-3 lg:grid-cols-4">
              {filteredMembers.map((item, index) => {
                const active = item.status === 'Active'

                return (
                  <div
                    key={item.id}
                    className={index % 2 ? 'sm:translate-y-10' : ''}
                  >
                    <Link
                      to={`/idol/members/${item.id}`}
                      aria-label={`View ${item.stage_name}`}
                      className="ip-focus group block rounded-3xl"
                    >
                      <HoloCard
                        max={10}
                        className="aspect-[3/4] rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--ink)] shadow-[7px_7px_0_var(--ink)] group-hover:shadow-[10px_10px_0_var(--pink)]"
                      >
                        <span className={`block h-full w-full ${active ? '' : 'saturate-[.55]'}`}>
                          <Photo member={item} />
                        </span>

                        <span
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/10 to-transparent"
                        />

                        <span
                          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${active
                            ? 'bg-[var(--cyan)] text-[var(--ink)]'
                            : 'bg-white/80 text-[var(--ink)]/70'
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[var(--ink)]' : 'bg-[var(--ink)]/40'
                              }`}
                          />
                          {item.status}
                        </span>

                        <span className="absolute inset-x-3 bottom-3 block sm:inset-x-4 sm:bottom-4">
                          <span className="inline-block max-w-full truncate rounded-full bg-[var(--lemon)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink)]">
                            {item.position}
                          </span>
                          <span className="ip-display mt-1.5 block truncate text-lg font-black leading-tight text-white sm:text-xl">
                            {item.stage_name}
                          </span>
                          {item.group_name && (
                            <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/75">
                              <Users aria-hidden="true" className="h-3 w-3 shrink-0" />
                              <span className="truncate">{item.group_name}</span>
                            </span>
                          )}
                        </span>
                      </HoloCard>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* =====================================================
            CTA — kartu berputar
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
                Every story starts with someone.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                Pick a member, then follow their group from stage to release.
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

            {/* kartu 2 sisi yang berputar */}
            <div
              aria-hidden="true"
              className="mx-auto h-[300px] w-[225px] sm:h-[360px] sm:w-[270px]"
              style={{ perspective: 1100 }}
            >
              <div
                className="ip-3d relative h-full w-full"
                style={{ animation: 'ip-flip 9s linear infinite' }}
              >
                <div className="ip-backface absolute inset-0 overflow-hidden rounded-3xl border-4 border-white shadow-[0_0_60px_rgba(255,61,154,.5)]">
                  <Photo member={members[0]} big />
                </div>
                <div
                  className="ip-backface absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-white bg-[var(--pink)]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <Star className="h-24 w-24 text-[var(--lemon)]" />
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
  if (!member) {
    return (
      <div className="ip-root relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[var(--ink)] px-6 text-center text-white">
        {styleTag}
        <StageBackdrop />
        <div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
            <User aria-hidden="true" className="h-9 w-9 text-[var(--pink)]" />
          </div>

          <h1 className="ip-display mt-6 text-2xl font-black sm:text-3xl">
            Member not found.
          </h1>
          <p className="mt-2 text-sm text-white/65">
            This profile may have been moved or removed.
          </p>

          <Link
            to="/idol/members"
            className="ip-focus mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--pink)] hover:text-white"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back to members
          </Link>
        </div>
      </div>
    )
  }

  /* ============================================================
     DETAIL — profil
  ============================================================ */
  const isActive = member.status === 'Active'
  const groupLink = member.group_id ? `/idol/groups/${member.group_id}` : '/idol/groups'

  return (
    <main className="ip-root min-h-screen overflow-x-clip bg-[var(--paper)] text-[var(--ink)]">
      {styleTag}

      {/* =====================================================
          HERO PROFIL
      ===================================================== */}
      <section
        aria-labelledby="member-name"
        className="relative isolate overflow-hidden bg-[var(--ink)] text-white"
      >
        <StageBackdrop tint="cyan" />

        {/* nama raksasa di belakang */}
        <p
          aria-hidden="true"
          className="ip-display ip-outline pointer-events-none absolute -bottom-6 left-1/2 -z-10 w-full -translate-x-1/2 select-none whitespace-nowrap text-center text-[clamp(5rem,20vw,16rem)] font-black leading-none text-white/10"
        >
          {member.stage_name}
        </p>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-28 sm:pt-32 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8">
          {/* Photocard 3D */}
          <div className="relative mx-auto w-full max-w-[340px]">
            <HoloCard
              max={16}
              always
              className="aspect-[3/4] w-full rounded-[28px] border-[5px] border-white bg-[var(--ink-2)] shadow-[0_50px_90px_-20px_rgba(0,0,0,.8),0_0_70px_rgba(255,61,154,.45)]"
            >
              <Photo member={member} eager big />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-transparent to-transparent"
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--lemon)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
                <Sparkles aria-hidden="true" className="h-3 w-3" />
                39Production artist
              </span>
            </HoloCard>

            {/* dekorasi melayang */}
            <Star
              className="absolute -right-5 -top-6 h-14 w-14 text-[var(--lemon)] drop-shadow-[0_0_18px_rgba(255,228,92,.8)]"
              style={{ '--z': '0px', '--r': '0deg', animation: 'ip-float 5s ease-in-out infinite' } as CSSProperties}
            />
            <Star
              className="absolute -left-6 bottom-[28%] h-9 w-9 text-[var(--cyan)]"
              style={{ '--z': '0px', '--r': '20deg', animation: 'ip-float 6.5s ease-in-out -2s infinite' } as CSSProperties}
            />
            <div
              aria-hidden="true"
              className="absolute -left-8 -top-8 -z-10 h-28 w-28 rounded-full border-[10px] border-[var(--pink)] shadow-[0_0_30px_var(--pink)]"
              style={{ transform: 'rotateX(65deg)', animation: 'ip-spin 14s linear infinite' }}
            />

            {/* badge putar dengan nomor artis */}
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -right-4 flex h-28 w-28 items-center justify-center rounded-full bg-[var(--cyan)] text-[var(--ink)] sm:-right-8 sm:h-32 sm:w-32"
            >
              <svg
                viewBox="0 0 120 120"
                className="absolute inset-0 h-full w-full"
                style={{ animation: 'ip-spin 16s linear infinite' }}
              >
                <defs>
                  <path id="ip-member-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                </defs>
                <text fontSize="11.5" fontWeight="800" fill="currentColor" letterSpacing="2.2">
                  <textPath href="#ip-member-circle">artist profile • artist profile • </textPath>
                </text>
              </svg>
              <span className="ip-display text-lg font-black">
                #{String(member.id).padStart(3, '0')}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="relative z-10">
            <div
              className="flex flex-wrap items-center gap-3"
              style={{ animation: 'ip-pop .7s .1s cubic-bezier(.2,.8,.2,1) both' }}
            >
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${isActive
                  ? 'bg-[var(--cyan)] text-[var(--ink)]'
                  : 'bg-white/15 text-white/80'
                  }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isActive ? 'bg-[var(--ink)]' : 'bg-white/50'
                    }`}
                />
                {member.status}
              </span>
            </div>

            <h1
              id="member-name"
              className="ip-display mt-6 break-words text-[clamp(2.6rem,7vw,5.8rem)] font-black leading-[0.98]"
              style={{ perspective: 800 }}
            >
              <span className="ip-line" style={{ animationDelay: '.15s' }}>
                {member.stage_name}
              </span>
            </h1>

            <p
              className="mt-5 inline-block rounded-full bg-[var(--lemon)] px-5 py-2 text-base font-bold text-[var(--ink)]"
              style={{ animation: 'ip-pop .7s .5s cubic-bezier(.2,.8,.2,1) both' }}
            >
              {member.position}
            </p>

            {member.name !== member.stage_name && (
              <p
                className="mt-5 text-base text-white/70"
                style={{ animation: 'ip-pop .7s .6s cubic-bezier(.2,.8,.2,1) both' }}
              >
                Legal name:{' '}
                <span className="font-semibold text-white">{member.name}</span>
              </p>
            )}

            {member.group_name && (
              <Link
                to={groupLink}
                className="ip-focus group mt-8 inline-flex max-w-full items-center gap-4 rounded-full border border-white/20 bg-white/10 py-2 pl-2 pr-6 backdrop-blur transition hover:border-[var(--pink)] hover:bg-white/15"
                style={{ animation: 'ip-pop .7s .75s cubic-bezier(.2,.8,.2,1) both' }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--ink-2)]">
                  {member.group_image_url ? (
                    <img
                      src={member.group_image_url}
                      alt={member.group_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users aria-hidden="true" className="h-5 w-5 text-[var(--pink)]" />
                  )}
                </span>

                <span className="min-w-0">
                  <span className="block text-xs text-white/60">Member of</span>
                  <span className="block truncate text-base font-bold">
                    {member.group_name}
                  </span>
                </span>

                <ChevronRight
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-[var(--pink)]"
                />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          BIO + DATA PROFIL
      ===================================================== */}
      <section
        aria-labelledby="bio-title"
        className="relative mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8"
      >
        <div className="grid gap-14 lg:grid-cols-[1fr_340px] lg:gap-20">
          <div>
            <h2
              id="bio-title"
              className="ip-display text-3xl font-black leading-tight sm:text-5xl"
            >
              About {member.stage_name}.
            </h2>

            {member.bio ? (
              <p className="mt-8 max-w-2xl whitespace-pre-line text-lg leading-8 text-[var(--ink)]/75">
                {member.bio}
              </p>
            ) : (
              <p className="mt-8 max-w-md text-base leading-7 text-[var(--ink)]/55">
                No biography has been added yet. Check back soon for the full story.
              </p>
            )}
          </div>

          {/* stiker data */}
          <div className="flex flex-col gap-5 lg:pt-3">
            <Tilt max={8}>
              <div className="-rotate-2 rounded-[28px] border-[3px] border-[var(--ink)] bg-[var(--pink)] p-5 text-white shadow-[6px_6px_0_var(--ink)]">
                <p className="text-sm font-semibold text-white/80">Position</p>
                <p className="ip-display mt-1 text-xl font-black">{member.position}</p>
              </div>
            </Tilt>

            {member.birth_date && (
              <Tilt max={8}>
                <div className="rotate-1 rounded-[28px] border-[3px] border-[var(--ink)] bg-[var(--lemon)] p-5 shadow-[6px_6px_0_var(--ink)]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]/70">
                    <CalendarDays aria-hidden="true" className="h-4 w-4" />
                    Birth date
                  </p>
                  <p className="ip-display mt-1 text-lg font-black">
                    {formatDate(member.birth_date)}
                  </p>
                </div>
              </Tilt>
            )}

            {member.email && (
              <Tilt max={8}>
                <div className="-rotate-1 rounded-[28px] border-[3px] border-[var(--ink)] bg-[var(--cyan)] p-5 shadow-[6px_6px_0_var(--ink)]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]/70">
                    <Mail aria-hidden="true" className="h-4 w-4" />
                    Contact
                  </p>
                  <a
                    href={`mailto:${member.email}`}
                    className="ip-focus mt-1 block break-all text-base font-bold underline decoration-[var(--ink)]/30 underline-offset-4 hover:decoration-[var(--ink)]"
                  >
                    {member.email}
                  </a>
                </div>
              </Tilt>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          NAVIGASI BAWAH
      ===================================================== */}
      <section
        aria-label="Continue exploring"
        className="mx-auto max-w-7xl px-6 pb-24 lg:px-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Tilt max={5}>
            <Link
              to="/idol/members"
              className="ip-focus group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--ink)] p-8 text-white"
            >
              <ChevronLeft
                aria-hidden="true"
                className="h-9 w-9 text-[var(--lemon)] transition-transform group-hover:-translate-x-2"
              />
              <div className="relative z-10">
                <p className="text-sm text-white/60">Directory</p>
                <p className="ip-display mt-1 text-2xl font-black">All members</p>
              </div>
              <Star
                className="absolute -right-4 -top-4 h-28 w-28 text-white/10"
                style={{ animation: 'ip-spin 20s linear infinite' }}
              />
            </Link>
          </Tilt>

          <Tilt max={5}>
            <Link
              to={groupLink}
              className="ip-focus group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[36px] bg-[var(--pink)] p-8 text-white"
            >
              <ChevronRight
                aria-hidden="true"
                className="ml-auto h-9 w-9 transition-transform group-hover:translate-x-2"
              />
              <div className="relative z-10">
                <p className="text-sm text-white/80">Continue</p>
                <p className="ip-display mt-1 truncate text-2xl font-black">
                  {member.group_name || 'Explore groups'}
                </p>
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