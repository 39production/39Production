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
          const groups = await apiRequest<
            Array<{ id: number }>
          >('/api/idol/groups')

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
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090B] px-6 py-20">
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
              Our Artists
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Idol Members
            </h1>

            <p className="mt-3 text-zinc-500">
              Meet the talented members of our idol groups.
            </p>
          </div>

          {members.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-12 text-center text-zinc-500">
              Belum ada member.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((item) => (
                <Link
                  key={item.id}
                  to={`/idol/members/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:-translate-y-1 hover:border-purple-500/40"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-zinc-900">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.stage_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <User className="h-20 w-20 text-zinc-700" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-bold">
                      {item.stage_name}
                    </h2>

                    <p className="mt-1 text-sm text-purple-400">
                      {item.position}
                    </p>

                    {item.group_name && (
                      <p className="mt-2 text-sm text-zinc-500">
                        {item.group_name}
                      </p>
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
      <div className="min-h-screen bg-[#09090B] px-6 py-20 text-center text-zinc-500">
        Member tidak ditemukan.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <Link
          to="/idol/members"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Link>

        <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
            {member.image_url ? (
              <img
                src={member.image_url}
                alt={member.stage_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <User className="h-28 w-28 text-zinc-700" />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs ${member.status === 'Active'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-zinc-500/10 text-zinc-400'
                }`}
            >
              {member.status}
            </span>

            <h1 className="mt-5 text-5xl font-bold">
              {member.stage_name}
            </h1>

            <p className="mt-2 text-lg text-purple-400">
              {member.position}
            </p>

            {member.name !== member.stage_name && (
              <p className="mt-5 text-zinc-500">
                Real Name: {member.name}
              </p>
            )}

            <div className="mt-8 space-y-4">
              {member.birth_date && (
                <div className="flex items-center gap-3 text-zinc-400">
                  <CalendarDays className="h-5 w-5 text-purple-400" />
                  <span>{formatDate(member.birth_date)}</span>
                </div>
              )}

              {member.email && (
                <div className="flex items-center gap-3 text-zinc-400">
                  <Mail className="h-5 w-5 text-purple-400" />
                  <span>{member.email}</span>
                </div>
              )}

              {member.group_name && (
                <Link
                  to={
                    member.group_id
                      ? `/idol/groups/${member.group_id}`
                      : '/idol/groups'
                  }
                  className="flex items-center gap-3 text-zinc-400 hover:text-white"
                >
                  <Users className="h-5 w-5 text-purple-400" />
                  <span>{member.group_name}</span>
                </Link>
              )}
            </div>

            {member.bio && (
              <div className="mt-10 border-t border-white/10 pt-8">
                <h2 className="text-xl font-semibold">
                  Biography
                </h2>

                <p className="mt-4 whitespace-pre-line leading-8 text-zinc-400">
                  {member.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}