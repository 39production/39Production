import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  Loader2,
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
  email: string
  bio: string
  image_url: string
  status: 'Active' | 'Inactive'
  group_id?: number
  group_name?: string
  group_image_url?: string
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

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function IdolMemberPage() {
  const { id } = useParams()

  const [members, setMembers] = useState<IdolMember[]>([])
  const [member, setMember] = useState<IdolMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        if (id) {
          const data = await apiRequest<IdolMember>(
            `/api/idol/members/${id}`,
          )

          setMember(data)
        } else {
          const groups = await apiRequest<Array<{ id: number }>>(
            '/api/idol/groups',
          )

          const results = await Promise.all(
            groups.map((group) =>
              apiRequest<IdolMember[]>(
                `/api/idol/groups/${group.id}/members`,
              ),
            ),
          )

          setMembers(results.flat())
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat member.',
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  const filteredMembers =
    filter === 'All'
      ? members
      : members.filter((item) => item.status === filter)

  const activeCount = members.filter(
    (item) => item.status === 'Active',
  ).length

  const inactiveCount = members.filter(
    (item) => item.status === 'Inactive',
  ).length

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
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500">
            39Production / Error
          </p>

          <p className="mt-3 text-sm text-red-700">
            {error}
          </p>

          <Link
            to="/idol/members"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-800 hover:text-violet-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>
        </div>
      </div>
    )
  }

  /*
   * ============================================================
   * MEMBER ARCHIVE
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
        {/* BACKGROUND ACCENTS */}
        <div className="pointer-events-none fixed -right-40 top-20 h-96 w-96 rounded-full bg-violet-100/50 blur-3xl" />
        <div className="pointer-events-none fixed -left-40 bottom-10 h-96 w-96 rounded-full bg-fuchsia-100/40 blur-3xl" />

        {/* HERO */}
        <section className="relative border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
            <div className="flex items-start justify-between gap-8">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                    39Production
                  </span>

                  <span className="h-px w-8 bg-zinc-300" />

                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-600">
                    Artists / Members
                  </span>
                </div>

                <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] text-zinc-950 sm:text-6xl lg:text-7xl">
                  The people
                  <br />
                  behind the
                  <br />
                  <span className="text-violet-600">stories.</span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                  Explore the artists and performers shaping the
                  39Production entertainment roster.
                </p>
              </div>

              <div className="hidden text-right lg:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Roster
                </p>

                <p className="mt-2 font-mono text-5xl tracking-[-0.06em] text-zinc-950">
                  {String(members.length).padStart(2, '0')}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Registered members
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* INDEX */}
        <section className="relative border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid border-x border-zinc-200 sm:grid-cols-3">
              <div className="border-b border-zinc-200 p-5 sm:border-b-0 sm:border-r">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  Total
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {members.length}
                </p>
              </div>

              <div className="border-b border-zinc-200 p-5 sm:border-b-0 sm:border-r">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  Active
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-violet-600">
                  {activeCount}
                </p>
              </div>

              <div className="p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  Inactive
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-500">
                  {inactiveCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FILTER */}
        <section className="relative border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['All', 'Active', 'Inactive'] as const).map(
                (item) => {
                  const count =
                    item === 'All'
                      ? members.length
                      : item === 'Active'
                        ? activeCount
                        : inactiveCount

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={`shrink-0 border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${filter === item
                          ? 'border-zinc-950 bg-zinc-950 text-white'
                          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-900'
                        }`}
                    >
                      {item}

                      <span
                        className={`ml-2 font-mono ${filter === item
                            ? 'text-zinc-400'
                            : 'text-zinc-300'
                          }`}
                      >
                        {String(count).padStart(2, '0')}
                      </span>
                    </button>
                  )
                },
              )}
            </div>

            <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:flex">
              <Users className="h-3.5 w-3.5" />
              Artist roster
            </div>
          </div>
        </section>

        {/* MEMBER ROSTER */}
        <section className="relative bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
            {filteredMembers.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
                <User className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-5 text-sm font-medium text-zinc-700">
                  Belum ada member.
                </p>

                <p className="mt-2 text-xs leading-6 text-zinc-400">
                  Member idol akan ditampilkan di halaman ini.
                </p>
              </div>
            ) : (
              <div className="border-t border-zinc-200">
                {filteredMembers.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/idol/members/${item.id}`}
                    className="group grid border-b border-zinc-200 transition hover:bg-zinc-50 lg:grid-cols-[72px_220px_1fr_auto] lg:items-center"
                  >
                    {/* NUMBER */}
                    <div className="hidden h-full items-center border-r border-zinc-200 px-5 lg:flex">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* IMAGE */}
                    <div className="relative m-4 aspect-[4/5] overflow-hidden bg-zinc-100 sm:m-5 lg:m-0 lg:aspect-square lg:h-[170px]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.stage_name}
                          className="h-full w-full object-cover grayscale-[12%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-zinc-100">
                          <span className="font-mono text-3xl text-zinc-300">
                            {getInitials(item.stage_name)}
                          </span>
                        </div>
                      )}

                      <div className="absolute left-3 top-3">
                        <span
                          className={`border bg-white/95 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.15em] ${item.status === 'Active'
                              ? 'border-violet-200 text-violet-600'
                              : 'border-zinc-200 text-zinc-400'
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* INFORMATION */}
                    <div className="px-5 pb-6 lg:px-8 lg:py-7">
                      <div className="flex items-center gap-3 lg:hidden">
                        <span className="font-mono text-[9px] text-zinc-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <span className="h-px w-5 bg-zinc-300" />
                      </div>

                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950 transition group-hover:text-violet-600 sm:text-4xl lg:mt-0 lg:text-4xl">
                        {item.stage_name}
                      </h2>

                      <p className="mt-2 text-sm font-medium text-violet-600">
                        {item.position}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-400">
                        {item.group_name && (
                          <span className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" />
                            {item.group_name}
                          </span>
                        )}

                        {item.birth_date && (
                          <span className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(item.birth_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTION */}
                    <div className="hidden items-center gap-4 border-l border-zinc-200 px-7 lg:flex">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 transition group-hover:text-violet-600">
                        View profile
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
        <section className="relative border-t border-zinc-200 bg-zinc-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[120px_1fr_auto] lg:items-end">
              <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">
                05.02
              </p>

              <h2 className="max-w-3xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                Every story starts with
                <span className="text-violet-400"> someone.</span>
              </h2>

              <Link
                to="/idol/groups"
                className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 transition hover:text-white"
              >
                Explore Groups
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
   * MEMBER DETAIL
   * ============================================================
   */

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-zinc-200 bg-zinc-50">
            <User className="h-6 w-6 text-zinc-300" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-zinc-800">
            Member tidak ditemukan.
          </h1>

          <Link
            to="/idol/members"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>
        </div>
      </div>
    )
  }

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
      {/* ACCENTS */}
      <div className="pointer-events-none fixed -right-40 top-20 h-96 w-96 rounded-full bg-violet-100/50 blur-3xl" />
      <div className="pointer-events-none fixed -left-40 bottom-0 h-96 w-96 rounded-full bg-fuchsia-100/40 blur-3xl" />

      {/* TOP BAR */}
      <div className="relative border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            to="/idol/members"
            className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            Members
          </Link>

          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
            39Production / Artist Profile
          </span>
        </div>
      </div>

      {/* PROFILE */}
      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="grid overflow-hidden border border-zinc-200 bg-white lg:grid-cols-[minmax(320px,42%)_1fr]">
            {/* IMAGE PANEL */}
            <div className="relative min-h-[520px] bg-zinc-100 lg:min-h-[680px]">
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={member.stage_name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-violet-50">
                  <div className="text-center">
                    <p className="font-mono text-6xl tracking-[-0.08em] text-zinc-200">
                      {getInitials(member.stage_name)}
                    </p>

                    <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                      39Production Artist
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/60">
                      Artist No.
                    </p>

                    <p className="mt-1 font-mono text-2xl tracking-[-0.04em] text-white">
                      #{String(member.id).padStart(3, '0')}
                    </p>
                  </div>

                  <span
                    className={`border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.16em] backdrop-blur ${member.status === 'Active'
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/20 bg-black/20 text-white/60'
                      }`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            </div>

            {/* CONTENT PANEL */}
            <div className="flex flex-col">
              <div className="flex-1 p-7 sm:p-10 lg:p-12">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600">
                    39Production Artist
                  </span>

                  <span className="h-px w-7 bg-zinc-300" />
                </div>

                <h1 className="mt-7 max-w-xl break-words text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-zinc-950 sm:text-6xl">
                  {member.stage_name}
                </h1>

                <p className="mt-5 text-base font-medium text-violet-600">
                  {member.position}
                </p>

                {member.name !== member.stage_name && (
                  <div className="mt-7 border-l-2 border-violet-200 pl-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                      Legal Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-zinc-700">
                      {member.name}
                    </p>
                  </div>
                )}

                {/* GROUP */}
                {member.group_name && (
                  <Link
                    to={
                      member.group_id
                        ? `/idol/groups/${member.group_id}`
                        : '/idol/groups'
                    }
                    className="group mt-9 flex items-center gap-4 border-y border-zinc-200 py-5 transition hover:bg-zinc-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-200 bg-zinc-50">
                      {member.group_image_url ? (
                        <img
                          src={member.group_image_url}
                          alt={member.group_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400">
                        Idol Group
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-zinc-800 group-hover:text-violet-600">
                        {member.group_name}
                      </p>
                    </div>

                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600" />
                  </Link>
                )}

                {/* DETAILS */}
                <div className="mt-9">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                    Profile Data
                  </p>

                  <div className="mt-4 grid border-t border-zinc-200 sm:grid-cols-2">
                    {member.birth_date && (
                      <div className="border-b border-zinc-200 py-5 sm:border-r sm:pr-5">
                        <div className="flex items-start gap-3">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />

                          <div>
                            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
                              Birth Date
                            </p>

                            <p className="mt-2 text-sm font-medium text-zinc-800">
                              {formatDate(member.birth_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {member.email && (
                      <div className="border-b border-zinc-200 py-5 sm:pl-5">
                        <div className="flex items-start gap-3">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />

                          <div className="min-w-0">
                            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
                              Contact
                            </p>

                            <p className="mt-2 break-all text-sm font-medium text-zinc-800">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* BIO */}
                {member.bio && (
                  <div className="mt-9 border-t border-zinc-200 pt-8">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
                        Biography
                      </p>

                      <span className="h-px w-8 bg-zinc-200" />
                    </div>

                    <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                      {member.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* BOTTOM NAV */}
              <div className="grid border-t border-zinc-200 sm:grid-cols-2">
                <Link
                  to="/idol/members"
                  className="group flex items-center justify-between border-b border-zinc-200 px-7 py-5 transition hover:bg-zinc-950 hover:text-white sm:border-b-0 sm:border-r sm:px-10"
                >
                  <span>
                    <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-zinc-500">
                      Directory
                    </span>

                    <span className="mt-1 block text-sm font-medium">
                      All Members
                    </span>
                  </span>

                  <ArrowLeft className="h-4 w-4 text-zinc-300 transition group-hover:-translate-x-1 group-hover:text-white" />
                </Link>

                {member.group_name ? (
                  <Link
                    to={
                      member.group_id
                        ? `/idol/groups/${member.group_id}`
                        : '/idol/groups'
                    }
                    className="group flex items-center justify-between px-7 py-5 transition hover:bg-zinc-950 hover:text-white sm:px-10"
                  >
                    <span>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-zinc-500">
                        Continue
                      </span>

                      <span className="mt-1 block truncate text-sm font-medium">
                        {member.group_name}
                      </span>
                    </span>

                    <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                ) : (
                  <Link
                    to="/idol/groups"
                    className="group flex items-center justify-between px-7 py-5 transition hover:bg-zinc-950 hover:text-white sm:px-10"
                  >
                    <span>
                      <span className="block font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-zinc-500">
                        Continue
                      </span>

                      <span className="mt-1 block text-sm font-medium">
                        Explore Groups
                      </span>
                    </span>

                    <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}