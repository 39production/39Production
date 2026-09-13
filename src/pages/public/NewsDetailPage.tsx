import {
  ArrowLeft,
  Calendar,
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
      <div className="min-h-screen bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
            <Newspaper className="h-6 w-6 animate-pulse text-purple-600" />
          </div>

          <p className="mt-5 text-sm text-zinc-500">
            Loading article...
          </p>
        </div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
            <FileText className="h-7 w-7 text-zinc-400" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-zinc-900">
            Article Not Found
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {error ||
              'The requested news article could not be found.'}
          </p>

          <Link
            to="/news"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-white text-zinc-900">
      {/* BREADCRUMB */}
      <div className="border-b border-zinc-200 bg-zinc-50/70">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link
              to="/news"
              className="shrink-0 font-medium text-zinc-500 transition hover:text-purple-600"
            >
              News
            </Link>

            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />

            <span className="truncate text-zinc-600">
              {news.title}
            </span>
          </div>
        </div>
      </div>

      {/* ARTICLE HEADER */}
      <header className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-pink-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 py-14 sm:py-16 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
              <Newspaper className="h-4 w-4" />
              {news.category}
            </span>

            <h1 className="mt-6 break-words text-4xl font-bold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              {news.title}
            </h1>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
              <span>
                By{' '}
                <strong className="font-semibold text-zinc-800">
                  {news.author}
                </strong>
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />

              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                {formatDate(news.date)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURED IMAGE */}
      <div className="mx-auto max-w-6xl px-6 pt-10 lg:px-8 lg:pt-12">
        <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-sm sm:min-h-[380px]">
          {news.image_url ? (
            <>
              <img
                src={news.image_url}
                alt={news.title}
                className="block max-h-[620px] min-h-[280px] w-full object-cover sm:min-h-[380px]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center sm:min-h-[380px]">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-purple-200 bg-white text-purple-500 shadow-sm">
                <Newspaper className="h-12 w-12" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ARTICLE CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* MAIN CONTENT */}
          <div className="min-w-0">
            <p className="mb-8 text-lg leading-8 text-zinc-600 sm:text-xl sm:leading-9">
              {news.excerpt}
            </p>

            <div className="whitespace-pre-line text-base leading-8 text-zinc-700 sm:text-[17px] sm:leading-9">
              {news.content}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="h-fit rounded-2xl border border-zinc-200 bg-zinc-50 p-6 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
              Article Information
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Category
                </p>

                <p className="mt-1 font-medium text-zinc-900">
                  {news.category}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Author
                </p>

                <p className="mt-1 font-medium text-zinc-900">
                  {news.author}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Published
                </p>

                <p className="mt-1 font-medium text-zinc-900">
                  {formatDate(news.date)}
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-zinc-200 pt-6">
              <Link
                to="/news"
                className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}