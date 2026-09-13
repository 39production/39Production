import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  ImageOff,
  Loader2,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface Portfolio {
  id: number
  title: string
  category: string
  client: string
  description: string
  year: string
  status: 'Published' | 'Draft'
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

const accentClasses = [
  {
    dot: 'bg-violet-500',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-100',
    hover: 'group-hover:text-violet-600',
  },
  {
    dot: 'bg-pink-500',
    soft: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-100',
    hover: 'group-hover:text-pink-600',
  },
  {
    dot: 'bg-indigo-500',
    soft: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
    hover: 'group-hover:text-indigo-600',
  },
  {
    dot: 'bg-fuchsia-500',
    soft: 'bg-fuchsia-50',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-100',
    hover: 'group-hover:text-fuchsia-600',
  },
  {
    dot: 'bg-purple-500',
    soft: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-100',
    hover: 'group-hover:text-purple-600',
  },
  {
    dot: 'bg-blue-500',
    soft: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    hover: 'group-hover:text-blue-600',
  },
]

function getAccent(index: number) {
  return accentClasses[index % accentClasses.length]
}

function getImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return ''

  return imageUrl.trim()
}

export function FeaturedWorksSection() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function fetchPortfolios() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/portfolio`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load portfolio (${response.status}).`,
          )
        }

        const result: ApiResponse<Portfolio[]> =
          await response.json()

        if (!result.success) {
          throw new Error(
            result.message ||
            'Failed to load portfolio.',
          )
        }

        if (mounted) {
          setPortfolios(result.data || [])
        }
      } catch (err) {
        console.error('Featured works error:', err)

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load portfolio.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchPortfolios()

    return () => {
      mounted = false
    }
  }, [])

  const featuredWorks = useMemo(() => {
    return portfolios
      .filter(
        (portfolio) =>
          portfolio.status === 'Published',
      )
      .slice(0, 6)
  }, [portfolios])

  return (
    <section
      id="featured-works"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* =========================================================
          SUBTLE BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="featuredGlow featuredGlowOne absolute -left-40 top-16 h-[420px] w-[420px] rounded-full" />

        <div className="featuredGlow featuredGlowTwo absolute -right-40 top-[42%] h-[460px] w-[460px] rounded-full" />

        <div className="featuredGlow featuredGlowThree absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="featuredGrid absolute inset-0" />
      </div>

      {/* Moving subtle accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="featuredLightLine featuredLightLineOne absolute left-[-20%] top-[28%] h-px w-[140%]" />

        <div className="featuredLightLine featuredLightLineTwo absolute left-[-20%] top-[73%] h-px w-[140%]" />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* =======================================================
            SECTION HEADING
        ======================================================== */}

        <div className="mx-auto max-w-3xl text-center">
          <div className="featuredEyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

            <span className="text-[10px] font-semibold tracking-[0.18em] text-violet-700 sm:text-[11px]">
              SELECTED WORKS
            </span>
          </div>

          <h2 className="text-3xl font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Turning ideas into
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              meaningful digital work.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
            A selection of projects that represent how we combine technology,
            design, and creative thinking to solve different kinds of digital
            challenges.
          </p>
        </div>

        {/* =======================================================
            INTRO STRIP
        ======================================================== */}

        <div className="mx-auto mt-12 max-w-[1180px] rounded-[24px] border border-neutral-200 bg-neutral-50/80 p-5 sm:mt-14 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                How we approach projects
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                Setiap project memiliki kebutuhan yang berbeda. Karena itu,
                kami menyesuaikan kombinasi teknologi, design, dan creative
                production berdasarkan tujuan project.
              </p>
            </div>

            <Link
              to="/portfolio"
              className="group inline-flex shrink-0 items-center justify-center gap-2 text-sm font-semibold text-neutral-700 transition-colors duration-300 hover:text-violet-600"
            >
              View all work
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* =======================================================
            LOADING
        ======================================================== */}

        {loading && (
          <div className="mt-10 rounded-[24px] border border-neutral-200 bg-neutral-50 px-6 py-16">
            <div className="flex items-center justify-center gap-3 text-sm text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              Loading selected works...
            </div>
          </div>
        )}

        {/* =======================================================
            ERROR
        ======================================================== */}

        {!loading && error && (
          <div className="mt-10 rounded-[24px] border border-red-100 bg-red-50/60 px-6 py-12 text-center">
            <p className="text-sm font-medium text-neutral-800">
              Unable to load featured works.
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-neutral-500">
              {error}
            </p>

            <Link
              to="/portfolio"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Open portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* =======================================================
            EMPTY
        ======================================================== */}

        {!loading &&
          !error &&
          featuredWorks.length === 0 && (
            <div className="mt-10 rounded-[24px] border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
                <ImageOff className="h-5 w-5 text-neutral-400" />
              </div>

              <p className="mt-5 text-sm font-medium text-neutral-800">
                No featured works available yet.
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-neutral-500">
                Published portfolio projects will appear here once they are
                added from the admin panel.
              </p>
            </div>
          )}

        {/* =======================================================
            FEATURED WORKS
        ======================================================== */}

        {!loading &&
          !error &&
          featuredWorks.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredWorks.map((work, index) => {
                const imageUrl = getImageUrl(
                  work.image_url,
                )

                const accent = getAccent(index)

                return (
                  <Link
                    key={work.id}
                    to="/portfolio"
                    className="featuredCard group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
                  >
                    {/* =========================================
                        IMAGE
                    ========================================== */}

                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={work.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              'none'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
                            <ImageOff className="h-5 w-5 text-neutral-400" />
                          </div>
                        </div>
                      )}

                      {/* Very light image treatment */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

                      {/* Number */}
                      <div className="absolute left-4 top-4">
                        <span className="inline-flex rounded-full border border-white/60 bg-white/90 px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.16em] text-neutral-700 shadow-sm backdrop-blur-sm">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Open icon */}
                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-neutral-700 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:text-violet-600">
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>

                      {/* Accent bottom line */}
                      <div
                        className={`absolute bottom-0 left-0 h-1 w-12 ${accent.dot} transition-all duration-500 group-hover:w-20`}
                      />
                    </div>

                    {/* =========================================
                        CONTENT
                    ========================================== */}

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      {/* Category */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${accent.soft} ${accent.text} ${accent.border}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${accent.dot}`}
                          />

                          {work.category}
                        </span>

                        {work.year && (
                          <span className="text-xs text-neutral-400">
                            {work.year}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-neutral-950 transition-colors duration-300 sm:text-[22px]">
                        {work.title}
                      </h3>

                      {/* Client */}
                      {work.client && (
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.13em] text-neutral-400">
                          {work.client}
                        </p>
                      )}

                      {/* Description */}
                      <p className="mt-3 line-clamp-3 text-[13px] leading-[1.7] text-neutral-500">
                        {work.description}
                      </p>

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-5">
                        <span
                          className={`text-xs font-semibold text-neutral-500 transition-colors duration-300 ${accent.hover}`}
                        >
                          View project
                        </span>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-all duration-300 group-hover:border-violet-200 group-hover:text-violet-600">
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Subtle shine */}
                    <div className="featuredCardShine pointer-events-none absolute inset-y-0 left-0 w-[35%] -translate-x-[180%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-18deg]" />
                  </Link>
                )
              })}
            </div>
          )}

        {/* =======================================================
            BOTTOM CTA
        ======================================================== */}

        {!loading &&
          !error &&
          featuredWorks.length > 0 && (
            <div className="mx-auto mt-14 max-w-2xl text-center sm:mt-16">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Looking for something specific?
              </p>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                Your project could be next.
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Ceritakan kebutuhanmu dan kita bisa menentukan pendekatan,
                scope, dan solusi yang paling sesuai.
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-200 sm:w-auto"
                >
                  Start a Project
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/portfolio"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-all duration-300 hover:border-violet-200 hover:text-violet-600 sm:w-auto"
                >
                  Explore Portfolio
                  <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          )}
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .featuredGlow {
          filter: blur(90px);
          opacity: 0.5;
        }

        .featuredGlowOne {
          background: rgba(139, 92, 246, 0.045);
          animation: featuredGlowOne 16s ease-in-out infinite;
        }

        .featuredGlowTwo {
          background: rgba(236, 72, 153, 0.035);
          animation: featuredGlowTwo 19s ease-in-out infinite;
        }

        .featuredGlowThree {
          background: rgba(99, 102, 241, 0.03);
          animation: featuredGlowThree 18s ease-in-out infinite;
        }

        .featuredGrid {
          background-image:
            linear-gradient(
              to right,
              rgba(15, 23, 42, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0.025) 1px,
              transparent 1px
            );

          background-size: 72px 72px;

          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 15%,
              black 82%,
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 15%,
              black 82%,
              transparent
            );

          animation: featuredGridMove 24s linear infinite;
        }

        .featuredLightLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.08),
            transparent
          );

          opacity: 0.45;
          animation: featuredLineMove 11s ease-in-out infinite;
        }

        .featuredLightLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.06),
            transparent
          );

          animation-delay: 4s;
        }

        .featuredEyebrow {
          animation: featuredEyebrowIn 0.7s ease-out both;
        }

        .featuredCardShine {
          opacity: 0;
          transition:
            transform 1s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.3s ease;
        }

        .featuredCard:hover .featuredCardShine {
          opacity: 1;
          transform: translateX(380%);
        }

        @keyframes featuredEyebrowIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes featuredGridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 72px 72px;
          }
        }

        @keyframes featuredGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(50px, 30px, 0);
          }
        }

        @keyframes featuredGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, -35px, 0);
          }
        }

        @keyframes featuredGlowThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(35px, -30px, 0);
          }
        }

        @keyframes featuredLineMove {
          0%,
          100% {
            transform: translateX(-3%);
            opacity: 0.15;
          }

          50% {
            transform: translateX(3%);
            opacity: 0.55;
          }
        }

        @media (max-width: 640px) {
          .featuredGlow {
            opacity: 0.3;
          }

          .featuredGrid {
            background-size: 56px 56px;
          }

          .featuredLightLine {
            opacity: 0.2;
          }

          .featuredCardShine {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .featuredGlow,
          .featuredGrid,
          .featuredLightLine,
          .featuredEyebrow {
            animation: none !important;
          }

          .featuredCardShine {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}