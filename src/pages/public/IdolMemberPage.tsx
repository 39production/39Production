import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  Loader2,
  User,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

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

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

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

  if (existing) {
    existing.remove()
  }

  const script = document.createElement('script')

  script.type = 'application/ld+json'
  script.setAttribute(
    'data-39production-seo',
    'idol-member',
  )
  script.textContent = JSON.stringify(data)

  document.head.appendChild(script)

  return () => {
    script.remove()
  }
}

function useMemberSeo(
  member: IdolMember | null,
  isDirectory: boolean,
) {
  useEffect(() => {
    const siteName = '39Production'
    const origin = window.location.origin

    if (isDirectory) {
      const title = `Idol Members | ${siteName}`
      const description =
        'Explore the artists and performers shaping the 39Production entertainment roster.'

      document.title = title

      setMeta('description', description)

      setMeta(
        'robots',
        'index, follow, max-image-preview:large',
      )

      setMeta('og:title', title, 'property')
      setMeta('og:description', description, 'property')
      setMeta('og:type', 'website', 'property')
      setMeta(
        'og:url',
        `${origin}/idol/members`,
        'property',
      )
      setMeta('og:site_name', siteName, 'property')

      setMeta('twitter:card', 'summary_large_image')
      setMeta('twitter:title', title)
      setMeta('twitter:description', description)

      setCanonical(`${origin}/idol/members`)

      const cleanupJsonLd = setJsonLd({
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

      return cleanupJsonLd
    }

    if (!member) {
      document.title = `Member | ${siteName}`

      setMeta(
        'description',
        'Artist profile from the 39Production entertainment roster.',
      )

      setMeta(
        'robots',
        'noindex, follow',
      )

      return
    }

    const title = `${member.stage_name} | 39Production`
    const description = member.bio
      ? member.bio.slice(0, 155)
      : `${member.stage_name}, ${member.position}, artist profile from the 39Production entertainment roster.`

    const memberUrl = `${origin}/idol/members/${member.id}`

    document.title = title

    setMeta('description', description)

    setMeta(
      'robots',
      'index, follow, max-image-preview:large',
    )

    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:type', 'profile', 'property')
    setMeta('og:url', memberUrl, 'property')
    setMeta('og:site_name', siteName, 'property')

    if (member.image_url) {
      setMeta(
        'og:image',
        member.image_url,
        'property',
      )

      setMeta(
        'twitter:image',
        member.image_url,
      )
    }

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)

    setCanonical(memberUrl)

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: member.stage_name,
      alternateName:
        member.name !== member.stage_name
          ? member.name
          : undefined,
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
          ? {
            url: `${origin}/idol/groups/${member.group_id}`,
          }
          : {}),
      }
    }

    const cleanupJsonLd = setJsonLd(jsonLd)

    return cleanupJsonLd
  }, [member, isDirectory])
}

export function IdolMemberPage() {
  const { id } = useParams()

  const [members, setMembers] = useState<IdolMember[]>([])
  const [member, setMember] = useState<IdolMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<
    'All' | 'Active' | 'Inactive'
  >('All')

  useMemberSeo(member, !id)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        if (id) {
          const data = await apiRequest<IdolMember>(
            `/api/idol/members/${id}`,
          )

          setMember(data)
        } else {
          const groups = await apiRequest<
            Array<{ id: number }>
          >('/api/idol/groups')

          const results = await Promise.all(
            groups.map((group) =>
              apiRequest<IdolMember[]>(
                `/api/idol/groups/${group.id}/members`,
              ),
            ),
          )

          setMembers(results.flat())
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat member.',
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  const filteredMembers =
    filter === 'All'
      ? members
      : members.filter((item) => item.status === filter)

  const activeCount = members.filter(
    (item) => item.status === 'Active',
  ).length

  const inactiveCount = members.filter(
    (item) => item.status === 'Inactive',
  ).length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-5 py-16 text-zinc-900 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl border border-red-200 bg-red-50 p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500">
            39Production / Error
          </p>

          <p className="mt-3 text-sm leading-6 text-red-700">
            {error}
          </p>

          <Link
            to="/idol/members"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-800 transition hover:text-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>
        </div>
      </div>
    )
  }

  /*
   * ============================================================
   * MEMBER ARCHIVE
   * ============================================================
   */

  if (!id) {
    return (
      <div
        className="min-h-screen bg-white text-zinc-900"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      >
        {/* BACKGROUND ACCENTS */}
        <div className="pointer-events-none fixed -right-40 top-20 h-80 w-80 rounded-full bg-violet-100/50 blur-3xl sm:h-96 sm:w-96" />

        <div className="pointer-events-none fixed -left-40 bottom-10 h-80 w-80 rounded-full bg-fuchsia-100/40 blur-3xl sm:h-96 sm:w-96" />

        {/* HERO */}
        <section className="relative border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
            <div className="flex items-start justify-between gap-8">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[10px] sm:tracking-[0.22em]">
                    39Production
                  </span>

                  <span className="h-px w-5 bg-zinc-300 sm:w-8" />

                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-600 sm:text-[10px] sm:tracking-[0.22em]">
                    Artists / Members
                  </span>
                </div>

                <h1 className="mt-6 max-w-2xl text-[3rem] font-semibold leading-[0.92] tracking-[-0.06em] text-zinc-950 sm:mt-7 sm:text-6xl lg:text-7xl">
                  The people
                  <br />
                  behind the
                  <br />
                  <span className="text-violet-600">
                    stories.
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-6 text-zinc-500 sm:mt-7 sm:text-base sm:leading-7">
                  Explore the artists and performers shaping
                  the 39Production entertainment roster.
                </p>
              </div>

              <div className="hidden text-right lg:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Roster
                </p>

                <p className="mt-2 font-mono text-5xl tracking-[-0.06em] text-zinc-950">
                  {String(members.length).padStart(2, '0')}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Registered members
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INDEX */}
        <section className="relative border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 border-x border-zinc-200">
              <div className="border-r border-zinc-200 p-4 sm:p-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-400 sm:text-[9px] sm:tracking-[0.18em]">
                  Total
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-tight sm:mt-2 sm:text-2xl">
                  {members.length}
                </p>
              </div>

              <div className="border-r border-zinc-200 p-4 sm:p-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-400 sm:text-[9px] sm:tracking-[0.18em]">
                  Active
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-tight text-violet-600 sm:mt-2 sm:text-2xl">
                  {activeCount}
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-400 sm:text-[9px] sm:tracking-[0.18em]">
                  Inactive
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-500 sm:mt-2 sm:text-2xl">
                  {inactiveCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FILTER */}
        <section className="relative border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5">
              {(['All', 'Active', 'Inactive'] as const).map(
                (item) => {
                  const count =
                    item === 'All'
                      ? members.length
                      : item === 'Active'
                        ? activeCount
                        : inactiveCount

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`shrink-0 border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] transition sm:px-4 sm:text-[10px] sm:tracking-[0.16em] ${filter === item
                          ? 'border-zinc-950 bg-zinc-950 text-white'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-900'
                        }`}
                    >
                      {item}

                      <span
                        className={`ml-1.5 font-mono sm:ml-2 ${filter === item
                            ? 'text-zinc-400'
                            : 'text-zinc-300'
                          }`}
                      >
                        {String(count).padStart(2, '0')}
                      </span>
                    </button>
                  )
                },
              )}
            </div>

            <div className="hidden shrink-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:flex">
              <Users className="h-3.5 w-3.5" />
              Artist roster
            </div>
          </div>
        </section>

        {/* MEMBER ROSTER */}
        <section className="relative bg-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            {filteredMembers.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 px-6 py-14 text-center sm:py-16">
                <User className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-5 text-sm font-medium text-zinc-700">
                  Belum ada member.
                </p>

                <p className="mt-2 text-xs leading-6 text-zinc-400">
                  Member idol akan ditampilkan di halaman ini.
                </p>
              </div>
            ) : (
              <>
                {/* ==================================================
                    MOBILE ROSTER
                ================================================== */}
                <div className="space-y-2.5 sm:hidden">
                  {filteredMembers.map((item, index) => (
                    <Link
                      key={item.id}
                      to={`/idol/members/${item.id}`}
                      className="group flex min-w-0 items-center gap-3 border border-zinc-200 bg-white p-2.5 transition active:bg-zinc-50"
                    >
                      {/* MOBILE IMAGE */}
                      <div className="relative h-[82px] w-[66px] shrink-0 overflow-hidden bg-zinc-100">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={`${item.stage_name} - 39Production`}
                            loading="lazy"
                            className="h-full w-full object-cover grayscale-[10%] transition duration-500 group-active:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-violet-50">
                            <span className="font-mono text-lg tracking-[-0.05em] text-zinc-300">
                              {getInitials(item.stage_name)}
                            </span>
                          </div>
                        )}

                        <span
                          className={`absolute bottom-1 left-1 px-1.5 py-0.5 font-mono text-[6px] uppercase tracking-[0.1em] backdrop-blur ${item.status === 'Active'
                              ? 'bg-white/90 text-violet-600'
                              : 'bg-white/90 text-zinc-400'
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* MOBILE CONTENT */}
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[7px] text-zinc-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          <span className="h-px w-3 bg-zinc-200" />
                        </div>

                        <h2 className="mt-1 truncate text-[17px] font-semibold leading-tight tracking-[-0.035em] text-zinc-950 transition group-active:text-violet-600">
                          {item.stage_name}
                        </h2>

                        <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-violet-600">
                          {item.position}
                        </p>

                        <div className="mt-2 flex min-w-0 items-center gap-2">
                          {item.group_name && (
                            <span className="flex min-w-0 items-center gap-1 text-[8px] text-zinc-400">
                              <Users className="h-2.5 w-2.5 shrink-0" />

                              <span className="truncate">
                                {item.group_name}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* MOBILE ARROW */}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-300 transition group-active:translate-x-0.5 group-active:text-violet-600" />
                    </Link>
                  ))}
                </div>

                {/* ==================================================
                    DESKTOP ROSTER
                ================================================== */}
                <div className="hidden border-t border-zinc-200 sm:block">
                  {filteredMembers.map((item, index) => (
                    <Link
                      key={item.id}
                      to={`/idol/members/${item.id}`}
                      className="group grid border-b border-zinc-200 transition hover:bg-zinc-50 lg:grid-cols-[72px_220px_1fr_auto] lg:items-center"
                    >
                      {/* NUMBER */}
                      <div className="hidden h-full items-center border-r border-zinc-200 px-5 lg:flex">
                        <span className="font-mono text-[10px] text-zinc-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* IMAGE */}
                      <div className="relative m-4 aspect-[4/5] overflow-hidden bg-zinc-100 sm:m-5 lg:m-0 lg:aspect-square lg:h-[170px]">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={`${item.stage_name} - 39Production`}
                            loading="lazy"
                            className="h-full w-full object-cover grayscale-[12%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-zinc-100">
                            <span className="font-mono text-3xl text-zinc-300">
                              {getInitials(item.stage_name)}
                            </span>
                          </div>
                        )}

                        <div className="absolute left-3 top-3">
                          <span
                            className={`border bg-white/95 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.15em] ${item.status === 'Active'
                                ? 'border-violet-200 text-violet-600'
                                : 'border-zinc-200 text-zinc-400'
                              }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* INFORMATION */}
                      <div className="px-5 pb-6 lg:px-8 lg:py-7">
                        <div className="flex items-center gap-3 lg:hidden">
                          <span className="font-mono text-[9px] text-zinc-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          <span className="h-px w-5 bg-zinc-300" />
                        </div>

                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 transition group-hover:text-violet-600 sm:text-4xl lg:mt-0 lg:text-4xl">
                          {item.stage_name}
                        </h2>

                        <p className="mt-2 text-sm font-medium text-violet-600">
                          {item.position}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
                          {item.group_name && (
                            <span className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5" />
                              {item.group_name}
                            </span>
                          )}

                          {item.birth_date && (
                            <span className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(item.birth_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ACTION */}
                      <div className="hidden items-center gap-4 border-l border-zinc-200 px-7 lg:flex">
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 transition group-hover:text-violet-600">
                          View profile
                        </span>

                        <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* FOOTER STATEMENT */}
        <section className="relative border-t border-zinc-200 bg-zinc-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid gap-7 lg:grid-cols-[120px_1fr_auto] lg:items-end">
              <p className="font-mono text-[9px] tracking-[0.2em] text-zinc-500 sm:text-[10px]">
                05.02
              </p>

              <h2 className="max-w-3xl text-2xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                Every story starts with
                <span className="text-violet-400">
                  {' '}
                  someone.
                </span>
              </h2>

              <Link
                to="/idol/groups"
                className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300 transition hover:text-white"
              >
                Explore Groups

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  /*
   * ============================================================
   * MEMBER DETAIL
   * ============================================================
   */

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-zinc-200 bg-zinc-50">
            <User className="h-6 w-6 text-zinc-300" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-zinc-800">
            Member tidak ditemukan.
          </h1>

          <Link
            to="/idol/members"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-white text-zinc-900"
      style={{
        backgroundImage: `
          linear-gradient(to right, #111 1px, transparent 1px),
          linear-gradient(to bottom, #111 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
      }}
    >
      {/* ACCENTS */}
      <div className="pointer-events-none fixed -right-40 top-20 h-80 w-80 rounded-full bg-violet-100/50 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none fixed -left-40 bottom-0 h-80 w-80 rounded-full bg-fuchsia-100/40 blur-3xl sm:h-96 sm:w-96" />

      {/* TOP BAR */}
      <div className="relative border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 lg:px-8">
          <Link
            to="/idol/members"
            className="group inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-950 sm:gap-3 sm:text-[10px] sm:tracking-[0.18em]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1 sm:h-4 sm:w-4" />
            Members
          </Link>

          <span className="truncate font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px] sm:tracking-[0.2em]">
            39Production / Artist Profile
          </span>
        </div>
      </div>

      {/* PROFILE */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="grid overflow-hidden border border-zinc-200 bg-white lg:grid-cols-[minmax(320px,42%)_1fr]">
            {/* IMAGE PANEL */}
            <div className="relative h-[330px] bg-zinc-100 sm:h-[480px] lg:h-auto lg:min-h-[680px]">
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={`${member.stage_name} - 39Production`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-violet-50">
                  <div className="text-center">
                    <p className="font-mono text-5xl tracking-[-0.08em] text-zinc-200 sm:text-6xl">
                      {getInitials(member.stage_name)}
                    </p>

                    <p className="mt-3 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[9px]">
                      39Production Artist
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 sm:p-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/60 sm:text-[9px]">
                      Artist No.
                    </p>

                    <p className="mt-1 font-mono text-xl tracking-[-0.04em] text-white sm:text-2xl">
                      #{String(member.id).padStart(3, '0')}
                    </p>
                  </div>

                  <span
                    className={`border px-2.5 py-1 font-mono text-[7px] uppercase tracking-[0.14em] backdrop-blur sm:px-3 sm:py-1.5 sm:text-[8px] sm:tracking-[0.16em] ${member.status === 'Active'
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/20 bg-black/20 text-white/60'
                      }`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            </div>

            {/* CONTENT PANEL */}
            <div className="flex flex-col">
              <div className="flex-1 p-5 sm:p-10 lg:p-12">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-mono text-[8px] uppercase tracking-[0.17em] text-violet-600 sm:text-[9px] sm:tracking-[0.2em]">
                    39Production Artist
                  </span>

                  <span className="h-px w-5 bg-zinc-300 sm:w-7" />
                </div>

                <h1 className="mt-5 max-w-xl break-words text-[2.8rem] font-semibold leading-[0.9] tracking-[-0.06em] text-zinc-950 sm:mt-7 sm:text-6xl">
                  {member.stage_name}
                </h1>

                <p className="mt-4 text-sm font-medium text-violet-600 sm:mt-5 sm:text-base">
                  {member.position}
                </p>

                {member.name !== member.stage_name && (
                  <div className="mt-6 border-l-2 border-violet-200 pl-4 sm:mt-7">
                    <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[9px]">
                      Legal Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-700">
                      {member.name}
                    </p>
                  </div>
                )}

                {/* GROUP */}
                {member.group_name && (
                  <Link
                    to={
                      member.group_id
                        ? `/idol/groups/${member.group_id}`
                        : '/idol/groups'
                    }
                    className="group mt-7 flex items-center gap-3 border-y border-zinc-200 py-4 transition hover:bg-zinc-50 sm:mt-9 sm:gap-4 sm:py-5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-200 bg-zinc-50 sm:h-10 sm:w-10">
                      {member.group_image_url ? (
                        <img
                          src={member.group_image_url}
                          alt={member.group_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[8px]">
                        Idol Group
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold text-zinc-800 group-hover:text-violet-600 sm:text-sm">
                        {member.group_name}
                      </p>
                    </div>

                    <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600 sm:h-4 sm:w-4" />
                  </Link>
                )}

                {/* DETAILS */}
                <div className="mt-7 sm:mt-9">
                  <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[9px]">
                    Profile Data
                  </p>

                  <div className="mt-3 grid border-t border-zinc-200 sm:mt-4 sm:grid-cols-2">
                    {member.birth_date && (
                      <div className="border-b border-zinc-200 py-4 sm:border-r sm:py-5 sm:pr-5">
                        <div className="flex items-start gap-3">
                          <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 sm:h-4 sm:w-4" />

                          <div>
                            <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[8px]">
                              Birth Date
                            </p>

                            <p className="mt-1.5 text-xs font-medium text-zinc-800 sm:mt-2 sm:text-sm">
                              {formatDate(member.birth_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {member.email && (
                      <div className="border-b border-zinc-200 py-4 sm:py-5 sm:pl-5">
                        <div className="flex items-start gap-3">
                          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400 sm:h-4 sm:w-4" />

                          <div className="min-w-0">
                            <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[8px]">
                              Contact
                            </p>

                            <p className="mt-1.5 break-all text-xs font-medium text-zinc-800 sm:mt-2 sm:text-sm">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* BIO */}
                {member.bio && (
                  <div className="mt-7 border-t border-zinc-200 pt-6 sm:mt-9 sm:pt-8">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[9px]">
                        Biography
                      </p>

                      <span className="h-px w-6 bg-zinc-200 sm:w-8" />
                    </div>

                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600 sm:mt-5 sm:text-base sm:leading-8">
                      {member.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* BOTTOM NAV */}
              <div className="grid border-t border-zinc-200 sm:grid-cols-2">
                <Link
                  to="/idol/members"
                  className="group flex items-center justify-between border-b border-zinc-200 px-5 py-4 transition hover:bg-zinc-950 hover:text-white sm:border-b-0 sm:border-r sm:px-10 sm:py-5"
                >
                  <span>
                    <span className="block font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-zinc-500 sm:text-[8px]">
                      Directory
                    </span>

                    <span className="mt-1 block text-xs font-medium sm:text-sm">
                      All Members
                    </span>
                  </span>

                  <ArrowLeft className="h-3.5 w-3.5 text-zinc-300 transition group-hover:-translate-x-1 group-hover:text-white sm:h-4 sm:w-4" />
                </Link>

                {member.group_name ? (
                  <Link
                    to={
                      member.group_id
                        ? `/idol/groups/${member.group_id}`
                        : '/idol/groups'
                    }
                    className="group flex items-center justify-between px-5 py-4 transition hover:bg-zinc-950 hover:text-white sm:px-10 sm:py-5"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-zinc-500 sm:text-[8px]">
                        Continue
                      </span>

                      <span className="mt-1 block truncate text-xs font-medium sm:text-sm">
                        {member.group_name}
                      </span>
                    </span>

                    <ArrowRight className="ml-3 h-3.5 w-3.5 shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-white sm:h-4 sm:w-4" />
                  </Link>
                ) : (
                  <Link
                    to="/idol/groups"
                    className="group flex items-center justify-between px-5 py-4 transition hover:bg-zinc-950 hover:text-white sm:px-10 sm:py-5"
                  >
                    <span>
                      <span className="block font-mono text-[7px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-zinc-500 sm:text-[8px]">
                        Continue
                      </span>

                      <span className="mt-1 block text-xs font-medium sm:text-sm">
                        Explore Groups
                      </span>
                    </span>

                    <ArrowRight className="h-3.5 w-3.5 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-white sm:h-4 sm:w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}