import {
  ArrowRight,
  Calendar,
  FileText,
  Newspaper,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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
      result.message || 'Gagal mengambil data.',
    )
  }

  return result.data
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate)
}

export function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true)
        setError('')

        const data = await apiRequest<News[]>('/api/news')

        setNews(
          (data || []).filter(
            (item) => item.status === 'Published',
          ),
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil berita.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadNews()
  }, [])

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          news.map((item) => item.category),
        ),
      ),
    [news],
  )

  const filteredNews =
    category === 'All'
      ? news
      : news.filter(
        (item) => item.category === category,
      )

  const featuredNews = filteredNews[0]
  const remainingNews = filteredNews.slice(1)

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-purple-100/70 blur-[120px]" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-pink-100/50 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
                <Newspaper className="h-4 w-4" />
                39Production Journal
              </div>

              <h1 className="mt-7 text-4xl font-bold leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl lg:text-7xl">
                Stories behind
                <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  what we create.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-600 md:text-lg">
                Explore the ideas, projects, releases,
                creative experiments, and stories shaping
                the world of 39Production.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
                  Creative Technology
                </span>

                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
                  Entertainment
                </span>

                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm">
                  Production
                </span>
              </div>
            </div>

            {/* STATS */}
            {!loading && !error && (
              <div className="hidden lg:block">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Published Stories
                  </p>

                  <p className="mt-2 text-5xl font-bold tracking-tight text-zinc-950">
                    {news.length
                      .toString()
                      .padStart(2, '0')}
                  </p>

                  <p className="mt-2 max-w-[150px] text-sm leading-5 text-zinc-500">
                    Across our latest updates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-16 px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
                <Newspaper className="h-6 w-6 animate-pulse text-purple-600" />
              </div>

              <p className="mt-5 text-sm text-zinc-500">
                Loading the latest stories...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-red-400" />

            <h2 className="mt-4 font-semibold text-zinc-900">
              Unable to load stories
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* CATEGORY FILTER */}
            {categories.length > 0 && (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                      Explore
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
                      Browse by topic
                    </h2>
                  </div>

                  <span className="hidden text-sm text-zinc-500 sm:block">
                    {filteredNews.length}{' '}
                    {filteredNews.length === 1
                      ? 'story'
                      : 'stories'}
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setCategory('All')}
                    className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${category === 'All'
                        ? 'bg-zinc-950 text-white shadow-md'
                        : 'border border-zinc-200 bg-white text-zinc-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                  >
                    All Stories
                  </button>

                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${category === item
                          ? 'bg-zinc-950 text-white shadow-md'
                          : 'border border-zinc-200 bg-white text-zinc-600 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* EMPTY */}
            {filteredNews.length === 0 && (
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50">
                  <FileText className="h-7 w-7 text-purple-600" />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-zinc-950">
                  No stories yet
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                  There are currently no published stories
                  in this category. Check back soon for new
                  updates from 39Production.
                </p>
              </div>
            )}

            {/* FEATURED STORY */}
            {featuredNews && (
              <section>
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Sparkles className="h-4 w-4" />

                      <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                        Featured Story
                      </p>
                    </div>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                      Inside 39Production
                    </h2>
                  </div>
                </div>

                <Link
                  to={`/news/${featuredNews.id}`}
                  className="group relative grid overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30 md:grid-cols-2"
                >
                  {/* IMAGE */}
                  <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-purple-100 via-white to-pink-100 md:min-h-[500px]">
                    {featuredNews.image_url ? (
                      <img
                        src={featuredNews.image_url}
                        alt={featuredNews.title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-[320px] items-center justify-center md:min-h-[500px]">
                        <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-purple-200 bg-white/80 text-purple-500 shadow-sm">
                          <Newspaper className="h-12 w-12" />
                        </div>
                      </div>
                    )}

                    {featuredNews.image_url && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                        <div className="absolute bottom-6 left-6">
                          <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                            {featuredNews.category}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                    {!featuredNews.image_url && (
                      <span className="w-fit rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                        {featuredNews.category}
                      </span>
                    )}

                    <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-zinc-950 transition group-hover:text-purple-600 md:text-4xl lg:text-5xl">
                      {featuredNews.title}
                    </h2>

                    <p className="mt-5 text-base leading-8 text-zinc-600">
                      {featuredNews.excerpt}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
                      <span>
                        By{' '}
                        <span className="font-medium text-zinc-700">
                          {featuredNews.author}
                        </span>
                      </span>

                      <span className="hidden h-1 w-1 rounded-full bg-zinc-300 sm:block" />

                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredNews.date)}
                      </span>
                    </div>

                    <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-purple-600">
                      <span>Read full story</span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 transition group-hover:translate-x-1 group-hover:bg-purple-600 group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* NEWS GRID */}
            {remainingNews.length > 0 && (
              <section>
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                    Latest Updates
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                    More from 39Production
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                    The latest ideas, projects, announcements,
                    and creative stories from our studio.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {remainingNews.map((item) => (
                    <Link
                      key={item.id}
                      to={`/news/${item.id}`}
                      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30"
                    >
                      {/* IMAGE */}
                      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
                              <FileText className="h-7 w-7" />
                            </div>
                          </div>
                        )}

                        {item.image_url && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        )}

                        <span
                          className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-xs font-medium ${item.image_url
                              ? 'border border-white/20 bg-black/30 text-white backdrop-blur-md'
                              : 'border border-purple-200 bg-white/95 text-purple-700 shadow-sm'
                            }`}
                        >
                          {item.category}
                        </span>
                      </div>

                      {/* CONTENT */}
                      <div className="p-6">
                        <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-zinc-900 transition group-hover:text-purple-600">
                          {item.title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                          {item.excerpt}
                        </p>

                        <div className="mt-6 flex items-center justify-between gap-4 border-t border-zinc-100 pt-5 text-xs text-zinc-500">
                          <span className="truncate">
                            {item.author}
                          </span>

                          <span className="flex shrink-0 items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(item.date)}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <span className="text-sm font-semibold text-purple-600">
                            Read Article
                          </span>

                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition group-hover:translate-x-1 group-hover:bg-purple-600 group-hover:text-white">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}