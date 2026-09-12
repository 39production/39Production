
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
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden border-t border-border-default bg-bg-base py-24 lg:py-32"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Gradient atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.14),transparent_42%)]" />

        <div className="absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-brand-primary/10 blur-[130px] animate-[cta-float_9s_ease-in-out_infinite]" />

        <div
          className="absolute -right-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[130px] animate-[cta-float_10s_ease-in-out_infinite_reverse]"
        />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/10 blur-[100px] animate-pulse" />

        {/* Floating particles */}
        <div className="absolute left-[15%] top-[30%] h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_20px_rgba(139,92,246,0.9)] animate-[cta-particle_5s_ease-in-out_infinite]" />

        <div
          className="absolute left-[25%] bottom-[25%] h-1 w-1 rounded-full bg-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.9)] animate-[cta-particle_7s_ease-in-out_infinite]"
          style={{ animationDelay: '1s' }}
        />

        <div
          className="absolute right-[18%] top-[25%] h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_20px_rgba(192,132,252,0.9)] animate-[cta-particle_6s_ease-in-out_infinite]"
          style={{ animationDelay: '2s' }}
        />

        <div
          className="absolute right-[25%] bottom-[30%] h-1 w-1 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)] animate-[cta-particle_8s_ease-in-out_infinite]"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* =========================================================
          MAIN
      ========================================================== */}
      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">

        {/* Main glass container */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.025] px-6 py-16 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:px-10 lg:px-16 lg:py-20">

          {/* =====================================================
              DECORATIVE LOGO / 39
          ====================================================== */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 lg:block"
          >
            {/* Outer orbit */}
            <div className="absolute inset-0 rounded-full border border-brand-primary/10 animate-[cta-spin_30s_linear_infinite]" />

            {/* Inner orbit */}
            <div className="absolute inset-[55px] rounded-full border border-brand-accent/10 animate-[cta-spin-reverse_22s_linear_infinite]" />

            {/* Orbit dots */}
            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-primary shadow-[0_0_20px_rgba(139,92,246,0.9)]" />

            <div className="absolute bottom-[12%] left-[5%] h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.9)]" />

            <div className="absolute right-[8%] top-[20%] h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />

            {/* Giant 39 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[16rem] font-black leading-none tracking-[-0.12em] text-white/[0.025]">
              39
            </div>
          </div>

          {/* =====================================================
              TOP LABEL
          ====================================================== */}
          <div className="relative z-10 flex justify-center">
            <div className="inline-flex animate-[cta-fade-up_0.7s_ease-out_both] items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 backdrop-blur-md">
              <Sparkles
                aria-hidden="true"
                className="h-4 w-4 text-brand-primary animate-pulse"
              />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary sm:text-sm">
                Let's Build Something
              </span>
            </div>
          </div>

          {/* =====================================================
              TITLE
          ====================================================== */}
          <div className="relative z-10 mx-auto max-w-4xl text-center">

            <h2
              id="cta-title"
              className="mt-7 animate-[cta-fade-up_0.8s_0.08s_ease-out_both] font-display text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-7xl"
            >
              Ideas Deserve to{' '}
              <span className="gradient-text">Become Real.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl animate-[cta-fade-up_0.8s_0.16s_ease-out_both] text-base leading-8 text-text-secondary sm:text-lg">
              We combine technology, design, and creative production to
              build digital experiences, products, and stories that
              people remember.
            </p>

            <p className="mt-3 animate-[cta-fade-up_0.8s_0.22s_ease-out_both] font-display text-sm italic text-text-muted">
              Imagine it. Build it. Make it matter.
            </p>
          </div>

          {/* =====================================================
              SERVICES / BUSINESS PILLARS
          ====================================================== */}
          <div className="relative z-10 mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2 animate-[cta-fade-up_0.8s_0.28s_ease-out_both]">
            {[
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
            ].map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2.5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:bg-brand-primary/5"
                >
                  <Icon
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-brand-primary transition-transform duration-300 group-hover:scale-110"
                  />

                  <span className="text-xs font-medium text-text-muted transition-colors group-hover:text-text-primary">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* =====================================================
              BUTTONS
          ====================================================== */}
          <div className="relative z-10 mt-10 flex animate-[cta-fade-up_0.8s_0.34s_ease-out_both] flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              to="/contact"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-primary/20 outline-none transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_45px_rgba(139,92,246,0.4)] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
            >
              Start a Project

              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/services"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface/70 px-8 py-3.5 text-sm font-semibold text-text-primary backdrop-blur-md outline-none transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
            >
              Explore Our Work

              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-primary"
              />
            </Link>
          </div>

          {/* =====================================================
              MINI BRAND FOOTER
          ====================================================== */}
          <div className="relative z-10 mt-14 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:gap-6">

            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                {/* Logo glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent opacity-20 blur-md" />

                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-bg-surface">
                  <span className="font-display text-lg font-black gradient-text">
                    39
                  </span>
                </div>
              </div>

              <div className="text-left">
                <p className="font-display text-sm font-bold text-text-primary">
                  39Production
                </p>

                <p className="text-[10px] text-text-muted">
                  サンキュープロダクション
                </p>
              </div>
            </div>

            <div className="hidden h-5 w-px bg-border-default sm:block" />

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Disc3
                aria-hidden="true"
                className="h-3.5 w-3.5 text-brand-accent animate-[cta-spin_8s_linear_infinite]"
              />

              <span>
                Creating Digital Works.
              </span>

              <span className="text-border-default">•</span>

              <span>
                Producing Stories.
              </span>

              <span className="text-border-default">•</span>

              <span>
                Sharing Gratitude.
              </span>
            </div>
          </div>

          {/* Decorative stars */}
          <Star
            aria-hidden="true"
            className="absolute left-[8%] top-[18%] hidden h-4 w-4 text-brand-primary/40 lg:block animate-[cta-twinkle_3s_ease-in-out_infinite]"
          />

          <Star
            aria-hidden="true"
            className="absolute right-[10%] top-[25%] hidden h-3 w-3 text-brand-accent/50 lg:block animate-[cta-twinkle_4s_ease-in-out_infinite]"
            style={{ animationDelay: '1s' }}
          />

          <Sparkles
            aria-hidden="true"
            className="absolute bottom-[18%] left-[12%] hidden h-4 w-4 text-purple-300/30 lg:block animate-[cta-twinkle_5s_ease-in-out_infinite]"
            style={{ animationDelay: '2s' }}
          />
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}
      <style>{`
        @keyframes cta-fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cta-float {
          0%,
          100% {
            transform: translateY(-50%);
          }

          50% {
            transform: translateY(calc(-50% - 20px));
          }
        }

        @keyframes cta-particle {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.25;
          }

          50% {
            transform: translateY(-20px) translateX(8px);
            opacity: 1;
          }
        }

        @keyframes cta-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes cta-spin-reverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes cta-twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
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