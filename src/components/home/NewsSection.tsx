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

function getCategoryStyle(
  index: number,
) {
  const styles = [
    {
      badge:
        'border-violet-100 bg-violet-50 text-violet-700',
      dot: 'bg-violet-500',
    },
    {
      badge:
        'border-pink-100 bg-pink-50 text-pink-700',
      dot: 'bg-pink-500',
    },
    {
      badge:
        'border-purple-100 bg-purple-50 text-purple-700',
      dot: 'bg-purple-500',
    },
    {
      badge:
        'border-indigo-100 bg-indigo-50 text-indigo-700',
      dot: 'bg-indigo-500',
    },
  ]

  return styles[index % styles.length]
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
                item.status ===
                'Published',
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
  const secondaryNews =
    visibleNews.slice(1)

  return (
    <section
      id="news"
      aria-labelledby="news-section-title"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="newsGlow newsGlowOne absolute -left-40 top-[10%] h-[420px] w-[420px] rounded-full" />

        <div className="newsGlow newsGlowTwo absolute -right-40 top-[45%] h-[460px] w-[460px] rounded-full" />

        <div className="newsGlow newsGlowThree absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="newsGrid absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="newsLightLine newsLightLineOne absolute left-[-20%] top-[30%] h-px w-[140%]" />

        <div className="newsLightLine newsLightLineTwo absolute left-[-20%] top-[74%] h-px w-[140%]" />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* =======================================================
            HEADER
        ======================================================== */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="newsEyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 sm:text-[11px]">
                39PRODUCTION JOURNAL
              </span>
            </div>

            <h2
              id="news-section-title"
              className="text-3xl font-semibold leading-[1.1] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl"
            >
              What&apos;s happening
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                at 39Production?
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
              Ikuti update terbaru seputar project, produk digital, creative
              technology, dan entertainment dari 39Production.
            </p>
          </div>

          {!loading && news.length > 0 && (
            <Link
              to="/news"
              className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-violet-600"
            >
              View all updates

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* =======================================================
            LOADING
        ======================================================== */}

        {loading ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white">
              <div className="h-[280px] animate-pulse bg-neutral-100 sm:h-[340px]" />

              <div className="space-y-4 p-6">
                <div className="h-5 w-24 animate-pulse rounded-full bg-neutral-100" />

                <div className="h-7 w-4/5 animate-pulse rounded bg-neutral-100" />

                <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />

                <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[22px] border border-neutral-200 bg-white"
                  >
                    <div className="h-36 animate-pulse bg-neutral-100" />

                    <div className="space-y-3 p-5">
                      <div className="h-3 w-20 animate-pulse rounded-full bg-neutral-100" />
                      <div className="h-5 w-full animate-pulse rounded bg-neutral-100" />
                      <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {/* =================================================
                FEATURED NEWS
            ================================================== */}

            {featuredNews && (
              <Link
                to={getNewsUrl(
                  featuredNews,
                )}
                className="newsFeatured group flex h-full flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 sm:aspect-[16/8.5]">
                  {featuredNews.image_url ? (
                    <img
                      src={
                        featuredNews.image_url
                      }
                      alt={
                        featuredNews.title
                      }
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-pink-50">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm ring-1 ring-neutral-200">
                        <Newspaper className="h-7 w-7" />
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

                  {/* Featured badge */}
                  <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700 shadow-sm backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5 text-violet-600" />

                      Latest Update
                    </span>
                  </div>

                  {/* Accent */}
                  <div className="absolute bottom-0 left-0 h-1 w-20 bg-gradient-to-r from-violet-600 to-pink-500 transition-all duration-500 group-hover:w-32" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6 sm:p-7 lg:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

                      {featuredNews.category}
                    </span>

                    {(
                      featuredNews.published_at ??
                      featuredNews.created_at
                    ) && (
                        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <Clock3 className="h-3.5 w-3.5" />

                          {formatDate(
                            featuredNews.published_at ??
                            featuredNews.created_at,
                          )}
                        </span>
                      )}
                  </div>

                  <h3 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-violet-600 sm:text-3xl">
                    {featuredNews.title}
                  </h3>

                  {featuredNews.excerpt && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
                      {featuredNews.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors group-hover:text-violet-600">
                      Read update

                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* =================================================
                SECONDARY NEWS
            ================================================== */}

            <div className="grid gap-5 sm:grid-cols-2">
              {secondaryNews.map(
                (item, index) => {
                  const accent =
                    getCategoryStyle(
                      index,
                    )

                  return (
                    <Link
                      key={item.id}
                      to={getNewsUrl(item)}
                      className="newsCard group flex h-full flex-col overflow-hidden rounded-[22px] border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                        {item.image_url ? (
                          <img
                            src={
                              item.image_url
                            }
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                'none'
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                            <Newspaper className="h-10 w-10 text-neutral-300" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

                        <div className="absolute bottom-3 left-3">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] shadow-sm backdrop-blur-sm ${accent.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                            />

                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <Clock3 className="h-3.5 w-3.5" />

                          {formatDate(
                            item.published_at ??
                            item.created_at,
                          )}
                        </div>

                        <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-neutral-950 transition-colors duration-300 group-hover:text-violet-600">
                          {item.title}
                        </h3>

                        {item.excerpt && (
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-500">
                            {item.excerpt}
                          </p>
                        )}

                        <div className="mt-auto pt-4">
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition-colors group-hover:text-violet-600">
                            Read more

                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>

                      <div className="newsCardShine pointer-events-none absolute inset-y-0 left-0 w-[30%] -translate-x-[180%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-18deg]" />
                    </Link>
                  )
                },
              )}

              {secondaryNews.length === 0 && (
                <div className="hidden rounded-[22px] border border-dashed border-neutral-200 bg-neutral-50 sm:block" />
              )}
            </div>
          </div>
        )}

        {/* =======================================================
            BOTTOM CTA
        ======================================================== */}

        {!loading && news.length > 6 && (
          <div className="mt-10 flex justify-center">
            <Link
              to="/news"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-600 hover:shadow-md sm:w-auto"
            >
              Explore all updates

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .newsGlow {
          filter: blur(90px);
          opacity: 0.38;
        }

        .newsGlowOne {
          background: rgba(139, 92, 246, 0.04);
          animation: newsGlowOne 16s ease-in-out infinite;
        }

        .newsGlowTwo {
          background: rgba(236, 72, 153, 0.03);
          animation: newsGlowTwo 19s ease-in-out infinite;
        }

        .newsGlowThree {
          background: rgba(99, 102, 241, 0.028);
          animation: newsGlowThree 18s ease-in-out infinite;
        }

        .newsGrid {
          background-image:
            linear-gradient(
              to right,
              rgba(15, 23, 42, 0.022) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0.022) 1px,
              transparent 1px
            );

          background-size: 76px 76px;

          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 14%,
              black 82%,
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 14%,
              black 82%,
              transparent
            );

          animation: newsGridMove 24s linear infinite;
        }

        .newsLightLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.07),
            transparent
          );

          opacity: 0.4;
          animation: newsLineMove 11s ease-in-out infinite;
        }

        .newsLightLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.06),
            transparent
          );

          animation-delay: 4s;
        }

        .newsEyebrow {
          animation: newsEyebrowIn 0.7s ease-out both;
        }

        .newsCardShine {
          opacity: 0;
          transition:
            transform 1s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.3s ease;
        }

        .newsCard:hover .newsCardShine {
          opacity: 1;
          transform: translateX(400%);
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

        @keyframes newsGridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 76px 76px;
          }
        }

        @keyframes newsGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(45px, 30px, 0);
          }
        }

        @keyframes newsGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, -30px, 0);
          }
        }

        @keyframes newsGlowThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(35px, -30px, 0);
          }
        }

        @keyframes newsLineMove {
          0%,
          100% {
            transform: translateX(-3%);
            opacity: 0.15;
          }

          50% {
            transform: translateX(3%);
            opacity: 0.5;
          }
        }

        @media (max-width: 640px) {
          .newsGlow {
            opacity: 0.28;
          }

          .newsGrid {
            background-size: 56px 56px;
          }

          .newsLightLine {
            opacity: 0.2;
          }

          .newsCardShine {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .newsGlow,
          .newsGrid,
          .newsLightLine,
          .newsEyebrow {
            animation: none !important;
          }

          .newsCardShine {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}