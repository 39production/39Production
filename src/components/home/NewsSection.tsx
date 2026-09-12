// ============================================================
// NewsSection.tsx
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Clock3,
  Newspaper,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface News {
  id: number
  title: string
  slug?: string
  excerpt?: string
  content?: string
  category: string
  image_url?: string
  status: string
  published_at?: string
  created_at?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

function formatDate(date?: string) {
  if (!date) {
    return ''
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(parsed)
}

function getNewsUrl(item: News) {
  if (item.slug) {
    return `/news/${item.slug}`
  }

  return `/news`
}

export function NewsSection() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadNews() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/news`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch news.',
          )
        }

        const result =
          (await response.json()) as ApiResponse<
            News[]
          >

        if (!mounted) {
          return
        }

        if (result.success) {
          const publishedNews = (
            result.data ?? []
          )
            .filter(
              (item) =>
                item.status === 'Published',
            )
            .sort((a, b) => {
              const dateA = new Date(
                a.published_at ??
                a.created_at ??
                '',
              ).getTime()

              const dateB = new Date(
                b.published_at ??
                b.created_at ??
                '',
              ).getTime()

              return dateB - dateA
            })

          setNews(publishedNews)
        } else {
          setNews([])
        }
      } catch (error) {
        console.error(
          'Load news error:',
          error,
        )

        if (mounted) {
          setNews([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadNews()

    return () => {
      mounted = false
    }
  }, [])

  const visibleNews = useMemo(() => {
    return news.slice(0, 6)
  }, [news])

  /*
   * Tidak menampilkan section apabila
   * belum ada berita yang published.
   */
  if (!loading && news.length === 0) {
    return null
  }

  const featuredNews = visibleNews[0]
  const secondaryNews = visibleNews.slice(1)

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/[0.025] to-transparent" />

      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-brand-primary/[0.05] blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-brand-accent/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-primary">
              <Sparkles className="h-4 w-4" />
              39Production Journal
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
              What&apos;s happening
              <br />
              <span className="text-brand-primary">
                at 39Production?
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              Ikuti update terbaru seputar project,
              produk digital, creative technology,
              dan entertainment dari 39Production.
            </p>
          </div>

          {!loading && news.length > 0 && (
            <Link
              to="/news"
              className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-brand-primary"
            >
              View all updates

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading ? (
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="h-[460px] animate-pulse rounded-3xl border border-border-default bg-bg-surface" />

            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[217px] animate-pulse rounded-2xl border border-border-default bg-bg-surface"
                />
              ))}
            </div>
          </div>
        ) : (
          /* ===================================================
             CONTENT
          ==================================================== */
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* =================================================
                FEATURED NEWS
            ================================================== */}
            {featuredNews && (
              <Link
                to={getNewsUrl(
                  featuredNews,
                )}
                className="group relative min-h-[460px] overflow-hidden rounded-3xl border border-border-default bg-bg-surface"
              >
                {/* Image */}
                <div className="absolute inset-0">
                  {featuredNews.image_url ? (
                    <img
                      src={
                        featuredNews.image_url
                      }
                      alt={
                        featuredNews.title
                      }
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-bg-elevated">
                      <Newspaper className="h-20 w-20 text-text-muted/20" />
                    </div>
                  )}
                </div>

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

                {/* Top accent */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-brand-primary via-brand-accent to-transparent" />

                {/* Featured badge */}
                <div className="absolute left-6 top-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
                    Latest Update
                  </span>
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white">
                      {featuredNews.category}
                    </span>

                    {(
                      featuredNews.published_at ??
                      featuredNews.created_at
                    ) && (
                        <span className="flex items-center gap-1.5 text-xs text-white/70">
                          <Clock3 className="h-3.5 w-3.5" />

                          {formatDate(
                            featuredNews.published_at ??
                            featuredNews.created_at,
                          )}
                        </span>
                      )}
                  </div>

                  <h3 className="mt-4 max-w-2xl text-2xl font-bold leading-tight text-white transition-colors group-hover:text-brand-primary sm:text-3xl">
                    {featuredNews.title}
                  </h3>

                  {featuredNews.excerpt && (
                    <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                      {featuredNews.excerpt}
                    </p>
                  )}

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    Read update

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            )}

            {/* =================================================
                SECONDARY NEWS
            ================================================== */}
            <div className="grid gap-6 sm:grid-cols-2">
              {secondaryNews.map((item) => (
                <Link
                  key={item.id}
                  to={getNewsUrl(item)}
                  className="group overflow-hidden rounded-2xl border border-border-default bg-bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-bg-elevated">
                    {item.image_url ? (
                      <img
                        src={
                          item.image_url
                        }
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Newspaper className="h-10 w-10 text-text-muted/20" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock3 className="h-3.5 w-3.5" />

                      {formatDate(
                        item.published_at ??
                        item.created_at,
                      )}
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-text-primary transition-colors group-hover:text-brand-primary">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-text-muted">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-brand-primary">
                      Read more

                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}

              {/* Empty visual slot when only one news exists */}
              {secondaryNews.length === 0 && (
                <div className="hidden min-h-[217px] rounded-2xl border border-dashed border-border-default bg-bg-surface/50 sm:block" />
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}
        {!loading && news.length > 6 && (
          <div className="mt-10 flex justify-center">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-bg-surface px-6 py-3 text-sm font-semibold text-text-primary transition-all hover:border-brand-primary/40 hover:text-brand-primary"
            >
              Explore all updates

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}