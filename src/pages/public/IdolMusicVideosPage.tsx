import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Loader2,
  Play,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

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

function getYoutubeThumbnail(url: string) {
  try {
    const parsed = new URL(url)

    let id = ''

    if (parsed.hostname.includes('youtu.be')) {
      id = parsed.pathname.replace('/', '')
    }

    if (parsed.hostname.includes('youtube.com')) {
      id = parsed.searchParams.get('v') || ''

      if (!id && parsed.pathname.includes('/embed/')) {
        id = parsed.pathname.split('/embed/')[1]
      }
    }

    if (id) {
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    }
  } catch {
    return ''
  }

  return ''
}

function toYoutubeEmbed(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')

      if (id) {
        return `https://www.youtube.com/embed/${id}`
      }
    }

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')

      if (id) {
        return `https://www.youtube.com/embed/${id}`
      }

      if (parsed.pathname.includes('/embed/')) {
        return url
      }
    }
  } catch {
    return url
  }

  return url
}

export function IdolMusicVideosPage() {
  const [videos, setVideos] = useState<IdolMusicVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeVideo, setActiveVideo] =
    useState<IdolMusicVideo | null>(null)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolMusicVideo[]>(
          '/api/idol/music-videos',
        )

        setVideos(data || [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat music videos.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadVideos()
  }, [])

  useEffect(() => {
    if (!activeVideo) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveVideo(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [activeVideo])

  const publishedCount = videos.filter(
    (video) => video.status === 'Published',
  ).length

  const upcomingCount = videos.filter(
    (video) => video.status === 'Upcoming',
  ).length

  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}
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

      <div className="pointer-events-none fixed -right-40 top-24 z-0 h-[360px] w-[360px] rounded-full bg-fuchsia-100/50 blur-[110px]" />

      <div className="pointer-events-none fixed -left-40 top-[58%] z-0 h-[340px] w-[340px] rounded-full bg-violet-100/50 blur-[110px]" />

      <div className="relative z-10">
        {/* ======================================================
            HERO
        ====================================================== */}
        <section className="border-b border-zinc-200">
          <div className="mx-auto max-w-7xl px-6 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                39Production
                <span className="mx-2 text-fuchsia-500">•</span>
                Music Videos
              </p>

              <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 sm:block">
                Visual Archive
              </span>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-fuchsia-500" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-600">
                    Visual Releases
                  </span>
                </div>

                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-zinc-950 sm:text-6xl lg:text-7xl">
                  Music,
                  <br />
                  <span className="text-zinc-400">in motion.</span>
                </h1>
              </div>

              <div className="lg:pb-1">
                <p className="max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
                  Official music videos and visual releases from
                  the 39Production entertainment catalog.
                </p>

                <div className="mt-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  <Play className="h-3.5 w-3.5 text-fuchsia-600" />
                  Watch the visual archive
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            STATS
        ====================================================== */}
        {!loading && !error && videos.length > 0 && (
          <section className="border-b border-zinc-200 bg-zinc-50/60">
            <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-zinc-200">
              <div className="px-5 py-5 sm:px-8">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                  Total Videos
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em]">
                  {videos.length}
                </p>
              </div>

              <div className="px-5 py-5 sm:px-8">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                  Published
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em]">
                  {publishedCount}
                </p>
              </div>

              <div className="px-5 py-5 sm:px-8">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                  Upcoming
                </p>

                <p className="mt-1.5 text-xl font-semibold tracking-[-0.04em] text-fuchsia-600">
                  {upcomingCount}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            CONTENT
        ====================================================== */}
        <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-18 lg:py-20">
          {/* SECTION HEADER */}
          <div className="mb-8 flex items-end justify-between border-b border-zinc-200 pb-5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-fuchsia-600">
                01 / Visual Archive
              </p>

              <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
                Watch the releases.
              </h2>
            </div>

            <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
              {videos.length} Visual Works
            </span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-fuchsia-600" />

                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  Loading videos...
                </span>
              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-semibold text-red-700">
                Unable to load music videos
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            videos.length === 0 && (
              <div className="border border-zinc-200 bg-zinc-50 p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center border border-zinc-200 bg-white">
                  <Play className="h-6 w-6 text-fuchsia-500" />
                </div>

                <p className="mt-5 text-sm font-semibold text-zinc-800">
                  No music videos yet.
                </p>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-zinc-500">
                  Official visual releases from our artists will
                  appear here.
                </p>
              </div>
            )}

          {/* ====================================================
              VIDEO GRID
          ==================================================== */}
          {!loading && !error && videos.length > 0 && (
            <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => {
                const thumbnail =
                  video.thumbnail_url ||
                  getYoutubeThumbnail(video.youtube_url)

                return (
                  <article
                    key={video.id}
                    className="group min-w-0"
                  >
                    {/* THUMBNAIL */}
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="relative block aspect-video w-full overflow-hidden bg-zinc-100 text-left"
                    >
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={video.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                        />
                      ) : video.video_url ? (
                        <video
                          muted
                          preload="metadata"
                          src={video.video_url}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-fuchsia-50 via-white to-violet-50">
                          <Play className="h-12 w-12 text-fuchsia-200" />
                        </div>
                      )}

                      {/* OVERLAY */}
                      <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/25" />

                      {/* INDEX */}
                      <span className="absolute left-3 top-3 bg-black/70 px-2 py-1 font-mono text-[7px] tracking-[0.12em] text-white backdrop-blur-sm">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* STATUS */}
                      <span
                        className={`absolute right-3 top-3 px-2 py-1 font-mono text-[7px] uppercase tracking-[0.12em] backdrop-blur-sm ${video.status === 'Published'
                            ? 'bg-white/90 text-emerald-700'
                            : 'bg-white/90 text-amber-700'
                          }`}
                      >
                        {video.status}
                      </span>

                      {/* PLAY BUTTON */}
                      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-950 opacity-0 shadow-lg transition duration-300 group-hover:opacity-100">
                        <Play className="ml-0.5 h-4 w-4 fill-current" />
                      </span>

                      {/* YEAR */}
                      <span className="absolute bottom-3 left-3 font-mono text-[8px] uppercase tracking-[0.12em] text-white drop-shadow">
                        {getYear(video.release_date)}
                      </span>
                    </button>

                    {/* INFO */}
                    <div className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold tracking-[-0.025em] text-zinc-950">
                            {video.title}
                          </h3>

                          {video.group_name && (
                            <Link
                              to={`/idol/groups/${video.group_id}`}
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                              className="mt-1 inline-block truncate text-[10px] font-medium text-fuchsia-600 transition hover:text-fuchsia-700"
                            >
                              {video.group_name}
                            </Link>
                          )}
                        </div>

                        <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-400">
                          {formatDate(video.release_date)}
                        </span>
                      </div>

                      {video.description && (
                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-zinc-500">
                          {video.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
                        <button
                          type="button"
                          onClick={() => setActiveVideo(video)}
                          className="group/watch inline-flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-fuchsia-600"
                        >
                          <Play className="h-3 w-3" />
                          Watch video
                          <ArrowRight className="h-3 w-3 transition-transform group-hover/watch:translate-x-1" />
                        </button>

                        {video.youtube_url && (
                          <a
                            href={video.youtube_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                            className="inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-400 transition hover:text-fuchsia-600"
                          >
                            YouTube
                            <ExternalLink className="h-3 w-3" />
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

        {/* ======================================================
            EDITORIAL STATEMENT
        ====================================================== */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-fuchsia-600">
                02.01
              </span>

              <div>
                <p className="max-w-4xl text-2xl font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-950 sm:text-3xl lg:text-4xl">
                  Music gives a story its sound.
                  <span className="text-zinc-400">
                    {' '}
                    Visuals give it another dimension.
                  </span>
                </p>

                <div className="mt-7">
                  <Link
                    to="/idol/releases"
                    className="group inline-flex items-center gap-3 border border-zinc-300 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-900 transition hover:border-fuchsia-500 hover:bg-fuchsia-500 hover:text-white"
                  >
                    Explore Music Releases

                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            FOOTER LINE
        ====================================================== */}
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

      {/* ========================================================
          VIDEO MODAL
      ======================================================== */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveVideo(null)
            }
          }}
        >
          <div className="relative w-full max-w-5xl">
            {/* TOP BAR */}
            <div className="mb-3 flex items-center justify-between">
              <div className="min-w-0 pr-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-fuchsia-400">
                  39Production / Music Video
                </p>

                <h2 className="mt-1 truncate text-base font-semibold text-white sm:text-lg">
                  {activeVideo.title}
                </h2>

                {activeVideo.group_name && (
                  <p className="mt-0.5 text-xs text-white/45">
                    {activeVideo.group_name}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 text-white transition hover:border-fuchsia-400 hover:bg-fuchsia-500"
                aria-label="Close video"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            {/* VIDEO */}
            <div className="relative aspect-video overflow-hidden bg-black">
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
                  <Play className="h-12 w-12 text-white/20" />
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/35">
                  Released
                </p>

                <p className="mt-1 text-xs text-white/60">
                  {formatDate(activeVideo.release_date)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeVideo.group_id && (
                  <Link
                    to={`/idol/groups/${activeVideo.group_id}`}
                    onClick={() => setActiveVideo(null)}
                    className="inline-flex items-center gap-2 border border-white/15 px-3.5 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-fuchsia-400 hover:bg-fuchsia-500"
                  >
                    View Group
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}

                {activeVideo.youtube_url && (
                  <a
                    href={activeVideo.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-white/15 px-3.5 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-fuchsia-400 hover:bg-fuchsia-500"
                  >
                    Open YouTube
                    <ExternalLink className="h-3 w-3" />
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