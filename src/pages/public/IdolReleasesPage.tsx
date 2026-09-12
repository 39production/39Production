import { useEffect, useState } from 'react'
import {
  Disc3,
  Loader2,
  Music,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

export function IdolReleasesPage() {
  const [releases, setReleases] = useState<IdolRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReleases = async () => {
      try {
        setLoading(true)

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

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="text-sm uppercase tracking-widest text-purple-400">
            Discography
          </p>

          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Music Releases
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-500">
            Original songs, singles, EPs, and albums from
            39Production idol groups.
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

        {!loading && !error && releases.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-12 text-center">
            <Disc3 className="mx-auto h-12 w-12 text-zinc-700" />
            <p className="mt-4 text-zinc-500">
              Belum ada music release.
            </p>
          </div>
        )}

        {!loading && !error && releases.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {releases.map((release) => (
              <article
                key={release.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <div className="aspect-square overflow-hidden bg-zinc-900">
                  {release.cover_url ? (
                    <img
                      src={release.cover_url}
                      alt={release.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-950 to-pink-950">
                      <Music className="h-20 w-20 text-white/20" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wider text-purple-400">
                      {release.type}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${release.status === 'Released'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                    >
                      {release.status}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold">
                    {release.title}
                  </h2>

                  {release.group_name && (
                    <Link
                      to={`/idol/groups/${release.group_id}`}
                      className="mt-1 block text-sm text-purple-400 hover:text-purple-300"
                    >
                      {release.group_name}
                    </Link>
                  )}

                  <p className="mt-2 text-sm text-zinc-500">
                    {formatDate(release.release_date)}
                  </p>

                  {release.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
                      {release.description}
                    </p>
                  )}

                  {release.audio_url && (
                    <audio
                      controls
                      className="mt-5 h-9 w-full"
                      src={release.audio_url}
                    />
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    {release.spotify_url && (
                      <a
                        href={release.spotify_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                      >
                        Spotify
                      </a>
                    )}

                    {release.youtube_url && (
                      <a
                        href={release.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}