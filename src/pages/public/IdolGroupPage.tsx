import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Disc3,
  Loader2,
  MapPin,
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

function getShortDate(date: string) {
  if (!date) return '-'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

function getYear(date: string) {
  if (!date) return '-'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date.slice(0, 4)
  }

  return parsed.getFullYear().toString()
}

function toYoutubeEmbed(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')

      return `https://www.youtube.com/embed/${videoId}`
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
  } catch {
    return url
  }

  return url
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
        <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-6 py-20 text-zinc-900">
        <div className="mx-auto max-w-4xl border border-red-200 bg-red-50 p-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-500">
            39Production / Error
          </p>

          <p className="mt-3 text-sm text-red-700">
            {error}
          </p>

          <Link
            to="/idol/groups"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-800 transition hover:text-violet-600"
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
   * GROUP DIRECTORY
   * ============================================================
   */

  if (!id) {
    return (
      <div
        className="min-h-screen bg-white text-zinc-900"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      >
        <div className="pointer-events-none fixed -right-40 top-10 h-96 w-96 rounded-full bg-violet-100/50 blur-3xl" />
        <div className="pointer-events-none fixed -left-40 bottom-0 h-96 w-96 rounded-full bg-fuchsia-100/40 blur-3xl" />

        {/* HERO */}
        <section className="relative border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
            <div className="flex items-end justify-between gap-10">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
                    39Production
                  </span>

                  <span className="h-px w-8 bg-zinc-300" />

                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-violet-600">
                    Entertainment / Groups
                  </span>
                </div>

                <h1 className="mt-7 text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-zinc-950 sm:text-6xl lg:text-7xl">
                  Artists become
                  <br />
                  <span className="text-violet-600">a story.</span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                  Discover the idol groups developed, managed, and
                  produced through the 39Production entertainment
                  platform.
                </p>
              </div>

              <div className="hidden text-right lg:block">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                  Active roster
                </p>

                <p className="mt-2 font-mono text-5xl tracking-[-0.06em] text-zinc-950">
                  {String(groups.length).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GROUP DIRECTORY */}
        <section className="relative bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
            {groups.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
                <Music className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-5 text-sm font-medium text-zinc-700">
                  Belum ada idol group.
                </p>

                <p className="mt-2 text-xs leading-6 text-zinc-400">
                  Artist projects will appear here as they are published.
                </p>
              </div>
            ) : (
              <div className="border-t border-zinc-200">
                {groups.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/idol/groups/${item.id}`}
                    className="group grid border-b border-zinc-200 transition hover:bg-zinc-50 lg:grid-cols-[72px_280px_1fr_auto] lg:items-center"
                  >
                    {/* INDEX */}
                    <div className="hidden h-full items-center border-r border-zinc-200 px-5 lg:flex">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* IMAGE */}
                    <div className="relative m-4 aspect-video overflow-hidden bg-zinc-100 sm:m-5 lg:m-0 lg:aspect-[1.5] lg:h-[170px]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-violet-50">
                          <Music className="h-10 w-10 text-zinc-200" />
                        </div>
                      )}

                      <span
                        className={`absolute left-3 top-3 border bg-white/95 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.15em] ${item.status === 'Active'
                            ? 'border-violet-200 text-violet-600'
                            : 'border-amber-200 text-amber-600'
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* INFO */}
                    <div className="px-5 pb-6 lg:px-8 lg:py-7">
                      <div className="flex items-center gap-3 lg:hidden">
                        <span className="font-mono text-[9px] text-zinc-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="h-px w-6 bg-zinc-300" />
                      </div>

                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 transition group-hover:text-violet-600 lg:mt-0 lg:text-4xl">
                        {item.name}
                      </h2>

                      <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-zinc-500">
                        {item.description ||
                          'Idol group 39Production.'}
                      </p>
                    </div>

                    {/* ACTION */}
                    <div className="hidden items-center gap-4 border-l border-zinc-200 px-7 lg:flex">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 transition group-hover:text-violet-600">
                        View group
                      </span>

                      <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FOOTER STATEMENT */}
        <section className="border-t border-zinc-200 bg-zinc-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[120px_1fr_auto] lg:items-end">
              <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-500">
                05.01
              </span>

              <h2 className="max-w-3xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                Building groups.
                <br />
                Creating
                <span className="text-violet-400"> identities.</span>
              </h2>

              <Link
                to="/idol/members"
                className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 transition hover:text-white"
              >
                Meet the members
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-zinc-200 bg-zinc-50">
            <Music className="h-6 w-6 text-zinc-300" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-zinc-800">
            Group tidak ditemukan.
          </h1>

          <Link
            to="/idol/groups"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition hover:text-violet-700"
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
    <div
      className="min-h-screen bg-white text-zinc-900"
      style={{
        backgroundImage: `
          linear-gradient(to right, #111 1px, transparent 1px),
          linear-gradient(to bottom, #111 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
      }}
    >
      <div className="pointer-events-none fixed -right-40 top-20 h-96 w-96 rounded-full bg-violet-100/50 blur-3xl" />

      <div className="pointer-events-none fixed -left-40 bottom-0 h-96 w-96 rounded-full bg-fuchsia-100/40 blur-3xl" />

      {/* ========================================================
          TOP NAV
          ======================================================== */}

      <header className="relative border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            to="/idol/groups"
            className="group inline-flex items-center gap-3 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            All Groups
          </Link>

          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
            39Production / Group Profile
          </span>
        </div>
      </header>

      {/* ========================================================
          GROUP HERO
          ======================================================== */}

      <section className="relative border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="grid border border-zinc-200 lg:grid-cols-[45%_55%]">
            {/* IMAGE */}
            <div className="relative min-h-[420px] overflow-hidden bg-zinc-100 lg:min-h-[590px]">
              {group.image_url ? (
                <img
                  src={group.image_url}
                  alt={group.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-violet-50">
                  <Music className="h-24 w-24 text-zinc-200" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

              <div className="absolute left-6 top-6">
                <span
                  className={`border bg-white/95 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] ${group.status === 'Active'
                      ? 'border-violet-200 text-violet-600'
                      : 'border-amber-200 text-amber-600'
                    }`}
                >
                  {group.status}
                </span>
              </div>

              <div className="absolute bottom-6 left-6">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/60">
                  Group No.
                </p>

                <p className="mt-1 font-mono text-2xl tracking-[-0.04em] text-white">
                  #{String(group.id).padStart(3, '0')}
                </p>
              </div>
            </div>

            {/* INFO */}
            <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600">
                    39Production Idol
                  </span>

                  <span className="h-px w-8 bg-zinc-300" />
                </div>

                <h1 className="mt-7 max-w-xl break-words text-5xl font-semibold leading-[0.88] tracking-[-0.065em] text-zinc-950 sm:text-6xl lg:text-7xl">
                  {group.name}
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base sm:leading-8">
                  {group.description ||
                    'Idol group 39Production.'}
                </p>
              </div>

              {/* STATS */}
              <div className="mt-12 grid border-t border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  value={group.members?.length || 0}
                  label="Members"
                  icon={<Users className="h-3.5 w-3.5" />}
                />

                <Stat
                  value={group.releases?.length || 0}
                  label="Releases"
                  icon={<Disc3 className="h-3.5 w-3.5" />}
                />

                <Stat
                  value={group.music_videos?.length || 0}
                  label="Videos"
                  icon={<Play className="h-3.5 w-3.5" />}
                />

                <Stat
                  value={group.activities?.length || 0}
                  label="Activities"
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          MEMBERS
          ======================================================== */}

      <section className="relative border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
          <SectionIntro
            number="01"
            eyebrow="The Roster"
            title="Members"
            description="The artists behind the group."
          />

          {group.members?.length ? (
            <div className="mt-10 grid border-t border-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
              {group.members.map((member, index) => (
                <Link
                  key={member.id}
                  to={`/idol/members/${member.id}`}
                  className="group border-b border-zinc-200 p-4 transition hover:bg-zinc-50 sm:p-5 lg:border-r lg:p-4"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.stage_name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-violet-50">
                        <User className="h-14 w-14 text-zinc-200" />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 font-mono text-[9px] text-white drop-shadow-md">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`absolute right-3 top-3 border bg-white/95 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${member.status === 'Active'
                          ? 'border-violet-200 text-violet-600'
                          : 'border-zinc-200 text-zinc-400'
                        }`}
                    >
                      {member.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-5">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold tracking-[-0.025em] text-zinc-950 transition group-hover:text-violet-600">
                        {member.stage_name}
                      </h3>

                      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">
                        {member.position}
                      </p>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <Empty text="Belum ada member." />
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          RELEASES
          ======================================================== */}

      <section className="relative border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
          <SectionIntro
            number="02"
            eyebrow="Discography"
            title="Music Releases"
            description="A record of the group's released and upcoming music."
          />

          {group.releases?.length ? (
            <div className="mt-10 border-t border-zinc-300">
              {group.releases.map((release, index) => (
                <div
                  key={release.id}
                  className="grid border-b border-zinc-300 py-5 lg:grid-cols-[60px_96px_1fr_auto] lg:items-center lg:gap-6"
                >
                  {/* INDEX */}
                  <span className="hidden font-mono text-[9px] text-zinc-400 lg:block">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* COVER */}
                  <div className="mb-5 aspect-square w-24 overflow-hidden bg-zinc-200 lg:mb-0">
                    {release.cover_url ? (
                      <img
                        src={release.cover_url}
                        alt={release.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-100">
                        <Disc3 className="h-7 w-7 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-violet-600">
                        {release.type}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-zinc-300" />

                      <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-400">
                        {getYear(release.release_date)}
                      </span>

                      <span
                        className={`font-mono text-[8px] uppercase tracking-[0.15em] ${release.status === 'Released'
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                          }`}
                      >
                        / {release.status}
                      </span>
                    </div>

                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-zinc-950">
                      {release.title}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      {formatDate(release.release_date)}
                    </p>

                    {release.description && (
                      <p className="mt-3 max-w-xl line-clamp-2 text-sm leading-6 text-zinc-500">
                        {release.description}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-5 flex flex-wrap items-center gap-3 lg:mt-0 lg:justify-end">
                    {release.audio_url && (
                      <audio
                        className="h-8 max-w-[220px]"
                        controls
                        src={release.audio_url}
                      />
                    )}

                    {release.spotify_url && (
                      <a
                        href={release.spotify_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        className="border border-zinc-300 px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-600 transition hover:border-violet-300 hover:text-violet-600"
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
                        className="border border-zinc-300 px-3 py-2 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-600 transition hover:border-violet-300 hover:text-violet-600"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <Empty text="Belum ada music release." />
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          MUSIC VIDEOS
          ======================================================== */}

      <section className="relative border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
          <SectionIntro
            number="03"
            eyebrow="Visual Archive"
            title="Music Videos"
            description="Visual releases accompanying the group's music."
          />

          {group.music_videos?.length ? (
            <div className="mt-10 grid gap-px border border-zinc-200 bg-zinc-200 md:grid-cols-2">
              {group.music_videos.map((video, index) => (
                <div
                  key={video.id}
                  className="group bg-white"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-100">
                    {video.youtube_url ? (
                      <iframe
                        src={toYoutubeEmbed(video.youtube_url)}
                        title={video.title}
                        className="absolute inset-0 h-full w-full"
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
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-violet-50">
                        <Play className="h-12 w-12 text-zinc-200" />
                      </div>
                    )}

                    <span className="pointer-events-none absolute left-4 top-4 border border-white/30 bg-black/50 px-2 py-1 font-mono text-[8px] text-white backdrop-blur-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-5 p-5 lg:p-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-violet-600">
                          {video.status}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-zinc-300" />

                        <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-400">
                          {getShortDate(video.release_date)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-950">
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                          {video.description}
                        </p>
                      )}
                    </div>

                    {video.youtube_url && (
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 border border-zinc-200 p-2.5 text-zinc-400 transition hover:border-violet-200 hover:text-violet-600"
                        aria-label={`Open ${video.title} on YouTube`}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <Empty text="Belum ada music video." />
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          ACTIVITIES
          ======================================================== */}

      <section className="relative bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
          <SectionIntro
            number="04"
            eyebrow="Schedule"
            title="Activities & Events"
            description="Concerts, appearances, fan meetings, and upcoming schedules."
            dark
          />

          {group.activities?.length ? (
            <div className="mt-10 border-t border-white/10">
              {group.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group grid border-b border-white/10 py-7 lg:grid-cols-[80px_160px_1fr_auto] lg:items-center lg:gap-8"
                >
                  {/* INDEX */}
                  <div className="hidden lg:block">
                    <span className="font-mono text-[9px] text-zinc-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* DATE */}
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-violet-400">
                      {activity.type}
                    </p>

                    <p className="mt-2 text-sm font-medium text-zinc-300">
                      {getShortDate(activity.date)}
                    </p>
                  </div>

                  {/* INFO */}
                  <div className="mt-5 min-w-0 lg:mt-0">
                    <h3 className="text-xl font-medium tracking-[-0.025em] text-white">
                      {activity.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(activity.date)}
                      </span>

                      {activity.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          {activity.location}
                        </span>
                      )}
                    </div>

                    {activity.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                        {activity.description}
                      </p>
                    )}
                  </div>

                  {/* IMAGE / STATUS */}
                  <div className="mt-5 flex items-center gap-4 lg:mt-0">
                    {activity.image_url && (
                      <div className="h-14 w-20 shrink-0 overflow-hidden bg-zinc-900">
                        <img
                          src={activity.image_url}
                          alt={activity.title}
                          className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
                        />
                      </div>
                    )}

                    <span
                      className={`whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.15em] ${activity.status === 'Upcoming'
                          ? 'text-violet-400'
                          : activity.status === 'Completed'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <div className="border border-white/10 bg-white/[0.03] p-10 text-center">
                <p className="text-sm text-zinc-500">
                  Belum ada activity.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          BOTTOM NAVIGATION
          ======================================================== */}

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-2">
          <Link
            to="/idol/groups"
            className="group flex items-center justify-between border-b border-zinc-200 px-6 py-7 transition hover:bg-zinc-50 sm:border-b-0 sm:border-r lg:px-8"
          >
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                Directory
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-900">
                All Groups
              </p>
            </div>

            <ArrowLeft className="h-4 w-4 text-zinc-300 transition group-hover:-translate-x-1 group-hover:text-violet-600" />
          </Link>

          <Link
            to="/idol/members"
            className="group flex items-center justify-between px-6 py-7 transition hover:bg-zinc-50 lg:px-8"
          >
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                Continue
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-900">
                Meet the Artists
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
          </Link>
        </div>
      </section>
    </div>
  )
}

/*
 * ==============================================================
 * SECTION INTRO
 * ==============================================================
 */

function SectionIntro({
  number,
  eyebrow,
  title,
  description,
  dark = false,
}: {
  number: string
  eyebrow: string
  title: string
  description?: string
  dark?: boolean
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[90px_1fr]">
      <div>
        <span
          className={`font-mono text-[10px] tracking-[0.2em] ${dark ? 'text-zinc-600' : 'text-zinc-400'
            }`}
        >
          {number}
        </span>
      </div>

      <div>
        <p
          className={`font-mono text-[9px] uppercase tracking-[0.2em] ${dark ? 'text-violet-400' : 'text-violet-600'
            }`}
        >
          {eyebrow}
        </p>

        <h2
          className={`mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl ${dark ? 'text-white' : 'text-zinc-950'
            }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`mt-3 max-w-xl text-sm leading-7 ${dark ? 'text-zinc-500' : 'text-zinc-500'
              }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

/*
 * ==============================================================
 * STAT
 * ==============================================================
 */

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
    <div className="border-b border-zinc-200 py-5 sm:border-r sm:px-4 lg:px-3">
      <div className="flex items-center gap-2 text-violet-600">
        {icon}

        <span className="font-mono text-2xl tracking-[-0.05em] text-zinc-950">
          {String(value).padStart(2, '0')}
        </span>
      </div>

      <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
    </div>
  )
}

/*
 * ==============================================================
 * EMPTY
 * ==============================================================
 */

function Empty({ text }: { text: string }) {
  return (
    <div className="border border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-sm text-zinc-400">
        {text}
      </p>
    </div>
  )
}