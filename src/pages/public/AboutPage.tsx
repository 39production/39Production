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
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.08),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
              About 39Production
            </span>

            <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-7xl">
              Where{' '}
              <span className="gradient-text">
                Technology
              </span>{' '}
              Meets Creativity
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
              39Production adalah creative technology dan entertainment
              production house yang menggabungkan teknologi, design,
              storytelling, dan music untuk mengubah ide menjadi digital
              products, creative experiences, dan original entertainment
              yang meaningful.
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-text-muted">
              Nama{' '}
              <span className="font-semibold text-text-primary">
                "39"
              </span>{' '}
              dibaca sebagai{' '}
              <span className="font-semibold text-brand-primary">
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

      {/* Mission */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Our Mission
              </span>

              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Creating work that is
                <span className="gradient-text">
                  {' '}useful, expressive, and memorable.
                </span>
              </h2>
            </div>

            <div className="rounded-2xl border border-border-default bg-bg-surface p-7 sm:p-8">
              <p className="text-base leading-8 text-text-secondary">
                Misi kami adalah menghubungkan technology dan creativity
                untuk membangun products, experiences, dan entertainment
                yang benar-benar dapat terhubung dengan penggunanya.
                Kami menggabungkan technical execution dengan design
                thinking dan creative production untuk mengubah sebuah
                ide menjadi hasil yang meaningful.
              </p>

              <p className="mt-5 text-base leading-8 text-text-muted">
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

      {/* Values */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <SectionHeading
            label="Our Values"
            title="The Principles Behind Our Work"
          />

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="group rounded-2xl border border-border-default bg-bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-xl hover:shadow-brand-primary/5"
              >
                <div className="inline-flex rounded-xl border border-brand-primary/10 bg-brand-primary/10 p-3 transition-colors group-hover:bg-brand-primary/15">
                  <value.icon className="h-6 w-6 text-brand-primary" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-text-primary">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section className="border-y border-border bg-bg-surface/30">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
          <SectionHeading
            label="What We Do"
            title="Two Creative Divisions, One Vision"
          />

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Digital */}
            <div className="group relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-8 transition-all duration-300 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/5 sm:p-10">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl transition-all duration-300 group-hover:bg-blue-500/10" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Code2 className="h-6 w-6" />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                    Division 01
                  </span>
                </div>

                <h3 className="mt-7 font-display text-2xl font-bold text-text-primary sm:text-3xl">
                  Digital Creative Services
                </h3>

                <p className="mt-5 leading-8 text-text-muted">
                  Kami menciptakan digital solutions yang menggabungkan
                  technology, usability, dan visual creativity. Capability
                  kami mencakup web dan application development, UI/UX
                  design, graphic design, illustration, animation,
                  multimedia, hingga game development.
                </p>

                <p className="mt-4 leading-8 text-text-muted">
                  Mulai dari early concept hingga menjadi finished digital
                  experience, kami fokus membangun solusi yang functional,
                  visually engaging, dan tetap sesuai dengan tujuan setiap
                  project.
                </p>

                <Link
                  to="/services"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-accent"
                >
                  Explore our services
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Idol */}
            <div className="group relative overflow-hidden rounded-3xl border border-border-default bg-bg-surface p-8 transition-all duration-300 hover:border-brand-accent/30 hover:shadow-2xl hover:shadow-brand-accent/5 sm:p-10">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-pink-500/5 blur-3xl transition-all duration-300 group-hover:bg-pink-500/10" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10 text-brand-accent">
                    <Music2 className="h-6 w-6" />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">
                    Division 02
                  </span>
                </div>

                <h3 className="mt-7 font-display text-2xl font-bold text-text-primary sm:text-3xl">
                  Entertainment Production
                </h3>

                <p className="mt-5 leading-8 text-text-muted">
                  Kami mengembangkan original entertainment projects
                  melalui idola groups, original music, music videos,
                  live activities, dan creative content. Fokus kami adalah
                  membangun entertainment identity yang distinctive serta
                  experience yang mampu menciptakan meaningful connections
                  dengan audience.
                </p>

                <p className="mt-4 leading-8 text-text-muted">
                  Mulai dari artist concept dan music release hingga
                  visual content dan audience experience, division ini
                  menggabungkan storytelling, music, dan creative
                  production dalam satu ecosystem.
                </p>

                <Link
                  to="/idol"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-accent"
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
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="relative overflow-hidden rounded-3xl border border-brand-primary/20 bg-brand-primary/5 px-6 py-16 text-center sm:px-12">
            <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-3xl" />

            <div className="relative">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Let's Create Together
              </span>

              <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Punya ide yang siap diwujudkan?
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-text-secondary">
                Ceritakan apa yang sedang kamu bangun, ciptakan, atau
                bayangkan. Whether it's a digital product, creative
                service, entertainment project, atau sesuatu yang
                completely new, let's explore what we can create together.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5 hover:bg-brand-secondary"
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
