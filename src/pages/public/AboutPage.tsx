import { useEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Code2,
  Heart,
  Music2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'

import { SEO } from '@/components/common/SEO'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'

const values = [
  {
    icon: Sparkles,
    number: '01',
    title: 'Creativity',
    tag: 'Concept',
    description:
      'Kami mengubah ide menjadi karya yang distinctive melalui konsep yang fresh, visual yang expressive, dan solusi kreatif yang disesuaikan dengan kebutuhan setiap project.',
  },
  {
    icon: Target,
    number: '02',
    title: 'Quality',
    tag: 'Craft',
    description:
      'Kami memperhatikan setiap detail dalam proses pengerjaan — mulai dari functionality, usability, visual, hingga hasil akhir yang polished dan konsisten.',
  },
  {
    icon: Users,
    number: '03',
    title: 'Collaboration',
    tag: 'Team',
    description:
      'Kami percaya hasil terbaik lahir dari collaboration yang baik, komunikasi terbuka, pertukaran ide, dan hubungan kerja yang dibangun atas dasar kepercayaan.',
  },
  {
    icon: Heart,
    number: '04',
    title: 'Gratitude',
    tag: 'Sankyuu',
    description:
      'Nama "39" dibaca sebagai "Sankyuu", terinspirasi dari ungkapan Jepang "Thank You". Gratitude menjadi bagian dari identitas kami dalam menghargai setiap client, collaborator, audience, dan kesempatan.',
  },
]

const keywords = [
  'Web Development',
  'UI/UX Design',
  'Animation',
  'Game Development',
  'Original Music',
  'Idol Groups',
  'Music Videos',
  'Illustration',
  'Live Activities',
  'Multimedia',
]

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

export function AboutPage() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  /* Reveal saat di-scroll */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const items = root.querySelectorAll('[data-reveal]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  /* Tilt 3D stage mengikuti kursor */
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 22).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
  }

  const onLeave = () => {
    const el = stageRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  return (
    <>
      <SEO
        title="About 39Production — Creative Digital Production House"
        description="Kenali 39Production, creative technology dan entertainment production house yang menggabungkan teknologi, design, storytelling, music, dan entertainment untuk mengubah ide menjadi digital products dan creative experiences."
        path="/about"
        keywords="About 39Production, 39Production, creative technology, digital production house, entertainment production, creative studio Indonesia, web development, UI UX design, animation, game development"
      />

      <main
        ref={rootRef}
        className="ab min-h-screen overflow-x-hidden bg-white text-zinc-900"
      >
        <EditorialGrid />

        {/* =====================================================
            MASTHEAD / HERO
        ===================================================== */}

        <section className="relative border-b-2 border-zinc-950">
          <div className="mx-auto max-w-7xl px-5 pb-10 pt-[84px] sm:px-6 sm:pb-14 sm:pt-[100px] lg:px-8 lg:pt-[108px]">
            {/* Dateline */}
            <div
              className="ab-in flex items-center justify-between gap-4 border-b border-zinc-200 pb-3"
              style={delay(0)}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="ab-blink h-1.5 w-1.5 shrink-0 bg-violet-600" />
                <span className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-[10px]">
                  39Production
                </span>
                <span className="hidden h-1 w-1 bg-zinc-300 sm:block" />
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:block sm:text-[10px]">
                  About / Studio Profile
                </span>
              </div>

              <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:text-[10px]">
                Sankyuu · est. 39
              </span>
            </div>

            <div className="grid items-center gap-8 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
              {/* Headline */}
              <div className="relative z-10">
                <p
                  className="ab-in flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px]"
                  style={delay(80)}
                >
                  <span className="ab-grow h-px w-8 bg-violet-600" />
                  Technology · Creativity · Entertainment
                </p>

                <h1 className="mt-5 text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.07em] text-zinc-950 sm:text-7xl lg:text-[5.8rem] xl:text-[6.6rem]">
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span className="ab-up block" style={delay(140)}>
                      We make
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span className="ab-up block" style={delay(240)}>
                      ideas
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span
                      className="ab-up block text-violet-600"
                      style={delay(340)}
                    >
                      tangible.
                    </span>
                  </span>
                </h1>

                <div
                  className="ab-in mt-7 grid gap-6 sm:mt-9 sm:grid-cols-[1fr_auto] sm:items-end"
                  style={delay(460)}
                >
                  <p className="max-w-xl text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                    39Production adalah creative technology dan
                    entertainment production house yang menggabungkan
                    teknologi, design, storytelling, dan music untuk
                    mengubah ide menjadi digital products, creative
                    experiences, dan original entertainment yang
                    meaningful.
                  </p>

                  <a
                    href="#values"
                    className="group flex items-center gap-3 text-zinc-500 transition-colors hover:text-violet-600"
                  >
                    <span className="flex h-10 w-10 items-center justify-center border border-zinc-300 transition-colors group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
                      <ArrowDownRight className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em]">
                      What we
                      <br />
                      believe in
                    </span>
                  </a>
                </div>
              </div>

              {/* Stage 3D */}
              <div
                ref={stageRef}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className="ab-in ab-stage relative h-[300px] sm:h-[400px] lg:h-[470px]"
                style={delay(220)}
              >
                <div className="ab-tilt absolute inset-0">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 border border-zinc-200"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[9px]"
                  >
                    Fig.01 / The Studio
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-2.5 right-3 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-300 sm:text-[9px]"
                  >
                    Drag the cursor
                  </span>

                  {/* Grid lantai */}
                  <div
                    aria-hidden="true"
                    className="ab-floor pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                  />

                  {/* 39 ekstrusi */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="ab-float">
                      <div className="ab-num">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <span
                            key={i}
                            style={{ ['--z' as string]: i }}
                            className={i === 8 ? 'ab-num-front' : ''}
                          >
                            39
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ring kata */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2"
                  >
                    <div className="ab-ring">
                      {['Technology', 'Creativity', 'Entertainment', 'Gratitude'].map(
                        (label, i) => (
                          <div
                            key={label}
                            className="ab-card"
                            style={{ ['--a' as string]: `${i * 90}deg` }}
                          >
                            <span>{String(i + 1).padStart(2, '0')}</span>
                            {label}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Kubus */}
                  <div
                    aria-hidden="true"
                    className="ab-z-a pointer-events-none absolute right-[7%] top-[12%]"
                  >
                    <div className="ab-float-slow">
                      <div className="ab-cube">
                        <i className="f1">S</i>
                        <i className="f2" />
                        <i className="f3">K</i>
                        <i className="f4" />
                        <i className="f5" />
                        <i className="f6" />
                      </div>
                    </div>
                  </div>

                  {/* Bola */}
                  <div
                    aria-hidden="true"
                    className="ab-z-b pointer-events-none absolute bottom-[16%] left-[8%]"
                  >
                    <div className="ab-float" style={{ animationDelay: '-2s' }}>
                      <div className="ab-sphere" />
                    </div>
                  </div>

                  {[
                    ['12%', '20%'],
                    ['88%', '62%'],
                    ['30%', '88%'],
                  ].map(([l, t], i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="ab-twinkle pointer-events-none absolute h-1.5 w-1.5 bg-violet-600"
                      style={{ left: l, top: t, animationDelay: `${i * 0.7}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ticker */}
          <div className="overflow-hidden border-t border-zinc-950 bg-zinc-950 text-white">
            <div className="ab-marquee flex w-max items-center py-3">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex items-center"
                >
                  {keywords.map((word) => (
                    <span
                      key={`${copy}-${word}`}
                      className="flex items-center gap-5 whitespace-nowrap px-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                      {word}
                      <span className="h-1.5 w-1.5 bg-violet-500" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            EDITOR'S NOTE — WHY 39
        ===================================================== */}

        <section className="border-b border-zinc-200">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
              <div>
                <div
                  data-reveal
                  className="ab-rv flex items-center gap-3 border-b border-zinc-200 pb-3"
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-600">
                    01
                  </span>
                  <span className="h-px w-8 bg-violet-600" />
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Cover story · Why “39”?
                  </p>
                </div>

                <h2
                  data-reveal
                  style={delay(60)}
                  className="ab-rv mt-6 max-w-3xl text-3xl font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-5xl"
                >
                  Dibaca{' '}
                  <span className="text-violet-600">“Sankyuu”</span>.
                  Artinya terima kasih.
                </h2>

                <div className="mt-7 grid gap-6 sm:grid-cols-2 sm:gap-10">
                  <p
                    data-reveal
                    style={delay(100)}
                    className="ab-rv ab-dropcap text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8"
                  >
                    Nama “39” dibaca sebagai “Sankyuu”, terinspirasi dari
                    ungkapan Jepang “Thank You”. Gratitude bukan hanya
                    bagian dari nama kami, tetapi menjadi cara kami
                    menghargai setiap client, collaborator, creator,
                    audience, dan opportunity yang hadir dalam perjalanan
                    39Production.
                  </p>

                  <p
                    data-reveal
                    style={delay(160)}
                    className="ab-rv text-sm leading-7 text-zinc-500 sm:text-base sm:leading-8"
                  >
                    Dari situ kami membangun cara kerja: mendengarkan
                    dulu, menghargai setiap ide yang dipercayakan, lalu
                    mengerjakannya dengan serius sampai hasil akhirnya
                    benar-benar bisa dipakai dan dinikmati.
                  </p>
                </div>
              </div>

              {/* Sidebar — pull quote */}
              <aside
                data-reveal
                style={delay(120)}
                className="ab-rv relative self-start overflow-hidden border border-zinc-950"
              >
                <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-white">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                    In a word
                  </p>
                  <span className="ab-blink h-1.5 w-1.5 bg-violet-400" />
                </div>

                <div className="relative p-5 sm:p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-6 right-1 select-none text-[9rem] font-black leading-none tracking-[-0.12em] text-zinc-100"
                  >
                    39
                  </div>

                  <p className="relative text-2xl font-semibold leading-[1.1] tracking-[-0.04em] text-zinc-950">
                    “We make things, and we say{' '}
                    <span className="text-violet-600">thank you</span>{' '}
                    for the chance.”
                  </p>

                  <div className="relative mt-5 flex items-center gap-3 border-t border-zinc-200 pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                    <span className="h-1 w-1 bg-violet-600" />
                    The 39Production way
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* =====================================================
            MISSION — dark band
        ===================================================== */}

        <section className="relative overflow-hidden border-b border-zinc-200 bg-zinc-950 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 select-none text-[16rem] font-black leading-none tracking-[-0.12em] text-white/[0.035] sm:text-[24rem]"
          >
            39
          </div>

          <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="flex items-center gap-3" data-reveal>
              <span className="ab-rv font-mono text-[10px] font-bold tracking-[0.18em] text-violet-400">
                02
              </span>
              <span className="h-px w-8 bg-violet-400" />
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Our mission
              </p>
            </div>

            <h2
              data-reveal
              style={delay(60)}
              className="ab-rv mt-6 max-w-5xl text-3xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-7xl"
            >
              Creating work that is
              <span className="text-violet-400"> useful,</span>{' '}
              <br className="hidden sm:block" />
              expressive, and memorable.
            </h2>

            <div className="mt-10 grid gap-px border border-zinc-800 bg-zinc-800 sm:mt-14 lg:grid-cols-2">
              <p
                data-reveal
                style={delay(80)}
                className="ab-rv bg-zinc-950 p-6 text-sm leading-7 text-zinc-300 sm:p-8 sm:text-base sm:leading-8"
              >
                Misi kami adalah menghubungkan technology dan creativity
                untuk membangun products, experiences, dan entertainment
                yang benar-benar dapat terhubung dengan penggunanya.
              </p>

              <p
                data-reveal
                style={delay(160)}
                className="ab-rv bg-zinc-950 p-6 text-sm leading-7 text-zinc-400 sm:p-8 sm:text-base sm:leading-8"
              >
                Kami menggabungkan technical execution dengan design
                thinking dan creative production untuk mengubah sebuah ide
                menjadi hasil yang meaningful.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            VALUES — kolom koran
        ===================================================== */}

        <section id="values" className="scroll-mt-24 border-b border-zinc-200">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div
              data-reveal
              className="ab-rv flex flex-wrap items-end justify-between gap-4 border-b-2 border-zinc-950 pb-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-600">
                    03
                  </span>
                  <span className="h-px w-8 bg-violet-600" />
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Our values · What drives us
                  </p>
                </div>

                <h2 className="mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-5xl">
                  Four things we bring
                  <span className="text-violet-600"> into every project.</span>
                </h2>
              </div>

              <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
                04 principles
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon

                return (
                  <article
                    key={value.title}
                    data-reveal
                    style={delay(index * 80)}
                    className="ab-rv group relative flex flex-col border-b border-zinc-200 px-0 py-7 sm:px-6 sm:py-8 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:first:pl-0"
                  >
                    <div className="absolute left-0 top-0 h-0.5 w-0 bg-violet-600 transition-all duration-700 group-hover:w-full" />

                    <div className="flex items-start justify-between">
                      <span className="font-mono text-5xl font-medium leading-none tracking-[-0.07em] text-zinc-200 transition-colors duration-300 group-hover:text-violet-600 sm:text-6xl">
                        {value.number}
                      </span>

                      <div className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white transition-all duration-300 group-hover:-rotate-6 group-hover:border-violet-600 group-hover:bg-violet-600">
                        <Icon className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-white" />
                      </div>
                    </div>

                    <p className="mt-8 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-[9px]">
                      {value.tag}
                    </p>

                    <h3 className="ab-ul mt-2 text-2xl font-semibold tracking-[-0.04em] text-zinc-950">
                      <span>{value.title}</span>
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-zinc-500">
                      {value.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            DIVISIONS — dua rubrik
        ===================================================== */}

        <section className="border-b border-zinc-200 bg-zinc-50/60">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div
              data-reveal
              className="ab-rv flex flex-wrap items-end justify-between gap-4 border-b-2 border-zinc-950 pb-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-600">
                    04
                  </span>
                  <span className="h-px w-8 bg-violet-600" />
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    What we do · One studio / two directions
                  </p>
                </div>

                <h2 className="mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-5xl">
                  Technology and
                  <span className="text-zinc-400"> entertainment.</span>
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-2 lg:gap-6">
              {/* DIGITAL */}
              <article
                data-reveal
                className="ab-rv group relative overflow-hidden border border-zinc-200 bg-white p-6 transition-[border-color,box-shadow] duration-500 hover:border-blue-500 hover:shadow-[8px_8px_0_0_rgba(37,99,235,0.9)] sm:p-9"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -top-3 select-none font-mono text-[7rem] font-black leading-none tracking-[-0.1em] text-blue-50 transition-colors duration-500 group-hover:text-blue-100"
                >
                  01
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center border border-blue-100 bg-blue-50 text-blue-600 transition-transform duration-500 group-hover:-rotate-6">
                      <Code2 className="h-5 w-5" />
                    </div>

                    <span className="bg-blue-600 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                      Division 01
                    </span>
                  </div>

                  <h3 className="mt-9 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-zinc-950 sm:text-4xl">
                    Digital Creative
                    <br />
                    Services
                  </h3>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                    Kami menciptakan digital solutions yang menggabungkan
                    technology, usability, dan visual creativity.
                    Capability kami mencakup web dan application
                    development, UI/UX design, graphic design,
                    illustration, animation, multimedia, hingga game
                    development.
                  </p>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                    Mulai dari early concept hingga menjadi finished
                    digital experience, kami fokus membangun solusi yang
                    functional, visually engaging, dan sesuai dengan
                    tujuan setiap project.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Web & Apps', 'UI/UX', 'Animation', 'Games'].map((t) => (
                      <span
                        key={t}
                        className="border border-blue-100 bg-blue-50/60 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-blue-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <Link
                    to="/services"
                    className="group/link mt-8 inline-flex items-center gap-3 border-b border-zinc-300 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 transition-colors hover:border-blue-600 hover:text-blue-600"
                  >
                    Explore our services
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </article>

              {/* ENTERTAINMENT */}
              <article
                data-reveal
                style={delay(100)}
                className="ab-rv group relative overflow-hidden border border-zinc-200 bg-white p-6 transition-[border-color,box-shadow] duration-500 hover:border-fuchsia-500 hover:shadow-[8px_8px_0_0_rgba(192,38,211,0.9)] sm:p-9"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -top-3 select-none font-mono text-[7rem] font-black leading-none tracking-[-0.1em] text-fuchsia-50 transition-colors duration-500 group-hover:text-fuchsia-100"
                >
                  02
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center border border-fuchsia-100 bg-fuchsia-50 text-fuchsia-600 transition-transform duration-500 group-hover:-rotate-6">
                      <Music2 className="h-5 w-5" />
                    </div>

                    <span className="bg-fuchsia-600 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                      Division 02
                    </span>
                  </div>

                  <h3 className="mt-9 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-zinc-950 sm:text-4xl">
                    Entertainment
                    <br />
                    Production
                  </h3>

                  <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                    Kami mengembangkan original entertainment projects
                    melalui idola groups, original music, music videos,
                    live activities, dan creative content. Fokus kami
                    adalah membangun entertainment identity yang
                    distinctive serta experience yang mampu menciptakan
                    meaningful connections dengan audience.
                  </p>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-500">
                    Mulai dari artist concept dan music release hingga
                    visual content dan audience experience, division ini
                    menggabungkan storytelling, music, dan creative
                    production dalam satu ecosystem.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Idol Groups', 'Original Music', 'Music Videos', 'Live'].map(
                      (t) => (
                        <span
                          key={t}
                          className="border border-fuchsia-100 bg-fuchsia-50/60 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-fuchsia-700"
                        >
                          {t}
                        </span>
                      ),
                    )}
                  </div>

                  <Link
                    to="/idol"
                    className="group/link mt-8 inline-flex items-center gap-3 border-b border-zinc-300 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 transition-colors hover:border-fuchsia-600 hover:text-fuchsia-600"
                  >
                    Discover entertainment
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div
              data-reveal
              className="ab-rv relative overflow-hidden bg-zinc-950 px-6 py-12 text-white sm:px-12 sm:py-16"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-2 select-none text-[12rem] font-black leading-none tracking-[-0.12em] text-white/[0.05] sm:text-[18rem]"
              >
                39
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-6 hidden sm:block sm:right-14 sm:top-12"
              >
                <div className="ab-float-slow">
                  <div className="ab-cube ab-cube-dark">
                    <i className="f1">39</i>
                    <i className="f2" />
                    <i className="f3">S</i>
                    <i className="f4" />
                    <i className="f5" />
                    <i className="f6" />
                  </div>
                </div>
              </div>

              <div className="relative max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-400">
                    05
                  </span>
                  <span className="h-px w-8 bg-violet-400" />
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    Let's create together
                  </p>
                </div>

                <h2 className="mt-6 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl">
                  Punya ide yang
                  <br />
                  siap{' '}
                  <span className="text-violet-400">diwujudkan?</span>
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
                  Ceritakan apa yang sedang kamu bangun, ciptakan, atau
                  bayangkan. Whether it's a digital product, creative
                  service, entertainment project, atau sesuatu yang
                  completely new, let's explore what we can create
                  together.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center gap-3 bg-violet-600 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-violet-500"
                  >
                    Start a Conversation
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <WhatsAppButton variant="inline" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <style>{`
          html { scroll-behavior: smooth; }

          /* ---------- Reveal ---------- */
          @keyframes ab-in {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .ab .ab-in {
            opacity: 0;
            animation: ab-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
          }

          .ab .ab-rv {
            opacity: 0;
            transform: translate3d(0, 26px, 0);
            transition:
              opacity .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
              transform .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
          }
          .ab .ab-rv.is-visible { opacity: 1; transform: none; }

          @keyframes ab-up {
            from { transform: translateY(105%); }
            to   { transform: translateY(0); }
          }
          .ab .ab-up {
            transform: translateY(105%);
            animation: ab-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
          }
          @keyframes ab-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
          .ab .ab-grow {
            transform-origin: left;
            animation: ab-grow .9s cubic-bezier(.77,0,.18,1) .4s both;
          }

          .ab .ab-ul span {
            background-image: linear-gradient(currentColor, currentColor);
            background-repeat: no-repeat;
            background-position: 0 100%;
            background-size: 0% 2px;
            transition: background-size .6s cubic-bezier(.22,1,.36,1);
            padding-bottom: 2px;
          }
          .ab .group:hover .ab-ul span { background-size: 100% 2px; }

          .ab .ab-dropcap::first-letter {
            float: left;
            font-size: 3.6rem;
            line-height: .8;
            font-weight: 700;
            letter-spacing: -.06em;
            padding: .3rem .5rem 0 0;
            color: #7C3AED;
          }

          /* ---------- Misc motion ---------- */
          @keyframes ab-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          .ab .ab-float { animation: ab-float 6s ease-in-out infinite; }
          .ab .ab-float-slow { animation: ab-float 9s ease-in-out infinite; }

          @keyframes ab-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
          .ab .ab-blink { animation: ab-blink 1.6s ease-in-out infinite; }

          @keyframes ab-twinkle {
            0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
            50% { opacity: 1; transform: scale(1) rotate(45deg); }
          }
          .ab .ab-twinkle { animation: ab-twinkle 3s ease-in-out infinite; }

          @keyframes ab-marquee { to { transform: translateX(-50%); } }
          .ab .ab-marquee { animation: ab-marquee 40s linear infinite; }
          .ab .ab-marquee:hover { animation-play-state: paused; }

          /* ---------- Stage 3D ---------- */
          .ab .ab-stage { perspective: 1100px; }
          .ab .ab-tilt {
            transform-style: preserve-3d;
            transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
            transition: transform .35s cubic-bezier(.22,1,.36,1);
          }
          .ab .ab-z-a { transform: translateZ(90px); }
          .ab .ab-z-b { transform: translateZ(60px); }
          @media (max-width: 1023px) {
            .ab .ab-z-a, .ab .ab-z-b { transform: translateZ(30px); }
          }

          .ab .ab-floor {
            background-image:
              linear-gradient(to right, rgba(124,58,237,.22) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(124,58,237,.22) 1px, transparent 1px);
            background-size: 34px 34px;
            transform: rotateX(68deg) translateZ(-40px);
            transform-origin: bottom;
            -webkit-mask-image: linear-gradient(to top, #000, transparent 90%);
            mask-image: linear-gradient(to top, #000, transparent 90%);
          }

          /* 39 ekstrusi: tumpukan layer teks */
          .ab .ab-num {
            position: relative;
            width: 200px;
            height: 150px;
            transform-style: preserve-3d;
            animation: ab-sway 9s ease-in-out infinite alternate;
          }
          @media (min-width: 640px) { .ab .ab-num { width: 270px; height: 200px; } }
          @media (min-width: 1024px) { .ab .ab-num { width: 330px; height: 240px; } }
          .ab .ab-num span {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8.5rem;
            font-weight: 900;
            line-height: 1;
            letter-spacing: -.1em;
            color: #5b21b6;
            transform: translateZ(calc((var(--z) - 4) * 7px));
          }
          @media (min-width: 640px) { .ab .ab-num span { font-size: 11.5rem; } }
          @media (min-width: 1024px) { .ab .ab-num span { font-size: 14rem; } }
          .ab .ab-num span:nth-child(odd) { color: #7C3AED; }
          .ab .ab-num .ab-num-front {
            color: #fff;
            -webkit-text-stroke: 3px #7C3AED;
            background: none;
          }
          @keyframes ab-sway {
            from { transform: rotateY(-28deg) rotateX(6deg); }
            to   { transform: rotateY(28deg) rotateX(-4deg); }
          }

          /* Ring kata */
          .ab .ab-ring {
            position: absolute;
            left: 0; top: 0;
            width: 0; height: 0;
            transform-style: preserve-3d;
            animation: ab-spin 26s linear infinite;
          }
          @keyframes ab-spin {
            from { transform: translateY(-4px) rotateX(-8deg) rotateY(0deg); }
            to   { transform: translateY(-4px) rotateX(-8deg) rotateY(360deg); }
          }
          .ab .ab-card {
            --r: 150px;
            position: absolute;
            left: -60px; top: 96px;
            width: 120px;
            padding: 8px 10px;
            border: 1.5px solid #111;
            background: #fff;
            box-shadow: 4px 4px 0 0 rgba(124,58,237,.9);
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: .14em;
            text-transform: uppercase;
            color: #111;
            transform: rotateY(var(--a)) translateZ(var(--r));
            backface-visibility: hidden;
          }
          .ab .ab-card span { display: block; color: #7C3AED; margin-bottom: 3px; }
          @media (min-width: 640px) {
            .ab .ab-card { --r: 210px; top: 130px; width: 138px; left: -69px; font-size: 9px; }
          }
          @media (min-width: 1024px) {
            .ab .ab-card { --r: 250px; top: 156px; }
          }

          /* Kubus */
          .ab .ab-cube {
            --s: 40px;
            position: relative;
            width: var(--s);
            height: var(--s);
            transform-style: preserve-3d;
            animation: ab-cube 14s linear infinite;
          }
          @media (min-width: 640px) { .ab .ab-cube { --s: 50px; } }
          @keyframes ab-cube {
            from { transform: rotateX(-24deg) rotateY(0deg); }
            to   { transform: rotateX(-24deg) rotateY(360deg); }
          }
          .ab .ab-cube i {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-style: normal;
            font-weight: 900;
            font-size: calc(var(--s) * .34);
            letter-spacing: -.06em;
            color: #7C3AED;
            border: 1.5px solid rgba(124,58,237,.85);
            background: rgba(124,58,237,.1);
          }
          .ab .ab-cube .f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.8); }
          .ab .ab-cube .f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
          .ab .ab-cube .f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.8); }
          .ab .ab-cube .f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
          .ab .ab-cube .f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
          .ab .ab-cube .f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }
          .ab .ab-cube-dark { --s: 54px; }
          .ab .ab-cube-dark i { color: #E78FBA; border-color: rgba(231,143,186,.7); background: rgba(124,58,237,.28); }
          .ab .ab-cube-dark { perspective: none; }

          /* Bola */
          .ab .ab-sphere {
            width: 28px; height: 28px;
            border-radius: 9999px;
            background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
            box-shadow: 0 12px 18px -6px rgba(124,58,237,.55);
          }
          @media (min-width: 1024px) { .ab .ab-sphere { width: 40px; height: 40px; } }

          @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            .ab *, .ab *::before, .ab *::after {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
            .ab .ab-in, .ab .ab-rv, .ab .ab-up {
              opacity: 1 !important;
              transform: none !important;
            }
            .ab .ab-grow { transform: scaleX(1) !important; }
            .ab .ab-tilt { transform: none !important; }
          }
        `}</style>
      </main>
    </>
  )
}

/* =========================================================
   EDITORIAL GRID
========================================================= */

function EditorialGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #111 1px, transparent 1px),
          linear-gradient(to bottom, #111 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
      }}
    />
  )
}

export default AboutPage