import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-9 w-9 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }

  /*
   * ============================================================
   * GROUP LIST
   * ============================================================
   */

  if (!id) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <section className="relative overflow-hidden border-b border-zinc-200">
          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-purple-100/70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                39Production
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
                Idol Groups
              </h1>

              <p className="mt-4 text-base leading-7 text-zinc-600">
                Discover all idol groups managed by 39Production.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
                <Music className="h-7 w-7 text-purple-500" />
              </div>

              <p className="mt-5 font-medium text-zinc-700">
                Belum ada idol group.
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Artist projects will appear here as they are published.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((item) => (
                <Link
                  key={item.id}
                  to={`/idol/groups/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/40"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                        <Music className="h-14 w-14 text-purple-200" />
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border bg-white/95 px-3 py-1 text-xs font-medium shadow-sm ${item.status === 'Active'
                            ? 'border-emerald-200 text-emerald-700'
                            : 'border-amber-200 text-amber-700'
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900 transition group-hover:text-purple-600">
                          {item.name}
                        </h2>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                          {item.description ||
                            'Idol group 39Production.'}
                        </p>
                      </div>

                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-purple-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  /*
   * ============================================================
   * GROUP NOT FOUND
   * ============================================================
   */

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50">
            <Music className="h-7 w-7 text-zinc-300" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-zinc-800">
            Group tidak ditemukan.
          </h1>

          <Link
            to="/idol/groups"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-purple-600 transition hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  /*
   * ============================================================
   * GROUP DETAIL
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full bg-purple-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-pink-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
          <Link
            to="/idol/groups"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>

          <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:items-center lg:gap-14">
            {/* GROUP IMAGE */}
            <div className="mx-auto w-full max-w-md">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-xl shadow-zinc-200/50">
                {group.image_url ? (
                  <img
                    src={group.image_url}
                    alt={group.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                    <Music className="h-24 w-24 text-purple-200" />
                  </div>
                )}

                <div className="absolute left-5 top-5">
                  <span
                    className={`rounded-full border bg-white/95 px-3 py-1.5 text-xs font-medium shadow-sm ${group.status === 'Active'
                        ? 'border-emerald-200 text-emerald-700'
                        : 'border-amber-200 text-amber-700'
                      }`}
                  >
                    {group.status}
                  </span>
                </div>
              </div>
            </div>

            {/* GROUP INFO */}
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                39Production Idol
              </p>

              <h1 className="mt-3 break-words text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                {group.name}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
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
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <SectionHeader
          icon={<Users className="h-5 w-5" />}
          title="Members"
          description="Meet the artists behind the group."
        />

        {group.members?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {group.members.map((member) => (
              <Link
                key={member.id}
                to={`/idol/members/${member.id}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.stage_name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                      <User className="h-16 w-16 text-purple-200" />
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <span
                      className={`rounded-full border bg-white/95 px-2.5 py-1 text-[11px] font-medium shadow-sm ${member.status === 'Active'
                          ? 'border-emerald-200 text-emerald-700'
                          : 'border-zinc-200 text-zinc-500'
                        }`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-zinc-900 transition group-hover:text-purple-600">
                        {member.stage_name}
                      </p>

                      <p className="mt-1 text-sm font-medium text-purple-600">
                        {member.position}
                      </p>
                    </div>

                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-purple-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty text="Belum ada member." />
        )}
      </section>

      {/* RELEASES */}
      <section className="border-y border-zinc-200 bg-zinc-50/70">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <SectionHeader
            icon={<Disc3 className="h-5 w-5" />}
            title="Music Releases"
            description="Original music released by this group."
          />

          {group.releases?.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {group.releases.map((release) => (
                <div
                  key={release.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-purple-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      {release.cover_url ? (
                        <img
                          src={release.cover_url}
                          alt={release.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                          <Music className="h-8 w-8 text-purple-200" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
                          {release.type}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${release.status === 'Released'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                            }`}
                        >
                          {release.status}
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                        {release.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {formatDate(release.release_date)}
                      </p>

                      {release.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
                          {release.description}
                        </p>
                      )}

                      {release.audio_url && (
                        <audio
                          className="mt-4 h-9 w-full"
                          controls
                          src={release.audio_url}
                        />
                      )}

                      {(release.spotify_url ||
                        release.youtube_url) && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {release.spotify_url && (
                              <a
                                href={release.spotify_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                              >
                                Spotify
                              </a>
                            )}

                            {release.youtube_url && (
                              <a
                                href={release.youtube_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) =>
                                  event.stopPropagation()
                                }
                                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                              >
                                YouTube
                              </a>
                            )}
                          </div>
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
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <SectionHeader
          icon={<Play className="h-5 w-5" />}
          title="Music Videos"
          description="Watch visual releases and music videos from the group."
        />

        {group.music_videos?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {group.music_videos.map((video) => (
              <div
                key={video.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-purple-200 hover:shadow-md"
              >
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
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                      <Play className="h-14 w-14 text-purple-200" />
                    </div>
                  )}

                  <div className="absolute left-4 top-4 pointer-events-none">
                    <span
                      className={`rounded-full border bg-white/95 px-3 py-1 text-[11px] font-medium shadow-sm ${video.status === 'Published'
                          ? 'border-emerald-200 text-emerald-700'
                          : 'border-amber-200 text-amber-700'
                        }`}
                    >
                      {video.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-zinc-900">
                    {video.title}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(video.release_date)}
                  </p>

                  {video.description && (
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Belum ada music video." />
        )}
      </section>

      {/* ACTIVITIES */}
      <section className="border-t border-zinc-200 bg-zinc-50/70">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <SectionHeader
            icon={<CalendarDays className="h-5 w-5" />}
            title="Activities & Events"
            description="Follow upcoming schedules, concerts, and group activities."
          />

          {group.activities?.length ? (
            <div className="space-y-4">
              {group.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-purple-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 sm:flex">
                        <CalendarDays className="h-5 w-5 text-purple-600" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
                            {activity.type}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${activity.status === 'Upcoming'
                                ? 'bg-purple-50 text-purple-700'
                                : activity.status === 'Completed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-600'
                              }`}
                          >
                            {activity.status}
                          </span>
                        </div>

                        <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                          {activity.title}
                        </h3>

                        <div className="mt-2 flex flex-col gap-1 text-sm text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-2">
                          <span>{formatDate(activity.date)}</span>

                          {activity.location && (
                            <>
                              <span className="hidden sm:inline">
                                •
                              </span>
                              <span>{activity.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {activity.image_url && (
                      <div className="h-28 w-full overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-32 sm:shrink-0">
                        <img
                          src={activity.image_url}
                          alt={activity.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {activity.description && (
                    <p className="mt-5 border-t border-zinc-100 pt-4 text-sm leading-6 text-zinc-600">
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
  description,
}: {
  icon: ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="mb-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          {icon}
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          {title}
        </h2>
      </div>

      {description && (
        <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: number
  label: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-purple-600">
        {icon}

        <span className="text-xl font-bold text-zinc-900">
          {value}
        </span>
      </div>

      <p className="mt-1 text-xs font-medium text-zinc-500">
        {label}
      </p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center text-sm text-zinc-500">
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