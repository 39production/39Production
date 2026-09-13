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

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

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
        setError('')

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
    <div className="min-h-screen bg-white text-zinc-900">
      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-purple-100/70 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Calendar className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            Schedule
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            Events
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
            Upcoming and past events — live performances,
            fan meetings, and special occasions.
          </p>
        </div>
      </section>

      {/* EVENTS */}
      <section className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-20">
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

        {!loading && !error && activities.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
              <CalendarDays className="h-7 w-7 text-purple-500" />
            </div>

            <p className="mt-5 font-medium text-zinc-700">
              Belum ada event.
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Upcoming performances and activities will appear here.
            </p>
          </div>
        )}

        {/* UPCOMING */}
        {!loading && !error && upcoming.length > 0 && (
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Upcoming Events
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Keep up with the next activities from our artists.
                </p>
              </div>
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

        {/* PAST */}
        {!loading && !error && past.length > 0 && (
          <div className="mt-16 border-t border-zinc-200 pt-16">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
                <CalendarDays className="h-4 w-4 text-zinc-500" />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Past Events
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  A look back at previous performances and activities.
                </p>
              </div>
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
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30">
      <div className="grid md:grid-cols-[240px_1fr]">
        {/* IMAGE */}
        <div className="aspect-[16/10] bg-zinc-100 md:aspect-auto">
          {activity.image_url ? (
            <img
              src={activity.image_url}
              alt={activity.title}
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
              <CalendarDays className="h-16 w-16 text-purple-200" />
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700">
              {activity.type}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${activity.status === 'Upcoming'
                  ? 'bg-emerald-50 text-emerald-700'
                  : activity.status === 'Completed'
                    ? 'bg-zinc-100 text-zinc-600'
                    : 'bg-red-50 text-red-600'
                }`}
            >
              {activity.status}
            </span>
          </div>

          <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-900">
            {activity.title}
          </h3>

          {activity.group_name && (
            <Link
              to={`/idol/groups/${activity.group_id}`}
              className="mt-1 inline-block text-sm font-medium text-purple-600 transition hover:text-purple-700"
            >
              {activity.group_name}
            </Link>
          )}

          <div className="mt-5 space-y-3 text-sm text-zinc-600">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />

              <span>
                {formatEventDate(activity.date)}
              </span>
            </div>

            {activity.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />

                <span>{activity.location}</span>
              </div>
            )}
          </div>

          {activity.description && (
            <p className="mt-5 border-t border-zinc-100 pt-5 text-sm leading-6 text-zinc-600">
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

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}