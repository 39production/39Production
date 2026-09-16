import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Sparkles,
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

function getDateParts(date: string) {
  if (!date) {
    return {
      day: '--',
      month: '---',
      year: '----',
    }
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return {
      day: '--',
      month: '---',
      year: '----',
    }
  }

  const day = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
  }).format(parsed)

  const month = new Intl.DateTimeFormat('id-ID', {
    month: 'short',
  })
    .format(parsed)
    .replace('.', '')
    .toUpperCase()

  const year = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
  }).format(parsed)

  return {
    day,
    month,
    year,
  }
}

function getEventTime(date: string) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  if (
    parsed.getHours() === 0 &&
    parsed.getMinutes() === 0 &&
    parsed.getSeconds() === 0
  ) {
    return ''
  }

  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

export function IdolEventsPage() {
  const [activities, setActivities] = useState<IdolActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<
    'All' | IdolActivity['type']
  >('All')

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

  const filteredActivities = useMemo(() => {
    if (filter === 'All') {
      return activities
    }

    return activities.filter(
      (activity) => activity.type === filter,
    )
  }, [activities, filter])

  const upcoming = filteredActivities
    .filter((activity) => activity.status === 'Upcoming')
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime(),
    )

  const past = filteredActivities
    .filter(
      (activity) =>
        activity.status === 'Completed' ||
        activity.status === 'Cancelled',
    )
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime(),
    )

  const totalUpcoming = activities.filter(
    (activity) => activity.status === 'Upcoming',
  ).length

  const totalCompleted = activities.filter(
    (activity) => activity.status === 'Completed',
  ).length

  const totalGroups = new Set(
    activities
      .map((activity) => activity.group_id)
      .filter(Boolean),
  ).size

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* EDITORIAL GRID */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-fuchsia-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24">
          {/* TOP META */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              39Production • Events
            </p>

            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:flex">
              <span>Entertainment</span>
              <span className="text-zinc-300">/</span>
              <span>Schedule</span>
            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="grid gap-12 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:pt-20">
            <div>
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white">
                  <Calendar className="h-4 w-4 text-violet-600" />
                </div>

                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-600">
                  Live schedule
                </span>
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-zinc-950 sm:text-6xl lg:text-[5.25rem]">
                Moments
                <br />
                <span className="text-zinc-400">worth showing up for.</span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
                Follow upcoming performances, fan meetings,
                special events, and activities from the
                39Production entertainment roster.
              </p>
            </div>

            {/* HERO INDEX */}
            <div className="lg:justify-self-end lg:w-full lg:max-w-md">
              <div className="border-y border-zinc-200">
                <div className="grid grid-cols-3 divide-x divide-zinc-200">
                  <HeroStat
                    value={String(totalUpcoming).padStart(2, '0')}
                    label="Upcoming"
                  />

                  <HeroStat
                    value={String(totalCompleted).padStart(2, '0')}
                    label="Completed"
                  />

                  <HeroStat
                    value={String(totalGroups).padStart(2, '0')}
                    label="Groups"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                <span>
                  Keep the date. We'll handle the story.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* FILTER */}
        <section className="border-b border-zinc-200 py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
                Event index
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Browse activities by event type.
              </p>
            </div>

            <div className="flex flex-wrap border border-zinc-200">
              {(
                [
                  'All',
                  'Concert',
                  'Fan Meeting',
                  'Event',
                  'Schedule',
                ] as const
              ).map((item) => {
                const active = filter === item

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`border-r border-zinc-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition last:border-r-0 ${active
                        ? 'bg-zinc-950 text-white'
                        : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                      }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* STATES */}
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              <span>Loading events...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="my-16 border border-red-200 bg-red-50/60 p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-500">
              Request failed
            </p>

            <p className="mt-3 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          activities.length === 0 && (
            <div className="my-16 border border-zinc-200 bg-zinc-50 p-12 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-zinc-300" />

              <p className="mt-5 text-sm font-medium text-zinc-700">
                Belum ada event.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Upcoming performances and activities will
                appear here.
              </p>
            </div>
          )}

        {/* EVENTS */}
        {!loading && !error && activities.length > 0 && (
          <>
            {/* UPCOMING */}
            {upcoming.length > 0 && (
              <section className="py-14 sm:py-16">
                <SectionHeading
                  number="01"
                  eyebrow="Next up"
                  title="Upcoming events."
                  description="The next moments on the entertainment calendar."
                  accent
                />

                <div className="mt-10 border-t border-zinc-200">
                  {upcoming.map((activity, index) => (
                    <EventRow
                      key={activity.id}
                      activity={activity}
                      index={index}
                      featured={index === 0}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* PAST */}
            {past.length > 0 && (
              <section className="border-t border-zinc-200 py-14 sm:py-16">
                <SectionHeading
                  number="02"
                  eyebrow="Archive"
                  title="Past events."
                  description="A record of performances, gatherings, and activities."
                />

                <div className="mt-10 border-t border-zinc-200">
                  {past.map((activity, index) => (
                    <EventRow
                      key={activity.id}
                      activity={activity}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FILTER EMPTY */}
            {filteredActivities.length === 0 && (
              <section className="py-20 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-zinc-300" />

                <p className="mt-5 text-sm font-medium text-zinc-700">
                  Tidak ada event untuk filter ini.
                </p>

                <button
                  type="button"
                  onClick={() => setFilter('All')}
                  className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-violet-600 hover:text-violet-700"
                >
                  View all events
                </button>
              </section>
            )}
          </>
        )}

        {/* BOTTOM STATEMENT */}
        {!loading && !error && activities.length > 0 && (
          <section className="border-t border-zinc-200 py-16 sm:py-20">
            <div className="grid gap-8 sm:grid-cols-[120px_1fr]">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                05.03
              </div>

              <div className="max-w-3xl">
                <p className="text-2xl font-medium leading-tight tracking-[-0.03em] text-zinc-900 sm:text-3xl">
                  Every date is a chance to turn an
                  ordinary schedule into a memorable
                  moment.
                </p>

                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                  <Link
                    to="/idol/groups"
                    className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600"
                  >
                    Explore groups
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/idol"
                    className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-zinc-900"
                  >
                    Entertainment
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function HeroStat({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div className="px-4 py-5 sm:px-5">
      <p className="font-mono text-2xl font-medium tracking-[-0.04em] text-zinc-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
    </div>
  )
}

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
  accent = false,
}: {
  number: string
  eyebrow: string
  title: string
  description: string
  accent?: boolean
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-[100px_1fr] lg:grid-cols-[120px_1fr]">
      <div className="font-mono text-[10px] tracking-[0.16em] text-zinc-400">
        {number}
      </div>

      <div>
        <p
          className={`font-mono text-[9px] uppercase tracking-[0.2em] ${accent ? 'text-violet-600' : 'text-zinc-400'
            }`}
        >
          {eyebrow}
        </p>

        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
          {title}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  )
}

function EventRow({
  activity,
  index,
  featured = false,
}: {
  activity: IdolActivity
  index: number
  featured?: boolean
}) {
  const dateParts = getDateParts(activity.date)
  const eventTime = getEventTime(activity.date)

  const statusClass =
    activity.status === 'Upcoming'
      ? 'text-emerald-600'
      : activity.status === 'Completed'
        ? 'text-zinc-400'
        : 'text-red-500'

  return (
    <article
      className={`group border-b border-zinc-200 transition ${featured
          ? 'bg-zinc-50/70 hover:bg-violet-50/30'
          : 'hover:bg-zinc-50'
        }`}
    >
      <div className="grid gap-0 lg:grid-cols-[150px_minmax(0,1fr)_280px]">
        {/* DATE */}
        <div className="flex items-start gap-4 border-b border-zinc-200 px-0 py-6 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <div className="min-w-[58px]">
            <p className="font-mono text-4xl font-medium leading-none tracking-[-0.06em] text-zinc-950">
              {dateParts.day}
            </p>

            <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600">
              {dateParts.month}
            </p>
          </div>

          <div className="pt-1 lg:hidden">
            <p className="text-xs font-medium text-zinc-500">
              {dateParts.year}
            </p>

            {eventTime && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                <Clock3 className="h-3 w-3" />
                {eventTime}
              </p>
            )}
          </div>

          <div className="hidden pt-1 lg:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
              {dateParts.year}
            </p>

            {eventTime && (
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Clock3 className="h-3 w-3" />
                {eventTime}
              </p>
            )}
          </div>
        </div>

        {/* MAIN INFO */}
        <div className="px-0 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-600">
              {activity.type}
            </span>

            <span className="text-zinc-300">/</span>

            <span
              className={`font-mono text-[9px] font-semibold uppercase tracking-[0.16em] ${statusClass}`}
            >
              {activity.status}
            </span>
          </div>

          <h3
            className={`mt-3 font-semibold tracking-[-0.035em] text-zinc-950 ${featured
                ? 'text-2xl sm:text-3xl'
                : 'text-xl'
              }`}
          >
            {activity.title}
          </h3>

          {activity.group_name && (
            <Link
              to={`/idol/groups/${activity.group_id}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-violet-600"
            >
              {activity.group_name}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
              <span>{formatDate(activity.date)}</span>
            </div>

            {activity.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                <span>{activity.location}</span>
              </div>
            )}
          </div>

          {activity.description && (
            <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-500">
              {activity.description}
            </p>
          )}
        </div>

        {/* IMAGE */}
        <div className="relative min-h-[190px] overflow-hidden bg-zinc-100 lg:min-h-0 lg:border-l lg:border-zinc-200">
          {activity.image_url ? (
            <>
              <img
                src={activity.image_url}
                alt={activity.title}
                className="h-full min-h-[190px] w-full object-cover grayscale-[15%] transition duration-700 group-hover:scale-[1.035] group-hover:grayscale-0"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />

              <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.16em] text-white/90">
                39P / {String(index + 1).padStart(2, '0')}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[190px] items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-violet-50">
              <div className="text-center">
                <Calendar className="mx-auto h-8 w-8 text-violet-200" />

                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-300">
                  Event archive
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}