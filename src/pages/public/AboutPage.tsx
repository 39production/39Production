import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  Code2,
  Heart,
  Music2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'

const values = [
  {
    icon: Sparkles,
    number: '01',
    title: 'Creativity',
    description:
      'Kami mengubah ide menjadi karya yang distinctive melalui konsep yang fresh, visual yang expressive, dan solusi kreatif yang disesuaikan dengan kebutuhan setiap project.',
  },
  {
    icon: Target,
    number: '02',
    title: 'Quality',
    description:
      'Kami memperhatikan setiap detail dalam proses pengerjaan — mulai dari functionality, usability, visual, hingga hasil akhir yang polished dan konsisten.',
  },
  {
    icon: Users,
    number: '03',
    title: 'Collaboration',
    description:
      'Kami percaya hasil terbaik lahir dari collaboration yang baik, komunikasi terbuka, pertukaran ide, dan hubungan kerja yang dibangun atas dasar kepercayaan.',
  },
  {
    icon: Heart,
    number: '04',
    title: 'Gratitude',
    description:
      'Nama "39" dibaca sebagai "Sankyuu", terinspirasi dari ungkapan Jepang "Thank You". Gratitude menjadi bagian dari identitas kami dalam menghargai setiap client, collaborator, audience, dan kesempatan.',
  },
]

export function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-900">
      <EditorialGrid />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative border-b border-zinc-200">
        {/* Decorative numbers */}

        <div className="pointer-events-none absolute right-6 top-20 hidden select-none font-mono text-[9rem] font-semibold leading-none tracking-[-0.1em] text-zinc-100 lg:block">
          39
        </div>

        <div className="pointer-events-none absolute -right-32 top-24 h-72 w-72 rounded-full bg-violet-100/60 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
          {/* Top label */}

          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                39Production
              </span>

              <span className="h-1 w-1 bg-zinc-300" />

              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                About / Studio
              </span>
            </div>

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-300">
              07 / 08
            </span>
          </div>

          <div className="relative mt-14 grid gap-12 lg:grid-cols-[150px_minmax(0,1fr)] lg:gap-16">
            {/* Index */}

            <div className="hidden lg:block">
              <p className="font-mono text-[10px] text-zinc-400">
                ABOUT
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="font-mono text-[9px] text-zinc-300">
                  01
                </span>

                <span className="h-px w-8 bg-violet-500" />
              </div>

              <p className="mt-4 max-w-[100px] font-mono text-[9px] uppercase leading-5 tracking-[0.15em] text-zinc-400">
                Technology
                <br />
                Creativity
                <br />
                Entertainment
              </p>
            </div>

            {/* Hero content */}

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 lg:hidden">
                About 39Production
              </p>

              <h1 className="max-w-6xl text-[3.3rem] font-semibold leading-[0.91] tracking-[-0.07em] text-zinc-950 sm:text-6xl lg:text-8xl xl:text-[7.8rem]">
                We make
                <br />
                ideas
                <br />
                <span className="text-violet-600">
                  tangible.
                </span>
              </h1>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end lg:gap-20">
                <p className="max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg sm:leading-9">
                  39Production adalah creative technology
                  dan entertainment production house yang
                  menggabungkan teknologi, design,
                  storytelling, dan music untuk mengubah ide
                  menjadi digital products, creative
                  experiences, dan original entertainment
                  yang meaningful.
                </p>

                <div className="border-l border-zinc-200 pl-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                    Scroll to explore
                  </p>

                  <div className="mt-5 flex items-center gap-3 text-zinc-500">
                    <span className="flex h-9 w-9 items-center justify-center border border-zinc-200">
                      <ArrowDownRight className="h-4 w-4" />
                    </span>

                    <span className="text-xs">
                      What we believe in
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meaning of 39 */}

          <div className="mt-16 border-t border-zinc-200 pt-7 lg:ml-[166px]">
            <div className="grid gap-7 sm:grid-cols-[180px_1fr] sm:gap-12">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                Why "39"?
              </p>

              <p className="max-w-3xl text-sm leading-7 text-zinc-500 sm:text-base sm:leading-8">
                Nama{' '}
                <span className="font-semibold text-zinc-900">
                  "39"
                </span>{' '}
                dibaca sebagai{' '}
                <span className="font-semibold text-violet-600">
                  "Sankyuu"
                </span>
                , terinspirasi dari ungkapan Jepang "Thank
                You". Gratitude bukan hanya bagian dari nama
                kami, tetapi menjadi cara kami menghargai
                setiap client, collaborator, creator,
                audience, dan opportunity yang hadir dalam
                perjalanan 39Production.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BIG STATEMENT
      ===================================================== */}

      <section className="border-b border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[150px_1fr] lg:gap-16">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              02
            </div>

            <div>
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                Our mission
              </p>

              <h2 className="mt-7 max-w-5xl text-3xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Creating work that is
                <span className="text-violet-400">
                  {' '}useful,
                </span>
                <br className="hidden sm:block" />
                expressive, and memorable.
              </h2>

              <div className="mt-10 grid gap-8 border-t border-zinc-800 pt-8 lg:grid-cols-2 lg:gap-16">
                <p className="text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
                  Misi kami adalah menghubungkan technology
                  dan creativity untuk membangun products,
                  experiences, dan entertainment yang benar-benar
                  dapat terhubung dengan penggunanya.
                </p>

                <p className="text-sm leading-7 text-zinc-500 sm:text-base sm:leading-8">
                  Kami menggabungkan technical execution
                  dengan design thinking dan creative production
                  untuk mengubah sebuah ide menjadi hasil yang
                  meaningful.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[150px_1fr] lg:gap-16">
            <div>
              <p className="font-mono text-[10px] text-zinc-400">
                03
              </p>

              <div className="mt-5 h-px w-8 bg-violet-500" />

              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Our values
              </p>
            </div>

            <div>
              <div className="max-w-3xl">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  What drives us
                </p>

                <h2 className="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-5xl">
                  Four things we bring
                  <span className="text-violet-600">
                    {' '}into every project.
                  </span>
                </h2>
              </div>

              <div className="mt-12 grid border-l border-t border-zinc-200 sm:grid-cols-2">
                {values.map((value) => {
                  const Icon = value.icon

                  return (
                    <div
                      key={value.title}
                      className="group relative min-h-[280px] border-b border-r border-zinc-200 p-7 transition-colors duration-300 hover:bg-zinc-50 sm:p-9"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white transition-all duration-300 group-hover:border-violet-200 group-hover:bg-violet-50">
                          <Icon className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-violet-600" />
                        </div>

                        <span className="font-mono text-[10px] text-zinc-300">
                          {value.number}
                        </span>
                      </div>

                      <div className="mt-14">
                        <h3 className="text-2xl font-semibold tracking-[-0.035em] text-zinc-950">
                          {value.title}
                        </h3>

                        <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500">
                          {value.description}
                        </p>
                      </div>

                      <ArrowRight className="absolute bottom-8 right-8 h-4 w-4 text-zinc-200 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-500" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DIVISIONS
      ===================================================== */}

      <section className="border-b border-zinc-200 bg-zinc-50/50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[150px_1fr] lg:gap-16">
            <div>
              <p className="font-mono text-[10px] text-zinc-400">
                04
              </p>

              <div className="mt-5 h-px w-8 bg-violet-500" />

              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                What we do
              </p>
            </div>

            <div>
              <div className="max-w-3xl">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                  One studio / two directions
                </p>

                <h2 className="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-5xl">
                  Technology and
                  <span className="text-zinc-400">
                    {' '}entertainment.
                  </span>
                </h2>
              </div>

              <div className="mt-12 grid border-l border-t border-zinc-200 lg:grid-cols-2">
                {/* DIGITAL */}

                <div className="group relative overflow-hidden border-b border-r border-zinc-200 bg-white p-7 sm:p-10">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/70 opacity-0 blur-[70px] transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center border border-blue-100 bg-blue-50 text-blue-600">
                        <Code2 className="h-5 w-5" />
                      </div>

                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-blue-600">
                        Division 01
                      </span>
                    </div>

                    <h3 className="mt-10 text-3xl font-semibold tracking-[-0.045em] text-zinc-950">
                      Digital Creative
                      <br />
                      Services
                    </h3>

                    <p className="mt-6 max-w-xl text-sm leading-8 text-zinc-600 sm:text-base">
                      Kami menciptakan digital solutions
                      yang menggabungkan technology, usability,
                      dan visual creativity. Capability kami
                      mencakup web dan application development,
                      UI/UX design, graphic design, illustration,
                      animation, multimedia, hingga game
                      development.
                    </p>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500">
                      Mulai dari early concept hingga menjadi
                      finished digital experience, kami fokus
                      membangun solusi yang functional,
                      visually engaging, dan sesuai dengan
                      tujuan setiap project.
                    </p>

                    <Link
                      to="/services"
                      className="group/link mt-9 inline-flex items-center gap-3 border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 transition-colors hover:border-violet-500 hover:text-violet-600"
                    >
                      Explore our services
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* ENTERTAINMENT */}

                <div className="group relative overflow-hidden border-b border-r border-zinc-200 bg-white p-7 sm:p-10">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-100/70 opacity-0 blur-[70px] transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center border border-fuchsia-100 bg-fuchsia-50 text-fuchsia-600">
                        <Music2 className="h-5 w-5" />
                      </div>

                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-fuchsia-600">
                        Division 02
                      </span>
                    </div>

                    <h3 className="mt-10 text-3xl font-semibold tracking-[-0.045em] text-zinc-950">
                      Entertainment
                      <br />
                      Production
                    </h3>

                    <p className="mt-6 max-w-xl text-sm leading-8 text-zinc-600 sm:text-base">
                      Kami mengembangkan original
                      entertainment projects melalui idola
                      groups, original music, music videos,
                      live activities, dan creative content.
                      Fokus kami adalah membangun
                      entertainment identity yang distinctive
                      serta experience yang mampu menciptakan
                      meaningful connections dengan audience.
                    </p>

                    <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-500">
                      Mulai dari artist concept dan music
                      release hingga visual content dan
                      audience experience, division ini
                      menggabungkan storytelling, music, dan
                      creative production dalam satu ecosystem.
                    </p>

                    <Link
                      to="/idol"
                      className="group/link mt-9 inline-flex items-center gap-3 border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 transition-colors hover:border-fuchsia-500 hover:text-fuchsia-600"
                    >
                      Discover entertainment
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL STATEMENT / CTA
      ===================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[150px_1fr] lg:gap-16">
            <div>
              <p className="font-mono text-[10px] text-zinc-400">
                05
              </p>

              <div className="mt-5 h-px w-8 bg-violet-500" />

              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Start something
              </p>
            </div>

            <div className="relative overflow-hidden border-y border-zinc-200 py-14 sm:py-16">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-100/60 blur-[90px]" />

              <div className="relative max-w-4xl">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600">
                  Let's create together
                </p>

                <h2 className="mt-6 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-zinc-950 sm:text-6xl">
                  Punya ide yang
                  <br />
                  siap{' '}
                  <span className="text-violet-600">
                    diwujudkan?
                  </span>
                </h2>

                <p className="mt-7 max-w-2xl text-sm leading-8 text-zinc-500 sm:text-base sm:leading-8">
                  Ceritakan apa yang sedang kamu bangun,
                  ciptakan, atau bayangkan. Whether it's a
                  digital product, creative service,
                  entertainment project, atau sesuatu yang
                  completely new, let's explore what we can
                  create together.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center gap-3 bg-zinc-950 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-violet-600"
                  >
                    Start a Conversation
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <WhatsAppButton variant="inline" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* =========================================================
   EDITORIAL GRID
========================================================= */

function EditorialGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
      style={{
        backgroundImage: `
linear - gradient(to right, #111 1px, transparent 1px),
  linear - gradient(to bottom, #111 1px, transparent 1px)
    `,
        backgroundSize: '72px 72px',
      }}
    />
  )
}