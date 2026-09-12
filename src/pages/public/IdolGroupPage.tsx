import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Disc3,
  Loader2,
  Music,
  Play,
  User,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

interface IdolMember {
  id: number
  name: string
  stage_name: string
  position: string
  birth_date: string
  bio: string
  image_url: string
  status: 'Active' | 'Inactive'
}

interface IdolRelease {
  id: number
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

interface IdolMusicVideo {
  id: number
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  youtube_url: string
  release_date: string
  status: 'Published' | 'Upcoming'
}

interface IdolActivity {
  id: number
  title: string
  type: 'Concert' | 'Fan Meeting' | 'Event' | 'Schedule'
  date: string
  location: string
  description: string
  image_url: string
  status: 'Upcoming' | 'Completed' | 'Cancelled'
}

interface IdolGroup {
  id: number
  name: string
  description: string
  image_url: string
  status: 'Active' | 'Hiatus'
  members: IdolMember[]
  releases: IdolRelease[]
  music_videos: IdolMusicVideo[]
  activities: IdolActivity[]
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

export function IdolGroupPage() {
  const { id } = useParams()

  const [groups, setGroups] = useState<IdolGroup[]>([])
  const [group, setGroup] = useState<IdolGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        if (id) {
          const data = await apiRequest<IdolGroup>(
            `/api/idol/groups/${id}`,
          )

          setGroup(data)
          return
        }

        const data = await apiRequest<IdolGroup[]>(
          '/api/idol/groups',
        )

        setGroups(data || [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat data group.',
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090B] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
          {error}
        </div>
      </div>
    )
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white">
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-widest text-purple-400">
              39Production
            </p>
            <h1 className="mt-2 text-4xl font-bold">
              Idol Groups
            </h1>
            <p className="mt-3 text-zinc-500">
              Discover all idol groups managed by 39Production.
            </p>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-12 text-center text-zinc-500">
              Belum ada idol group.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((item) => (
                <Link
                  key={item.id}
                  to={`/idol/groups/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:-translate-y-1 hover:border-purple-500/40"
                >
                  <div className="aspect-video overflow-hidden bg-zinc-900">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-950 to-pink-950">
                        <Music className="h-14 w-14 text-white/20" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold">
                        {item.name}
                      </h2>

                      <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                      {item.description || 'Idol group 39Production.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#09090B] px-6 py-20 text-center text-zinc-500">
        Group tidak ditemukan.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-transparent to-pink-950/20" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Link
            to="/idol/groups"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>

          <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:items-center">
            <div className="aspect-square overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
              {group.image_url ? (
                <img
                  src={group.image_url}
                  alt={group.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-950 to-pink-950">
                  <Music className="h-24 w-24 text-white/20" />
                </div>
              )}
            </div>

            <div>
              <span className="inline-flex rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                {group.status}
              </span>

              <h1 className="mt-4 text-5xl font-bold">
                {group.name}
              </h1>

              <p className="mt-5 max-w-2xl leading-8 text-zinc-400">
                {group.description || 'Idol group 39Production.'}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={<Users className="h-4 w-4" />}
                  value={group.members?.length || 0}
                  label="Members"
                />

                <Stat
                  icon={<Disc3 className="h-4 w-4" />}
                  value={group.releases?.length || 0}
                  label="Releases"
                />

                <Stat
                  icon={<Play className="h-4 w-4" />}
                  value={group.music_videos?.length || 0}
                  label="Videos"
                />

                <Stat
                  icon={<CalendarDays className="h-4 w-4" />}
                  value={group.activities?.length || 0}
                  label="Events"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERS */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <SectionHeader
          icon={<Users className="h-5 w-5" />}
          title="Members"
        />

        {group.members?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {group.members.map((member) => (
              <Link
                key={member.id}
                to={`/idol/members/${member.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-purple-500/40"
              >
                <div className="aspect-[4/5] overflow-hidden bg-zinc-900">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.stage_name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-16 w-16 text-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-lg font-semibold">
                    {member.stage_name}
                  </p>
                  <p className="mt-1 text-sm text-purple-400">
                    {member.position}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty text="Belum ada member." />
        )}
      </section>

      {/* RELEASES */}
      <section className="border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <SectionHeader
            icon={<Disc3 className="h-5 w-5" />}
            title="Music Releases"
          />

          {group.releases?.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {group.releases.map((release) => (
                <div
                  key={release.id}
                  className="rounded-2xl border border-white/10 bg-[#09090B] p-5"
                >
                  <div className="flex gap-5">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                      {release.cover_url ? (
                        <img
                          src={release.cover_url}
                          alt={release.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Music className="h-8 w-8 text-zinc-700" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs text-purple-400">
                        {release.type}
                      </span>

                      <h3 className="mt-1 truncate text-lg font-semibold">
                        {release.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(release.release_date)}
                      </p>

                      {release.audio_url && (
                        <audio
                          className="mt-3 h-8 w-full"
                          controls
                          src={release.audio_url}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Belum ada music release." />
          )}
        </div>
      </section>

      {/* MUSIC VIDEOS */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <SectionHeader
          icon={<Play className="h-5 w-5" />}
          title="Music Videos"
        />

        {group.music_videos?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {group.music_videos.map((video) => (
              <div
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
                      className="h-full w-full object-cover"
                      src={video.video_url}
                    />
                  ) : video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-14 w-14 text-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Belum ada music video." />
        )}
      </section>

      {/* ACTIVITIES */}
      <section className="border-t border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <SectionHeader
            icon={<CalendarDays className="h-5 w-5" />}
            title="Activities & Events"
          />

          {group.activities?.length ? (
            <div className="space-y-4">
              {group.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-white/10 bg-[#09090B] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-xs text-purple-400">
                        {activity.type}
                      </span>

                      <h3 className="mt-1 text-lg font-semibold">
                        {activity.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(activity.date)}
                        {activity.location
                          ? ` • ${activity.location}`
                          : ''}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs ${activity.status === 'Upcoming'
                        ? 'bg-purple-500/10 text-purple-300'
                        : activity.status === 'Completed'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                        }`}
                    >
                      {activity.status}
                    </span>
                  </div>

                  {activity.description && (
                    <p className="mt-4 text-sm leading-6 text-zinc-500">
                      {activity.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Belum ada activity." />
          )}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
        {icon}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-purple-400">
        {icon}
        <span className="text-xl font-bold text-white">{value}</span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-zinc-500">
      {text}
    </div>
  )
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