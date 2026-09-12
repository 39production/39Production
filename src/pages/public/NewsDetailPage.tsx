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
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(
    new Date(`${date}T00:00:00`),
  )
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

    loadNews()
  }, [id])

  {/* =====================================================
      LOADING
  ====================================================== */}

  if (loading) {
    return (
      <div className="py-20">
        <div className="rounded-2xl border border-border-default bg-bg-surface px-6 py-16 text-center text-text-muted">
          Loading article...
        </div>
      </div>
    )
  }

  {/* =====================================================
      ERROR
  ====================================================== */}

  if (error || !news) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border-default bg-bg-surface px-6 py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-text-muted" />

          <h1 className="mt-4 text-xl font-bold text-text-primary">
            Article Not Found
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            {error ||
              'The requested news article could not be found.'}
          </p>

          <Link
            to="/news"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="py-10">
      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="mb-8 flex items-center gap-2 text-sm text-text-muted">
        <Link
          to="/news"
          className="transition hover:text-brand-primary"
        >
          News
        </Link>

        <ChevronRight className="h-4 w-4" />

        <span className="truncate text-text-secondary">
          {news.title}
        </span>
      </div>

      {/* =====================================================
          ARTICLE HEADER
      ====================================================== */}

      <header className="mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-2 text-sm font-medium text-brand-primary">
          <Newspaper className="h-4 w-4" />
          {news.category}
        </span>

        <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-text-primary md:text-6xl">
          {news.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-text-muted">
          <span>
            By{' '}
            <strong className="text-text-secondary">
              {news.author}
            </strong>
          </span>

          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDate(news.date)}
          </span>
        </div>
      </header>

      {/* =====================================================
          FEATURED IMAGE
      ====================================================== */}

      <div className="relative mx-auto mt-10 min-h-[300px] max-w-5xl overflow-hidden rounded-3xl border border-border-default bg-gradient-to-br from-brand-primary/15 via-bg-surface to-bg-base">
        {news.image_url ? (
          <>
            <img
              src={news.image_url}
              alt={news.title}
              className="block max-h-[620px] min-h-[300px] w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="rounded-2xl bg-brand-primary/10 p-8 text-brand-primary">
              <Newspaper className="h-20 w-20" />
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto mt-12 grid max-w-5xl gap-12 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="mb-8 text-lg leading-8 text-text-secondary">
            {news.excerpt}
          </p>

          <div className="whitespace-pre-line text-base leading-8 text-text-secondary">
            {news.content}
          </div>
        </div>

        {/* =================================================
            SIDEBAR
        ================================================== */}

        <aside className="h-fit rounded-2xl border border-border-default bg-bg-surface p-6 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
            Article Information
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs text-text-muted">
                Category
              </p>

              <p className="mt-1 font-medium text-text-primary">
                {news.category}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Author
              </p>

              <p className="mt-1 font-medium text-text-primary">
                {news.author}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">
                Published
              </p>

              <p className="mt-1 font-medium text-text-primary">
                {formatDate(news.date)}
              </p>
            </div>
          </div>

          <Link
            to="/news"
            className="mt-7 flex items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-brand-primary hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
        </aside>
      </div>
    </article>
  )
}