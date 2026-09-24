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
    <section className="relative isolate overflow-hidden bg-white text-black">
      {/* =========================================================
          HERO
      ========================================================= */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="relative flex min-h-[calc(100svh-72px)] flex-col py-7 sm:min-h-[calc(100svh-80px)] sm:py-10 md:py-12 lg:min-h-[calc(100vh-80px)] lg:py-14 xl:py-16">

          {/* -----------------------------------------------------
              TOP BRAND LINE
          ----------------------------------------------------- */}
          <div className="hero-item relative z-30 flex items-center justify-between gap-4 border-b border-black/10 pb-4 sm:pb-5">
            <div className="min-w-0 flex items-center gap-2.5 sm:gap-3">
              <span className="shrink-0 text-base font-black tracking-[-0.06em] text-black sm:text-lg">
                39Production
              </span>

              <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600 sm:block sm:h-2 sm:w-2" />

              <span className="hidden truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400 sm:block sm:text-[10px] sm:tracking-[0.2em]">
                Digital Production House
              </span>
            </div>

            <span className="shrink-0 text-right text-[8px] font-bold uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px] sm:tracking-[0.2em]">
              Indonesia / 2026
            </span>
          </div>

          {/* -----------------------------------------------------
              MAIN HERO COMPOSITION
          ----------------------------------------------------- */}
          <div className="relative mt-7 flex-1 sm:mt-9 lg:mt-8 xl:mt-4">

            {/* Decorative accent */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[68%]
                top-[12px]
                z-0
                h-8
                w-8
                rounded-full
                bg-gradient-to-br
                from-fuchsia-500
                to-violet-600
                opacity-80
                blur-[0.5px]
                sm:left-[58%]
                sm:top-[4px]
                sm:h-12
                sm:w-12
                lg:left-[42%]
                lg:top-[-34px]
                lg:h-20
                lg:w-20
                xl:h-24
                xl:w-24
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
                gap-6
                lg:grid-cols-[0.86fr_1.14fr]
                lg:gap-8
                xl:grid-cols-[0.8fr_1.2fr]
                xl:gap-10
              "
            >

              {/* -------------------------------------------------
                  LEFT — HEADLINE
              ------------------------------------------------- */}
              <div className="relative z-20 order-2 lg:order-none">

                {/* Creative × Technology × Entertainment */}
                <p className="hero-item mb-4 text-[8px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:mb-5 sm:text-[10px] sm:tracking-[0.28em] md:text-xs">
                  Creative × Technology × Entertainment
                </p>

                {/* Headline */}
                <h1
                  className="
                    hero-item
                    max-w-[760px]
                    text-[2.95rem]
                    font-black
                    leading-[0.9]
                    tracking-[-0.075em]
                    text-black
                    sm:text-6xl
                    md:text-7xl
                    lg:text-[5.6rem]
                    xl:text-[7.1rem]
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
                        bottom-0
                        left-0
                        right-[-3%]
                        z-0
                        h-[0.11em]
                        bg-gradient-to-r
                        from-fuchsia-500
                        via-violet-500
                        to-violet-600
                        sm:-bottom-1
                        sm:h-[0.12em]
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

                {/* -------------------------------------------------
                    MOBILE VIDEO / LOGO
                    Hanya dipindahkan ke sini pada mobile.
                    Desktop tetap menggunakan video di sebelah kanan.
                ------------------------------------------------- */}
                {/* -------------------------------------------------
    MOBILE VIDEO / LOGO
    Full-bleed + centered
------------------------------------------------- */}
                <div
                  className="
    hero-video
    relative
    left-1/2
    -ml-[50vw]
    flex
    w-screen
    items-center
    justify-center
    py-3
    sm:py-4
    lg:hidden
  "
                >
                  <div
                    className="
      relative
      flex
      w-full
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
        w-screen
        max-w-none
        object-contain
      "
                      style={{
                        filter:
                          'brightness(1.03) contrast(6.54) saturate(1.88)',
                      }}
                    />

                    {/* Very subtle white integration */}
                    <div
                      aria-hidden="true"
                      className="
        pointer-events-none
        absolute
        inset-0
        bg-gradient-to-r
        from-white/10
        via-transparent
        to-white/5
      "
                    />

                    {/* Showreel */}
                    <div
                      className="
        absolute
        bottom-3
        left-1/2
        flex
        -translate-x-1/2
        items-center
        gap-2
        sm:bottom-4
      "
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-lg sm:h-10 sm:w-10">
                        <Play size={11} fill="currentColor" />
                      </span>

                      <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-black sm:text-[9px] sm:tracking-[0.2em]">
                        Showreel
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="hero-item mt-6 max-w-[440px] sm:mt-8 md:mt-9">
                  <p className="max-w-[38rem] text-[13px] leading-6 text-neutral-600 sm:text-sm sm:leading-7 md:text-base md:leading-8">
                    From digital products and creative visuals
                    to entertainment projects — we build ideas
                    into something people can see, use, and
                    remember.
                  </p>
                </div>

                {/* CTA */}
                <div className="hero-item mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <Link
                    to="/contact"
                    className="
                      group
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-full
                      bg-black
                      px-5
                      py-3.5
                      text-[11px]
                      font-bold
                      text-white
                      transition-all
                      duration-300
                      hover:bg-violet-600
                      sm:w-auto
                      sm:px-6
                      sm:py-3.5
                      sm:text-xs
                    "
                  >
                    Start a Project

                    <ArrowUpRight
                      size={14}
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
                      w-full
                      items-center
                      justify-center
                      gap-3
                      rounded-full
                      border
                      border-black
                      px-5
                      py-3.5
                      text-[11px]
                      font-bold
                      text-black
                      transition-all
                      duration-300
                      hover:bg-black
                      hover:text-white
                      sm:w-auto
                      sm:px-6
                      sm:py-3.5
                      sm:text-xs
                    "
                  >
                    Explore Services

                    <ArrowUpRight
                      size={14}
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
                  Desktop only
              ------------------------------------------------- */}
              <div
                className="
                  hero-video
                  relative
                  order-1
                  hidden
                  min-h-0
                  items-center
                  justify-center
                  pt-1
                  pb-1
                  lg:order-none
                  lg:flex
                  lg:min-h-[500px]
                  lg:pt-0
                  xl:min-h-[590px]
                "
              >
                <div
                  className="
                    relative
                    z-10
                    flex
                    w-full
                    items-center
                    justify-center
                  "
                >
                  <video
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

                  {/* Very subtle white integration */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-white/10
                      via-transparent
                      to-white/5
                    "
                  />

                  {/* Showreel */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-lg sm:h-10 sm:w-10">
                      <Play size={11} fill="currentColor" />
                    </span>

                    <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-black sm:text-[9px] sm:tracking-[0.2em]">
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
                mt-9
                border-t
                border-black/10
                pt-5
                sm:mt-10
                sm:pt-6
                lg:mt-12
                xl:mt-16
              "
            >
              <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">

                {/* Digital */}
                <Link
                  to="/services"
                  className="
                    group
                    flex
                    min-h-[58px]
                    items-center
                    gap-4
                    border-b
                    border-black/10
                    py-3
                    sm:min-h-0
                    sm:border-b-0
                    sm:border-r
                    sm:py-0
                    sm:pr-7
                    md:pr-8
                  "
                >
                  <span className="w-5 shrink-0 text-[9px] font-bold text-violet-600">
                    01
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold tracking-[-0.02em] text-black">
                        Digital
                      </p>

                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
                      />
                    </div>

                    <p className="mt-0.5 text-[10px] text-neutral-400">
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
                    min-h-[58px]
                    items-center
                    gap-4
                    border-b
                    border-black/10
                    py-3
                    sm:min-h-0
                    sm:border-b-0
                    sm:border-r
                    sm:px-7
                    sm:py-0
                    md:px-8
                  "
                >
                  <span className="w-5 shrink-0 text-[9px] font-bold text-violet-600">
                    02
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold tracking-[-0.02em] text-black">
                        Creative
                      </p>

                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
                      />
                    </div>

                    <p className="mt-0.5 text-[10px] text-neutral-400">
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
                    min-h-[58px]
                    items-center
                    gap-4
                    py-3
                    sm:min-h-0
                    sm:py-0
                    sm:pl-7
                    md:pl-8
                  "
                >
                  <span className="w-5 shrink-0 text-[9px] font-bold text-violet-600">
                    03
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold tracking-[-0.02em] text-black">
                        Entertainment
                      </p>

                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-neutral-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600"
                      />
                    </div>

                    <p className="mt-0.5 text-[10px] text-neutral-400">
                      Music · Idol · Production
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Bottom statement */}
            <div className="hero-item mt-6 hidden items-center justify-between lg:flex">
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

        {/* Violet accent */}
        <div
          className="
            absolute
            left-[70%]
            top-[18%]
            h-2
            w-2
            rounded-full
            bg-violet-600
            sm:left-[34%]
            sm:top-[16%]
            sm:h-3
            sm:w-3
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

        @keyframes heroVideoRevealMobile {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
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
            140ms
            cubic-bezier(0.22, 1, 0.36, 0.18)
            forwards;
        }

        .hero-item:nth-child(1) {
          animation-delay: 80ms;
        }

        .hero-item:nth-child(2) {
          animation-delay: 160ms;
        }

        @media (max-width: 1023px) {
          .hero-video {
            animation-name: heroVideoRevealMobile;
          }
        }

        @media (max-width: 639px) {
          .hero-item {
            animation-duration: 0.7s;
          }

          .hero-video {
            animation-duration: 0.8s;
          }
        }

        @media (max-width: 420px) {
          .hero-video {
            margin-top: 1px;
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