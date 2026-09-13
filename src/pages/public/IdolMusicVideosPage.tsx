import { useEffect, useState } from 'react'
import {
  Loader2,
  Play,
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
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

function toYoutubeEmbed(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${id}`
    }

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')

      if (id) {
        return `https://www.youtube.com/embed/${id}`
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

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-pink-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-purple-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-600">
              Video
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Music Videos
            </h1>

            <p className="mt-4 text-base leading-7 text-zinc-600">
              Official music videos from 39Production idol groups.
            </p>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
              <Play className="h-7 w-7 text-purple-500" />
            </div>

            <p className="mt-5 font-medium text-zinc-700">
              Belum ada music video.
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Official visual releases from our artists will appear here.
            </p>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/40"
              >
                {/* VIDEO */}
                <div className="relative aspect-video overflow-hidden bg-zinc-100">
                  {video.youtube_url ? (
                    <iframe
                      src={toYoutubeEmbed(video.youtube_url)}
                      title={video.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : video.video_url ? (
                    <video
                      controls
                      poster={video.thumbnail_url || undefined}
                      src={video.video_url}
                      className="h-full w-full object-cover"
                    />
                  ) : video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                      <Play className="h-16 w-16 text-purple-200" />
                    </div>
                  )}

                  <div className="pointer-events-none absolute left-4 top-4">
                    <span
                      className={`rounded-full border bg-white/95 px-3 py-1.5 text-[11px] font-medium shadow-sm ${video.status === 'Published'
                          ? 'border-emerald-200 text-emerald-700'
                          : 'border-amber-200 text-amber-700'
                        }`}
                    >
                      {video.status}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                        {video.title}
                      </h2>

                      {video.group_name && (
                        <p className="mt-1 text-sm font-medium text-purple-600">
                          {video.group_name}
                        </p>
                      )}
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1 text-[11px] font-medium sm:mt-0.5 ${video.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {video.status}
                    </span>
                  </div>

                  {video.release_date && (
                    <p className="mt-3 text-sm text-zinc-500">
                      {formatDate(video.release_date)}
                    </p>
                  )}

                  {video.description && (
                    <p className="mt-4 text-sm leading-6 text-zinc-600">
                      {video.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}