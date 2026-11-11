import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Disc3,
  Music,
  Play,
  Sparkles,
  Users,
} from 'lucide-react'

import idolSilhouette from '@/assets/idol-silhouette1.png'

const menuItems = [
  {
    href: '/idol',
    number: '01',
    title: 'Idol Groups',
    description: 'Artists, members & group profiles',
    icon: Users,
  },
  {
    href: '/idol/releases',
    number: '02',
    title: 'Music Releases',
    description: 'Songs, singles & releases',
    icon: Music,
  },
  {
    href: '/idol/music-videos',
    number: '03',
    title: 'Music Videos',
    description: 'Official visual content',
    icon: Play,
  },
  {
    href: '/idol/events',
    number: '04',
    title: 'Events & Activities',
    description: 'Performances, events & activities',
    icon: Calendar,
  },
]

export function IdolSection() {
  const sectionRef = useRef<HTMLElement | null>(null)

  /* Reveal on scroll */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const items = section.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  /* Parallax gambar utama */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const els = Array.from(
      section.querySelectorAll<HTMLElement>('[data-parallax]'),
    )
    let ticking = false

    const update = () => {
      const vh = window.innerHeight
      els.forEach((el) => {
        const speed = Number(el.getAttribute('data-parallax')) || 0.05
        const rect = el.parentElement!.getBoundingClientRect()
        if (rect.bottom < -200 || rect.top > vh + 200) return
        const offset = (rect.top + rect.height / 2 - vh / 2) * speed
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.08)`
      })
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="idol-section-title"
      className="idl relative overflow-hidden bg-white text-zinc-950"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />

        <div className="idl-float absolute right-[8%] top-[17%] h-2 w-2 rounded-full bg-[#7C3AED]" />

        <div
          className="idl-float absolute bottom-[20%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
          style={{ animationDelay: '-2.5s' }}
        />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        {/* =================================================
            SECTION LABEL
        ================================================== */}

        <div
          data-reveal
          className="rv mb-12 border-t border-black/10 pt-4 sm:mb-14"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="idl-ping h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                39Production / Entertainment Division
              </span>
            </div>

            <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              39 / 07
            </span>
          </div>
        </div>

        {/* =================================================
            INTRO
        ================================================== */}

        <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:gap-16">
          <div
            data-reveal
            style={{ ['--d' as string]: '120ms' }}
            className="rv max-w-md"
          >
            <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
              Entertainment menjadi ruang bagi 39Production
              untuk membangun karya original melalui musik,
              visual, performance, dan storytelling.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="idl-grow h-px w-10 origin-left bg-[#7C3AED]" />

              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Music / Visual / Story
              </span>
            </div>
          </div>

          <div className="max-w-5xl">
            <p
              data-reveal
              className="rv mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]"
            >
              <Sparkles size={12} className="idl-twinkle" />
              Original Entertainment
            </p>

            <h2
              id="idol-section-title"
              data-reveal
              style={{ ['--d' as string]: '80ms' }}
              className="rv text-[clamp(2.6rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
            >
              More than music.
              <span className="text-neutral-300">
                {' '}
                We create stories.
              </span>
            </h2>

            <p
              data-reveal
              style={{ ['--d' as string]: '180ms' }}
              className="rv mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]"
            >
              39Production sedang membangun original idol
              project yang menggabungkan artist development,
              music production, visual identity, dan dunia
              cerita yang dapat berkembang bersama audience.
            </p>
          </div>
        </div>

        {/* =================================================
            MAIN FEATURE
        ================================================== */}

        <div
          data-reveal
          className="rv mt-16 grid overflow-hidden border border-black/10 bg-black sm:mt-20 lg:grid-cols-[1.4fr_0.6fr]"
        >
          {/* =================================================
              VISUAL
          ================================================== */}

          <div className="group relative min-h-[480px] overflow-hidden sm:min-h-[580px] lg:min-h-[650px]">
            <div
              data-parallax="0.05"
              className="absolute inset-0 will-change-transform"
            >
              <img
                src={idolSilhouette}
                alt="39Production original idol project"
                loading="lazy"
                decoding="async"
                className="idl-kenburns h-full w-full object-cover object-center"
              />
            </div>

            {/* Image treatment */}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"
            />

            {/* Kilau cahaya menyapu */}

            <div
              aria-hidden="true"
              className="idl-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />

            {/* Brand accent */}

            <div
              aria-hidden="true"
              className="idl-pulse absolute left-0 top-1/3 h-28 w-1 bg-[#7C3AED]"
            />

            {/* Top information */}

            <div className="absolute left-5 right-5 top-5 flex items-start justify-between sm:left-8 sm:right-8 sm:top-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-white/30 bg-black/25 text-white backdrop-blur-sm">
                  <Users
                    className="h-[17px] w-[17px]"
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">
                    39Production
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-white">
                    Idol Project
                  </p>
                </div>
              </div>

              <span className="idl-blink border border-white/25 bg-black/25 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                Coming Soon
              </span>
            </div>

            {/* Visual details */}

            <div
              aria-hidden="true"
              className="absolute right-8 top-28 hidden h-24 w-24 sm:block"
            >
              <div className="idl-ring absolute inset-0 rounded-full border border-white/15" />

              <div className="idl-orbit absolute inset-0">
                <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED] shadow-[0_0_20px_rgba(198,61,135,0.55)]" />
              </div>
            </div>

            <div
              aria-hidden="true"
              className="idl-float absolute bottom-[32%] left-[12%] h-1.5 w-1.5 rounded-full bg-white/60"
            />

            {/* Main visual copy */}

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <div className="idl-copy mb-4 flex items-center gap-3">
                  <span className="idl-grow h-px w-9 origin-left bg-[#7C3AED]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/65 sm:text-[10px]">
                    Original Entertainment Project
                  </p>
                </div>

                <h3 className="text-4xl font-black leading-[0.9] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                  <span className="block overflow-hidden">
                    <span className="idl-line block">
                      Something new.
                    </span>
                  </span>

                  <span className="block overflow-hidden text-white/35">
                    <span
                      className="idl-line block"
                      style={{ animationDelay: '0.2s' }}
                    >
                      Is coming.
                    </span>
                  </span>
                </h3>

                <p
                  className="idl-copy mt-5 max-w-xl text-sm font-medium leading-6 text-white/65 sm:text-[15px] sm:leading-7"
                  style={{ animationDelay: '0.45s' }}
                >
                  Sebuah original idol project yang sedang
                  kami kembangkan dari nol — mulai dari
                  group, music, visual identity, hingga
                  universe dan cerita yang akan dibangun
                  bersama audience.
                </p>

                <Link
                  to="/idol"
                  className="idl-copy group/cta mt-7 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-black transition-all duration-300 hover:bg-[#7C3AED] hover:text-white"
                  style={{ animationDelay: '0.6s' }}
                >
                  Discover the Project

                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover/cta:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {/* Bottom metadata */}

            <div className="absolute bottom-7 right-7 hidden items-center gap-2 sm:flex">
              <Disc3
                size={13}
                className="idl-spin text-white/45"
              />

              <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/45">
                Original Entertainment
              </span>
            </div>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================== */}

          <div className="flex flex-col justify-between border-t border-white/10 bg-black p-6 text-white sm:p-8 lg:border-l lg:border-t-0 lg:p-9">
            <div>
              <div className="flex items-center gap-3">
                <span className="idl-ping h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Explore the division
                </p>
              </div>

              <h3 className="mt-5 text-2xl font-black leading-[0.95] tracking-[-0.045em] sm:text-3xl">
                Follow every part
                <span className="block text-white/30">
                  of the journey.
                </span>
              </h3>

              <p className="mt-5 text-xs font-medium leading-6 text-white/45 sm:text-sm">
                Dari artist dan music sampai visual dan
                activities. Semua bagian dari entertainment
                project akan berkembang di sini.
              </p>
            </div>

            <nav
              aria-label="Idol division navigation"
              className="mt-10"
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="idl-nav group/item relative flex items-center justify-between border-t border-white/10 py-5 transition-colors duration-300 last:border-b"
                    style={{ animationDelay: `${0.35 + index * 0.1}s` }}
                  >
                    {/* Garis ungu menyapu saat hover */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 h-px w-0 bg-[#7C3AED] transition-all duration-500 group-hover/item:w-full"
                    />

                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-white/50 transition-all duration-300 group-hover/item:border-[#7C3AED] group-hover/item:bg-[#7C3AED] group-hover/item:text-white">
                        <Icon
                          className="h-[15px] w-[15px]"
                          strokeWidth={1.7}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[8px] font-bold tracking-[0.14em] text-[#7C3AED]">
                            {item.number}
                          </span>

                          <p className="truncate text-sm font-bold text-white transition-transform duration-300 group-hover/item:translate-x-1">
                            {item.title}
                          </p>
                        </div>

                        <p className="mt-1 text-[10px] font-medium text-white/35 transition-colors duration-300 group-hover/item:text-white/60">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      size={14}
                      className="ml-4 shrink-0 text-white/20 transition-all duration-300 group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 group-hover/item:text-[#7C3AED]"
                    />
                  </Link>
                )
              })}
            </nav>

            <Link
              to="/idol"
              className="group/main mt-7 inline-flex items-center justify-center gap-3 rounded-full bg-white px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-black transition-all duration-300 hover:bg-[#7C3AED] hover:text-white"
            >
              Discover Entertainment Production

              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover/main:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* =================================================
            BOTTOM STATEMENT
        ================================================== */}

        <div
          data-reveal
          className="rv mt-10 grid gap-6 border-t border-black/10 pt-7 sm:grid-cols-[1fr_auto] sm:items-center"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 text-[#7C3AED]">
              <Music
                className="idl-bounce h-4 w-4"
                strokeWidth={1.7}
              />
            </div>

            <div>
              <p className="text-sm font-bold tracking-[-0.02em] text-black">
                Original music. Original artists. Original
                stories.
              </p>

              <p className="mt-1.5 max-w-2xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                Entertainment bukan hanya tentang apa yang
                didengar atau dilihat, tetapi tentang dunia
                yang bisa dibangun di sekitarnya.
              </p>
            </div>
          </div>

          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            39 / Sankyuu Production
          </span>
        </div>

        {/* =================================================
            FOOTER LINE
        ================================================== */}

        <div
          data-reveal
          className="rv mt-8 flex items-center justify-between border-t border-black/10 pt-4"
        >
          <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
            ENTERTAINMENT DIVISION
          </span>

          <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
            Music / Visual / Story
          </span>

          <ArrowUpRight
            size={13}
            className="text-neutral-400"
          />
        </div>
      </div>

      {/* =========================================================
          MOTION
      ========================================================== */}

      <style>{`
        /* Reveal on scroll */
        .idl .rv {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
          transition:
            opacity .9s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .9s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
          will-change: transform, opacity;
        }
        .idl .rv.is-visible { opacity: 1; transform: none; }

        /* Elemen di dalam blok utama baru jalan setelah blok terlihat */
        .idl .idl-line,
        .idl .idl-copy,
        .idl .idl-nav { opacity: 0; }

        .idl .rv.is-visible .idl-line {
          animation: idl-line-up .95s cubic-bezier(.2,.7,.2,1) .55s both;
        }
        .idl .rv.is-visible .idl-copy {
          animation: idl-fade-up .8s cubic-bezier(.2,.7,.2,1) .5s both;
        }
        .idl .rv.is-visible .idl-nav {
          animation: idl-slide-in .8s cubic-bezier(.2,.7,.2,1) both;
        }

        @keyframes idl-line-up {
          from { transform: translateY(110%); opacity: 1; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes idl-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes idl-slide-in {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: none; }
        }

        /* Garis kecil tumbuh */
        .idl .idl-grow { transform: scaleX(0); transition: transform 1s cubic-bezier(.77,0,.18,1) .6s; }
        .idl .rv.is-visible .idl-grow { transform: scaleX(1); }

        /* Gambar bergerak pelan */
        @keyframes idl-kenburns {
          from { transform: scale(1) translateX(0); }
          to { transform: scale(1.07) translateX(-1.4%); }
        }
        .idl .idl-kenburns { animation: idl-kenburns 18s ease-in-out infinite alternate; }

        /* Kilau cahaya */
        @keyframes idl-sweep {
          0%, 55% { left: -35%; opacity: 0; }
          65% { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }
        .idl .idl-sweep { animation: idl-sweep 7s ease-in-out infinite; }

        /* Cincin & titik orbit */
        @keyframes idl-orbit { to { transform: rotate(360deg); } }
        .idl .idl-orbit { animation: idl-orbit 8s linear infinite; }

        @keyframes idl-ring {
          0%, 100% { transform: scale(1); opacity: .8; }
          50% { transform: scale(1.08); opacity: .4; }
        }
        .idl .idl-ring { animation: idl-ring 4s ease-in-out infinite; }

        /* Disc berputar */
        @keyframes idl-spin { to { transform: rotate(360deg); } }
        .idl .idl-spin { animation: idl-spin 6s linear infinite; }

        /* Titik mengambang */
        @keyframes idl-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .idl .idl-float { animation: idl-float 6s ease-in-out infinite; }

        /* Aksen ungu berdenyut */
        @keyframes idl-pulse {
          0%, 100% { transform: scaleY(1); opacity: 1; }
          50% { transform: scaleY(.55); opacity: .6; }
        }
        .idl .idl-pulse { animation: idl-pulse 3s ease-in-out infinite; }

        /* Titik label berdenyut */
        @keyframes idl-ping {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.5); }
          50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
        }
        .idl .idl-ping { animation: idl-ping 2s ease-out infinite; }

        /* Badge Coming Soon berkedip halus */
        @keyframes idl-blink {
          0%, 100% { border-color: rgba(255,255,255,.25); }
          50% { border-color: rgba(124,58,237,.95); }
        }
        .idl .idl-blink { animation: idl-blink 2.4s ease-in-out infinite; }

        /* Ikon kecil */
        @keyframes idl-twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.25) rotate(20deg); opacity: .6; }
        }
        .idl .idl-twinkle { animation: idl-twinkle 2.6s ease-in-out infinite; }

        @keyframes idl-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .idl .idl-bounce { animation: idl-bounce 1.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .idl .rv {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .idl .idl-line, .idl .idl-copy, .idl .idl-nav {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
          .idl .rv.is-visible .idl-line,
          .idl .rv.is-visible .idl-copy,
          .idl .rv.is-visible .idl-nav { animation: none !important; }
          .idl .idl-grow { transform: scaleX(1) !important; transition: none !important; }
          .idl .idl-kenburns, .idl .idl-sweep, .idl .idl-orbit, .idl .idl-ring,
          .idl .idl-spin, .idl .idl-float, .idl .idl-pulse, .idl .idl-ping,
          .idl .idl-blink, .idl .idl-twinkle, .idl .idl-bounce { animation: none !important; }
        }
      `}</style>
    </section>
  )
}