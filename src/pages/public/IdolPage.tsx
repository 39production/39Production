import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Disc3,
  Loader2,
  Music,
  Play,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

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

export function IdolPage() {
  const [groups, setGroups] = useState<IdolGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const pageTitle =
      '39Production Idol — Music, Artists & Entertainment'

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
    upsertMetaTag(
      'name',
      'author',
      '39Production',
    )

    upsertMetaTag(
      'property',
      'og:type',
      'website',
    )
    upsertMetaTag(
      'property',
      'og:title',
      pageTitle,
    )
    upsertMetaTag(
      'property',
      'og:description',
      pageDescription,
    )
    upsertMetaTag(
      'property',
      'og:url',
      canonicalUrl,
    )
    upsertMetaTag(
      'property',
      'og:site_name',
      '39Production',
    )

    upsertMetaTag(
      'property',
      'og:image',
      `${SITE_URL}/og-image.png`,
    )

    upsertMetaTag(
      'name',
      'twitter:card',
      'summary_large_image',
    )
    upsertMetaTag(
      'name',
      'twitter:title',
      pageTitle,
    )
    upsertMetaTag(
      'name',
      'twitter:description',
      pageDescription,
    )
    upsertMetaTag(
      'name',
      'twitter:image',
      `${SITE_URL}/og-image.png`,
    )

    upsertCanonical(canonicalUrl)

    const loadGroups = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolGroup[]>(
          '/api/idol/groups',
        )

        setGroups(data || [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat data idol.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadGroups()

    return () => {
      const structuredData =
        document.getElementById(
          'idol-page-structured-data',
        )

      structuredData?.remove()
    }
  }, [])

  useEffect(() => {
    const pageUrl = `${SITE_URL}/idol`

    const itemList = groups
      .slice(0, 6)
      .map((group, index) => ({
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

    let script =
      document.getElementById(
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

  const stats = useMemo(() => {
    return groups.reduce(
      (acc, group) => {
        acc.members += group.member_count || 0
        acc.releases += group.release_count || 0
        acc.videos += group.music_video_count || 0
        acc.activities +=
          group.upcoming_activity_count || 0

        return acc
      },
      {
        members: 0,
        releases: 0,
        videos: 0,
        activities: 0,
      },
    )
  }, [groups])

  const featuredGroup = groups[0]

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* =========================================================
          GLOBAL GRID
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.028]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        aria-labelledby="idol-page-title"
        className="relative overflow-hidden border-b border-zinc-200 bg-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-violet-100/60 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-fuchsia-100/40 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-20 sm:pb-16 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-24">
          {/* Top editorial bar */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              39Production
              <span className="mx-2 text-violet-500">
                •
              </span>
              Entertainment
            </p>

            <div className="hidden items-center gap-5 sm:flex">
              <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Music
              </span>

              <span className="h-px w-8 bg-zinc-300" />

              <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Visuals
              </span>

              <span className="h-px w-8 bg-zinc-300" />

              <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Artists
              </span>
            </div>
          </div>

          {/* Main hero */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
            {/* Copy */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center border border-violet-200 bg-violet-50"
                >
                  <Music className="h-3.5 w-3.5 text-violet-600" />
                </span>

                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-600">
                  39Production Idol
                </span>
              </div>

              <h1
                id="idol-page-title"
                className="mt-7 max-w-xl text-[3.25rem] font-semibold leading-[0.9] tracking-[-0.06em] text-zinc-950 sm:text-5xl lg:text-[4.75rem]"
              >
                Where music
                <span className="block text-violet-600">
                  meets
                </span>
                visual stories.
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base">
                Discover the artists, idol groups, music
                releases, and visual experiences created within
                the 39Production entertainment universe.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link
                  to="/idol/groups"
                  className="group inline-flex items-center gap-3 bg-zinc-950 px-5 py-3.5 text-xs font-medium text-white transition hover:bg-violet-600"
                >
                  Explore Groups

                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/idol/music-videos"
                  className="group inline-flex items-center gap-2 border-b border-zinc-300 pb-1.5 text-xs font-medium text-zinc-700 transition hover:border-violet-600 hover:text-violet-600"
                >
                  <Play
                    aria-hidden="true"
                    className="h-3 w-3"
                  />

                  Watch Music Videos
                </Link>
              </div>
            </div>

            {/* Featured visual */}
            <div className="relative">
              <div className="relative ml-auto max-w-2xl">
                {/* Decorative number */}
                <div
                  aria-hidden="true"
                  className="absolute -left-5 top-7 z-20 hidden -translate-x-full lg:block"
                >
                  <p className="font-mono text-[10px] text-zinc-400">
                    ENTERTAINMENT
                  </p>

                  <p className="mt-2 font-mono text-[10px] text-violet-600">
                    01 / 05
                  </p>
                </div>

                <div className="relative aspect-[16/10] overflow-hidden border border-zinc-200 bg-zinc-100">
                  {featuredGroup?.image_url ? (
                    <img
                      src={featuredGroup.image_url}
                      alt={`${featuredGroup.name} — 39Production Idol`}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-100 via-white to-fuchsia-100">
                      <Music
                        aria-hidden="true"
                        className="h-16 w-16 text-violet-200"
                      />
                    </div>
                  )}

                  {/* Gradient */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent"
                  />

                  {/* Featured label */}
                  <div className="absolute left-5 top-5">
                    <span className="inline-flex items-center gap-2 border border-white/30 bg-black/30 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-white backdrop-blur-md">
                      <Sparkles
                        aria-hidden="true"
                        className="h-3 w-3"
                      />

                      Featured
                    </span>
                  </div>

                  {/* Bottom information */}
                  {featuredGroup && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                      <div className="flex items-end justify-between gap-5">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
                            39Production Idol
                          </p>

                          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                            {featuredGroup.name}
                          </h2>

                          <p className="mt-2 max-w-md line-clamp-2 text-xs leading-5 text-white/70">
                            {featuredGroup.description ||
                              'An original idol project from 39Production.'}
                          </p>
                        </div>

                        <Link
                          to={`/idol/groups/${featuredGroup.id}`}
                          aria-label={`View ${featuredGroup.name}`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white hover:text-zinc-950"
                        >
                          <ArrowRight
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Featured bottom metadata */}
                {featuredGroup && (
                  <div className="grid grid-cols-3 border-x border-b border-zinc-200 bg-white">
                    <div className="border-r border-zinc-200 px-4 py-3.5 sm:px-5">
                      <p className="font-mono text-sm text-zinc-900">
                        {featuredGroup.member_count || 0}
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-400">
                        Members
                      </p>
                    </div>

                    <div className="border-r border-zinc-200 px-4 py-3.5 sm:px-5">
                      <p className="font-mono text-sm text-zinc-900">
                        {featuredGroup.release_count || 0}
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-400">
                        Releases
                      </p>
                    </div>

                    <div className="px-4 py-3.5 sm:px-5">
                      <p className="font-mono text-sm text-zinc-900">
                        {featuredGroup.music_video_count || 0}
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-zinc-400">
                        Music Videos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ENTERTAINMENT INDEX
      ========================================================= */}
      <section
        aria-label="39Production Idol categories"
        className="relative border-b border-zinc-200 bg-zinc-50/40"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 border-x border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/idol/groups"
              className="group relative border-b border-zinc-200 bg-white p-6 transition hover:bg-violet-50/50 lg:border-b-0 lg:border-r"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[9px] text-violet-600">
                  01
                </span>

                <ArrowDownRight
                  aria-hidden="true"
                  className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-violet-500"
                />
              </div>

              <div className="mt-12">
                <Users
                  aria-hidden="true"
                  className="h-5 w-5 text-zinc-800"
                />

                <h3 className="mt-5 text-sm font-medium">
                  Idol Groups
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                  Explore the artist roster
                </p>
              </div>
            </Link>

            <Link
              to="/idol/members"
              className="group relative border-b border-zinc-200 bg-white p-6 transition hover:bg-fuchsia-50/40 lg:border-b-0 lg:border-r"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[9px] text-violet-600">
                  02
                </span>

                <ArrowDownRight
                  aria-hidden="true"
                  className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-violet-500"
                />
              </div>

              <div className="mt-12">
                <Users
                  aria-hidden="true"
                  className="h-5 w-5 text-zinc-800"
                />

                <h3 className="mt-5 text-sm font-medium">
                  Members
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                  Meet the people behind each group
                </p>
              </div>
            </Link>

            <Link
              to="/idol/releases"
              className="group relative border-b border-zinc-200 bg-white p-6 transition hover:bg-violet-50/50 sm:border-r lg:border-b-0"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[9px] text-violet-600">
                  03
                </span>

                <ArrowDownRight
                  aria-hidden="true"
                  className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-violet-500"
                />
              </div>

              <div className="mt-12">
                <Disc3
                  aria-hidden="true"
                  className="h-5 w-5 text-zinc-800"
                />

                <h3 className="mt-5 text-sm font-medium">
                  Releases
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                  Original songs and music projects
                </p>
              </div>
            </Link>

            <Link
              to="/idol/events"
              className="group relative bg-white p-6 transition hover:bg-fuchsia-50/40"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[9px] text-violet-600">
                  04
                </span>

                <ArrowDownRight
                  aria-hidden="true"
                  className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-violet-500"
                />
              </div>

              <div className="mt-12">
                <CalendarDays
                  aria-hidden="true"
                  className="h-5 w-5 text-zinc-800"
                />

                <h3 className="mt-5 text-sm font-medium">
                  Events
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                  Performances and upcoming activities
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          ENTERTAINMENT STATS
      ========================================================= */}
      <section
        aria-label="39Production Idol statistics"
        className="border-b border-zinc-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 border-x border-zinc-200 sm:grid-cols-4">
            <div className="border-b border-r border-zinc-200 px-6 py-7 sm:border-b-0">
              <p className="font-mono text-2xl tracking-[-0.04em] text-zinc-950">
                {groups.length}
              </p>

              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Idol Groups
              </p>
            </div>

            <div className="border-b border-zinc-200 px-6 py-7 sm:border-b-0 sm:border-r">
              <p className="font-mono text-2xl tracking-[-0.04em] text-zinc-950">
                {stats.members}
              </p>

              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Members
              </p>
            </div>

            <div className="border-r border-zinc-200 px-6 py-7">
              <p className="font-mono text-2xl tracking-[-0.04em] text-zinc-950">
                {stats.releases}
              </p>

              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Releases
              </p>
            </div>

            <div className="px-6 py-7">
              <p className="font-mono text-2xl tracking-[-0.04em] text-zinc-950">
                {stats.videos}
              </p>

              <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Music Videos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          GROUP ROSTER
      ========================================================= */}
      <section
        aria-labelledby="group-roster-title"
        className="relative overflow-hidden bg-white"
      >
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          {/* Section header */}
          <div className="grid gap-8 border-b border-zinc-200 pb-8 lg:grid-cols-[150px_1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs text-violet-600">
                05
              </p>

              <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                Artist Roster
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                39Production Idol
              </p>

              <h2
                id="group-roster-title"
                className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-4xl"
              >
                The Groups
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                Different sounds, different identities, one
                entertainment universe.
              </p>
            </div>

            <Link
              to="/idol/groups"
              className="group inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-600 transition hover:text-violet-600"
            >
              View all groups

              <ChevronRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex min-h-72 items-center justify-center border-x border-b border-zinc-200">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                <Loader2
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin text-violet-600"
                />

                Loading roster
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="border-x border-b border-red-200 bg-red-50/40 p-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-red-500">
                Unable to load roster
              </p>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && groups.length === 0 && (
            <div className="border-x border-b border-zinc-200 bg-zinc-50/60 px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-zinc-200 bg-white">
                <Music
                  aria-hidden="true"
                  className="h-6 w-6 text-violet-500"
                />
              </div>

              <p className="mt-6 text-sm font-medium text-zinc-700">
                Our artist roster is currently being
                prepared.
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-zinc-500">
                Check back soon for the latest 39Production
                idol projects.
              </p>
            </div>
          )}

          {/* Cards */}
          {!loading &&
            !error &&
            groups.length > 0 && (
              <div className="grid gap-px border-x border-b border-zinc-200 bg-zinc-200 md:grid-cols-2 lg:grid-cols-3">
                {groups.slice(0, 6).map(
                  (group, index) => {
                    const isWide =
                      index === 1 || index === 4

                    return (
                      <Link
                        key={group.id}
                        to={`/idol/groups/${group.id}`}
                        aria-label={`View ${group.name} idol group`}
                        className={`group relative bg-white transition duration-500 hover:z-10 ${isWide
                            ? 'lg:col-span-2'
                            : ''
                          }`}
                      >
                        {/* Image */}
                        <div
                          className={`relative overflow-hidden bg-zinc-100 ${isWide
                              ? 'aspect-[16/8]'
                              : 'aspect-[4/3]'
                            }`}
                        >
                          {group.image_url ? (
                            <img
                              src={group.image_url}
                              alt={`${group.name} idol group — 39Production`}
                              loading={
                                index < 3
                                  ? 'eager'
                                  : 'lazy'
                              }
                              decoding="async"
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
                              <Music
                                aria-hidden="true"
                                className="h-12 w-12 text-violet-200"
                              />
                            </div>
                          )}

                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70"
                          />

                          {/* Index */}
                          <div className="absolute left-4 top-4">
                            <span className="font-mono text-[9px] text-white/70">
                              {String(
                                index + 1,
                              ).padStart(2, '0')}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="absolute right-4 top-4">
                            <span
                              className={`inline-flex items-center gap-1.5 border border-white/30 bg-black/25 px-2.5 py-1.5 text-[8px] uppercase tracking-[0.14em] text-white backdrop-blur-md ${group.status ===
                                  'Active'
                                  ? ''
                                  : 'opacity-80'
                                }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${group.status ===
                                    'Active'
                                    ? 'bg-emerald-400'
                                    : 'bg-amber-400'
                                  }`}
                              />

                              {group.status}
                            </span>
                          </div>

                          {/* Image bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-white/60">
                              Idol Group
                            </p>

                            <div className="mt-1 flex items-end justify-between gap-4">
                              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                                {group.name}
                              </h3>

                              <div
                                aria-hidden="true"
                                className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/30 bg-white/10 backdrop-blur-sm transition group-hover:bg-white group-hover:text-zinc-950"
                              >
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card information */}
                        <div className="p-5 sm:p-6">
                          <p className="line-clamp-2 text-xs leading-6 text-zinc-500">
                            {group.description ||
                              'An original idol project from 39Production.'}
                          </p>

                          <div className="mt-6 grid grid-cols-3 border-t border-zinc-100 pt-5">
                            <div className="border-r border-zinc-100">
                              <p className="font-mono text-base text-zinc-900">
                                {group.member_count ||
                                  0}
                              </p>

                              <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-zinc-400">
                                Members
                              </p>
                            </div>

                            <div className="border-r border-zinc-100 px-4">
                              <p className="font-mono text-base text-zinc-900">
                                {group.release_count ||
                                  0}
                              </p>

                              <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-zinc-400">
                                Releases
                              </p>
                            </div>

                            <div className="pl-4">
                              <p className="font-mono text-base text-zinc-900">
                                {group.music_video_count ||
                                  0}
                              </p>

                              <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-zinc-400">
                                Videos
                              </p>
                            </div>
                          </div>

                          {group.upcoming_activity_count >
                            0 && (
                              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                                <div className="flex items-center gap-2">
                                  <CalendarDays
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5 text-violet-600"
                                  />

                                  <span className="text-[8px] font-medium uppercase tracking-[0.14em] text-violet-600">
                                    Upcoming Activity
                                  </span>
                                </div>

                                <span className="font-mono text-xs text-zinc-700">
                                  {
                                    group.upcoming_activity_count
                                  }
                                </span>
                              </div>
                            )}
                        </div>
                      </Link>
                    )
                  },
                )}
              </div>
            )}
        </div>
      </section>

      {/* =========================================================
          MUSIC / ENTERTAINMENT CTA
      ========================================================= */}
      <section className="relative overflow-hidden border-t border-zinc-200 bg-zinc-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #fff 1px, transparent 1px),
              linear-gradient(to bottom, #fff 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-600/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[150px_1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs text-violet-400">
                06
              </p>

              <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                Music & Visuals
              </p>
            </div>

            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Continue exploring
              </p>

              <h2 className="mt-3 text-3xl font-medium leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Hear the music.
                <span className="block text-zinc-500">
                  See the stories.
                </span>
              </h2>
            </div>

            <Link
              to="/idol/releases"
              className="group inline-flex items-center gap-3 bg-white px-5 py-3.5 text-xs font-medium text-zinc-950 transition hover:bg-violet-500 hover:text-white"
            >
              Explore Releases

              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}