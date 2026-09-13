import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Mail,
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

export function IdolMemberPage() {
  const { id } = useParams()

  const [members, setMembers] = useState<IdolMember[]>([])
  const [member, setMember] = useState<IdolMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          /*
           * Ambil semua group lalu ambil member tiap group.
           * Endpoint group members memang sudah tersedia di API.
           */
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

  if (!id) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        {/* HEADER */}
        <section className="relative overflow-hidden border-b border-zinc-200">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-pink-100/60 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Our Artists
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
                Idol Members
              </h1>

              <p className="mt-4 text-base leading-7 text-zinc-600">
                Meet the talented members of our idol groups.
              </p>
            </div>
          </div>
        </section>

        {/* MEMBERS */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          {members.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
                <User className="h-7 w-7 text-purple-500" />
              </div>

              <p className="mt-5 font-medium text-zinc-700">
                Belum ada member.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Member idol akan ditampilkan di halaman ini.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((item) => (
                <Link
                  key={item.id}
                  to={`/idol/members/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/40"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.stage_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                        <User className="h-20 w-20 text-purple-200" />
                      </div>
                    )}

                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${item.status === 'Active'
                            ? 'border-emerald-200 bg-white/95 text-emerald-700'
                            : 'border-zinc-200 bg-white/95 text-zinc-500'
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold tracking-tight text-zinc-900 transition group-hover:text-purple-600">
                          {item.stage_name}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-violet-600">
                          {item.position}
                        </p>
                      </div>

                      <ArrowLeft
                        className="mt-1 h-4 w-4 shrink-0 rotate-180 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-purple-500"
                      />
                    </div>

                    {item.group_name && (
                      <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4 text-sm text-zinc-500">
                        <Users className="h-4 w-4 text-zinc-400" />
                        <span className="truncate">
                          {item.group_name}
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

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50">
            <User className="h-7 w-7 text-zinc-300" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-zinc-800">
            Member tidak ditemukan.
          </h1>

          <Link
            to="/idol/members"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-purple-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-pink-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
          <Link
            to="/idol/members"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-purple-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>

          <div className="grid gap-10 lg:grid-cols-[400px_1fr] lg:items-center lg:gap-14">
            {/* IMAGE */}
            <div className="mx-auto w-full max-w-md">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-xl shadow-zinc-200/50">
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.stage_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                    <User className="h-28 w-28 text-purple-200" />
                  </div>
                )}

                <div className="absolute left-5 top-5">
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm ${member.status === 'Active'
                        ? 'border-emerald-200 bg-white/95 text-emerald-700'
                        : 'border-zinc-200 bg-white/95 text-zinc-500'
                      }`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            </div>

            {/* INFORMATION */}
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                39Production Artist
              </p>

              <h1 className="mt-3 break-words text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                {member.stage_name}
              </h1>

              <p className="mt-3 text-lg font-medium text-purple-600">
                {member.position}
              </p>

              {member.name !== member.stage_name && (
                <p className="mt-5 text-sm text-zinc-500">
                  Real Name:{' '}
                  <span className="font-medium text-zinc-700">
                    {member.name}
                  </span>
                </p>
              )}

              {/* META */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {member.birth_date && (
                  <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                      <CalendarDays className="h-4 w-4 text-purple-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Birth Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-zinc-800">
                        {formatDate(member.birth_date)}
                      </p>
                    </div>
                  </div>
                )}

                {member.email && (
                  <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50">
                      <Mail className="h-4 w-4 text-pink-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Contact
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-zinc-800">
                        {member.email}
                      </p>
                    </div>
                  </div>
                )}

                {member.group_name && (
                  <Link
                    to={
                      member.group_id
                        ? `/idol/groups/${member.group_id}`
                        : '/idol/groups'
                    }
                    className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:bg-purple-50/40 sm:col-span-2"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Idol Group
                      </p>

                      <p className="mt-1 text-sm font-semibold text-zinc-800 transition group-hover:text-purple-600">
                        {member.group_name}
                      </p>
                    </div>

                    <ArrowLeft className="ml-auto mt-2 h-4 w-4 shrink-0 rotate-180 text-zinc-300" />
                  </Link>
                )}
              </div>

              {/* BIO */}
              {member.bio && (
                <div className="mt-10 border-t border-zinc-200 pt-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    Biography
                  </p>

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                    {member.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}