import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  Music,
  Play,
  Sparkles,
  Users,
  Disc3,
  Star,
} from 'lucide-react'

import idolSilhouette from '@/assets/idol-silhouette1.png'

const menuItems = [
  {
    href: '/idol',
    title: 'Idol Groups',
    description: 'Artists & members',
    icon: Users,
    accent: 'brand-primary',
  },
  {
    href: '/idol/releases',
    title: 'Music Releases',
    description: 'Songs & singles',
    icon: Music,
    accent: 'pink',
  },
  {
    href: '/idol/music-videos',
    title: 'Music Videos',
    description: 'Official visual content',
    icon: Play,
    accent: 'cyan',
  },
  {
    href: '/idol/events',
    title: 'Events & Activities',
    description: 'Performances & events',
    icon: Calendar,
    accent: 'amber',
  },
]

export function IdolSection() {
  return (
    <section
      aria-labelledby="idol-section-title"
      className="relative isolate overflow-hidden border-y border-border bg-black py-24 lg:py-32"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-[8%] top-[15%] h-[420px] w-[420px] animate-pulse rounded-full bg-purple-600/15 blur-[150px]" />

        <div
          className="absolute bottom-[10%] right-[5%] h-[420px] w-[420px] animate-pulse rounded-full bg-pink-500/10 blur-[150px]"
          style={{
            animationDelay: '1.5s',
          }}
        />

        <div className="absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 animate-[idol-orbit_12s_ease-in-out_infinite] rounded-full bg-brand-primary/10 blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '70px 70px',
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =========================================================
            HEADER
        ========================================================== */}

        <header className="max-w-4xl animate-[idol-fade-up_0.8s_ease-out_both] motion-reduce:animate-none">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent backdrop-blur"
            aria-label="Entertainment Division"
          >
            <Sparkles
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-pulse motion-reduce:animate-none"
            />

            <span>Entertainment Division</span>
          </div>

          <h2
            id="idol-section-title"
            className="mt-7 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            More Than Music.
            <br />

            <span className="gradient-text">
              We Create Stories.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            39Production&apos;s entertainment division develops
            original idol projects through music, visual storytelling,
            performances, and meaningful connections with fans.
          </p>
        </header>

        {/* =========================================================
            MAIN FEATURE
        ========================================================== */}

        <div className="mt-14 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-purple-950/20 backdrop-blur-sm">
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">

            {/* =====================================================
                VISUAL
            ====================================================== */}

            <div className="group relative min-h-[520px] overflow-hidden sm:min-h-[600px] lg:min-h-[680px]">

              {/* =================================================
                  ACTUAL IMAGE
              ================================================== */}

              <img
                src={idolSilhouette}
                alt="39Production original idol project"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />

              {/* Image overlay */}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-transparent to-pink-950/50 mix-blend-multiply"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent"
              />

              {/* =================================================
                  FLOATING PARTICLES
              ================================================== */}

              <div
                aria-hidden="true"
                className="absolute left-[12%] top-[20%] h-3 w-3 animate-[idol-float_5s_ease-in-out_infinite] rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.8)] motion-reduce:animate-none"
              />

              <div
                aria-hidden="true"
                className="absolute left-[28%] top-[35%] h-2 w-2 animate-[idol-float_6s_ease-in-out_infinite] rounded-full bg-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.9)] motion-reduce:animate-none"
                style={{
                  animationDelay: '1s',
                }}
              />

              <div
                aria-hidden="true"
                className="absolute right-[20%] top-[25%] h-2.5 w-2.5 animate-[idol-float_7s_ease-in-out_infinite] rounded-full bg-purple-300 shadow-[0_0_20px_rgba(192,132,252,0.9)] motion-reduce:animate-none"
                style={{
                  animationDelay: '2s',
                }}
              />

              <div
                aria-hidden="true"
                className="absolute bottom-[35%] right-[14%] h-2 w-2 animate-[idol-float_5.5s_ease-in-out_infinite] rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.8)] motion-reduce:animate-none"
                style={{
                  animationDelay: '1.5s',
                }}
              />

              {/* =================================================
                  DECORATIVE RINGS
              ================================================== */}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 animate-[idol-spin_24s_linear_infinite] rounded-full border border-white/10 motion-reduce:animate-none"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 animate-[idol-spin_18s_linear_infinite_reverse] rounded-full border border-white/10 motion-reduce:animate-none"
              />

              {/* =================================================
                  TOP CONTROLS
              ================================================== */}

              <div className="absolute left-6 right-6 top-6 flex items-start justify-between sm:left-10 sm:right-10 sm:top-10">

                <div
                  aria-hidden="true"
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/30 shadow-xl backdrop-blur-md transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
                >
                  <Users className="h-7 w-7 text-white/90" />
                </div>

                <span className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">
                  <span
                    aria-hidden="true"
                    className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400 motion-reduce:animate-none"
                  />

                  Coming Soon
                </span>
              </div>

              {/* =================================================
                  IMAGE CONTENT
              ================================================== */}

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12">
                <div className="max-w-2xl animate-[idol-fade-up_1s_0.2s_ease-out_both] motion-reduce:animate-none">

                  <div className="mb-4 flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="h-px w-10 bg-brand-accent"
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
                      39Production Idol Project
                    </p>
                  </div>

                  <h3 className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                    Something New
                    <br />

                    <span className="text-white/80">
                      Is Coming.
                    </span>
                  </h3>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                    Our original idol project is currently in
                    development. Follow the journey as we build
                    the group, music, visuals, and stories behind
                    the project.
                  </p>

                  <Link
                    to="/idol"
                    className="group/cta mt-7 inline-flex min-h-11 items-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black shadow-xl outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span>Discover the project</span>

                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1 motion-reduce:transition-none"
                    />
                  </Link>
                </div>
              </div>

              {/* =================================================
                  DECORATIVE BADGE
              ================================================== */}

              <div
                aria-hidden="true"
                className="absolute bottom-6 right-6 hidden sm:block"
              >
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-md">

                  <Disc3 className="h-4 w-4 animate-[idol-spin_5s_linear_infinite] text-white/50 motion-reduce:animate-none" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    Original Entertainment
                  </span>
                </div>
              </div>
            </div>

            {/* =====================================================
                NAVIGATION
            ====================================================== */}

            <div className="relative flex flex-col justify-between bg-white/[0.025] p-6 sm:p-8 lg:p-10">

              <div>
                <div className="flex items-center gap-2 text-brand-accent">

                  <Star
                    aria-hidden="true"
                    className="h-4 w-4 fill-current"
                  />

                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Explore The Division
                  </p>
                </div>

                <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
                  Follow every part
                  <br />
                  of the journey.
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/60">
                  Explore the artists, music, visuals, and activities
                  that will shape the 39Production entertainment
                  universe.
                </p>
              </div>

              {/* =================================================
                  MENU
              ================================================== */}

              <nav
                aria-label="Idol division navigation"
                className="mt-10 space-y-3"
              >
                {menuItems.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="group/item relative flex min-h-16 items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-4 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      style={{
                        animation: `idol-fade-right ${0.15 + index * 0.1}s ease-out both`,
                      }}
                    >
                      {/* Decorative shine */}

                      <div
                        aria-hidden="true"
                        className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-all duration-700 group-hover/item:left-[120%] motion-reduce:transition-none"
                      />

                      <div className="relative flex items-center gap-4">

                        <div
                          aria-hidden="true"
                          className={`rounded-xl p-3 transition-all duration-300 motion-reduce:transition-none ${item.accent === 'brand-primary'
                              ? 'bg-brand-primary/10 text-brand-primary group-hover/item:bg-brand-primary/20'
                              : item.accent === 'pink'
                                ? 'bg-pink-500/10 text-pink-400 group-hover/item:bg-pink-500/20'
                                : item.accent === 'cyan'
                                  ? 'bg-cyan-500/10 text-cyan-400 group-hover/item:bg-cyan-500/20'
                                  : 'bg-amber-500/10 text-amber-400 group-hover/item:bg-amber-500/20'
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-white/50">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ArrowRight
                        aria-hidden="true"
                        className="relative h-4 w-4 text-white/35 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:text-white motion-reduce:transition-none"
                      />
                    </Link>
                  )
                })}
              </nav>

              {/* =================================================
                  MAIN CTA
              ================================================== */}

              <Link
                to="/idol"
                className="group/main mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-xl hover:shadow-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span>Discover Idol Production</span>

                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover/main:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM STATEMENT
        ========================================================== */}

        <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div
              aria-hidden="true"
              className="flex -space-x-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black bg-purple-500/20">
                <Music className="h-3.5 w-3.5 text-purple-300" />
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black bg-pink-500/20">
                <Play className="h-3.5 w-3.5 text-pink-300" />
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black bg-cyan-500/20">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              </div>
            </div>

            <p className="max-w-xl text-sm leading-6 text-white/50">
              Original music. Original artists. Original stories.
              Built under the 39Production entertainment division.
            </p>
          </div>

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
            39 — Sankyuu
          </span>
        </div>
      </div>

      {/* ===========================================================
          ANIMATIONS
      ============================================================ */}

      <style>{`
        @keyframes idol-fade-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes idol-fade-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes idol-float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }

          50% {
            transform: translateY(-20px) translateX(8px);
            opacity: 1;
          }
        }

        @keyframes idol-orbit {
          0%,
          100% {
            transform: translate3d(0, -50%, 0) scale(1);
          }

          50% {
            transform: translate3d(180px, -45%, 0) scale(1.2);
          }
        }

        @keyframes idol-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  )
}