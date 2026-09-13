import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  Disc3,
  Music,
  Play,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'

import idolSilhouette from '@/assets/idol-silhouette1.png'

const menuItems = [
  {
    href: '/idol',
    title: 'Idol Groups',
    description: 'Artists & members',
    icon: Users,
    accent: 'violet',
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

function getAccentStyles(accent: string) {
  switch (accent) {
    case 'pink':
      return {
        icon: 'bg-pink-50 text-pink-600 ring-pink-100',
        arrow: 'group-hover/item:text-pink-600',
      }

    case 'cyan':
      return {
        icon: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
        arrow: 'group-hover/item:text-cyan-600',
      }

    case 'amber':
      return {
        icon: 'bg-amber-50 text-amber-600 ring-amber-100',
        arrow: 'group-hover/item:text-amber-600',
      }

    default:
      return {
        icon: 'bg-violet-50 text-violet-600 ring-violet-100',
        arrow: 'group-hover/item:text-violet-600',
      }
  }
}

export function IdolSection() {
  return (
    <section
      aria-labelledby="idol-section-title"
      className="relative isolate overflow-hidden border-y border-neutral-200 bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="idolGlow idolGlowOne absolute -left-40 top-[8%] h-[420px] w-[420px] rounded-full" />

        <div className="idolGlow idolGlowTwo absolute -right-40 top-[42%] h-[460px] w-[460px] rounded-full" />

        <div className="idolGlow idolGlowThree absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="idolGrid absolute inset-0" />
      </div>

      {/* Subtle moving accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="idolLightLine idolLightLineOne absolute left-[-20%] top-[24%] h-px w-[140%]" />

        <div className="idolLightLine idolLightLineTwo absolute left-[-20%] top-[78%] h-px w-[140%]" />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* =======================================================
            HEADER
        ======================================================== */}

        <header className="mx-auto max-w-3xl text-center">
          <div className="idolEyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2">
            <Sparkles className="h-3.5 w-3.5 text-pink-600" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-700 sm:text-[11px]">
              ENTERTAINMENT DIVISION
            </span>
          </div>

          <h2
            id="idol-section-title"
            className="text-3xl font-semibold leading-[1.08] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl"
          >
            More than music.
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              We create stories.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
            39Production mengembangkan original idol project melalui musik,
            visual storytelling, performance, dan pengalaman yang membangun
            hubungan dengan fans.
          </p>
        </header>

        {/* =======================================================
            MAIN FEATURE
        ======================================================== */}

        <div className="mt-12 overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.06)] sm:mt-14">
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            {/* ===================================================
                VISUAL
            ==================================================== */}

            <div className="idolVisual group relative min-h-[500px] overflow-hidden bg-neutral-100 sm:min-h-[580px] lg:min-h-[650px]">
              {/* Image */}
              <img
                src={idolSilhouette}
                alt="39Production original idol project"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />

              {/* Light image treatment */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-violet-950/10 via-transparent to-pink-950/10"
              />

              {/* Subtle color accents */}
              <div
                aria-hidden="true"
                className="absolute -left-20 top-1/4 h-56 w-56 rounded-full bg-violet-500/10 blur-[90px]"
              />

              <div
                aria-hidden="true"
                className="absolute -right-20 top-1/3 h-56 w-56 rounded-full bg-pink-500/10 blur-[90px]"
              />

              {/* Floating particles */}
              <div
                aria-hidden="true"
                className="idolParticle idolParticleOne absolute left-[14%] top-[22%] h-2 w-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)]"
              />

              <div
                aria-hidden="true"
                className="idolParticle idolParticleTwo absolute left-[28%] top-[38%] h-1.5 w-1.5 rounded-full bg-pink-300 shadow-[0_0_16px_rgba(244,114,182,0.7)]"
              />

              <div
                aria-hidden="true"
                className="idolParticle idolParticleThree absolute right-[20%] top-[26%] h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(196,181,253,0.7)]"
              />

              <div
                aria-hidden="true"
                className="idolParticle idolParticleFour absolute bottom-[30%] right-[15%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]"
              />

              {/* Decorative circles */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/30"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border border-white/20"
              />

              {/* Top information */}
              <div className="absolute left-5 right-5 top-5 flex items-start justify-between sm:left-8 sm:right-8 sm:top-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-white/85 text-neutral-800 shadow-sm backdrop-blur-md transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100">
                  <Users className="h-6 w-6" />
                </div>

                <span className="rounded-full border border-white/50 bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-700 shadow-sm backdrop-blur-md">
                  Coming Soon
                </span>
              </div>

              {/* Main visual content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                <div className="max-w-2xl">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px w-9 bg-pink-400" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 sm:text-xs">
                      39Production Idol Project
                    </p>
                  </div>

                  <h3 className="text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Something New
                    <span className="block text-white/80">
                      Is Coming.
                    </span>
                  </h3>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                    Original idol project yang sedang kami kembangkan —
                    mulai dari group, music, visual identity, hingga cerita
                    yang akan dibangun bersama audience.
                  </p>

                  <Link
                    to="/idol"
                    className="group/cta mt-6 inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    Discover the project

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Bottom label */}
              <div className="absolute bottom-6 right-6 hidden sm:block">
                <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3 py-2 backdrop-blur-md">
                  <Disc3 className="h-4 w-4 text-white/75" />

                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75">
                    Original Entertainment
                  </span>
                </div>
              </div>
            </div>

            {/* ===================================================
                NAVIGATION PANEL
            ==================================================== */}

            <div className="flex flex-col justify-between border-t border-neutral-200 bg-neutral-50/70 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-9">
              <div>
                <div className="flex items-center gap-2 text-violet-600">
                  <Star className="h-4 w-4 fill-current" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                    Explore the division
                  </p>
                </div>

                <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-neutral-950 sm:text-3xl">
                  Follow every part
                  <span className="block text-neutral-500">
                    of the journey.
                  </span>
                </h3>

                <p className="mt-4 text-sm leading-6 text-neutral-500">
                  Explore artists, releases, music videos, dan berbagai
                  aktivitas yang akan membentuk entertainment universe
                  39Production.
                </p>
              </div>

              {/* Navigation */}
              <nav
                aria-label="Idol division navigation"
                className="mt-8 space-y-3"
              >
                {menuItems.map((item, index) => {
                  const Icon = item.icon
                  const accent = getAccentStyles(
                    item.accent,
                  )

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="group/item relative flex min-h-16 items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      style={{
                        animationDelay: `${index * 80}ms`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover/item:scale-105 ${accent.icon}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ArrowRight
                        className={`h-4 w-4 shrink-0 text-neutral-300 transition-all duration-300 group-hover/item:translate-x-1 ${accent.arrow}`}
                      />
                    </Link>
                  )
                })}
              </nav>

              {/* Main CTA */}
              <Link
                to="/idol"
                className="group/main mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Discover Idol Production

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/main:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* =======================================================
            BOTTOM STATEMENT
        ======================================================== */}

        <div className="mt-10 flex flex-col gap-5 border-t border-neutral-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-violet-50">
                <Music className="h-3.5 w-3.5 text-violet-600" />
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-pink-50">
                <Play className="h-3.5 w-3.5 text-pink-600" />
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cyan-50">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
              </div>
            </div>

            <p className="max-w-xl text-sm leading-6 text-neutral-500">
              Original music. Original artists. Original stories. Built under
              the 39Production entertainment division.
            </p>
          </div>

          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            39 — Sankyuu Production
          </span>
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .idolGlow {
          filter: blur(90px);
          opacity: 0.4;
        }

        .idolGlowOne {
          background: rgba(139, 92, 246, 0.045);
          animation: idolGlowOne 16s ease-in-out infinite;
        }

        .idolGlowTwo {
          background: rgba(236, 72, 153, 0.035);
          animation: idolGlowTwo 19s ease-in-out infinite;
        }

        .idolGlowThree {
          background: rgba(99, 102, 241, 0.03);
          animation: idolGlowThree 18s ease-in-out infinite;
        }

        .idolGrid {
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

          animation: idolGridMove 24s linear infinite;
        }

        .idolLightLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.07),
            transparent
          );

          opacity: 0.45;
          animation: idolLineMove 11s ease-in-out infinite;
        }

        .idolLightLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.06),
            transparent
          );

          animation-delay: 4s;
        }

        .idolEyebrow {
          animation: idolEyebrowIn 0.7s ease-out both;
        }

        .idolParticle {
          animation: idolParticleFloat 5.5s ease-in-out infinite;
        }

        .idolParticleOne {
          animation-delay: 0s;
        }

        .idolParticleTwo {
          animation-delay: 1s;
        }

        .idolParticleThree {
          animation-delay: 2s;
        }

        .idolParticleFour {
          animation-delay: 1.5s;
        }

        @keyframes idolEyebrowIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes idolGridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 76px 76px;
          }
        }

        @keyframes idolGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(45px, 30px, 0);
          }
        }

        @keyframes idolGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, -30px, 0);
          }
        }

        @keyframes idolGlowThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(35px, -30px, 0);
          }
        }

        @keyframes idolLineMove {
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

        @keyframes idolParticleFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.35;
          }

          50% {
            transform: translateY(-16px) scale(1.25);
            opacity: 0.85;
          }
        }

        @media (max-width: 640px) {
          .idolGlow {
            opacity: 0.28;
          }

          .idolGrid {
            background-size: 56px 56px;
          }

          .idolLightLine {
            opacity: 0.2;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .idolGlow,
          .idolGrid,
          .idolLightLine,
          .idolEyebrow,
          .idolParticle {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}