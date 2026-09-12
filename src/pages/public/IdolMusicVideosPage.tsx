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

  if (Number.isNaN(parsed.getTime())) return date

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
    <div className="min-h-screen bg-[#09090B] text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm uppercase tracking-widest text-pink-400">
            Video
          </p>

          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Music Videos
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-500">
            Official music videos from 39Production idol groups.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-12 text-center text-zinc-500">
            <Play className="mx-auto h-12 w-12 text-zinc-700" />
            <p className="mt-4">
              Belum ada music video.
            </p>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <div className="aspect-video bg-zinc-900">
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
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-16 w-16 text-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {video.title}
                      </h2>

                      {video.group_name && (
                        <p className="mt-1 text-sm text-purple-400">
                          {video.group_name}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs ${video.status === 'Published'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                    >
                      {video.status}
                    </span>
                  </div>

                  {video.release_date && (
                    <p className="mt-3 text-sm text-zinc-600">
                      {formatDate(video.release_date)}
                    </p>
                  )}

                  {video.description && (
                    <p className="mt-4 text-sm leading-6 text-zinc-500">
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