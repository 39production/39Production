
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
  return (
    <section
      aria-labelledby="idol-section-title"
      className="relative overflow-hidden bg-white text-zinc-950"
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

        <div className="absolute right-[8%] top-[17%] h-2 w-2 rounded-full bg-[#7C3AED]" />

        <div className="absolute bottom-[20%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        {/* =================================================
            SECTION LABEL
        ================================================== */}

        <div className="mb-12 border-t border-black/10 pt-4 sm:mb-14">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

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
          <div className="max-w-md">
            <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
              Entertainment menjadi ruang bagi 39Production
              untuk membangun karya original melalui musik,
              visual, performance, dan storytelling.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#7C3AED]" />

              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Music / Visual / Story
              </span>
            </div>
          </div>

          <div className="max-w-5xl">
            <p className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
              <Sparkles size={12} />
              Original Entertainment
            </p>

            <h2
              id="idol-section-title"
              className="text-[clamp(2.6rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
            >
              More than music.
              <span className="text-neutral-300">
                {' '}
                We create stories.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
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

        <div className="mt-16 grid overflow-hidden border border-black/10 bg-black sm:mt-20 lg:grid-cols-[1.4fr_0.6fr]">
          {/* =================================================
              VISUAL
          ================================================== */}

          <div className="group relative min-h-[480px] overflow-hidden sm:min-h-[580px] lg:min-h-[650px]">
            <img
              src={idolSilhouette}
              alt="39Production original idol project"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
            />

            {/* Image treatment */}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"
            />

            {/* Brand accent */}

            <div
              aria-hidden="true"
              className="absolute left-0 top-1/3 h-28 w-1 bg-[#7C3AED]"
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

              <span className="border border-white/25 bg-black/25 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                Coming Soon
              </span>
            </div>

            {/* Visual details */}

            <div
              aria-hidden="true"
              className="absolute right-8 top-28 hidden h-24 w-24 rounded-full border border-white/15 sm:block"
            />

            <div
              aria-hidden="true"
              className="absolute right-14 top-[136px] hidden h-3 w-3 rounded-full bg-[#7C3AED] shadow-[0_0_20px_rgba(198,61,135,0.55)] sm:block"
            />

            <div
              aria-hidden="true"
              className="absolute bottom-[32%] left-[12%] h-1.5 w-1.5 rounded-full bg-white/60"
            />

            {/* Main visual copy */}

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-9 bg-[#7C3AED]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/65 sm:text-[10px]">
                    Original Entertainment Project
                  </p>
                </div>

                <h3 className="text-4xl font-black leading-[0.9] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                  Something new.
                  <span className="block text-white/35">
                    Is coming.
                  </span>
                </h3>

                <p className="mt-5 max-w-xl text-sm font-medium leading-6 text-white/65 sm:text-[15px] sm:leading-7">
                  Sebuah original idol project yang sedang
                  kami kembangkan dari nol — mulai dari
                  group, music, visual identity, hingga
                  universe dan cerita yang akan dibangun
                  bersama audience.
                </p>

                <Link
                  to="/idol"
                  className="group/cta mt-7 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-black transition-all duration-300 hover:bg-[#7C3AED] hover:text-white"
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
                className="text-white/45"
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
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

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
              {menuItems.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="group/item flex items-center justify-between border-t border-white/10 py-5 transition-colors duration-300 last:border-b"
                  >
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

                          <p className="truncate text-sm font-bold text-white transition-transform duration-300 group-hover/item:translate-x-0.5">
                            {item.title}
                          </p>
                        </div>

                        <p className="mt-1 text-[10px] font-medium text-white/35">
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

        <div className="mt-10 grid gap-6 border-t border-black/10 pt-7 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 text-[#7C3AED]">
              <Music
                className="h-4 w-4"
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

        <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-4">
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
    </section>
  )
}
