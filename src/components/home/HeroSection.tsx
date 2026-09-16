
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Play } from 'lucide-react'

import heroBackground from '../../assets/hero-background.mp4'

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    video.playbackRate = 0.7

    const playVideo = async () => {
      try {
        await video.play()
      } catch {
        // Autoplay may be blocked by the browser.
      }
    }

    playVideo()
  }, [])

  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* =========================================================
          HERO
      ========================================================= */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="relative min-h-[calc(100vh-80px)] py-12 sm:py-14 lg:py-16">

          {/* -----------------------------------------------------
              TOP BRAND LINE
          ----------------------------------------------------- */}
          <div className="hero-item relative z-30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-black tracking-[-0.06em] text-black">
                39Production
              </span>

              <span className="hidden h-2 w-2 rounded-full bg-violet-600 sm:block" />

              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 sm:block">
                Digital Production House
              </span>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Indonesia / 2026
            </span>
          </div>

          {/* -----------------------------------------------------
              MAIN HERO COMPOSITION
          ----------------------------------------------------- */}
          <div className="relative mt-8 sm:mt-10 lg:mt-1">

            {/* Small decorative accent */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[42%]
                top-[-34px]
                z-0
                h-14
                w-14
                rounded-full
                bg-violet-600
                opacity-90
                sm:h-20
                sm:w-20
                lg:h-24
                lg:w-24
              "
            />

            {/* ===================================================
                TEXT + VIDEO
            =================================================== */}
            <div
              className="
                relative
                z-10
                grid
                items-center
                gap-8
                lg:grid-cols-[0.82fr_1.18fr]
                lg:gap-8
                xl:grid-cols-[0.78fr_1.22fr]
                xl:gap-10
              "
            >

              {/* -------------------------------------------------
                  LEFT — HEADLINE
              ------------------------------------------------- */}
              <div className="relative z-20">
                <p className="hero-item mb-5 text-[10px] font-bold uppercase tracking-[0.28em] text-neutral-500 sm:text-xs">
                  Creative × Technology × Entertainment
                </p>

                <h1
                  className="
                    hero-item
                    max-w-[720px]
                    text-[3.6rem]
                    font-black
                    leading-[0.84]
                    tracking-[-0.08em]
                    text-black
                    sm:text-6xl
                    md:text-7xl
                    lg:text-[6.1rem]
                    xl:text-[7.4rem]
                  "
                >
                  We turn
                  <br />

                  <span className="relative inline-block">
                    <span className="relative z-10">
                      ideas
                    </span>

                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        -bottom-1
                        left-0
                        right-[-5%]
                        z-0
                        h-[0.13em]
                        bg-violet-600
                        sm:-bottom-2
                      "
                    />
                  </span>

                  <span className="text-neutral-300">
                    {' '}into
                  </span>

                  <br />

                  <span className="text-neutral-300">
                    experiences.
                  </span>
                </h1>

                {/* Description */}
                <div className="hero-item mt-8 max-w-[440px] sm:mt-10">
                  <p className="text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                    From digital products and creative visuals
                    to entertainment projects — we build ideas
                    into something people can see, use, and
                    remember.
                  </p>
                </div>

                {/* CTA */}
                <div className="hero-item mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
                  <Link
                    to="/contact"
                    className="
                      group
                      inline-flex
                      items-center
                      gap-3
                      rounded-full
                      bg-black
                      px-6
                      py-3.5
                      text-xs
                      font-bold
                      text-white
                      transition-all
                      duration-300
                      hover:bg-violet-600
                    "
                  >
                    Start a Project

                    <ArrowUpRight
                      size={15}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </Link>

                  <Link
                    to="/services"
                    className="
                      group
                      inline-flex
                      items-center
                      gap-3
                      rounded-full
                      border
                      border-black
                      px-6
                      py-3.5
                      text-xs
                      font-bold
                      text-black
                      transition-all
                      duration-300
                      hover:bg-black
                      hover:text-white
                    "
                  >
                    Explore Services

                    <ArrowUpRight
                      size={15}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                      "
                    />
                  </Link>
                </div>
              </div>

              {/* -------------------------------------------------
                  RIGHT — VIDEO
              ------------------------------------------------- */}
              <div
                className="
                  hero-video
                  relative
                  flex
                  min-h-[360px]
                  items-center
                  justify-center
                  lg:min-h-[560px]
                  xl:min-h-[640px]
                "
              >
                {/* Video only — no background shadow / glow */}
                <div
                  className="
                    relative
                    z-10
                    flex
                    w-full
                    max-w-[900px]
                    items-center
                    justify-center
                  "
                >
                  <video
                    ref={videoRef}
                    src={heroBackground}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="
                      block
                      h-auto
                      max-h-[68vh]
                      w-full
                      object-contain
                    "
                    style={{
                      filter:
                        'brightness(1.03) contrast(6.54) saturate(1.88)',
                    }}
                  />

                  {/* Very subtle white integration only */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-white/15
                      via-transparent
                      to-white/5
                    "
                  />

                  {/* Showreel */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 sm:bottom-6 sm:left-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg">
                      <Play size={12} fill="currentColor" />
                    </span>

                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black">
                      Showreel
                    </span>
                  </div>
                </div>

                {/* Side text */}
                <div
                  className="
                    absolute
                    -right-1
                    top-1/2
                    hidden
                    -translate-y-1/2
                    rotate-90
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.28em]
                    text-neutral-300
                    xl:block
                  "
                >
                  Create · Produce · Deliver
                </div>
              </div>
            </div>

            {/* ===================================================
                SERVICE STRIP
            =================================================== */}
            <div
              className="
                hero-item
                relative
                z-30
                mt-12
                border-t
                border-black/10
                pt-6
                lg:mt-16
              "
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-0">

                {/* Digital */}
                <Link
                  to="/services"
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    sm:border-r
                    sm:border-black/10
                    sm:pr-8
                  "
                >
                  <span className="text-[9px] font-bold text-violet-600">
                    01
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold tracking-[-0.02em] text-black">
                        Digital
                      </p>

                      <ArrowUpRight
                        size={14}
                        className="text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-neutral-400">
                      Web · App · Game
                    </p>
                  </div>
                </Link>

                {/* Creative */}
                <Link
                  to="/services"
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    sm:border-r
                    sm:border-black/10
                    sm:px-8
                  "
                >
                  <span className="text-[9px] font-bold text-violet-600">
                    02
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold tracking-[-0.02em] text-black">
                        Creative
                      </p>

                      <ArrowUpRight
                        size={14}
                        className="text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-neutral-400">
                      Design · Animation · Visual
                    </p>
                  </div>
                </Link>

                {/* Entertainment */}
                <Link
                  to="/services"
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    sm:pl-8
                  "
                >
                  <span className="text-[9px] font-bold text-violet-600">
                    03
                  </span>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold tracking-[-0.02em] text-black">
                        Entertainment
                      </p>

                      <ArrowUpRight
                        size={14}
                        className="text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-neutral-400">
                      Music · Idol · Production
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Bottom statement */}
            <div className="hero-item mt-7 hidden items-center justify-between lg:flex">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-400">
                Creating Digital Works. Producing Stories. Sharing Gratitude.
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-300">
                39P / Creative Production House
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-1] overflow-hidden"
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #111 1px, transparent 1px),
              linear-gradient(to bottom, #111 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Small violet accent only */}
        <div
          className="
            absolute
            left-[34%]
            top-[16%]
            h-3
            w-3
            rounded-full
            bg-violet-600
          "
        />
      </div>

      {/* =========================================================
          ANIMATION
      ========================================================= */}
      <style>{`
        @keyframes heroReveal {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroVideoReveal {
          from {
            opacity: 0;
            transform: translateX(24px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .hero-item {
          opacity: 0;
          animation:
            heroReveal
            0.8s
            cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .hero-video {
          opacity: 0;
          animation:
            heroVideoReveal
            1s
            cubic-bezier(0.22, 1, 0.36, 0.18)
            forwards;
        }

        @media (max-width: 1023px) {
          .hero-video {
            animation-name: heroReveal;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-item,
          .hero-video {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  )
}