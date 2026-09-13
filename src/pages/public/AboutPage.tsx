import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/common/SectionHeading'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import {
  Users,
  Sparkles,
  Target,
  Heart,
  ArrowRight,
  Code2,
  Music2,
} from 'lucide-react'

const values = [
  {
    icon: Sparkles,
    title: 'Creativity',
    description:
      'Kami mengubah ide menjadi karya yang distinctive melalui konsep yang fresh, visual yang expressive, dan solusi kreatif yang disesuaikan dengan kebutuhan setiap project.',
  },
  {
    icon: Target,
    title: 'Quality',
    description:
      'Kami memperhatikan setiap detail dalam proses pengerjaan — mulai dari functionality, usability, visual, hingga hasil akhir yang polished dan konsisten.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description:
      'Kami percaya hasil terbaik lahir dari collaboration yang baik, komunikasi terbuka, pertukaran ide, dan hubungan kerja yang dibangun atas dasar kepercayaan.',
  },
  {
    icon: Heart,
    title: 'Gratitude',
    description:
      'Nama "39" dibaca sebagai "Sankyuu", terinspirasi dari ungkapan Jepang "Thank You". Gratitude menjadi bagian dari identitas kami dalam menghargai setiap client, collaborator, audience, dan kesempatan.',
  },
]

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-purple-100/70 blur-[120px]" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-pink-100/50 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">
              About 39Production
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-5xl lg:text-7xl">
              Where{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Technology
              </span>{' '}
              Meets Creativity
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg">
              39Production adalah creative technology dan entertainment
              production house yang menggabungkan teknologi, design,
              storytelling, dan music untuk mengubah ide menjadi digital
              products, creative experiences, dan original entertainment
              yang meaningful.
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500">
              Nama{' '}
              <span className="font-semibold text-zinc-900">
                "39"
              </span>{' '}
              dibaca sebagai{' '}
              <span className="font-semibold text-purple-600">
                "Sankyuu"
              </span>
              , terinspirasi dari ungkapan Jepang "Thank You".
              Gratitude bukan hanya bagian dari nama kami, tetapi juga
              menjadi cara kami menghargai setiap client, collaborator,
              creator, audience, dan opportunity yang hadir dalam perjalanan
              39Production.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:gap-16">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
                Our Mission
              </span>

              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-zinc-950 sm:text-4xl">
                Creating work that is
                <span className="block bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                  useful, expressive, and memorable.
                </span>
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-7 shadow-sm sm:p-8">
              <p className="text-base leading-8 text-zinc-600">
                Misi kami adalah menghubungkan technology dan creativity
                untuk membangun products, experiences, dan entertainment
                yang benar-benar dapat terhubung dengan penggunanya.
                Kami menggabungkan technical execution dengan design
                thinking dan creative production untuk mengubah sebuah
                ide menjadi hasil yang meaningful.
              </p>

              <p className="mt-5 text-base leading-8 text-zinc-500">
                Baik itu website, digital product, visual identity,
                illustration, animation, game, original music, maupun
                entertainment project, kami membawa prinsip yang sama:
                memahami ide, membentuk vision, mengeksekusi dengan baik,
                dan menghasilkan sesuatu yang worth remembering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <SectionHeading
            label="Our Values"
            title="The Principles Behind Our Work"
          />

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="group rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30"
              >
                <div className="inline-flex rounded-xl border border-purple-100 bg-purple-50 p-3 transition-colors group-hover:bg-purple-100">
                  <value.icon className="h-6 w-6 text-purple-600" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-zinc-900">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVISIONS */}
      <section className="border-y border-zinc-200 bg-zinc-50/70">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <SectionHeading
            label="What We Do"
            title="Two Creative Divisions, One Vision"
          />

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* DIGITAL */}
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/30 sm:p-10">
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl transition-all duration-300 group-hover:bg-blue-100" />

              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Code2 className="h-6 w-6" />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Division 01
                  </span>
                </div>

                <h3 className="mt-7 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                  Digital Creative Services
                </h3>

                <p className="mt-5 leading-8 text-zinc-600">
                  Kami menciptakan digital solutions yang menggabungkan
                  technology, usability, dan visual creativity. Capability
                  kami mencakup web dan application development, UI/UX
                  design, graphic design, illustration, animation,
                  multimedia, hingga game development.
                </p>

                <p className="mt-4 leading-8 text-zinc-500">
                  Mulai dari early concept hingga menjadi finished digital
                  experience, kami fokus membangun solusi yang functional,
                  visually engaging, dan tetap sesuai dengan tujuan setiap
                  project.
                </p>

                <Link
                  to="/services"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700"
                >
                  Explore our services
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* ENTERTAINMENT */}
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/30 sm:p-10">
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-pink-100/60 blur-3xl transition-all duration-300 group-hover:bg-pink-100" />

              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                    <Music2 className="h-6 w-6" />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-600">
                    Division 02
                  </span>
                </div>

                <h3 className="mt-7 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                  Entertainment Production
                </h3>

                <p className="mt-5 leading-8 text-zinc-600">
                  Kami mengembangkan original entertainment projects
                  melalui idola groups, original music, music videos,
                  live activities, dan creative content. Fokus kami adalah
                  membangun entertainment identity yang distinctive serta
                  experience yang mampu menciptakan meaningful connections
                  dengan audience.
                </p>

                <p className="mt-4 leading-8 text-zinc-500">
                  Mulai dari artist concept dan music release hingga
                  visual content dan audience experience, division ini
                  menggabungkan storytelling, music, dan creative
                  production dalam satu ecosystem.
                </p>

                <Link
                  to="/idol"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition-colors hover:text-pink-600"
                >
                  Discover our Entertainment production
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 px-6 py-16 text-center shadow-sm sm:px-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-purple-200/50 blur-3xl" />

            <div className="relative">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
                Let's Create Together
              </span>

              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                Punya ide yang siap diwujudkan?
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600">
                Ceritakan apa yang sedang kamu bangun, ciptakan, atau
                bayangkan. Whether it's a digital product, creative
                service, entertainment project, atau sesuatu yang
                completely new, let's explore what we can create together.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-zinc-800 sm:w-auto"
                >
                  Start a Conversation
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <WhatsAppButton variant="inline" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}