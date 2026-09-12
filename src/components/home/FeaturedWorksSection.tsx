import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ExternalLink,
  ImageOff,
  Loader2,
} from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'

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

const gradients = [
  'from-blue-500 to-cyan-400',
  'from-purple-500 to-pink-400',
  'from-orange-500 to-red-400',
  'from-pink-500 to-rose-400',
  'from-emerald-500 to-teal-400',
  'from-violet-500 to-indigo-400',
]

function getGradient(index: number) {
  return gradients[index % gradients.length]
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
        console.error(
          'Featured works error:',
          err,
        )

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
    <section className="relative isolate overflow-hidden bg-bg-base py-24 lg:py-36">
      {/* =========================================================
          ANIMATED BACKGROUND
      ========================================================= */}

      {/* Base gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.10),transparent_38%)]" />

      {/* Aurora 1 */}
      <div
        className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-purple-600/[0.10] blur-[140px]"
        style={{
          animation:
            'featuredAuroraOne 12s ease-in-out infinite',
        }}
      />

      {/* Aurora 2 */}
      <div
        className="pointer-events-none absolute -right-40 top-[35%] h-[550px] w-[550px] rounded-full bg-pink-500/[0.08] blur-[150px]"
        style={{
          animation:
            'featuredAuroraTwo 15s ease-in-out infinite',
        }}
      />

      {/* Aurora 3 */}
      <div
        className="pointer-events-none absolute bottom-[-150px] left-[25%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.06] blur-[140px]"
        style={{
          animation:
            'featuredAuroraThree 18s ease-in-out infinite',
        }}
      />

      {/* Moving grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage:
            'linear-gradient(to bottom, transparent, black 15%, black 80%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 15%, black 80%, transparent)',
        }}
      />

      {/* Moving light beams */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-[20%] top-[15%] h-px w-[70%] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent"
          style={{
            animation:
              'featuredBeamOne 10s linear infinite',
          }}
        />

        <div
          className="absolute -right-[30%] top-[55%] h-px w-[80%] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent"
          style={{
            animation:
              'featuredBeamTwo 14s linear infinite',
          }}
        />

        <div
          className="absolute left-[15%] top-[-20%] h-[140%] w-px bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"
          style={{
            animation:
              'featuredBeamVertical 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="absolute left-[12%] top-[18%] h-1 w-1 rounded-full bg-purple-400/50"
          style={{
            animation:
              'featuredParticleOne 7s ease-in-out infinite',
          }}
        />

        <span
          className="absolute left-[78%] top-[22%] h-1.5 w-1.5 rounded-full bg-pink-400/40"
          style={{
            animation:
              'featuredParticleTwo 9s ease-in-out infinite',
          }}
        />

        <span
          className="absolute left-[65%] top-[68%] h-1 w-1 rounded-full bg-blue-400/40"
          style={{
            animation:
              'featuredParticleThree 8s ease-in-out infinite',
          }}
        />

        <span
          className="absolute left-[25%] top-[78%] h-1.5 w-1.5 rounded-full bg-purple-300/30"
          style={{
            animation:
              'featuredParticleFour 11s ease-in-out infinite',
          }}
        />

        <span
          className="absolute left-[88%] top-[82%] h-1 w-1 rounded-full bg-pink-300/40"
          style={{
            animation:
              'featuredParticleFive 10s ease-in-out infinite',
          }}
        />
      </div>

      {/* Decorative orbit */}
      <div className="pointer-events-none absolute left-1/2 top-[18%] hidden h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/[0.025] lg:block">
        <div
          className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.7)]"
          style={{
            animation:
              'featuredOrbit 12s linear infinite',
            transformOrigin: '0 260px',
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[18%] hidden h-[700px] w-[700px] -translate-x-1/2 rounded-full border border-white/[0.018] lg:block" />

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Heading */}
        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/[0.08] blur-[100px]" />

          <SectionHeading
            eyebrow="OUR WORK"
            title="Ideas turned into"
            highlight="digital experiences."
            description="Explore selected projects across technology, design, entertainment, and creative production."
          />
        </div>

        {/* =======================================================
            LOADING
        ======================================================= */}

        {loading && (
          <div className="relative mt-16 flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
              Loading selected works...
            </div>
          </div>
        )}

        {/* =======================================================
            ERROR
        ======================================================= */}

        {!loading && error && (
          <div className="relative mt-16 flex min-h-[240px] items-center justify-center">
            <div className="max-w-md rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-5 text-center backdrop-blur-sm">
              <p className="text-sm text-zinc-400">
                Unable to load featured works.
              </p>

              <p className="mt-2 text-xs text-zinc-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            EMPTY
        ======================================================= */}

        {!loading &&
          !error &&
          featuredWorks.length === 0 && (
            <div className="relative mt-16 flex min-h-[240px] items-center justify-center">
              <div className="max-w-md rounded-2xl border border-white/[0.07] bg-white/[0.025] px-6 py-8 text-center backdrop-blur-sm">
                <ImageOff className="mx-auto h-8 w-8 text-zinc-600" />

                <p className="mt-4 text-sm text-zinc-400">
                  No featured works available yet.
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Published portfolio projects will
                  appear here.
                </p>
              </div>
            </div>
          )}

        {/* =======================================================
            WORKS GRID
        ======================================================= */}

        {!loading &&
          !error &&
          featuredWorks.length > 0 && (
            <div className="relative mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredWorks.map(
                (work, index) => {
                  const gradient =
                    getGradient(index)

                  const imageUrl =
                    getImageUrl(
                      work.image_url,
                    )

                  return (
                    <Link
                      key={work.id}
                      to="/portfolio"
                      className="group relative min-h-[390px] overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.14] hover:bg-white/[0.045] hover:shadow-2xl hover:shadow-purple-500/[0.06]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      {/* Image */}
                      <div className="absolute inset-0 overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={work.title}
                            loading="lazy"
                            className="h-full w-full object-cover opacity-40 grayscale transition-all duration-700 group-hover:scale-110 group-hover:opacity-60 group-hover:grayscale-0"
                            onError={(
                              event,
                            ) => {
                              event.currentTarget.style.display =
                                'none'
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
                            <ImageOff className="h-10 w-10 text-white/10" />
                          </div>
                        )}

                        {/* Image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/80 to-transparent" />

                        {/* Top overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30" />

                        {/* Gradient glow */}
                        <div
                          className={`pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-[90px] transition-all duration-700 group-hover:scale-125 group-hover:opacity-[0.20]`}
                        />

                        <div
                          className={`pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-[80px] transition-all duration-700 group-hover:opacity-[0.10]`}
                        />
                      </div>

                      {/* Moving shine */}
                      <div className="pointer-events-none absolute -inset-[100%] rotate-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent opacity-0 transition-all duration-[1200ms] group-hover:translate-x-[100%] group-hover:opacity-100" />

                      {/* Content */}
                      <div className="relative z-10 flex h-full min-h-[390px] flex-col p-6 sm:p-7">
                        {/* Top */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] tracking-[0.25em] text-white/30 transition-colors duration-300 group-hover:text-white/50">
                            {String(
                              index + 1,
                            ).padStart(2, '0')}
                          </span>

                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-black/20 backdrop-blur-md transition-all duration-300 group-hover:border-white/[0.18] group-hover:bg-white/[0.08]">
                            <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                          </div>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Bottom */}
                        <div>
                          {/* Category + year */}
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${gradient}`}
                              />

                              <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                                {work.category}
                              </span>
                            </div>

                            {work.year && (
                              <>
                                <span className="h-3 w-px bg-white/10" />

                                <span className="text-xs text-zinc-500">
                                  {work.year}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="line-clamp-2 text-2xl font-bold tracking-tight text-white sm:text-[26px]">
                            {work.title}
                          </h3>

                          {/* Client */}
                          {work.client && (
                            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                              {work.client}
                            </p>
                          )}

                          {/* Description */}
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
                            {work.description}
                          </p>

                          {/* Explore */}
                          <div className="mt-6 flex items-center gap-3">
                            <span className="text-sm font-semibold text-zinc-400 transition-colors duration-300 group-hover:text-white">
                              Explore work
                            </span>

                            <div className="relative h-px w-8 overflow-hidden bg-white/10 transition-all duration-500 group-hover:w-14">
                              <div
                                className={`absolute inset-0 -translate-x-full bg-gradient-to-r ${gradient} transition-transform duration-500 group-hover:translate-x-0`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inner border */}
                      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/[0.04]" />
                    </Link>
                  )
                },
              )}
            </div>
          )}

        {/* =======================================================
            CTA
        ======================================================= */}

        {!loading &&
          !error &&
          featuredWorks.length > 0 && (
            <div className="relative mt-16 flex flex-col items-center justify-center text-center">
              <p className="mb-5 text-xs uppercase tracking-[0.22em] text-zinc-600">
                More projects in our portfolio
              </p>

              <Link
                to="/portfolio"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-brand-primary/30 hover:bg-brand-primary/10 hover:text-white"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative">
                  Explore all projects
                </span>

                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] transition-all duration-300 group-hover:bg-brand-primary/20">
                  <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          )}
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================= */}

      <style>
        {`
          @keyframes featuredAuroraOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            33% {
              transform: translate3d(180px, 80px, 0) scale(1.15);
            }

            66% {
              transform: translate3d(80px, 220px, 0) scale(0.9);
            }
          }

          @keyframes featuredAuroraTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            35% {
              transform: translate3d(-160px, -100px, 0) scale(1.15);
            }

            70% {
              transform: translate3d(-80px, 140px, 0) scale(0.9);
            }
          }

          @keyframes featuredAuroraThree {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(180px, -120px, 0) scale(1.2);
            }
          }

          @keyframes featuredBeamOne {
            0% {
              transform: translateX(-20%);
              opacity: 0;
            }

            15% {
              opacity: 1;
            }

            85% {
              opacity: 1;
            }

            100% {
              transform: translateX(180%);
              opacity: 0;
            }
          }

          @keyframes featuredBeamTwo {
            0% {
              transform: translateX(30%);
              opacity: 0;
            }

            20% {
              opacity: 1;
            }

            80% {
              opacity: 1;
            }

            100% {
              transform: translateX(-140%);
              opacity: 0;
            }
          }

          @keyframes featuredBeamVertical {
            0%, 100% {
              transform: translateY(-10%);
              opacity: 0;
            }

            50% {
              transform: translateY(10%);
              opacity: 1;
            }
          }

          @keyframes featuredParticleOne {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              opacity: 0.2;
            }

            50% {
              transform: translate3d(80px, -100px, 0);
              opacity: 0.8;
            }
          }

          @keyframes featuredParticleTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              opacity: 0.2;
            }

            50% {
              transform: translate3d(-100px, 80px, 0);
              opacity: 0.7;
            }
          }

          @keyframes featuredParticleThree {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              opacity: 0.2;
            }

            50% {
              transform: translate3d(70px, 100px, 0);
              opacity: 0.8;
            }
          }

          @keyframes featuredParticleFour {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              opacity: 0.15;
            }

            50% {
              transform: translate3d(-80px, -80px, 0);
              opacity: 0.7;
            }
          }

          @keyframes featuredParticleFive {
            0%, 100% {
              transform: translate3d(0, 0, 0);
              opacity: 0.15;
            }

            50% {
              transform: translate3d(-60px, -100px, 0);
              opacity: 0.7;
            }
          }

          @keyframes featuredOrbit {
            from {
              transform: rotate(0deg) translateX(260px) rotate(0deg);
            }

            to {
              transform: rotate(360deg) translateX(260px) rotate(-360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </section>
  )
}