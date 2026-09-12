import { useEffect, useState } from 'react'
import {
  Calendar,
  CalendarDays,
  Loader2,
  MapPin,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'https://39production-api.39production.workers.dev'

interface IdolActivity {
  id: number
  group_id: number
  group_name?: string
  title: string
  type: 'Concert' | 'Fan Meeting' | 'Event' | 'Schedule'
  date: string
  location: string
  description: string
  image_url: string
  status: 'Upcoming' | 'Completed' | 'Cancelled'
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
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

export function IdolEventsPage() {
  const [activities, setActivities] = useState<IdolActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true)

        const data = await apiRequest<IdolActivity[]>(
          '/api/idol/activities',
        )

        setActivities(data || [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat events.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadActivities()
  }, [])

  const upcoming = activities.filter(
    (activity) => activity.status === 'Upcoming',
  )

  const past = activities.filter(
    (activity) =>
      activity.status === 'Completed' ||
      activity.status === 'Cancelled',
  )

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-5 inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-400">
            <Calendar className="h-7 w-7" />
          </div>

          <p className="text-sm uppercase tracking-widest text-purple-400">
            Schedule
          </p>

          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
            Events
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-500">
            Upcoming and past events — live performances,
            fan meetings, and special occasions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
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

        {!loading && !error && activities.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-zinc-700" />
            <p className="mt-4 text-zinc-500">
              Belum ada event.
            </p>
          </div>
        )}

        {!loading && !error && upcoming.length > 0 && (
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <h2 className="text-2xl font-bold">
                Upcoming Events
              </h2>
            </div>

            <div className="space-y-5">
              {upcoming.map((activity) => (
                <EventCard
                  key={activity.id}
                  activity={activity}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && past.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-zinc-600" />
              <h2 className="text-2xl font-bold">
                Past Events
              </h2>
            </div>

            <div className="space-y-5">
              {past.map((activity) => (
                <EventCard
                  key={activity.id}
                  activity={activity}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function EventCard({
  activity,
}: {
  activity: IdolActivity
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="aspect-video bg-zinc-900 md:aspect-auto">
          {activity.image_url ? (
            <img
              src={activity.image_url}
              alt={activity.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center bg-gradient-to-br from-purple-950/50 to-pink-950/40">
              <CalendarDays className="h-16 w-16 text-white/10" />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
              {activity.type}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs ${activity.status === 'Upcoming'
                  ? 'bg-green-500/10 text-green-400'
                  : activity.status === 'Completed'
                    ? 'bg-zinc-500/10 text-zinc-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
            >
              {activity.status}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-bold">
            {activity.title}
          </h3>

          {activity.group_name && (
            <Link
              to={`/idol/groups/${activity.group_id}`}
              className="mt-1 inline-block text-sm text-purple-400 hover:text-purple-300"
            >
              {activity.group_name}
            </Link>
          )}

          <div className="mt-5 space-y-3 text-sm text-zinc-500">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-purple-400" />
              {formatEventDate(activity.date)}
            </div>

            {activity.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-purple-400" />
                {activity.location}
              </div>
            )}
          </div>

          {activity.description && (
            <p className="mt-5 text-sm leading-6 text-zinc-500">
              {activity.description}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function formatEventDate(date: string) {
  if (!date) return '-'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}