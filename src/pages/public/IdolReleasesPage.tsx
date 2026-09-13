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

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

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

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-purple-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              Discography
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Music Releases
            </h1>

            <p className="mt-4 text-base leading-7 text-zinc-600">
              Original songs, singles, EPs, and albums from
              39Production idol groups.
            </p>
          </div>
        </div>
      </section>

      {/* RELEASES */}
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

        {!loading && !error && releases.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
              <Disc3 className="h-7 w-7 text-purple-500" />
            </div>

            <p className="mt-5 font-medium text-zinc-700">
              Belum ada music release.
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Original releases from our artists will appear here.
            </p>
          </div>
        )}

        {!loading && !error && releases.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {releases.map((release) => (
              <article
                key={release.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/40"
              >
                {/* COVER */}
                <div className="relative aspect-square overflow-hidden bg-zinc-100">
                  {release.cover_url ? (
                    <img
                      src={release.cover_url}
                      alt={release.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                      <Music className="h-20 w-20 text-purple-200" />
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <span className="rounded-full border border-purple-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-purple-700 shadow-sm">
                      {release.type}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full border bg-white/95 px-3 py-1.5 text-[11px] font-medium shadow-sm ${release.status === 'Released'
                          ? 'border-emerald-200 text-emerald-700'
                          : 'border-amber-200 text-amber-700'
                        }`}
                    >
                      {release.status}
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 sm:p-6">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                    {release.title}
                  </h2>

                  {release.group_name && (
                    <Link
                      to={`/idol/groups/${release.group_id}`}
                      className="mt-1 block text-sm font-medium text-purple-600 transition hover:text-purple-700"
                    >
                      {release.group_name}
                    </Link>
                  )}

                  <p className="mt-2 text-sm text-zinc-500">
                    {formatDate(release.release_date)}
                  </p>

                  {release.description && (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">
                      {release.description}
                    </p>
                  )}

                  {release.audio_url && (
                    <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                      <audio
                        controls
                        className="h-9 w-full"
                        src={release.audio_url}
                      />
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {release.spotify_url && (
                      <a
                        href={release.spotify_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                      >
                        Spotify
                      </a>
                    )}

                    {release.youtube_url && (
                      <a
                        href={release.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
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