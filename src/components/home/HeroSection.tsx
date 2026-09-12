import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  Database,
  Disc3,
  Globe2,
  Layers3,
  Music2,
  Package,
  Palette,
  Play,
  Sparkles,
  Smartphone,
  Wand2,
  Zap,
} from 'lucide-react'

// =========================================================
// ASSET
// =========================================================
import idolSilhouette from '../../assets/idol-silhouette.png'

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate min-h-screen overflow-hidden bg-bg-base"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-base to-bg-surface" />

        {/* Purple glow */}
        <div className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-brand-primary/15 blur-[150px]" />

        {/* Pink glow */}
        <div className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-accent/15 blur-[160px]" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-secondary/10 blur-[150px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(5,5,10,0.8)_100%)]" />

        {/* Moving light */}
        <div className="absolute left-0 right-0 top-[30%] h-px bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent animate-[hero-scan_8s_ease-in-out_infinite]" />

        {/* Floating particles */}
        <div className="absolute left-[10%] top-[25%] h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_18px_rgba(139,92,246,0.9)] animate-[hero-float_5s_ease-in-out_infinite]" />

        <div
          className="absolute left-[25%] top-[70%] h-1 w-1 rounded-full bg-brand-accent shadow-[0_0_18px_rgba(236,72,153,0.9)] animate-[hero-float_7s_ease-in-out_infinite]"
          style={{ animationDelay: '1s' }}
        />

        <div
          className="absolute right-[20%] top-[18%] h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)] animate-[hero-float_6s_ease-in-out_infinite]"
          style={{ animationDelay: '2s' }}
        />

        <div
          className="absolute right-[10%] bottom-[25%] h-1 w-1 rounded-full bg-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.9)] animate-[hero-float_8s_ease-in-out_infinite]"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16">

          {/* =====================================================
              LEFT SIDE
          ====================================================== */}
          <div className="relative z-20 max-w-3xl">

            {/* =================================================
                POSITIONING BADGE
            ================================================== */}
            <div className="mb-8 inline-flex animate-[hero-fade-up_0.7s_ease-out_both] items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary sm:text-sm">
                Creative Technology Studio
              </span>
            </div>

            {/* =================================================
                MAIN BRAND
            ================================================== */}
            <h1
              id="hero-title"
              className="animate-[hero-fade-up_0.8s_0.05s_ease-out_both] font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            >
              <span className="gradient-text">39</span>
              <span className="text-text-primary">Production</span>
            </h1>

            {/* Japanese Brand Name */}
            <p className="mt-5 animate-[hero-fade-up_0.8s_0.12s_ease-out_both] font-display text-lg text-text-muted sm:text-xl md:text-2xl">
              サンキュープロダクション —{' '}
              <span className="text-text-secondary">
                Sankyuu Production
              </span>
            </p>

            {/* =================================================
                CORE VALUE PROPOSITION
            ================================================== */}
            <p className="mt-7 max-w-2xl animate-[hero-fade-up_0.8s_0.2s_ease-out_both] font-display text-2xl font-semibold leading-[1.25] tracking-tight text-text-primary sm:text-3xl md:text-4xl">
              We build{' '}
              <span className="gradient-text">
                digital experiences
              </span>{' '}
              and creative works that bring ideas to life.
            </p>

            {/* Supporting Description */}
            <p className="mt-5 max-w-2xl animate-[hero-fade-up_0.8s_0.24s_ease-out_both] text-sm leading-7 text-text-muted sm:text-base">
              From technology and design to animation, games, digital
              products, and entertainment — 39Production brings
              creative and technical production into one studio.
            </p>

            {/* =================================================
                BUSINESS IDENTITY
            ================================================== */}
            <div className="mt-7 flex animate-[hero-fade-up_0.8s_0.29s_ease-out_both] flex-wrap gap-2">
              {[
                {
                  icon: Code2,
                  text: 'Creative Technology',
                },
                {
                  icon: Palette,
                  text: 'Design & Experience',
                },
                {
                  icon: Wand2,
                  text: 'Creative Production',
                },
                {
                  icon: Layers3,
                  text: 'Digital Products',
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.text}
                    className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface/60 px-3.5 py-2 text-xs text-text-muted backdrop-blur-md transition-all duration-300 hover:border-brand-primary/30 hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-brand-primary"
                    />

                    {item.text}
                  </div>
                )
              })}
            </div>

            {/* =================================================
                CTA
            ================================================== */}
            <div className="mt-9 flex animate-[hero-fade-up_0.8s_0.36s_ease-out_both] flex-col gap-3 sm:flex-row">
              <Link
                to="/portfolio"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
              >
                Explore Our Work

                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/contact"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface/60 px-7 py-3.5 text-sm font-semibold text-text-primary backdrop-blur-md outline-none transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
              >
                <Play
                  aria-hidden="true"
                  className="h-4 w-4 text-brand-primary"
                />

                Start a Project
              </Link>
            </div>

            {/* =================================================
                MICRO TRUST STATEMENT
            ================================================== */}
            <div className="mt-8 flex animate-[hero-fade-up_0.8s_0.45s_ease-out_both] items-center gap-3">
              <div className="h-px w-8 bg-brand-primary/50" />

              <p className="text-xs leading-5 text-text-muted">
                Technology · Design · Entertainment · Digital Business
              </p>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE — REAL IDOL IMAGE
          ====================================================== */}
          <div
            aria-hidden="true"
            className="relative mx-auto hidden h-[620px] w-full max-w-[520px] lg:block"
          >

            {/* =================================================
                ORBIT
            ================================================== */}
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-primary/10 animate-[hero-orbit_30s_linear_infinite]" />

            <div className="absolute left-1/2 top-1/2 h-[410px] w-[410px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-accent/10 animate-[hero-orbit-reverse_22s_linear_infinite]" />

            {/* =================================================
                DECORATIVE TECH ORBIT
            ================================================== */}
            <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/[0.06] animate-[hero-orbit_45s_linear_infinite]" />

            {/* Glow */}
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/10 blur-[100px] animate-pulse" />

            {/* =================================================
                CONNECTING LINES
            ================================================== */}
            <div
              className="absolute left-[12%] top-[30%] h-px w-[145px] origin-left rotate-[18deg] bg-gradient-to-r from-cyan-400/30 to-transparent"
            />

            <div
              className="absolute right-[10%] top-[28%] h-px w-[125px] origin-right rotate-[-18deg] bg-gradient-to-l from-brand-accent/30 to-transparent"
            />

            <div
              className="absolute left-[8%] top-[58%] h-px w-[150px] origin-left rotate-[-12deg] bg-gradient-to-r from-brand-primary/25 to-transparent"
            />

            <div
              className="absolute right-[8%] top-[58%] h-px w-[145px] origin-right rotate-[14deg] bg-gradient-to-l from-cyan-400/25 to-transparent"
            />

            <div
              className="absolute left-[22%] bottom-[23%] h-px w-[120px] origin-left rotate-[22deg] bg-gradient-to-r from-brand-accent/25 to-transparent"
            />

            {/* =================================================
                FLOATING ICON : MUSIC
            ================================================== */}
            <div className="absolute left-[7%] top-[20%] animate-[hero-icon-float-a_5s_ease-in-out_infinite]">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-400/5 shadow-[0_0_30px_rgba(236,72,153,0.12)] backdrop-blur-xl">
                <Music2 className="h-5 w-5 text-pink-300" />

                <span className="absolute inset-0 rounded-2xl border border-pink-300/10 animate-ping" />
              </div>
            </div>

            {/* =================================================
                FLOATING ICON : WEB
            ================================================== */}
            <div className="absolute right-[7%] top-[20%] animate-[hero-icon-float-b_6s_ease-in-out_infinite]">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-xl">
                <Globe2 className="h-5 w-5 text-cyan-300" />

                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse" />
              </div>
            </div>

            {/* =================================================
                FLOATING ICON : DATABASE
            ================================================== */}
            <div className="absolute left-[2%] top-[47%] animate-[hero-icon-float-c_7s_ease-in-out_infinite]">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/5 shadow-[0_0_30px_rgba(139,92,246,0.12)] backdrop-blur-xl">
                <Database className="h-5 w-5 text-brand-primary" />

                <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-primary animate-pulse" />
              </div>
            </div>

            {/* =================================================
                FLOATING ICON : APP
            ================================================== */}
            <div className="absolute right-[1%] top-[46%] animate-[hero-icon-float-a_6.5s_ease-in-out_infinite]">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/5 shadow-[0_0_30px_rgba(139,92,246,0.14)] backdrop-blur-xl">
                <Smartphone className="h-5 w-5 text-violet-300" />

                <span className="absolute inset-[6px] rounded-lg border border-violet-300/10 animate-pulse" />
              </div>
            </div>

            {/* =================================================
                FLOATING ICON : DESIGN
            ================================================== */}
            <div className="absolute left-[8%] bottom-[27%] animate-[hero-icon-float-b_8s_ease-in-out_infinite]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent/20 bg-brand-accent/5 shadow-[0_0_25px_rgba(236,72,153,0.1)] backdrop-blur-xl">
                <Palette className="h-4.5 w-4.5 text-brand-accent" />
              </div>
            </div>

            {/* =================================================
                FLOATING ICON : DIGITAL PRODUCT
            ================================================== */}
            <div className="absolute right-[8%] bottom-[29%] animate-[hero-icon-float-c_7.5s_ease-in-out_infinite]">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/5 shadow-[0_0_30px_rgba(251,191,36,0.08)] backdrop-blur-xl">
                <Package className="h-5 w-5 text-amber-200" />

                <Zap className="absolute -right-1 -top-1 h-3 w-3 text-amber-300 animate-pulse" />
              </div>
            </div>

            {/* =================================================
                FLOATING ICON : CODE
            ================================================== */}
            <div className="absolute left-[18%] top-[10%] animate-[hero-icon-float-a_9s_ease-in-out_infinite]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/10 bg-cyan-300/[0.03] backdrop-blur-md">
                <Code2 className="h-4 w-4 text-cyan-300/70" />
              </div>
            </div>

            {/* =================================================
                FLOATING ICON : CREATIVE
            ================================================== */}
            <div className="absolute right-[18%] bottom-[12%] animate-[hero-icon-float-b_8s_ease-in-out_infinite]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-300/10 bg-purple-300/[0.03] backdrop-blur-md">
                <Wand2 className="h-4 w-4 text-purple-300/70" />
              </div>
            </div>

            {/* =================================================
                MAIN IMAGE CARD
            ================================================== */}
            <div className="absolute left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] animate-[hero-card_7s_ease-in-out_infinite]">

              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-bg-surface p-2 shadow-2xl shadow-purple-950/40">

                {/* REAL IDOL IMAGE */}
                <div className="relative h-[480px] overflow-hidden rounded-[1.6rem] bg-black">

                  <img
                    src={idolSilhouette}
                    alt="39 Production Idol"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />

                  {/* Dark cinematic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                  {/* Purple atmosphere */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />

                  {/* Soft glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(168,85,247,0.18),transparent_45%)]" />

                  {/* Light beam */}
                  <div className="absolute left-1/2 top-[-20%] h-[150%] w-24 -translate-x-1/2 rotate-[18deg] bg-gradient-to-b from-white/10 via-purple-400/5 to-transparent blur-xl" />

                  {/* SPARKLES */}
                  <Sparkles
                    className="absolute left-8 top-24 h-5 w-5 text-white/60 animate-pulse"
                  />

                  <Sparkles
                    className="absolute right-10 top-32 h-4 w-4 text-pink-300/70 animate-pulse"
                    style={{ animationDelay: '1s' }}
                  />

                  <Sparkles
                    className="absolute bottom-32 left-12 h-4 w-4 text-purple-300/60 animate-pulse"
                    style={{ animationDelay: '2s' }}
                  />

                  {/* TOP BADGE */}
                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between">



                    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">

                      <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-pulse" />

                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                        Original
                      </span>

                    </div>
                  </div>

                  {/* BOTTOM CONTENT */}
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">

                    <div className="flex items-end justify-between">

                      <div>

                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
                          Entertainment Division
                        </p>

                        <p className="mt-1 font-display text-2xl font-bold text-white">
                          New Generation
                        </p>

                        <p className="mt-1 text-[10px] text-white/45">
                          Music · Visual · Performance
                        </p>

                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <Music2 className="h-4 w-4 text-white" />
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                FLOATING TECHNOLOGY CARD
            ================================================== */}
            <div className="absolute left-0 top-[15%] animate-[hero-float_6s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-bg-surface/85 p-4 shadow-xl backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Code2 className="h-5 w-5 text-brand-primary" />
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                    Technology
                  </p>

                  <p className="mt-1 text-xs font-semibold text-text-primary">
                    Digital Production
                  </p>
                </div>

              </div>
            </div>

            {/* =================================================
                FLOATING CREATIVE CARD
            ================================================== */}
            <div
              className="absolute bottom-[17%] right-0 animate-[hero-float_7s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-bg-surface/85 p-4 shadow-xl backdrop-blur-xl"
              style={{ animationDelay: '1.5s' }}
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/10">
                  <Wand2 className="h-5 w-5 text-brand-accent" />
                </div>

                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                    Creative Business
                  </p>

                  <p className="mt-1 text-xs font-semibold text-text-primary">
                    Services & Products
                  </p>
                </div>

              </div>
            </div>

            {/* =================================================
                MUSIC DISC
            ================================================== */}
            <div className="absolute right-[5%] top-[8%] flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md animate-[hero-spin_12s_linear_infinite]">
              <Disc3 className="h-7 w-7 text-brand-accent" />
            </div>

            {/* =================================================
                CODE CHIP
            ================================================== */}
            <div className="absolute bottom-[5%] left-[10%] rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 backdrop-blur-md animate-[hero-float_5s_ease-in-out_infinite]">

              <div className="flex items-center gap-2">

                <Code2 className="h-3.5 w-3.5 text-cyan-400" />

                <span className="font-mono text-[9px] text-cyan-300/70">
                  CREATE() → PRODUCE() → SHARE()
                </span>

              </div>
            </div>

            {/* =================================================
                DECORATIVE CORNER
            ================================================== */}
            <div className="absolute right-[15%] bottom-[4%] h-16 w-16 rounded-full border border-brand-primary/20 animate-[hero-spin_15s_linear_infinite]" />

          </div>
        </div>
      </div>

      {/* =========================================================
          SCROLL INDICATOR
      ========================================================== */}
      <div
        aria-hidden="true"
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">

          <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-text-muted/50">
            Explore
          </span>

          <div className="h-9 w-5 rounded-full border border-text-muted/20 p-1">

            <div className="mx-auto h-1.5 w-1.5 rounded-full bg-brand-primary animate-[hero-scroll_1.8s_ease-in-out_infinite]" />

          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}
      <style>{`

        @keyframes hero-fade-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes hero-float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }

          50% {
            transform: translateY(-16px) translateX(5px);
          }
        }

        @keyframes hero-icon-float-a {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(5px, -14px, 0) rotate(3deg);
          }
        }

        @keyframes hero-icon-float-b {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(-6px, -11px, 0) rotate(-3deg);
          }
        }

        @keyframes hero-icon-float-c {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(7px, -16px, 0);
          }
        }

        @keyframes hero-card {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-3deg);
          }

          50% {
            transform: translate(-50%, -53%) rotate(1deg);
          }
        }

        @keyframes hero-orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes hero-orbit-reverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }

          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }

        @keyframes hero-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes hero-scan {
          0%,
          100% {
            transform: translateY(-120px);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          50% {
            opacity: 0.4;
          }

          80% {
            opacity: 1;
          }

          100% {
            transform: translateY(420px);
            opacity: 0;
          }
        }

        @keyframes hero-scroll {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.3;
          }

          50% {
            transform: translateY(14px);
            opacity: 1;
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