import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  Palette,
  Play,
  Sparkles,
} from 'lucide-react'

import heroBackground from '../../assets/hero-background.mp4'

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    video.playbackRate = 0.7

    const startVideo = async () => {
      try {
        await video.play()
      } catch {
        // Browser may block autoplay.
      }
    }

    startVideo()
  }, [])

  return (
    <section
      className="
        relative
        isolate
        min-h-[calc(100vh-80px)]
        overflow-hidden
        bg-white
      "
    >
      {/* =========================================================
          HERO VIDEO
          
          The video is part of the Hero canvas.
          Darken blend removes the visible white/milky panel
          against the white page while preserving darker
          logo + purple/pink visual elements.
      ========================================================= */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          hidden
          overflow-visible
          lg:block
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
            absolute
            right-[-5%]
            top-1/2
            block
            h-auto
            w-[74%]
            max-w-none
            -translate-y-1/2
            object-contain
            mix-blend-darken
          "
          style={{
            filter: 'brightness(1.06) contrast(1) saturate(1)',
          }}
        />
      </div>

      {/* =========================================================
          MOBILE VIDEO
      ========================================================= */}
      <div
        className="
          pointer-events-none
          absolute
          left-0
          right-0
          top-[18%]
          z-0
          overflow-visible
          lg:hidden
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
            mx-auto
            block
            h-auto
            w-[96%]
            max-w-[760px]
            object-contain
            mix-blend-darken
          "
          style={{
            filter: 'brightness(1.06) contrast(1) saturate(1)',
          }}
        />
      </div>

      {/* =========================================================
          SOFT BACKGROUND DETAILS
      ========================================================= */}
      <div
        className="
          pointer-events-none
          absolute
          left-[-12%]
          top-[15%]
          z-[-1]
          h-[28rem]
          w-[28rem]
          rounded-full
          bg-violet-100/25
          blur-[110px]
          heroOrbOne
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-12%]
          bottom-[-10%]
          z-[-1]
          h-[32rem]
          w-[32rem]
          rounded-full
          bg-pink-100/20
          blur-[120px]
          heroOrbTwo
        "
      />

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[calc(100vh-80px)]
          max-w-7xl
          items-center
          px-6
          py-24
          sm:px-8
          lg:px-12
          lg:py-20
        "
      >
        <div className="w-full">
          <div
            className="
              max-w-3xl
              lg:max-w-[58%]
              xl:max-w-[60%]
            "
          >
            {/* ===================================================
                BRAND
            =================================================== */}
            <div
              className="
                heroReveal
                mb-8
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
              "
            >
              <span
                className="
                  text-sm
                  font-black
                  tracking-[0.24em]
                  text-neutral-950
                  sm:text-base
                "
              >
                39PRODUCTION
              </span>

              <span className="h-1 w-1 rounded-full bg-violet-500" />

              <span
                className="
                  text-xs
                  font-medium
                  tracking-[0.16em]
                  text-neutral-500
                  sm:text-sm
                "
              >
                サンキュープロダクション
              </span>
            </div>

            {/* ===================================================
                CATEGORY
            =================================================== */}
            <div
              className="
                heroReveal
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-neutral-200/80
                bg-white
                px-3.5
                py-2
                text-xs
                font-semibold
                text-neutral-700
                sm:text-sm
              "
            >
              <Sparkles
                size={15}
                className="text-violet-600"
              />

              <span>
                Creative Technology Studio
              </span>
            </div>

            {/* ===================================================
                MAIN HEADING
            =================================================== */}
            <h1
              className="
                heroReveal
                max-w-4xl
                text-[2.8rem]
                font-black
                leading-[0.97]
                tracking-[-0.055em]
                text-neutral-950
                sm:text-5xl
                md:text-6xl
                lg:text-[4.8rem]
                xl:text-[5.35rem]
              "
            >
              We turn ideas into{' '}
              <span
                className="
                  bg-gradient-to-r
                  from-violet-600
                  via-fuchsia-600
                  to-pink-500
                  bg-clip-text
                  text-transparent
                "
              >
                meaningful
              </span>{' '}
              digital work.
            </h1>

            {/* ===================================================
                DESCRIPTION
            =================================================== */}
            <p
              className="
                heroReveal
                mt-7
                max-w-2xl
                text-base
                leading-7
                text-neutral-600
                sm:text-lg
                sm:leading-8
              "
            >
              39Production combines technology, design, and
              creative production to build digital experiences,
              visual content, products, and entertainment projects
              that are made to matter.
            </p>

            {/* ===================================================
                CAPABILITIES
            =================================================== */}
            <div
              className="
                heroReveal
                mt-8
                flex
                flex-wrap
                items-center
                gap-x-6
                gap-y-3
                text-sm
                font-medium
                text-neutral-700
                sm:gap-x-8
              "
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-violet-50
                    text-violet-600
                  "
                >
                  <Code2 size={15} />
                </span>

                <span>
                  Technology
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-pink-50
                    text-pink-600
                  "
                >
                  <Palette size={15} />
                </span>

                <span>
                  Design
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-fuchsia-50
                    text-fuchsia-600
                  "
                >
                  <Play size={15} />
                </span>

                <span>
                  Creative Production
                </span>
              </div>
            </div>

            {/* ===================================================
                CTA
            =================================================== */}
            <div
              className="
                heroReveal
                mt-10
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <Link
                to="/contact"
                className="
                  group
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-neutral-950
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_15px_35px_rgba(0,0,0,0.14)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-violet-600
                  hover:shadow-[0_18px_40px_rgba(124,58,237,0.22)]
                "
              >
                Start a Project

                <ArrowRight
                  size={17}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>

              <Link
                to="/services"
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-neutral-200
                  bg-white
                  px-6
                  text-sm
                  font-semibold
                  text-neutral-800
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-violet-200
                  hover:bg-violet-50
                  hover:text-violet-700
                "
              >
                Explore Services
              </Link>
            </div>

            {/* ===================================================
                BRAND NOTE
            =================================================== */}
            <div
              className="
                heroReveal
                mt-10
                flex
                items-center
                gap-3
                text-xs
                text-neutral-500
                sm:text-sm
              "
            >
              <span
                className="
                  h-px
                  w-8
                  bg-gradient-to-r
                  from-violet-500
                  to-pink-500
                "
              />

              <span>
                SanKyuu Production — creating with purpose.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          CREATIVE IN MOTION
      ========================================================= */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-8
          right-8
          z-10
          hidden
          items-center
          gap-3
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-neutral-400
          lg:flex
        "
      >
        <span>
          Creative in motion
        </span>

        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-violet-500
            heroPulse
          "
        />
      </div>

      {/* =========================================================
          SCROLL INDICATOR
      ========================================================= */}
      <div
        className="
          absolute
          bottom-7
          left-1/2
          z-10
          hidden
          -translate-x-1/2
          items-center
          gap-3
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-neutral-400
          md:flex
        "
      >
        <span>
          Scroll to explore
        </span>

        <span
          className="
            h-1
            w-1
            rounded-full
            bg-violet-500
            heroScrollDot
          "
        />
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================= */}
      <style>{`
        @keyframes heroOrbFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(14px, -10px, 0) scale(1.04);
          }
        }

        @keyframes heroOrbFloatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-16px, 10px, 0) scale(1.05);
          }
        }

        @keyframes heroReveal {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroPulse {
          0%,
          100% {
            opacity: 0.35;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.4);
          }
        }

        @keyframes heroScroll {
          0%,
          100% {
            opacity: 0.35;
            transform: translateX(0);
          }

          50% {
            opacity: 1;
            transform: translateX(5px);
          }
        }

        .heroOrbOne {
          animation:
            heroOrbFloat
            8s
            ease-in-out
            infinite;
        }

        .heroOrbTwo {
          animation:
            heroOrbFloatTwo
            9s
            ease-in-out
            infinite;
        }

        .heroReveal {
          opacity: 0;
          animation:
            heroReveal
            0.7s
            ease-out
            forwards;
        }

        .heroReveal:nth-child(1) {
          animation-delay: 0.05s;
        }

        .heroReveal:nth-child(2) {
          animation-delay: 0.12s;
        }

        .heroReveal:nth-child(3) {
          animation-delay: 0.18s;
        }

        .heroReveal:nth-child(4) {
          animation-delay: 0.24s;
        }

        .heroReveal:nth-child(5) {
          animation-delay: 0.30s;
        }

        .heroReveal:nth-child(6) {
          animation-delay: 0.36s;
        }

        .heroPulse {
          animation:
            heroPulse
            2.8s
            ease-in-out
            infinite;
        }

        .heroScrollDot {
          animation:
            heroScroll
            1.8s
            ease-in-out
            infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .heroOrbOne,
          .heroOrbTwo,
          .heroReveal,
          .heroPulse,
          .heroScrollDot {
            animation: none !important;
          }

          .heroReveal {
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  )
}