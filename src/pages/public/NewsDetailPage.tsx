import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileText,
  Newspaper,
} from 'lucide-react'
import {
  Link,
  useParams,
} from 'react-router-dom'
import {
  useEffect,
  useState,
} from 'react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface News {
  id: number
  title: string
  category: string
  author: string
  excerpt: string
  content: string
  date: string
  status: 'Published' | 'Draft'
  image_url?: string | null
}

async function apiRequest<T>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
  )

  const text = await response.text()

  let result: any

  try {
    result = JSON.parse(text)
  } catch {
    throw new Error(
      `API response tidak valid (${response.status}).`,
    )
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
      'Gagal mengambil data.',
    )
  }

  return result.data
}

function formatDate(date: string) {
  const parsedDate = new Date(
    `${date}T00:00:00`,
  )

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

function getDateParts(date: string) {
  const parsedDate = new Date(
    `${date}T00:00:00`,
  )

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      day: '--',
      month: '---',
      year: '----',
    }
  }

  return {
    day: new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
    }).format(parsedDate),

    month: new Intl.DateTimeFormat('id-ID', {
      month: 'short',
    })
      .format(parsedDate)
      .replace('.', '')
      .toUpperCase(),

    year: new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
    }).format(parsedDate),
  }
}

export function NewsDetailPage() {
  const { id } = useParams()

  const [news, setNews] =
    useState<News | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadNews() {
      if (!id) {
        setError(
          'News ID is not available.',
        )
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const data =
          await apiRequest<News>(
            `/api/news/${id}`,
          )

        if (data.status !== 'Published') {
          setError(
            'This news article is not available.',
          )
          return
        }

        setNews(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil artikel.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadNews()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <EditorialGrid />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex min-h-[560px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-violet-600" />
              <span>
                Loading article...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <EditorialGrid />

        <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16 lg:px-8">
          <div className="w-full border-y border-zinc-200 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-zinc-200 bg-zinc-50">
              <FileText className="h-5 w-5 text-zinc-400" />
            </div>

            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400">
              404 / Article
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-950">
              Article not found.
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              {error ||
                'The requested news article could not be found.'}
            </p>

            <Link
              to="/news"
              className="group mt-7 inline-flex items-center gap-2 border border-zinc-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to News
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const dateParts = getDateParts(news.date)

  return (
    <article className="min-h-screen bg-white text-zinc-900">
      <EditorialGrid />

      {/* ─────────────────────────────────────────
          BREADCRUMB
      ───────────────────────────────────────── */}

      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-14 items-center gap-2 overflow-hidden">
            <Link
              to="/news"
              className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400 transition hover:text-violet-600"
            >
              39Production Journal
            </Link>

            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-300" />

            <span className="truncate text-xs text-zinc-500">
              {news.title}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────
          FEATURED IMAGE
      ───────────────────────────────────────── */}

      <section className="mx-auto max-w-7xl px-6 pt-8 sm:pt-10 lg:px-8 lg:pt-12">
        <div className="relative overflow-hidden border-y border-zinc-200 bg-zinc-100">
          {news.image_url ? (
            <>
              <img
                src={news.image_url}
                alt={news.title}
                className="block aspect-[16/8] w-full object-cover transition-transform duration-700 hover:scale-[1.015]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
                <span className="border border-white/20 bg-black/35 px-3 py-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-md">
                  39P / Journal
                </span>
              </div>
            </>
          ) : (
            <div className="flex aspect-[16/8] min-h-[280px] items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
              <div className="text-center">
                <Newspaper className="mx-auto h-10 w-10 text-violet-200" />

                <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-300">
                  No featured image
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          ARTICLE INTRO
      ───────────────────────────────────────── */}

      <header className="mx-auto max-w-7xl px-6 pb-12 pt-10 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-20">
          <div className="max-w-5xl">
            {/* CATEGORY / REFERENCE */}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                {news.category}
              </span>

              <span className="h-1 w-1 bg-zinc-300" />

              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                Journal /{' '}
                {String(news.id).padStart(
                  3,
                  '0',
                )}
              </span>
            </div>

            {/* TITLE */}

            <h1 className="mt-5 max-w-5xl break-words text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-zinc-950 sm:text-5xl lg:text-6xl xl:text-[4.7rem]">
              {news.title}
            </h1>

            {/* META */}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-zinc-200 py-4">
              <MetaInline
                label="Published"
                value={formatDate(news.date)}
              />

              <span className="hidden h-4 w-px bg-zinc-200 sm:block" />

              <MetaInline
                label="Written by"
                value={news.author}
              />
            </div>

            {/* DESCRIPTION */}

            <div className="mt-8 max-w-3xl border-l-2 border-violet-500 pl-5 sm:pl-7">
              <p className="text-lg font-medium leading-8 tracking-[-0.015em] text-zinc-800 sm:text-xl sm:leading-9">
                {news.excerpt}
              </p>
            </div>
          </div>

          {/* DATE MARKER */}

          <div className="hidden lg:flex lg:items-end lg:justify-end">
            <div className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Published
              </p>

              <div className="mt-3 flex items-end justify-end gap-3">
                <div>
                  <p className="font-mono text-6xl font-medium leading-none tracking-[-0.07em] text-zinc-950">
                    {dateParts.day}
                  </p>

                  <p className="mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                    {dateParts.month}
                  </p>
                </div>

                <p className="pb-1 font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400">
                  {dateParts.year}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────
          ARTICLE CONTENT
      ───────────────────────────────────────── */}

      <section className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,760px)_220px] lg:justify-between lg:gap-20">
            {/* ARTICLE */}

            <div className="min-w-0">
              <div className="mb-8 flex items-center gap-3">
                <span className="font-mono text-[10px] text-zinc-400">
                  01
                </span>

                <span className="h-px w-8 bg-violet-500" />

                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Article
                </p>
              </div>

              <div className="whitespace-pre-line text-[15px] leading-8 text-zinc-700 sm:text-base sm:leading-9">
                {news.content}
              </div>

              {/* END STORY */}

              <div className="mt-14 border-t border-zinc-200 pt-7">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                      End of story
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Thanks for reading the
                      39Production Journal.
                    </p>
                  </div>

                  <Link
                    to="/news"
                    className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600"
                  >
                    More stories
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* STORY INFORMATION */}

            <aside className="h-fit lg:sticky lg:top-24">
              <div className="border-y border-zinc-200 py-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-zinc-400">
                    INFO
                  </span>

                  <span className="h-px w-7 bg-violet-500" />

                  <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                    Story information
                  </p>
                </div>

                <div className="mt-7 space-y-6">
                  <MetaItem
                    label="Category"
                    value={news.category}
                  />

                  <MetaItem
                    label="Author"
                    value={news.author}
                  />

                  <MetaItem
                    label="Published"
                    value={formatDate(news.date)}
                  />

                  <MetaItem
                    label="Reference"
                    value={`39P-JNL-${String(news.id).padStart(3, '0')}`}
                  />
                </div>
              </div>

              <Link
                to="/news"
                className="group mt-7 flex items-center justify-between border border-zinc-200 px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.13em] text-zinc-600 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to Journal
                </span>

                <ArrowRight className="h-3.5 w-3.5 opacity-40 transition group-hover:opacity-100" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          CLOSING STATEMENT
      ───────────────────────────────────────── */}

      <section className="border-t border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-[120px_1fr]">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              06.02
            </div>

            <div className="max-w-3xl">
              <p className="text-2xl font-medium leading-tight tracking-[-0.03em] text-zinc-900 sm:text-3xl">
                Stories are part of the work —
                they give context to what we
                build, produce, and share.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                <Link
                  to="/news"
                  className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600"
                >
                  Explore journal
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-zinc-900"
                >
                  View our work
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

/* ─────────────────────────────────────────────
   EDITORIAL GRID
───────────────────────────────────────────── */

function EditorialGrid() {
  return (
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
  )
}

/* ─────────────────────────────────────────────
   INLINE META
───────────────────────────────────────────── */

function MetaInline({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </span>

      <span className="text-xs font-medium text-zinc-700">
        {value}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SIDEBAR META
───────────────────────────────────────────── */

function MetaItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-xs font-medium leading-5 text-zinc-800">
        {value}
      </p>
    </div>
  )
}