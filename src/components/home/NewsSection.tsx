
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

  return '/news'
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
          throw new Error('Failed to fetch news.')
        }

        const result =
          (await response.json()) as ApiResponse<News[]>

        if (!mounted) {
          return
        }

        if (result.success) {
          const publishedNews = (result.data ?? [])
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
    <section
      id="news"
      aria-labelledby="news-section-title"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.028]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[16%] -z-10 h-2 w-2 rounded-full bg-[#7C3AED]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[11%] bottom-[18%] -z-10 hidden h-1.5 w-1.5 rounded-full bg-black/20 sm:block"
      />

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* =======================================================
            HEADER
        ======================================================== */}

        <div className="flex flex-col gap-8 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="newsEyebrow mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                <Newspaper
                  className="h-3.5 w-3.5"
                  strokeWidth={1.8}
                />
              </span>

              <span className="h-px w-8 bg-[#7C3AED]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400">
                39Production Journal
              </span>
            </div>

            <h2
              id="news-section-title"
              className="max-w-3xl text-4xl font-black leading-[0.92] tracking-[-0.065em] text-black sm:text-5xl lg:text-6xl"
            >
              Stories, updates,
              <br />
              <span className="text-neutral-300">
                and things we're making.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
              Ikuti perkembangan terbaru dari 39Production —
              mulai dari project, produk digital, creative
              technology, hingga entertainment.
            </p>
          </div>

          {!loading && news.length > 0 && (
            <Link
              to="/news"
              className="group inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
            >
              View all updates

              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>

        {/* =======================================================
            LOADING
        ======================================================== */}

        {loading ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="overflow-hidden border border-neutral-200 bg-white">
              <div className="aspect-[16/9] animate-pulse bg-neutral-100" />

              <div className="space-y-5 p-6 sm:p-8">
                <div className="h-3 w-24 animate-pulse bg-neutral-100" />

                <div className="h-8 w-4/5 animate-pulse bg-neutral-100" />

                <div className="h-3 w-full animate-pulse bg-neutral-100" />

                <div className="h-3 w-2/3 animate-pulse bg-neutral-100" />

                <div className="h-4 w-28 animate-pulse bg-neutral-100" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden border border-neutral-200 bg-white"
                >
                  <div className="aspect-[16/9] animate-pulse bg-neutral-100" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse bg-neutral-100" />

                    <div className="h-5 w-full animate-pulse bg-neutral-100" />

                    <div className="h-3 w-4/5 animate-pulse bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            {/* =================================================
                FEATURED NEWS
            ================================================== */}

            {featuredNews && (
              <Link
                to={getNewsUrl(featuredNews)}
                className="newsFeatured group flex h-full flex-col overflow-hidden border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-black hover:shadow-[0_22px_55px_rgba(0,0,0,0.07)]"
              >
                {/* Image */}

                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 sm:aspect-[16/8.5]">
                  {featuredNews.image_url ? (
                    <img
                      src={featuredNews.image_url}
                      alt={featuredNews.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 transition-all duration-500 group-hover:border-[#7C3AED] group-hover:text-[#7C3AED]">
                        <Newspaper className="h-7 w-7" />
                      </div>
                    </div>
                  )}

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                  />

                  {/* Latest badge */}

                  <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
                    <span className="inline-flex items-center gap-2 bg-black px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                      <Sparkles className="h-3 w-3 text-[#7C3AED]" />

                      Latest Update
                    </span>
                  </div>

                  {/* Accent */}

                  <div className="absolute bottom-0 left-0 h-1 w-20 bg-[#7C3AED] transition-all duration-500 group-hover:w-32" />
                </div>

                {/* Content */}

                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 border border-[#7C3AED]/20 bg-[#7C3AED]/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#7C3AED]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                      {featuredNews.category}
                    </span>

                    {(featuredNews.published_at ??
                      featuredNews.created_at) && (
                        <>
                          <span className="h-3 w-px bg-neutral-200" />

                          <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                            <Clock3 className="h-3.5 w-3.5" />

                            {formatDate(
                              featuredNews.published_at ??
                              featuredNews.created_at,
                            )}
                          </span>
                        </>
                      )}
                  </div>

                  <h3 className="mt-5 max-w-3xl text-2xl font-black leading-[1.05] tracking-[-0.045em] text-black transition-colors duration-300 group-hover:text-[#7C3AED] sm:text-3xl lg:text-4xl">
                    {featuredNews.title}
                  </h3>

                  {featuredNews.excerpt && (
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
                      {featuredNews.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-8">
                    <div className="flex items-center justify-between gap-5 border-t border-neutral-200 pt-5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                        Featured Story
                      </span>

                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black transition-colors group-hover:text-[#7C3AED]">
                        Read update

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* =================================================
                SECONDARY NEWS
            ================================================== */}

            <div className="grid gap-6 sm:grid-cols-2">
              {secondaryNews.map((item, index) => (
                <Link
                  key={item.id}
                  to={getNewsUrl(item)}
                  className="newsCard group relative flex h-full flex-col overflow-hidden border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-black hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]"
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  {/* Image */}

                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            'none'
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                        <Newspaper className="h-9 w-9 text-neutral-300 transition-colors duration-300 group-hover:text-[#7C3AED]" />
                      </div>
                    )}

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
                    />

                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-2 bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-black">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-neutral-400">
                      <Clock3 className="h-3.5 w-3.5" />

                      {formatDate(
                        item.published_at ??
                        item.created_at,
                      )}
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-lg font-black leading-[1.15] tracking-[-0.035em] text-black transition-colors duration-300 group-hover:text-[#7C3AED]">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-auto pt-5">
                      <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-neutral-400 transition-colors duration-300 group-hover:text-[#7C3AED]">
                        Read more

                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>

                  {/* Bottom accent */}

                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#7C3AED] transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}

              {secondaryNews.length === 0 && (
                <div className="hidden border border-dashed border-neutral-200 bg-neutral-50 sm:block" />
              )}
            </div>
          </div>
        )}

        {/* =======================================================
            BOTTOM CTA
        ======================================================== */}

        {!loading && news.length > 6 && (
          <div className="mt-10 flex justify-center border-t border-black/10 pt-8">
            <Link
              to="/news"
              className="group inline-flex items-center gap-3 rounded-full bg-black px-6 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#7C3AED]"
            >
              Explore all updates

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {/* Small footer statement */}

        {!loading && news.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              39Production Journal
            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300">
              Create · Produce · Deliver
            </p>
          </div>
        )}
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .newsEyebrow {
          animation: newsEyebrowIn 0.7s ease-out both;
        }

        .newsFeatured {
          animation: newsFeaturedIn 0.8s ease-out both;
        }

        .newsCard {
          animation: newsCardIn 0.65s ease-out both;
        }

        @keyframes newsEyebrowIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes newsFeaturedIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes newsCardIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .newsEyebrow,
          .newsFeatured,
          .newsCard {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}
