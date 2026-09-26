import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Disc3,
  ExternalLink,
  Loader2,
  Music,
  Play,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const SITE_URL =
  'https://39production.github.io/39Production'

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

type ReleaseFilter =
  | 'All'
  | 'Single'
  | 'EP'
  | 'Album'
  | 'Upcoming'

async function apiRequest<T>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      cache: 'no-store',
    },
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
  if (!date) return '-'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function getYear(date: string) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.getFullYear().toString()
}

function getNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

function upsertMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  let element =
    document.head.querySelector<HTMLMetaElement>(
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
  let canonical =
    document.head.querySelector<HTMLLinkElement>(
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

export function IdolReleasesPage() {
  const [releases, setReleases] = useState<
    IdolRelease[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] =
    useState<ReleaseFilter>('All')

  /*
   * ==========================================================
   * SEO
   * ==========================================================
   */
  useEffect(() => {
    const pageTitle =
      'Music Releases — 39Production Idol'

    const pageDescription =
      'Explore original singles, EPs, albums, and upcoming music releases from 39Production Idol.'

    const canonicalUrl =
      `${SITE_URL}/idol/releases`

    document.title = pageTitle

    upsertMetaTag(
      'name',
      'description',
      pageDescription,
    )

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

    return () => {
      const structuredData =
        document.getElementById(
          'idol-releases-structured-data',
        )

      structuredData?.remove()
    }
  }, [])

  /*
   * ==========================================================
   * LOAD RELEASES
   * ==========================================================
   */
  useEffect(() => {
    const loadReleases = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolRelease[]>(
          '/api/idol/releases',
        )

        setReleases(data || [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat releases.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadReleases()
  }, [])

  /*
   * ==========================================================
   * RELEASE SEO STRUCTURED DATA
   * ==========================================================
   */
  useEffect(() => {
    const pageUrl =
      `${SITE_URL}/idol/releases`

    const itemList = releases
      .slice(0, 20)
      .map((release, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: release.title,
        url: pageUrl,
        item: {
          '@type': 'MusicRelease',
          name: release.title,
          url: pageUrl,
          datePublished:
            release.release_date || undefined,
          image:
            release.cover_url || undefined,
          description:
            release.description ||
            `Music release ${release.title} from 39Production Idol.`,
          byArtist: release.group_name
            ? {
              '@type': 'MusicGroup',
              name: release.group_name,
              url:
                `${SITE_URL}/idol/groups/${release.group_id}`,
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

    let script =
      document.getElementById(
        'idol-releases-structured-data',
      ) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.id =
        'idol-releases-structured-data'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent =
      JSON.stringify(structuredData)

    return () => {
      script?.remove()
    }
  }, [releases])

  /*
   * ==========================================================
   * FEATURED
   * ==========================================================
   */
  const featuredRelease = useMemo(() => {
    if (!releases.length) return null

    return (
      releases.find(
        (release) =>
          release.status === 'Released',
      ) || releases[0]
    )
  }, [releases])

  /*
   * ==========================================================
   * FILTER
   * ==========================================================
   */
  const filteredReleases = useMemo(() => {
    if (activeFilter === 'All') {
      return releases
    }

    if (activeFilter === 'Upcoming') {
      return releases.filter(
        (release) =>
          release.status === 'Upcoming',
      )
    }

    return releases.filter(
      (release) =>
        release.type === activeFilter,
    )
  }, [activeFilter, releases])

  const releasedCount = releases.filter(
    (release) =>
      release.status === 'Released',
  ).length

  const upcomingCount = releases.filter(
    (release) =>
      release.status === 'Upcoming',
  ).length

  const filters: ReleaseFilter[] = [
    'All',
    'Single',
    'EP',
    'Album',
    'Upcoming',
  ]

  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      {/* ======================================================
          BACKGROUND GRID
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-40 top-20 z-0 h-[360px] w-[360px] rounded-full bg-violet-100/50 blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-40 top-[60%] z-0 h-[320px] w-[320px] rounded-full bg-fuchsia-100/40 blur-[100px]"
      />

      <div className="relative z-10">
        {/* ======================================================
            HEADER
        ====================================================== */}
        <section
          aria-labelledby="releases-page-title"
          className="border-b border-zinc-200"
        >
          <div className="mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-10 lg:px-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px] sm:tracking-[0.22em]">
                39Production
                <span className="mx-1.5 text-violet-600 sm:mx-2">
                  •
                </span>
                Releases
              </p>

              <span className="hidden font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400 sm:block sm:text-[10px] sm:tracking-[0.18em]">
                Music Archive
              </span>
            </div>

            <div className="mt-10 flex flex-col gap-7 sm:mt-12 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-3 sm:mb-5">
                  <span className="h-px w-6 bg-violet-600 sm:w-8" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.17em] text-violet-600 sm:text-[10px] sm:tracking-[0.2em]">
                    Discography
                  </span>
                </div>

                <h1
                  id="releases-page-title"
                  className="text-[3.25rem] font-semibold leading-[0.88] tracking-[-0.065em] text-zinc-950 sm:text-6xl lg:text-7xl"
                >
                  Music
                  <br />
                  releases.
                </h1>
              </div>

              <div className="max-w-md lg:pb-1">
                <p className="text-sm leading-6 text-zinc-500 sm:text-base">
                  Original singles, EPs, and
                  albums from the 39Production
                  entertainment catalog.
                </p>

                <div className="mt-5 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px] sm:tracking-[0.18em]">
                  <Disc3 className="h-3.5 w-3.5 shrink-0 text-violet-600" />
                  Listen to the archive
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            FEATURED
        ====================================================== */}
        {!loading &&
          !error &&
          featuredRelease && (
            <section
              aria-labelledby="featured-release-title"
              className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16 lg:px-8"
            >
              <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-violet-600 sm:text-[9px] sm:tracking-[0.2em]">
                    01 / Featured
                  </p>

                  <h2 className="mt-1 text-lg font-semibold tracking-[-0.035em] sm:text-xl">
                    Latest release
                  </h2>
                </div>

                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-400 sm:text-[9px] sm:tracking-[0.15em]">
                  {featuredRelease.status}
                </span>
              </div>

              <article className="grid overflow-hidden border border-zinc-200 bg-zinc-950 lg:grid-cols-[42%_58%]">
                {/* COVER */}
                <div className="relative aspect-square overflow-hidden bg-zinc-900 sm:aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
                  {featuredRelease.cover_url ? (
                    <img
                      src={
                        featuredRelease.cover_url
                      }
                      alt={`${featuredRelease.title} — 39Production Idol`}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-700 hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-violet-100 via-white to-fuchsia-100 sm:min-h-[320px]">
                      <Music className="h-20 w-20 text-violet-200 sm:h-24 sm:w-24" />
                    </div>
                  )}

                  <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                    <span className="border border-white/30 bg-black/35 px-2.5 py-1.5 font-mono text-[7px] uppercase tracking-[0.16em] text-white backdrop-blur-md sm:px-3 sm:text-[8px] sm:tracking-[0.18em]">
                      {featuredRelease.type}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between sm:bottom-4 sm:left-4 sm:right-4">
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-white/70 sm:text-[9px] sm:tracking-[0.15em]">
                      {getYear(
                        featuredRelease.release_date,
                      )}
                    </span>

                    <Disc3 className="h-4 w-4 text-white/70 sm:h-5 sm:w-5" />
                  </div>
                </div>

                {/* INFO */}
                <div className="flex min-h-[390px] flex-col justify-between p-5 sm:min-h-[420px] sm:p-9 lg:p-10">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-violet-400 sm:text-[9px] sm:tracking-[0.18em]">
                        39P / Original Music
                      </span>

                      <span className="shrink-0 font-mono text-[8px] text-white/25 sm:text-[9px]">
                        #
                        {String(
                          featuredRelease.id,
                        ).padStart(3, '0')}
                      </span>
                    </div>

                    <h2
                      id="featured-release-title"
                      className="mt-8 max-w-xl break-words text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:mt-10 sm:text-4xl lg:text-5xl"
                    >
                      {featuredRelease.title}
                    </h2>

                    {featuredRelease.group_name && (
                      <Link
                        to={`/idol/groups/${featuredRelease.group_id}`}
                        className="mt-4 inline-flex max-w-full items-center gap-2 truncate text-xs font-medium text-violet-400 transition hover:text-violet-300"
                      >
                        <span className="truncate">
                          {
                            featuredRelease.group_name
                          }
                        </span>

                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                      </Link>
                    )}

                    <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-white/35 sm:text-[9px] sm:tracking-[0.15em]">
                      {formatDate(
                        featuredRelease.release_date,
                      )}
                    </p>

                    {featuredRelease.description && (
                      <p className="mt-6 max-w-lg text-sm leading-6 text-white/50 sm:mt-7">
                        {
                          featuredRelease.description
                        }
                      </p>
                    )}
                  </div>

                  <div className="mt-8">
                    {featuredRelease.audio_url && (
                      <div className="mb-5 overflow-hidden border border-white/10 bg-white/[0.04] p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Play className="h-3 w-3 shrink-0 text-violet-400" />

                          <span className="font-mono text-[7px] uppercase tracking-[0.15em] text-white/35 sm:text-[8px] sm:tracking-[0.18em]">
                            Audio Preview
                          </span>
                        </div>

                        <audio
                          controls
                          className="h-8 w-full"
                          src={
                            featuredRelease.audio_url
                          }
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {featuredRelease.spotify_url && (
                        <a
                          href={
                            featuredRelease.spotify_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-violet-500 hover:bg-violet-600 sm:px-3.5 sm:text-[9px] sm:tracking-[0.14em]"
                        >
                          Spotify
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {featuredRelease.youtube_url && (
                        <a
                          href={
                            featuredRelease.youtube_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-white transition hover:border-violet-500 hover:bg-violet-600 sm:px-3.5 sm:text-[9px] sm:tracking-[0.14em]"
                        >
                          YouTube
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </section>
          )}

        {/* ======================================================
            MINI STATS
        ====================================================== */}
        {!loading &&
          !error &&
          releases.length > 0 && (
            <section
              aria-label="Release statistics"
              className="border-y border-zinc-200 bg-zinc-50/60"
            >
              <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-zinc-200">
                <div className="px-4 py-5 sm:px-8 sm:py-6">
                  <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-400 sm:text-[8px] sm:tracking-[0.18em]">
                    Releases
                  </p>

                  <p className="mt-1.5 text-lg font-semibold tracking-[-0.04em] sm:text-xl">
                    {releases.length}
                  </p>
                </div>

                <div className="px-4 py-5 sm:px-8 sm:py-6">
                  <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-400 sm:text-[8px] sm:tracking-[0.18em]">
                    Released
                  </p>

                  <p className="mt-1.5 text-lg font-semibold tracking-[-0.04em] sm:text-xl">
                    {releasedCount}
                  </p>
                </div>

                <div className="px-4 py-5 sm:px-8 sm:py-6">
                  <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-zinc-400 sm:text-[8px] sm:tracking-[0.18em]">
                    Upcoming
                  </p>

                  <p className="mt-1.5 text-lg font-semibold tracking-[-0.04em] text-violet-600 sm:text-xl">
                    {upcomingCount}
                  </p>
                </div>
              </div>
            </section>
          )}

        {/* ======================================================
            CATALOG
        ====================================================== */}
        <section
          aria-labelledby="all-releases-title"
          className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-8 lg:py-20"
        >
          <div className="flex flex-col gap-5 border-b border-zinc-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-violet-600 sm:text-[9px] sm:tracking-[0.2em]">
                02 / Archive
              </p>

              <h2
                id="all-releases-title"
                className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl"
              >
                All releases
              </h2>
            </div>

            <div className="w-full overflow-x-auto pb-1 lg:w-auto">
              <div className="inline-flex min-w-max border border-zinc-200">
                {filters.map((filter) => {
                  const active =
                    activeFilter === filter

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() =>
                        setActiveFilter(filter)
                      }
                      className={`border-r border-zinc-200 px-3 py-2.5 text-[7px] font-semibold uppercase tracking-[0.13em] transition last:border-r-0 sm:px-3.5 sm:text-[8px] sm:tracking-[0.15em] ${active
                        ? 'bg-zinc-950 text-white'
                        : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                        }`}
                    >
                      {filter}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />

                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[9px] sm:tracking-[0.18em]">
                  Loading releases...
                </span>
              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="mt-8 border border-red-200 bg-red-50 p-5 sm:p-6">
              <p className="text-sm font-semibold text-red-700">
                Unable to load releases
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            releases.length === 0 && (
              <div className="mt-8 border border-zinc-200 bg-zinc-50 p-8 text-center sm:p-10">
                <Music className="mx-auto h-7 w-7 text-violet-500" />

                <p className="mt-4 text-sm font-semibold">
                  No releases yet.
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Original releases will appear
                  here.
                </p>
              </div>
            )}

          {/* NO FILTER RESULT */}
          {!loading &&
            !error &&
            releases.length > 0 &&
            filteredReleases.length === 0 && (
              <div className="mt-8 border border-zinc-200 bg-zinc-50 p-8 text-center sm:p-10">
                <Sparkles className="mx-auto h-6 w-6 text-violet-500" />

                <p className="mt-4 text-sm font-semibold">
                  No releases in this category.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveFilter('All')
                  }
                  className="mt-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-violet-600 hover:text-violet-700"
                >
                  View all
                </button>
              </div>
            )}

          {/* ====================================================
              RELEASE LIST
          ==================================================== */}
          {!loading &&
            !error &&
            filteredReleases.length > 0 && (
              <>
                {/* ============================
                    MOBILE / SMALL SCREEN
                ============================ */}
                <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200 sm:hidden">
                  {filteredReleases.map(
                    (release, index) => (
                      <article
                        key={release.id}
                        className="group flex gap-3 py-3"
                      >
                        {/* COVER */}
                        <div className="relative h-[82px] w-[82px] shrink-0 overflow-hidden bg-zinc-100">
                          {release.cover_url ? (
                            <img
                              src={
                                release.cover_url
                              }
                              alt={`${release.title} — ${release.group_name || '39Production Idol'}`}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
                              <Music className="h-7 w-7 text-violet-200" />
                            </div>
                          )}

                          <span className="absolute left-1.5 top-1.5 bg-black/65 px-1.5 py-0.5 font-mono text-[6px] text-white backdrop-blur-sm">
                            {getNumber(index)}
                          </span>

                          {release.audio_url && (
                            <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center bg-white/95 text-zinc-950">
                              <Play className="ml-0.5 h-2.5 w-2.5 fill-current" />
                            </span>
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="min-w-0 truncate text-sm font-semibold tracking-[-0.025em] text-zinc-950">
                                {release.title}
                              </h3>

                              <span
                                className={`shrink-0 pt-0.5 font-mono text-[6px] uppercase tracking-[0.08em] ${release.status ===
                                  'Released'
                                  ? 'text-emerald-600'
                                  : 'text-amber-600'
                                  }`}
                              >
                                {release.status}
                              </span>
                            </div>

                            {release.group_name && (
                              <Link
                                to={`/idol/groups/${release.group_id}`}
                                className="mt-0.5 block truncate text-[9px] font-medium text-violet-600"
                              >
                                {
                                  release.group_name
                                }
                              </Link>
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 font-mono text-[7px] uppercase tracking-[0.08em] text-zinc-400">
                                {release.type}
                              </span>

                              <span className="h-2.5 w-px bg-zinc-200" />

                              <span className="truncate font-mono text-[7px] uppercase tracking-[0.08em] text-zinc-400">
                                {formatDate(
                                  release.release_date,
                                )}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {release.spotify_url && (
                                <a
                                  href={
                                    release.spotify_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Listen to ${release.title} on Spotify`}
                                  className="text-[7px] font-semibold uppercase tracking-[0.06em] text-zinc-400 transition hover:text-violet-600"
                                >
                                  Spotify
                                </a>
                              )}

                              {release.youtube_url && (
                                <a
                                  href={
                                    release.youtube_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Watch ${release.title} on YouTube`}
                                  className="text-[7px] font-semibold uppercase tracking-[0.06em] text-zinc-400 transition hover:text-violet-600"
                                >
                                  YouTube
                                </a>
                              )}
                            </div>
                          </div>

                          {release.audio_url && (
                            <div className="mt-1.5 overflow-hidden">
                              <audio
                                controls
                                className="h-6 w-full"
                                src={
                                  release.audio_url
                                }
                              />
                            </div>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>

                {/* ============================
                    TABLET / DESKTOP
                ============================ */}
                <div className="mt-8 hidden grid-cols-2 gap-x-5 gap-y-10 sm:grid lg:grid-cols-4">
                  {filteredReleases.map(
                    (release, index) => (
                      <article
                        key={release.id}
                        className="group min-w-0"
                      >
                        <div className="relative aspect-square overflow-hidden bg-zinc-100">
                          {release.cover_url ? (
                            <img
                              src={
                                release.cover_url
                              }
                              alt={`${release.title} — ${release.group_name || '39Production Idol'}`}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
                              <Music className="h-12 w-12 text-violet-200" />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                          <span className="absolute left-2.5 top-2.5 bg-black/65 px-2 py-1 font-mono text-[7px] text-white backdrop-blur-sm">
                            {getNumber(index)}
                          </span>

                          <span className="absolute right-2.5 top-2.5 bg-white/90 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.1em] text-zinc-700 backdrop-blur-sm">
                            {release.type}
                          </span>

                          {release.audio_url && (
                            <div className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center bg-white text-zinc-950 opacity-0 shadow-sm transition duration-300 group-hover:opacity-100">
                              <Play className="ml-0.5 h-3 w-3 fill-current" />
                            </div>
                          )}
                        </div>

                        <div className="pt-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold tracking-[-0.025em] text-zinc-950">
                                {release.title}
                              </h3>

                              {release.group_name && (
                                <Link
                                  to={`/idol/groups/${release.group_id}`}
                                  className="mt-0.5 block truncate text-[10px] text-violet-600 hover:text-violet-700"
                                >
                                  {
                                    release.group_name
                                  }
                                </Link>
                              )}
                            </div>

                            <span
                              className={`mt-0.5 shrink-0 font-mono text-[7px] uppercase tracking-[0.1em] ${release.status ===
                                'Released'
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                                }`}
                            >
                              {release.status}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-col gap-2 border-t border-zinc-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-400">
                              {formatDate(
                                release.release_date,
                              )}
                            </span>

                            <div className="flex gap-2">
                              {release.spotify_url && (
                                <a
                                  href={
                                    release.spotify_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Listen to ${release.title} on Spotify`}
                                  className="text-[8px] font-semibold uppercase tracking-[0.08em] text-zinc-400 transition hover:text-violet-600"
                                >
                                  Spotify
                                </a>
                              )}

                              {release.youtube_url && (
                                <a
                                  href={
                                    release.youtube_url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Watch ${release.title} on YouTube`}
                                  className="text-[8px] font-semibold uppercase tracking-[0.08em] text-zinc-400 transition hover:text-violet-600"
                                >
                                  YouTube
                                </a>
                              )}
                            </div>
                          </div>

                          {release.audio_url && (
                            <div className="mt-2 overflow-hidden">
                              <audio
                                controls
                                className="h-7 w-full"
                                src={
                                  release.audio_url
                                }
                              />
                            </div>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </>
            )}
        </section>

        {/* ======================================================
            BOTTOM
        ====================================================== */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-violet-600 sm:text-[9px] sm:tracking-[0.2em]">
                  03 / Entertainment
                </p>

                <p className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-3xl">
                  More music. More stories.
                  <span className="text-zinc-400">
                    {' '}
                    Keep exploring the
                    39Production universe.
                  </span>
                </p>
              </div>

              <Link
                to="/idol/groups"
                className="group inline-flex shrink-0 items-center justify-center gap-3 border border-zinc-300 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] transition hover:border-violet-600 hover:bg-violet-600 hover:text-white"
              >
                Explore Groups

                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================
            FOOTER LINE
        ====================================================== */}
        <div className="border-t border-zinc-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-8">
            <Link
              to="/idol"
              className="group inline-flex min-w-0 items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-500 transition hover:text-zinc-950 sm:text-[9px] sm:tracking-[0.15em]"
            >
              <ArrowLeft className="h-3 w-3 shrink-0 transition group-hover:-translate-x-1" />

              <span>
                Back to Entertainment
              </span>
            </Link>

            <span className="shrink-0 font-mono text-[7px] uppercase tracking-[0.13em] text-zinc-400 sm:text-[8px] sm:tracking-[0.16em]">
              39Production
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}