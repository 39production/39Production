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

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

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

export function IdolReleasesPage() {
  const [releases, setReleases] = useState<IdolRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<ReleaseFilter>('All')

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

  const featuredRelease = useMemo(() => {
    if (!releases.length) return null

    return (
      releases.find(
        (release) => release.status === 'Released',
      ) || releases[0]
    )
  }, [releases])

  const filteredReleases = useMemo(() => {
    if (activeFilter === 'All') {
      return releases
    }

    if (activeFilter === 'Upcoming') {
      return releases.filter(
        (release) => release.status === 'Upcoming',
      )
    }

    return releases.filter(
      (release) => release.type === activeFilter,
    )
  }, [activeFilter, releases])

  const releasedCount = releases.filter(
    (release) => release.status === 'Released',
  ).length

  const upcomingCount = releases.filter(
    (release) => release.status === 'Upcoming',
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
      {/* BACKGROUND GRID */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      <div className="pointer-events-none fixed -right-40 top-20 z-0 h-[360px] w-[360px] rounded-full bg-violet-100/50 blur-[110px]" />

      <div className="pointer-events-none fixed -left-40 top-[60%] z-0 h-[320px] w-[320px] rounded-full bg-fuchsia-100/40 blur-[100px]" />

      <div className="relative z-10">
        {/* ======================================================
            HEADER
        ====================================================== */}
        <section className="border-b border-zinc-200">
          <div className="mx-auto max-w-7xl px-6 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                39Production
                <span className="mx-2 text-violet-600">•</span>
                Releases
              </p>

              <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 sm:block">
                Music Archive
              </span>
            </div>

            <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-violet-600" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                    Discography
                  </span>
                </div>

                <h1 className="text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-zinc-950 sm:text-6xl lg:text-7xl">
                  Music
                  <br />
                  releases.
                </h1>
              </div>

              <div className="max-w-md lg:pb-1">
                <p className="text-sm leading-6 text-zinc-500 sm:text-base">
                  Original singles, EPs, and albums from the
                  39Production entertainment catalog.
                </p>

                <div className="mt-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  <Disc3 className="h-3.5 w-3.5 text-violet-600" />
                  Listen to the archive
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            FEATURED
        ====================================================== */}
        {!loading && !error && featuredRelease && (
          <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600">
                  01 / Featured
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">
                  Latest release
                </h2>
              </div>

              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400">
                {featuredRelease.status}
              </span>
            </div>

            <article className="grid border border-zinc-200 bg-zinc-950 lg:grid-cols-[42%_58%]">
              {/* COVER */}
              <div className="relative aspect-square max-h-[500px] overflow-hidden bg-zinc-900 lg:aspect-auto lg:max-h-none lg:min-h-[420px]">
                {featuredRelease.cover_url ? (
                  <img
                    src={featuredRelease.cover_url}
                    alt={featuredRelease.title}
                    className="h-full w-full object-cover transition duration-700 hover:scale-[1.025]"
                  />
                ) : (
                  <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-violet-100 via-white to-fuchsia-100">
                    <Music className="h-24 w-24 text-violet-200" />
                  </div>
                )}

                <div className="absolute left-4 top-4">
                  <span className="border border-white/30 bg-black/35 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    {featuredRelease.type}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/70">
                    {getYear(featuredRelease.release_date)}
                  </span>

                  <Disc3 className="h-5 w-5 text-white/70" />
                </div>
              </div>

              {/* INFO */}
              <div className="flex min-h-[420px] flex-col justify-between p-7 sm:p-9">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-400">
                      39P / Original Music
                    </span>

                    <span className="font-mono text-[9px] text-white/25">
                      #{String(featuredRelease.id).padStart(3, '0')}
                    </span>
                  </div>

                  <h3 className="mt-10 max-w-xl text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                    {featuredRelease.title}
                  </h3>

                  {featuredRelease.group_name && (
                    <Link
                      to={`/idol/groups/${featuredRelease.group_id}`}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-violet-400 transition hover:text-violet-300"
                    >
                      {featuredRelease.group_name}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">
                    {formatDate(featuredRelease.release_date)}
                  </p>

                  {featuredRelease.description && (
                    <p className="mt-7 max-w-lg text-sm leading-6 text-white/50">
                      {featuredRelease.description}
                    </p>
                  )}
                </div>

                <div className="mt-8">
                  {featuredRelease.audio_url && (
                    <div className="mb-5 border border-white/10 bg-white/[0.04] p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Play className="h-3 w-3 text-violet-400" />

                        <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
                          Audio Preview
                        </span>
                      </div>

                      <audio
                        controls
                        className="h-8 w-full"
                        src={featuredRelease.audio_url}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {featuredRelease.spotify_url && (
                      <a
                        href={featuredRelease.spotify_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 border border-white/15 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-violet-500 hover:bg-violet-600"
                      >
                        Spotify
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {featuredRelease.youtube_url && (
                      <a
                        href={featuredRelease.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 border border-white/15 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-violet-500 hover:bg-violet-600"
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
        {!loading && !error && releases.length > 0 && (
          <section className="border-y border-zinc-200 bg-zinc-50/60">
            <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-zinc-200">
              <div className="px-5 py-5 sm:px-8">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                  Releases
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em]">
                  {releases.length}
                </p>
              </div>

              <div className="px-5 py-5 sm:px-8">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                  Released
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em]">
                  {releasedCount}
                </p>
              </div>

              <div className="px-5 py-5 sm:px-8">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                  Upcoming
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-violet-600">
                  {upcomingCount}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            CATALOG
        ====================================================== */}
        <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-18 lg:py-20">
          <div className="flex flex-col gap-5 border-b border-zinc-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600">
                02 / Archive
              </p>

              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
                All releases
              </h2>
            </div>

            <div className="flex flex-wrap border border-zinc-200">
              {filters.map((filter) => {
                const active = activeFilter === filter

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`border-r border-zinc-200 px-3.5 py-2.5 text-[8px] font-semibold uppercase tracking-[0.15em] transition last:border-r-0 ${active
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

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />

                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  Loading releases...
                </span>
              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="mt-8 border border-red-200 bg-red-50 p-6">
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
              <div className="mt-8 border border-zinc-200 bg-zinc-50 p-10 text-center">
                <Music className="mx-auto h-7 w-7 text-violet-500" />

                <p className="mt-4 text-sm font-semibold">
                  No releases yet.
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Original releases will appear here.
                </p>
              </div>
            )}

          {/* NO FILTER RESULT */}
          {!loading &&
            !error &&
            releases.length > 0 &&
            filteredReleases.length === 0 && (
              <div className="mt-8 border border-zinc-200 bg-zinc-50 p-10 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-violet-500" />

                <p className="mt-4 text-sm font-semibold">
                  No releases in this category.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveFilter('All')}
                  className="mt-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-violet-600 hover:text-violet-700"
                >
                  View all
                </button>
              </div>
            )}

          {/* COMPACT RELEASE GRID */}
          {!loading &&
            !error &&
            filteredReleases.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                {filteredReleases.map((release, index) => (
                  <article
                    key={release.id}
                    className="group min-w-0"
                  >
                    {/* COVER */}
                    <div className="relative aspect-square overflow-hidden bg-zinc-100">
                      {release.cover_url ? (
                        <img
                          src={release.cover_url}
                          alt={release.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
                          <Music className="h-12 w-12 text-violet-200" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                      {/* INDEX */}
                      <span className="absolute left-2.5 top-2.5 bg-black/65 px-2 py-1 font-mono text-[7px] text-white backdrop-blur-sm">
                        {getNumber(index)}
                      </span>

                      {/* TYPE */}
                      <span className="absolute right-2.5 top-2.5 bg-white/90 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.1em] text-zinc-700 backdrop-blur-sm">
                        {release.type}
                      </span>

                      {/* PLAY */}
                      {release.audio_url && (
                        <div className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center bg-white text-zinc-950 opacity-0 shadow-sm transition duration-300 group-hover:opacity-100">
                          <Play className="ml-0.5 h-3 w-3 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* META */}
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
                              {release.group_name}
                            </Link>
                          )}
                        </div>

                        <span
                          className={`mt-0.5 shrink-0 font-mono text-[7px] uppercase tracking-[0.1em] ${release.status === 'Released'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                            }`}
                        >
                          {release.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2">
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-400">
                          {formatDate(release.release_date)}
                        </span>

                        <div className="flex gap-2">
                          {release.spotify_url && (
                            <a
                              href={release.spotify_url}
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
                              href={release.youtube_url}
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
                        <div className="mt-2">
                          <audio
                            controls
                            className="h-7 w-full"
                            src={release.audio_url}
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>

        {/* ======================================================
            BOTTOM
        ====================================================== */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600">
                  03 / Entertainment
                </p>

                <p className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.045em] text-zinc-950 sm:text-3xl">
                  More music. More stories.
                  <span className="text-zinc-400">
                    {' '}
                    Keep exploring the 39Production universe.
                  </span>
                </p>
              </div>

              <Link
                to="/idol/groups"
                className="group inline-flex shrink-0 items-center gap-3 border border-zinc-300 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] transition hover:border-violet-600 hover:bg-violet-600 hover:text-white"
              >
                Explore Groups
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER LINE */}
        <div className="border-t border-zinc-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
            <Link
              to="/idol"
              className="group inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500 transition hover:text-zinc-950"
            >
              <ArrowLeft className="h-3 w-3 transition group-hover:-translate-x-1" />
              Back to Entertainment
            </Link>

            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
              39Production
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}