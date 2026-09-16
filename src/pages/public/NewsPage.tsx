import {
  ArrowRight,
  Calendar,
  FileText,
  Loader2,
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

function getDateParts(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`)

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
          news
            .map((item) => item.category)
            .filter(Boolean),
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
        <div className="pointer-events-none absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-violet-100/60 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-100/40 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-10 sm:pb-18 sm:pt-14 lg:px-8 lg:pb-20">
          {/* TOP LINE */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              39Production • Journal
            </p>

            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:flex">
              <span>Stories</span>
              <span className="text-zinc-300">/</span>
              <span>Ideas</span>
              <span className="text-zinc-300">/</span>
              <span>Updates</span>
            </div>
          </div>

          <div className="grid gap-12 pt-14 lg:grid-cols-[1fr_300px] lg:items-end lg:pt-18">
            {/* TITLE */}
            <div>
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white">
                  <Newspaper className="h-4 w-4 text-violet-600" />
                </div>

                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-600">
                  Publication
                </span>
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-zinc-950 sm:text-6xl lg:text-[5.25rem]">
                Stories behind
                <br />
                <span className="text-zinc-400">
                  what we create.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
                Ideas, projects, releases, creative
                experiments, and stories shaping the world
                of 39Production.
              </p>
            </div>

            {/* PUBLICATION INFO */}
            {!loading && !error && (
              <div className="border-y border-zinc-200">
                <div className="grid grid-cols-2 divide-x divide-zinc-200">
                  <div className="px-4 py-5">
                    <p className="font-mono text-3xl font-medium tracking-[-0.05em] text-zinc-950">
                      {String(news.length).padStart(2, '0')}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.17em] text-zinc-400">
                      Published
                    </p>
                  </div>

                  <div className="px-4 py-5">
                    <p className="font-mono text-3xl font-medium tracking-[-0.05em] text-zinc-950">
                      {String(categories.length).padStart(
                        2,
                        '0',
                      )}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.17em] text-zinc-400">
                      Topics
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-200 px-4 py-3">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <Sparkles className="h-3 w-3 text-violet-500" />
                    <span>
                      The latest from our studio.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* FILTER INDEX */}
        {!loading && !error && categories.length > 0 && (
          <section className="border-b border-zinc-200 py-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
                  Story index
                </p>

                <p className="mt-1 text-sm text-zinc-600">
                  Browse the journal by topic.
                </p>
              </div>

              <div className="flex overflow-x-auto border border-zinc-200 scrollbar-none">
                <FilterButton
                  active={category === 'All'}
                  onClick={() => setCategory('All')}
                >
                  All Stories
                </FilterButton>

                {categories.map((item) => (
                  <FilterButton
                    key={item}
                    active={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </FilterButton>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[480px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              <span>Loading the journal...</span>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="my-16 border border-red-200 bg-red-50/60 p-8">
            <div className="flex items-start gap-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-500">
                  Request failed
                </p>

                <p className="mt-3 text-sm leading-6 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {!loading && !error && (
          <>
            {/* EMPTY */}
            {filteredNews.length === 0 && (
              <section className="py-20 sm:py-28">
                <div className="border border-zinc-200 bg-zinc-50 px-6 py-20 text-center">
                  <Newspaper className="mx-auto h-8 w-8 text-zinc-300" />

                  <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    Empty index
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                    No stories yet.
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                    There are currently no published stories
                    in this category. Check back soon for new
                    updates from 39Production.
                  </p>
                </div>
              </section>
            )}

            {/* FEATURED */}
            {featuredNews && (
              <section className="py-14 sm:py-16">
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400">
                        01
                      </span>

                      <span className="h-px w-8 bg-violet-500" />

                      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                        Featured story
                      </p>
                    </div>

                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
                      Inside 39Production.
                    </h2>
                  </div>

                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
                    Editor's pick
                  </span>
                </div>

                <Link
                  to={`/news/${featuredNews.id}`}
                  className="group block border-y border-zinc-200 transition hover:bg-zinc-50/70"
                >
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                    {/* IMAGE */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 lg:aspect-[4/3]">
                      {featuredNews.image_url ? (
                        <>
                          <img
                            src={featuredNews.image_url}
                            alt={featuredNews.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                          <div className="absolute bottom-5 left-5">
                            <span className="border border-white/25 bg-black/30 px-3 py-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur-md">
                              {featuredNews.category}
                            </span>
                          </div>

                          <div className="absolute right-5 top-5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/80">
                            39P / 01
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
                          <Newspaper className="h-12 w-12 text-violet-200" />
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-col justify-center border-t border-zinc-200 p-7 sm:p-9 lg:border-l lg:border-t-0 lg:p-12 xl:p-14">
                      {!featuredNews.image_url && (
                        <span className="w-fit border border-violet-200 bg-violet-50 px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                          {featuredNews.category}
                        </span>
                      )}

                      <h2 className="mt-5 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-zinc-950 transition group-hover:text-violet-600 sm:text-4xl xl:text-[2.75rem]">
                        {featuredNews.title}
                      </h2>

                      <p className="mt-5 text-sm leading-7 text-zinc-600 sm:text-base">
                        {featuredNews.excerpt}
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-200 pt-5">
                        <span className="text-xs text-zinc-500">
                          By{' '}
                          <span className="font-medium text-zinc-800">
                            {featuredNews.author}
                          </span>
                        </span>

                        <span className="hidden h-1 w-1 bg-zinc-300 sm:block" />

                        <span className="flex items-center gap-2 text-xs text-zinc-500">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(featuredNews.date)}
                        </span>
                      </div>

                      <div className="mt-8 flex items-center gap-3">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">
                          Read full story
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center border border-zinc-200 transition group-hover:translate-x-1 group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* LATEST STORIES */}
            {remainingNews.length > 0 && (
              <section className="border-t border-zinc-200 py-14 sm:py-16">
                <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400">
                        02
                      </span>

                      <span className="h-px w-8 bg-zinc-300" />

                      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Latest updates
                      </p>
                    </div>

                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-950 sm:text-4xl">
                      More from the journal.
                    </h2>
                  </div>

                  <p className="max-w-xs text-sm leading-6 text-zinc-500 sm:text-right">
                    The latest ideas, projects,
                    announcements, and creative stories from
                    the studio.
                  </p>
                </div>

                <div className="mt-10 border-t border-zinc-200">
                  {remainingNews.map((item, index) => (
                    <NewsRow
                      key={item.id}
                      item={item}
                      index={index + 2}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* FOOTER STATEMENT */}
            {filteredNews.length > 0 && (
              <section className="border-t border-zinc-200 py-16 sm:py-20">
                <div className="grid gap-8 sm:grid-cols-[120px_1fr]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    06.01
                  </div>

                  <div className="max-w-3xl">
                    <p className="text-2xl font-medium leading-tight tracking-[-0.03em] text-zinc-900 sm:text-3xl">
                      We document the ideas, experiments,
                      and stories that become part of the
                      work.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                      <Link
                        to="/portfolio"
                        className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-violet-600"
                      >
                        Explore our work
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>

                      <Link
                        to="/contact"
                        className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-zinc-900"
                      >
                        Start a project
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border-r border-zinc-200 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition last:border-r-0 ${active
          ? 'bg-zinc-950 text-white'
          : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
        }`}
    >
      {children}
    </button>
  )
}

function NewsRow({
  item,
  index,
}: {
  item: News
  index: number
}) {
  const dateParts = getDateParts(item.date)

  return (
    <Link
      to={`/news/${item.id}`}
      className="group block border-b border-zinc-200 py-7 transition hover:bg-zinc-50/70 sm:py-8"
    >
      <div className="grid gap-6 lg:grid-cols-[70px_180px_minmax(0,1fr)_220px] lg:items-center lg:gap-8">
        {/* INDEX */}
        <div className="hidden lg:block">
          <span className="font-mono text-[10px] tracking-[0.16em] text-zinc-400">
            {String(index).padStart(2, '0')}
          </span>
        </div>

        {/* IMAGE */}
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 sm:aspect-[16/7] lg:aspect-[4/3]">
          {item.image_url ? (
            <>
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-black/5 transition group-hover:bg-transparent" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-violet-50">
              <FileText className="h-7 w-7 text-violet-200" />
            </div>
          )}
        </div>

        {/* ARTICLE */}
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-violet-600">
              {item.category}
            </span>

            <span className="h-1 w-1 bg-zinc-300" />

            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-zinc-400">
              {dateParts.day} {dateParts.month}{' '}
              {dateParts.year}
            </span>
          </div>

          <h3 className="mt-3 max-w-2xl text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-950 transition group-hover:text-violet-600 sm:text-2xl">
            {item.title}
          </h3>

          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {item.excerpt}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <span>By {item.author}</span>
          </div>
        </div>

        {/* DATE / ACTION */}
        <div className="hidden lg:flex lg:flex-col lg:items-end lg:justify-between lg:self-stretch">
          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
              Published
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              {formatDate(item.date)}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 transition group-hover:text-violet-600">
            Read
            <span className="flex h-7 w-7 items-center justify-center border border-zinc-200 transition group-hover:translate-x-1 group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* MOBILE ACTION */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 lg:hidden">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
            {String(index).padStart(2, '0')} / Journal
          </span>

          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-600">
            Read story
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}