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

export function NewsPage() {
  const [news, setNews] =
    useState<News[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [category, setCategory] =
    useState('All')

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true)
        setError('')

        const data =
          await apiRequest<News[]>(
            '/api/news',
          )

        setNews(
          (data || []).filter(
            (item) =>
              item.status ===
              'Published',
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
          news.map(
            (item) =>
              item.category,
          ),
        ),
      ),
    [news],
  )

  const filteredNews =
    category === 'All'
      ? news
      : news.filter(
        (item) =>
          item.category ===
          category,
      )

  const featuredNews =
    filteredNews[0]

  const remainingNews =
    filteredNews.slice(1)

  return (
    <div className="min-h-screen bg-bg-base pb-24">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-border-default">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand-primary/15 blur-[120px]" />

          <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-secondary/10 blur-[120px]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_auto]">
            <div className="max-w-4xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/10 px-4 py-2 text-sm font-medium text-brand-primary">
                <Newspaper className="h-4 w-4" />
                39Production Journal
              </div>

              <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
                Stories behind
                <span className="block bg-gradient-to-r from-brand-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  what we create.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-text-secondary md:text-lg">
                Explore the ideas, projects,
                releases, creative experiments,
                and stories shaping the world
                of 39Production.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-secondary">
                  Creative Technology
                </div>

                <div className="rounded-full border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-secondary">
                  Entertainment
                </div>

                <div className="rounded-full border border-border-default bg-bg-surface px-4 py-2 text-sm text-text-secondary">
                  Production
                </div>
              </div>
            </div>

            {/* Hero stats */}
            {!loading && !error && (
              <div className="hidden shrink-0 lg:block">
                <div className="rounded-3xl border border-border-default bg-bg-surface/80 p-6 backdrop-blur-xl">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                    Published Stories
                  </p>

                  <p className="mt-2 font-display text-5xl font-bold text-text-primary">
                    {news.length
                      .toString()
                      .padStart(2, '0')}
                  </p>

                  <p className="mt-2 text-sm text-text-muted">
                    Across our latest updates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-20 px-6 pt-12 lg:px-8">
        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-border-default bg-bg-surface">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10">
                <Newspaper className="h-6 w-6 animate-pulse text-brand-primary" />
              </div>

              <p className="mt-5 text-sm text-text-muted">
                Loading the latest stories...
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-red-400/70" />

            <h2 className="mt-4 font-semibold text-text-primary">
              Unable to load stories
            </h2>

            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* =================================================
                CATEGORY FILTER
            ================================================== */}

            {categories.length > 0 && (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                      Explore
                    </p>

                    <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">
                      Browse by topic
                    </h2>
                  </div>

                  <span className="hidden text-sm text-text-muted sm:block">
                    {filteredNews.length}{' '}
                    {filteredNews.length === 1
                      ? 'story'
                      : 'stories'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCategory('All')
                    }
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${category === 'All'
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                        : 'border border-border-default bg-bg-surface text-text-secondary hover:border-brand-primary/30 hover:text-text-primary'
                      }`}
                  >
                    All Stories
                  </button>

                  {categories.map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setCategory(item)
                        }
                        className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${category === item
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                            : 'border border-border-default bg-bg-surface text-text-secondary hover:border-brand-primary/30 hover:text-text-primary'
                          }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                EMPTY
            ================================================== */}

            {filteredNews.length ===
              0 && (
                <div className="rounded-3xl border border-border-default bg-bg-surface px-6 py-20 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
                    <FileText className="h-7 w-7 text-brand-primary" />
                  </div>

                  <h2 className="mt-6 font-display text-2xl font-bold text-text-primary">
                    No stories yet
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-muted">
                    There are currently no
                    published stories in this
                    category. Check back soon
                    for new updates from
                    39Production.
                  </p>
                </div>
              )}

            {/* =================================================
                FEATURED STORY
            ================================================== */}

            {featuredNews && (
              <section>
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-brand-primary">
                      <Sparkles className="h-4 w-4" />

                      <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                        Featured Story
                      </p>
                    </div>

                    <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">
                      Inside 39Production
                    </h2>
                  </div>
                </div>

                <Link
                  to={`/news/${featuredNews.id}`}
                  className="group relative grid overflow-hidden rounded-3xl border border-border-default bg-bg-surface transition duration-500 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-2xl hover:shadow-brand-primary/5 md:grid-cols-2"
                >
                  {/* IMAGE */}
                  <div className="relative min-h-[360px] overflow-hidden bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-bg-base md:min-h-[500px]">
                    {featuredNews.image_url ? (
                      <img
                        src={
                          featuredNews.image_url
                        }
                        alt={
                          featuredNews.title
                        }
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-[360px] items-center justify-center md:min-h-[500px]">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-3xl" />

                          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
                            <Newspaper className="h-12 w-12" />
                          </div>
                        </div>
                      </div>
                    )}

                    {featuredNews.image_url && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                        <div className="absolute bottom-6 left-6">
                          <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                            {featuredNews.category}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
                    {!featuredNews.image_url && (
                      <span className="w-fit rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                        {featuredNews.category}
                      </span>
                    )}

                    <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-text-primary transition group-hover:text-brand-primary md:text-4xl lg:text-5xl">
                      {featuredNews.title}
                    </h2>

                    <p className="mt-5 text-base leading-8 text-text-secondary">
                      {featuredNews.excerpt}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
                      <span>
                        By{' '}
                        <span className="text-text-secondary">
                          {
                            featuredNews.author
                          }
                        </span>
                      </span>

                      <span className="hidden h-1 w-1 rounded-full bg-text-muted sm:block" />

                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(
                          featuredNews.date,
                        )}
                      </span>
                    </div>

                    <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-brand-primary">
                      <span>
                        Read full story
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 transition group-hover:translate-x-1 group-hover:bg-brand-primary group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* =================================================
                NEWS GRID
            ================================================== */}

            {remainingNews.length > 0 && (
              <section>
                <div className="mb-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                      Latest Updates
                    </p>

                    <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">
                      More from 39Production
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                      The latest ideas, projects,
                      announcements, and creative
                      stories from our studio.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {remainingNews.map(
                    (item) => (
                      <Link
                        key={item.id}
                        to={`/news/${item.id}`}
                        className="group overflow-hidden rounded-2xl border border-border-default bg-bg-surface transition duration-500 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-xl hover:shadow-brand-primary/5"
                      >
                        {/* IMAGE */}
                        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-bg-base">
                          {item.image_url ? (
                            <img
                              src={
                                item.image_url
                              }
                              alt={
                                item.title
                              }
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-2xl" />

                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                                  <FileText className="h-7 w-7" />
                                </div>
                              </div>
                            </div>
                          )}

                          {item.image_url && (
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          )}

                          <span className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                            {item.category}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6">
                          <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-text-primary transition group-hover:text-brand-primary">
                            {item.title}
                          </h3>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">
                            {item.excerpt}
                          </p>

                          <div className="mt-6 flex items-center justify-between border-t border-border-default pt-5 text-xs text-text-muted">
                            <span>
                              {item.author}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(
                                item.date,
                              )}
                            </span>
                          </div>

                          <div className="mt-5 flex items-center justify-between">
                            <span className="text-sm font-semibold text-brand-primary">
                              Read Article
                            </span>

                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary transition group-hover:translate-x-1 group-hover:bg-brand-primary group-hover:text-white">
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}