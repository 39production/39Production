import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Disc3,
  Loader2,
  Music,
  Play,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

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
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

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

export function IdolPage() {
  const [groups, setGroups] = useState<IdolGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<IdolGroup[]>('/api/idol/groups')
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
  }, [])

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-purple-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-pink-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
              <Music className="h-4 w-4" />
              39Production Idol
            </div>

            <h1 className="mt-7 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Building Artists,
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Music & Experiences
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
              Discover the artists and idol groups behind 39Production —
              from original music and visual releases to performances,
              members, and upcoming activities.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/idol/groups"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 font-medium text-white transition hover:bg-zinc-800"
              >
                Explore Groups
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/idol/music-videos"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 font-medium text-zinc-800 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
              >
                <Play className="h-4 w-4" />
                Watch Music Videos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="border-b border-zinc-200 bg-zinc-50/70">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-zinc-200 sm:grid-cols-4">
          <Link
            to="/idol/groups"
            className="bg-white p-5 transition hover:bg-purple-50/60 sm:p-6"
          >
            <Users className="mb-3 h-6 w-6 text-violet-600" />

            <h3 className="font-semibold text-zinc-900">
              Groups
            </h3>

            <p className="mt-1 text-sm leading-5 text-zinc-500">
              Discover our artists
            </p>
          </Link>

          <Link
            to="/idol/members"
            className="bg-white p-5 transition hover:bg-pink-50/60 sm:p-6"
          >
            <Users className="mb-3 h-6 w-6 text-pink-500" />

            <h3 className="font-semibold text-zinc-900">
              Members
            </h3>

            <p className="mt-1 text-sm leading-5 text-zinc-500">
              Meet the people behind the artists
            </p>
          </Link>

          <Link
            to="/idol/releases"
            className="bg-white p-5 transition hover:bg-purple-50/60 sm:p-6"
          >
            <Disc3 className="mb-3 h-6 w-6 text-violet-600" />

            <h3 className="font-semibold text-zinc-900">
              Releases
            </h3>

            <p className="mt-1 text-sm leading-5 text-zinc-500">
              Explore original music
            </p>
          </Link>

          <Link
            to="/idol/events"
            className="bg-white p-5 transition hover:bg-pink-50/60 sm:p-6"
          >
            <CalendarDays className="mb-3 h-6 w-6 text-pink-500" />

            <h3 className="font-semibold text-zinc-900">
              Events
            </h3>

            <p className="mt-1 text-sm leading-5 text-zinc-500">
              Follow upcoming activities
            </p>
          </Link>
        </div>
      </section>

      {/* GROUPS */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Our Artists
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Idol Groups
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
                Meet the groups shaping the 39Production entertainment
                universe through music, performance, and visual storytelling.
              </p>
            </div>

            <Link
              to="/idol/groups"
              className="inline-flex items-center gap-2 self-start text-sm font-medium text-zinc-600 transition hover:text-purple-600 sm:self-auto"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading && (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
                <Music className="h-7 w-7 text-purple-500" />
              </div>

              <p className="mt-5 font-medium text-zinc-700">
                Our artist roster is currently being prepared.
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Check back soon for the latest 39Production idol projects.
              </p>
            </div>
          )}

          {!loading && !error && groups.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.slice(0, 6).map((group) => (
                <Link
                  key={group.id}
                  to={`/idol/groups/${group.id}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                    {group.image_url ? (
                      <img
                        src={group.image_url}
                        alt={group.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                        <Music className="h-16 w-16 text-purple-200" />
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${group.status === 'Active'
                            ? 'border-emerald-200 bg-white/95 text-emerald-700'
                            : 'border-amber-200 bg-white/95 text-amber-700'
                          }`}
                      >
                        {group.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-bold tracking-tight text-zinc-900 transition group-hover:text-purple-600">
                        {group.name}
                      </h3>

                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-purple-500" />
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                      {group.description ||
                        'An original idol project from 39Production.'}
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-5">
                      <div>
                        <p className="text-lg font-semibold text-zinc-900">
                          {group.member_count || 0}
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          Members
                        </p>
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-zinc-900">
                          {group.release_count || 0}
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          Releases
                        </p>
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-zinc-900">
                          {group.music_video_count || 0}
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          Videos
                        </p>
                      </div>
                    </div>

                    {group.upcoming_activity_count > 0 && (
                      <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4 text-xs font-medium text-purple-600">
                        <CalendarDays className="h-3.5 w-3.5" />

                        <span>
                          {group.upcoming_activity_count} upcoming{' '}
                          {group.upcoming_activity_count === 1
                            ? 'activity'
                            : 'activities'}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}