import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  Disc3,
  Layers3,
  Music2,
  Sparkles,
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
      className="relative isolate overflow-hidden border-t border-black/10 bg-white py-20 sm:py-24 lg:py-28"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[22%] -z-10 h-2 w-2 rounded-full bg-[#7C3AED]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[9%] bottom-[20%] -z-10 h-1.5 w-1.5 rounded-full bg-black/20"
      />

      {/* =========================================================
          MAIN
      ========================================================== */}

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative overflow-hidden border border-neutral-200 bg-neutral-50">
          {/* =====================================================
              LARGE 39 WATERMARK
          ====================================================== */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-20px] top-1/2 hidden -translate-y-1/2 select-none text-[18rem] font-black leading-none tracking-[-0.14em] text-black/[0.025] lg:block xl:text-[22rem]"
          >
            39
          </div>

          {/* =====================================================
              TOP BRAND LINE
          ====================================================== */}

          <div className="relative z-10 flex flex-col gap-4 border-b border-black/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black tracking-[-0.04em] text-black">
                39Production
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Digital Production House
              </span>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Start something worth making
            </span>
          </div>

          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div className="relative z-10 px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
              {/* LEFT */}

              <div>
                <div className="ctaFade flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                    <Sparkles
                      className="h-3.5 w-3.5"
                      strokeWidth={1.8}
                    />
                  </span>

                  <span className="h-px w-8 bg-[#7C3AED]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400">
                    Let&apos;s build something
                  </span>
                </div>

                <h2
                  id="cta-title"
                  className="ctaFade ctaFadeTwo mt-7 max-w-4xl text-5xl font-black leading-[0.88] tracking-[-0.075em] text-black sm:text-6xl lg:text-7xl xl:text-[6.8rem]"
                >
                  Bring your
                  <br />
                  <span className="relative inline-block">
                    idea
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-[-4%] h-[0.09em] bg-[#7C3AED]"
                    />
                  </span>{' '}
                  <span className="text-neutral-300">
                    to life.
                  </span>
                </h2>

                <p className="ctaFade ctaFadeThree mt-7 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base sm:leading-8">
                  Punya project, produk, atau cerita yang
                  ingin diwujudkan? 39Production membantu
                  mengubahnya menjadi digital experience,
                  creative work, atau entertainment project
                  yang siap dibuat.
                </p>

                <div className="ctaFade ctaFadeFour mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/contact"
                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-black px-7 py-3.5 text-xs font-bold text-white transition-all duration-300 hover:bg-[#7C3AED]"
                  >
                    Start a Project

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/services"
                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-black bg-white px-7 py-3.5 text-xs font-bold text-black transition-all duration-300 hover:bg-black hover:text-white"
                  >
                    Explore Services

                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* RIGHT */}

              <div className="ctaFade ctaFadeFive lg:pb-1">
                <div className="border-t border-black/10">
                  <div className="py-5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      What we build
                    </p>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
                      Satu production house untuk berbagai
                      kebutuhan digital, creative, dan
                      entertainment.
                    </p>
                  </div>

                  <div className="border-t border-black/10">
                    {pillars.map((item, index) => {
                      const Icon = item.icon

                      return (
                        <div
                          key={item.label}
                          className="group flex items-center justify-between border-b border-black/10 py-4 transition-colors duration-300 hover:bg-white"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black tracking-[0.16em] text-[#7C3AED]">
                              {String(
                                index + 1,
                              ).padStart(2, '0')}
                            </span>

                            <Icon
                              aria-hidden="true"
                              className="h-4 w-4 text-neutral-400 transition-colors duration-300 group-hover:text-[#7C3AED]"
                              strokeWidth={1.7}
                            />

                            <span className="text-sm font-semibold text-black">
                              {item.label}
                            </span>
                          </div>

                          <ArrowRight
                            aria-hidden="true"
                            className="h-4 w-4 text-neutral-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#7C3AED]"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================
                BOTTOM STATEMENT
            ==================================================== */}

            <div className="ctaFade ctaFadeSix mt-12 flex flex-col gap-5 border-t border-black/10 pt-7 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                  <span className="text-sm font-black tracking-[-0.08em]">
                    39
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-black">
                    39Production
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-400">
                    Creative Production House
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                <Disc3 className="h-3.5 w-3.5 text-[#7C3AED]" />

                <span>Creating Digital Works.</span>

                <span className="text-neutral-300">
                  •
                </span>

                <span>Producing Stories.</span>

                <span className="text-neutral-300">
                  •
                </span>

                <span>Sharing Gratitude.</span>
              </div>
            </div>
          </div>

          {/* =====================================================
              ACCENT EDGE
          ====================================================== */}

          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-1 w-24 bg-[#7C3AED]"
          />
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
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
          animation-delay: 0.24s;
        }

        .ctaFadeFive {
          animation-delay: 0.32s;
        }

        .ctaFadeSix {
          animation-delay: 0.4s;
        }

        @keyframes ctaFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ctaFade {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}
