import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  Disc3,
  Layers3,
  Music2,
  Sparkles,
  Star,
  Wand2,
} from 'lucide-react'

export function CTASection() {
  const pillars = [
    {
      icon: Music2,
      label: 'Entertainment',
    },
    {
      icon: Code2,
      label: 'Creative Technology',
    },
    {
      icon: Wand2,
      label: 'Creative Services',
    },
    {
      icon: Layers3,
      label: 'Digital Products',
    },
  ]

  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden border-t border-neutral-200 bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
      >
        {/* Main soft atmosphere */}
        <div className="ctaGlow ctaGlowOne absolute -left-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full" />

        <div className="ctaGlow ctaGlowTwo absolute -right-40 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full" />

        <div className="ctaGlow ctaGlowCenter absolute left-1/2 top-[42%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full" />

        {/* Very subtle grid */}
        <div className="ctaGrid absolute inset-0" />

        {/* Moving accent lines */}
        <div className="ctaLine ctaLineOne absolute left-[-20%] top-[28%] h-px w-[140%]" />

        <div className="ctaLine ctaLineTwo absolute left-[-20%] top-[72%] h-px w-[140%]" />

        {/* Particles */}
        <span className="ctaParticle ctaParticleOne absolute left-[14%] top-[28%] h-1.5 w-1.5 rounded-full" />

        <span className="ctaParticle ctaParticleTwo absolute left-[25%] bottom-[24%] h-1 w-1 rounded-full" />

        <span className="ctaParticle ctaParticleThree absolute right-[18%] top-[25%] h-1.5 w-1.5 rounded-full" />

        <span className="ctaParticle ctaParticleFour absolute right-[25%] bottom-[28%] h-1 w-1 rounded-full" />
      </div>

      {/* =========================================================
          MAIN
      ========================================================== */}

      <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
        <div className="ctaPanel relative overflow-hidden rounded-[30px] border border-neutral-200 bg-neutral-50/80 px-6 py-14 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          {/* =====================================================
              DECORATIVE 39
          ====================================================== */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 lg:block"
          >
            <div className="ctaOrbitOuter absolute inset-0 rounded-full border border-violet-200/50" />

            <div className="ctaOrbitInner absolute inset-[58px] rounded-full border border-pink-200/40" />

            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-500" />

            <div className="absolute bottom-[12%] left-[5%] h-1.5 w-1.5 rounded-full bg-pink-500" />

            <div className="absolute right-[8%] top-[20%] h-1.5 w-1.5 rounded-full bg-cyan-500" />

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[15rem] font-black leading-none tracking-[-0.12em] text-neutral-900/[0.025]">
              39
            </div>
          </div>

          {/* Decorative stars */}
          <Star
            aria-hidden="true"
            className="ctaStar absolute left-[8%] top-[18%] hidden h-4 w-4 text-violet-400 lg:block"
          />

          <Star
            aria-hidden="true"
            className="ctaStar absolute right-[10%] top-[25%] hidden h-3 w-3 text-pink-400 lg:block"
            style={{
              animationDelay: '1s',
            }}
          />

          <Sparkles
            aria-hidden="true"
            className="ctaStar absolute bottom-[18%] left-[12%] hidden h-4 w-4 text-purple-300 lg:block"
            style={{
              animationDelay: '2s',
            }}
          />

          {/* =====================================================
              LABEL
          ====================================================== */}

          <div className="relative z-10 flex justify-center">
            <div className="ctaFade ctaFadeOne inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2">
              <Sparkles className="h-4 w-4 text-violet-600" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 sm:text-xs">
                LET&apos;S BUILD SOMETHING
              </span>
            </div>
          </div>

          {/* =====================================================
              TITLE
          ====================================================== */}

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h2
              id="cta-title"
              className="ctaFade ctaFadeTwo mt-7 text-3xl font-semibold leading-[1.05] tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl"
            >
              Ideas deserve to
              <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                become real.
              </span>
            </h2>

            <p className="ctaFade ctaFadeThree mx-auto mt-6 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7 lg:text-lg">
              Kami menggabungkan technology, design, dan creative production
              untuk membangun digital experiences, products, dan stories yang
              punya tujuan nyata.
            </p>

            <p className="ctaFade ctaFadeFour mt-4 text-sm italic text-neutral-400">
              Imagine it. Build it. Make it matter.
            </p>
          </div>

          {/* =====================================================
              BUSINESS PILLARS
          ====================================================== */}

          <div className="ctaFade ctaFadeFive relative z-10 mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {pillars.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="group inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                >
                  <Icon
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-violet-600 transition-transform duration-300 group-hover:scale-110"
                  />

                  <span className="text-xs font-medium text-neutral-600">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* =====================================================
              BUTTONS
          ====================================================== */}

          <div className="ctaFade ctaFadeSix relative z-10 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/contact"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-xl hover:shadow-violet-200 sm:w-auto"
            >
              Start a Project

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/services"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:text-violet-600 hover:shadow-md sm:w-auto"
            >
              Explore Our Services

              <ArrowRight className="h-4 w-4 text-neutral-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-600" />
            </Link>
          </div>

          {/* =====================================================
              MINI BRAND FOOTER
          ====================================================== */}

          <div className="ctaFade ctaFadeSeven relative z-10 mt-12 flex flex-col items-center justify-center gap-5 border-t border-neutral-200 pt-7 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 opacity-15 blur-md" />

                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
                  <span className="font-display text-lg font-black bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                    39
                  </span>
                </div>
              </div>

              <div className="text-left">
                <p className="text-sm font-bold text-neutral-900">
                  39Production
                </p>

                <p className="text-[10px] text-neutral-400">
                  サンキュープロダクション
                </p>
              </div>
            </div>

            <div className="hidden h-5 w-px bg-neutral-200 sm:block" />

            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-neutral-400">
              <Disc3
                aria-hidden="true"
                className="h-3.5 w-3.5 text-pink-500"
              />

              <span>Creating Digital Works.</span>

              <span className="text-neutral-300">•</span>

              <span>Producing Stories.</span>

              <span className="text-neutral-300">•</span>

              <span>Sharing Gratitude.</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .ctaGlow {
          filter: blur(90px);
          opacity: 0.45;
        }

        .ctaGlowOne {
          background: rgba(139, 92, 246, 0.055);
          animation: ctaGlowOne 15s ease-in-out infinite;
        }

        .ctaGlowTwo {
          background: rgba(236, 72, 153, 0.04);
          animation: ctaGlowTwo 18s ease-in-out infinite;
        }

        .ctaGlowCenter {
          background: rgba(124, 58, 237, 0.035);
          animation: ctaGlowCenter 14s ease-in-out infinite;
        }

        .ctaGrid {
          background-image:
            linear-gradient(
              to right,
              rgba(15, 23, 42, 0.02) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0.02) 1px,
              transparent 1px
            );

          background-size: 64px 64px;

          mask-image:
            radial-gradient(
              ellipse at center,
              black 0%,
              transparent 72%
            );

          -webkit-mask-image:
            radial-gradient(
              ellipse at center,
              black 0%,
              transparent 72%
            );

          animation: ctaGridMove 22s linear infinite;
        }

        .ctaLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.08),
            transparent
          );

          opacity: 0.4;
          animation: ctaLineMove 10s ease-in-out infinite;
        }

        .ctaLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.06),
            transparent
          );

          animation-delay: 3s;
        }

        .ctaParticle {
          background: rgba(124, 58, 237, 0.3);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.12);
          animation: ctaParticleFloat 5s ease-in-out infinite;
        }

        .ctaParticleTwo,
        .ctaParticleFour {
          background: rgba(236, 72, 153, 0.25);
          box-shadow: 0 0 12px rgba(236, 72, 153, 0.1);
        }

        .ctaParticleTwo {
          animation-delay: 1s;
        }

        .ctaParticleThree {
          animation-delay: 2s;
        }

        .ctaParticleFour {
          animation-delay: 3s;
        }

        .ctaFade {
          animation: ctaFadeUp 0.75s ease-out both;
        }

        .ctaFadeTwo {
          animation-delay: 0.08s;
        }

        .ctaFadeThree {
          animation-delay: 0.16s;
        }

        .ctaFadeFour {
          animation-delay: 0.22s;
        }

        .ctaFadeFive {
          animation-delay: 0.28s;
        }

        .ctaFadeSix {
          animation-delay: 0.34s;
        }

        .ctaFadeSeven {
          animation-delay: 0.4s;
        }

        .ctaOrbitOuter {
          animation: ctaOrbitSpin 30s linear infinite;
        }

        .ctaOrbitInner {
          animation: ctaOrbitSpinReverse 22s linear infinite;
        }

        .ctaStar {
          animation: ctaTwinkle 3.5s ease-in-out infinite;
        }

        @keyframes ctaFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ctaGlowOne {
          0%,
          100% {
            transform: translate3d(0, -50%, 0) scale(1);
          }

          50% {
            transform: translate3d(45px, calc(-50% + 25px), 0) scale(1.08);
          }
        }

        @keyframes ctaGlowTwo {
          0%,
          100% {
            transform: translate3d(0, -50%, 0) scale(1);
          }

          50% {
            transform: translate3d(-45px, calc(-50% - 25px), 0) scale(1.06);
          }
        }

        @keyframes ctaGlowCenter {
          0%,
          100% {
            transform: translate3d(-50%, -50%, 0) scale(1);
          }

          50% {
            transform: translate3d(-50%, calc(-50% - 20px), 0) scale(1.08);
          }
        }

        @keyframes ctaGridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 64px 64px;
          }
        }

        @keyframes ctaLineMove {
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

        @keyframes ctaParticleFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }

          50% {
            transform: translateY(-16px) scale(1.3);
            opacity: 0.8;
          }
        }

        @keyframes ctaOrbitSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ctaOrbitSpinReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes ctaTwinkle {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.85);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @media (max-width: 640px) {
          .ctaGlow {
            opacity: 0.3;
          }

          .ctaGrid {
            background-size: 52px 52px;
          }

          .ctaLine {
            opacity: 0.2;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ctaGlow,
          .ctaGrid,
          .ctaLine,
          .ctaParticle,
          .ctaFade,
          .ctaOrbitOuter,
          .ctaOrbitInner,
          .ctaStar {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}