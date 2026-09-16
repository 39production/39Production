
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  MoveUpRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

export function FeaturedWorksSection() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchPortfolios = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${API_BASE_URL}/api/portfolio`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch portfolio (${response.status})`,
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
      id="portfolio"
      className="relative overflow-hidden bg-white text-zinc-950"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />

        <div className="absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />

        <div className="absolute left-[5%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
      </div>

      {/* =========================================================
          MAIN
      ========================================================== */}

      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        {/* =======================================================
            SECTION HEADER
        ======================================================== */}

        <div className="mb-12 border-t border-black/10 pt-4 sm:mb-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                39Production / Selected Works
              </span>
            </div>

            <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              39 / 04
            </span>
          </div>
        </div>

        {/* =======================================================
            INTRO
        ======================================================== */}

        <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:gap-16">
          {/* Left */}
          <div className="max-w-md">
            <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
              A selection of projects we've worked on
              across technology, design, visual,
              animation, games, and creative production.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#7C3AED]" />

              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Selected / Recent / Published
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="max-w-5xl">
            <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
              Selected Works
            </p>

            <h2 className="text-[clamp(2.6rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black">
              Work that
              <span className="text-neutral-300">
                {' '}
                speaks for itself.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
              Setiap project punya konteks dan tujuan
              yang berbeda. Berikut beberapa karya yang
              merepresentasikan cara kami bekerja.
            </p>
          </div>
        </div>

        {/* =======================================================
            WORK HEADER
        ======================================================== */}

        <div className="mt-16 border-t border-black/10 pt-7 sm:mt-20">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                Featured Projects
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
                A closer look at
                <span className="text-neutral-300">
                  {' '}
                  what we make.
                </span>
              </h3>
            </div>

            <Link
              to="/portfolio"
              className="group inline-flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
            >
              View All Works

              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* =======================================================
            LOADING
        ======================================================== */}

        {loading && (
          <div className="mt-7 border-t border-black/10">
            <div className="flex min-h-[280px] items-center justify-center border-b border-black/10">
              <div className="flex items-center gap-3">
                <Loader2
                  className="h-4 w-4 animate-spin text-[#7C3AED]"
                />

                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Loading selected works
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            ERROR
        ======================================================== */}

        {!loading && error && (
          <div className="mt-7 border-t border-black/10">
            <div className="border-b border-black/10 py-14 text-center">
              <p className="text-sm font-bold text-black">
                Unable to load portfolio
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-neutral-500">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            EMPTY
        ======================================================== */}

        {!loading &&
          !error &&
          featuredWorks.length === 0 && (
            <div className="mt-7 border-t border-black/10">
              <div className="flex flex-col items-center justify-center border-b border-black/10 py-16 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10">
                  <Sparkles
                    className="h-4 w-4 text-[#7C3AED]"
                  />
                </div>

                <h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-black">
                  More work is coming.
                </h3>

                <p className="mt-2 max-w-md text-xs leading-6 text-neutral-500">
                  We're currently preparing more projects
                  to showcase here.
                </p>
              </div>
            </div>
          )}

        {/* =======================================================
            PROJECT LIST
        ======================================================== */}

        {!loading &&
          !error &&
          featuredWorks.length > 0 && (
            <div className="mt-7">
              {featuredWorks.map(
                (portfolio, index) => (
                  <article
                    key={portfolio.id}
                    className="group border-t border-black/10"
                  >
                    <div className="grid gap-6 py-7 md:grid-cols-[56px_0.9fr_1.1fr] md:items-center md:gap-8 lg:py-8">
                      {/* Number */}

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#7C3AED]">
                          {String(index + 1).padStart(
                            2,
                            '0',
                          )}
                        </span>

                        <span className="h-px w-5 bg-black/10 md:hidden" />
                      </div>

                      {/* Image */}

                      <div className="relative overflow-hidden bg-neutral-100">
                        <div className="aspect-[16/9]">
                          {portfolio.image_url ? (
                            <img
                              src={
                                portfolio.image_url
                              }
                              alt={portfolio.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                            />
                          ) : (
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
                              <div
                                aria-hidden="true"
                                className="absolute right-[-10%] top-[-30%] h-52 w-52 rounded-full bg-[#7C3AED]/20 blur-3xl"
                              />

                              <div
                                aria-hidden="true"
                                className="absolute bottom-[-30%] left-[-10%] h-44 w-44 rounded-full bg-white/[0.04] blur-2xl"
                              />

                              <div
                                aria-hidden="true"
                                className="absolute h-24 w-24 rounded-full border border-white/10"
                              />

                              <span className="relative text-5xl font-black tracking-[-0.1em] text-white/[0.09]">
                                39
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Category */}

                        <div className="absolute left-3 top-3">
                          <span className="inline-flex items-center border border-white/20 bg-black/60 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                            {portfolio.category}
                          </span>
                        </div>

                        {/* Year */}

                        <div className="absolute right-3 top-3">
                          <span className="inline-flex border border-black/10 bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-black backdrop-blur-sm">
                            {portfolio.year}
                          </span>
                        </div>

                        {/* Hover indicator */}

                        <div className="absolute bottom-3 right-3 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <ExternalLink size={13} />
                        </div>
                      </div>

                      {/* Content */}

                      <div className="relative">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
                              {portfolio.client}
                            </p>

                            <h3 className="max-w-xl text-2xl font-black leading-[1] tracking-[-0.045em] text-black transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
                              {portfolio.title}
                            </h3>
                          </div>

                          <span className="hidden font-mono text-[9px] font-bold tracking-[0.16em] text-neutral-300 sm:block">
                            {String(
                              index + 1,
                            ).padStart(2, '0')}
                          </span>
                        </div>

                        <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-neutral-500">
                          {portfolio.description}
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                          <span className="h-px w-8 bg-black/10 transition-all duration-300 group-hover:w-12 group-hover:bg-[#7C3AED]" />

                          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                            Featured Project
                          </span>

                          <ArrowUpRight
                            size={13}
                            className="text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#7C3AED]"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}

        {/* =======================================================
            BOTTOM CTA
        ======================================================== */}

        {!loading &&
          !error &&
          featuredWorks.length > 0 && (
            <div className="mt-14 border-t border-black/10 pt-8 sm:mt-16">
              <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                    Explore More
                  </p>

                  <h3 className="mt-3 max-w-3xl text-3xl font-black leading-[0.94] tracking-[-0.05em] text-black sm:text-4xl">
                    There&apos;s more
                    <span className="text-neutral-300">
                      {' '}
                      behind the work.
                    </span>
                  </h3>

                  <p className="mt-4 max-w-xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                    Lihat lebih banyak project,
                    eksperimen, dan karya yang pernah
                    kami kerjakan.
                  </p>
                </div>

                <Link
                  to="/portfolio"
                  className="group inline-flex w-fit items-center gap-3 rounded-full bg-black px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED]"
                >
                  Explore Portfolio

                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          )}

        {/* =======================================================
            SIGNATURE
        ======================================================== */}

        <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
            39PRODUCTION
          </span>

          <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
            Selected Works / 2026
          </span>

          <MoveUpRight
            size={13}
            className="text-neutral-400"
          />
        </div>
      </div>
    </section>
  )
}
