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
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.22),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 text-sm text-purple-300">
              <Music className="h-4 w-4" />
              39Production Idol
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Building Artists,
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Music & Experiences
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Discover the artists and idol groups behind 39Production —
              from original music and visual releases to performances,
              members, and upcoming activities.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/idol/groups"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 font-medium text-white transition hover:bg-brand-primary/80"
              >
                Explore Groups
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/idol/music-videos"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition hover:bg-white/10"
              >
                <Play className="h-4 w-4" />
                Watch Music Videos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
          <Link
            to="/idol/groups"
            className="bg-[#09090B] p-6 transition hover:bg-white/[0.03]"
          >
            <Users className="mb-3 h-6 w-6 text-purple-400" />
            <h3 className="font-semibold">Groups</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Discover our artists
            </p>
          </Link>

          <Link
            to="/idol/members"
            className="bg-[#09090B] p-6 transition hover:bg-white/[0.03]"
          >
            <Users className="mb-3 h-6 w-6 text-pink-400" />
            <h3 className="font-semibold">Members</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Meet the people behind the artists
            </p>
          </Link>

          <Link
            to="/idol/releases"
            className="bg-[#09090B] p-6 transition hover:bg-white/[0.03]"
          >
            <Disc3 className="mb-3 h-6 w-6 text-purple-400" />
            <h3 className="font-semibold">Releases</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Explore original music
            </p>
          </Link>

          <Link
            to="/idol/events"
            className="bg-[#09090B] p-6 transition hover:bg-white/[0.03]"
          >
            <CalendarDays className="mb-3 h-6 w-6 text-pink-400" />
            <h3 className="font-semibold">Events</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Follow upcoming activities
            </p>
          </Link>
        </div>
      </section>

      {/* GROUPS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-purple-400">
              Our Artists
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Idol Groups
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Meet the groups shaping the 39Production entertainment
              universe through music, performance, and visual storytelling.
            </p>
          </div>

          <Link
            to="/idol/groups"
            className="hidden items-center gap-2 text-sm text-zinc-400 transition hover:text-white sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <Music className="mx-auto h-10 w-10 text-zinc-600" />

            <p className="mt-4 text-zinc-400">
              Our artist roster is currently being prepared.
            </p>

            <p className="mt-2 text-sm text-zinc-600">
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
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:-translate-y-1 hover:border-purple-500/40 hover:bg-white/[0.04]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                  {group.image_url ? (
                    <img
                      src={group.image_url}
                      alt={group.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-950 to-pink-950">
                      <Music className="h-16 w-16 text-white/20" />
                    </div>
                  )}

                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${group.status === 'Active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                    >
                      {group.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold transition group-hover:text-purple-400">
                      {group.name}
                    </h3>

                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-purple-400" />
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                    {group.description ||
                      'An original idol project from 39Production.'}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
                    <div>
                      <p className="text-lg font-semibold">
                        {group.member_count || 0}
                      </p>
                      <p className="text-xs text-zinc-600">
                        Members
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-semibold">
                        {group.release_count || 0}
                      </p>
                      <p className="text-xs text-zinc-600">
                        Releases
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-semibold">
                        {group.music_video_count || 0}
                      </p>
                      <p className="text-xs text-zinc-600">
                        Videos
                      </p>
                    </div>
                  </div>

                  {group.upcoming_activity_count > 0 && (
                    <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-purple-400">
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
      </section>
    </div>
  )
}