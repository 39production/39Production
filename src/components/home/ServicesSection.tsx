import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Gamepad2,
  Layers3,
  MonitorPlay,
  MoveUpRight,
  Palette,
  PenTool,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const services = [
  {
    number: '01',
    title: 'Web Development',
    shortTitle: 'Technology',
    description:
      'Build websites and web applications yang fast, structured, dan siap dikembangkan sesuai kebutuhan bisnis atau digital product.',
    icon: Code2,
    className: 'lg:col-span-2',
  },
  {
    number: '02',
    title: 'UI/UX Design',
    shortTitle: 'Design',
    description:
      'From wireframe to final interface. Kami merancang user experience yang clear, intuitive, dan tetap punya karakter visual.',
    icon: Layers3,
    className: 'lg:col-span-1',
  },
  {
    number: '03',
    title: 'Graphic Design',
    shortTitle: 'Visual',
    description:
      'Visual identity, campaign, social media, hingga promotional material untuk membuat brand tampil lebih konsisten dan memorable.',
    icon: Palette,
    className: 'lg:col-span-1',
  },
  {
    number: '04',
    title: 'Digital Illustration',
    shortTitle: 'Illustration',
    description:
      'Custom illustration untuk character, campaign, merchandise, storytelling, atau visual direction yang membutuhkan sentuhan khusus.',
    icon: PenTool,
    className: 'lg:col-span-2',
  },
  {
    number: '05',
    title: 'Animation',
    shortTitle: 'Motion',
    description:
      'Motion graphics and animation untuk promotional content, storytelling, campaign, maupun digital media yang lebih dynamic.',
    icon: MonitorPlay,
    className: 'lg:col-span-1',
  },
  {
    number: '06',
    title: 'Game Development',
    shortTitle: 'Interactive',
    description:
      'Game experience yang menggabungkan gameplay, visual, interaction, dan storytelling menjadi satu konsep yang engaging.',
    icon: Gamepad2,
    className: 'lg:col-span-1',
  },
  {
    number: '07',
    title: 'Creative Production',
    shortTitle: 'Production',
    description:
      'End-to-end digital production untuk content, entertainment, talent, campaign, dan creative projects lintas bidang.',
    icon: Sparkles,
    className: 'lg:col-span-2',
  },
]

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-white text-zinc-950"
    >
      {/* Background */}
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

        <div className="absolute right-[9%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />

        <div className="absolute bottom-[20%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
      </div>

      {/* Main */}
      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
        {/* Section Header */}
        <div className="border-t border-black/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                39Production / What We Do
              </span>
            </div>

            <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
              39 / 03
            </span>
          </div>
        </div>

        {/* Intro */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16">
          <div className="max-w-md">
            <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
              One team, multiple disciplines. Kami menggabungkan technology,
              design, dan creative production untuk membangun sesuatu yang
              punya purpose.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <span className="h-px w-10 bg-[#7C3AED]" />

              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Digital / Creative / Entertainment
              </span>
            </div>
          </div>

          <div className="max-w-5xl">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
              What We Build
            </p>

            <h2 className="mt-3 text-[clamp(2.7rem,5vw,5.2rem)] font-black leading-[0.9] tracking-[-0.065em] text-black">
              Ideas into
              <span className="text-neutral-300"> digital works.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
              Dari sebuah konsep sampai ready to launch. Pilih kebutuhanmu,
              atau{' '}
              <span className="font-semibold text-black">
                let&apos;s figure it out together.
              </span>
            </p>
          </div>
        </div>

        {/* Capability Header */}
        <div className="mt-16 flex flex-col gap-5 border-t border-black/10 pt-7 sm:mt-20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
              Our Capabilities
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
              Different disciplines.
              <span className="text-neutral-300"> One production team.</span>
            </h3>
          </div>

          <Link
            to="/contact"
            className="group inline-flex w-fit items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:text-[#7C3AED]"
          >
            Discuss a Project

            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="mt-8 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon

            return (
              <Link
                key={service.title}
                to="/contact"
                className={`group bg-white ${service.className}`}
              >
                <article className="relative flex h-full min-h-[245px] flex-col justify-between overflow-hidden p-6 transition-colors duration-300 hover:bg-neutral-50 sm:p-7 lg:min-h-[260px]">
                  {/* Hover Accent */}
                  <div className="absolute left-0 top-0 h-0.5 w-0 bg-[#7C3AED] transition-all duration-500 group-hover:w-full" />

                  {/* Top */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center border border-black/10 text-black transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                        <Icon
                          className="h-[19px] w-[19px]"
                          strokeWidth={1.7}
                        />
                      </div>

                      <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-neutral-300 transition-colors duration-300 group-hover:text-[#7C3AED]">
                        {service.number}
                      </span>
                    </div>

                    <p className="mt-7 text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      {service.shortTitle}
                    </p>

                    <h3 className="mt-2 max-w-md text-xl font-black tracking-[-0.04em] text-black transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                      {service.title}
                    </h3>

                    <p className="mt-3 max-w-xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                      {service.description}
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-4">
                    <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400 transition-colors duration-300 group-hover:text-black">
                      Explore Service
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-neutral-300 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                      <ArrowUpRight
                        size={13}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        {/* Bottom Statement */}
        <div className="mt-14 border-t border-black/10 pt-8 sm:mt-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                  Beyond The Services
                </p>
              </div>

              <h3 className="mt-4 max-w-3xl text-3xl font-black leading-[0.94] tracking-[-0.05em] text-black sm:text-4xl">
                Not every project
                <span className="text-neutral-300"> fits a category.</span>
              </h3>

              <p className="mt-4 max-w-xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                Kalau kebutuhanmu belum ada di list, tell us what you have in
                mind. Kami bisa mulai dari problem dan tujuan, bukan hanya dari
                service.
              </p>
            </div>

            <Link
              to="/contact"
              className="group inline-flex w-fit items-center gap-3 rounded-full bg-black px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED]"
            >
              Start a Project

              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Section Signature */}
        <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="font-mono text-[8px] font-bold tracking-[0.18em] text-neutral-400">
            39PRODUCTION
          </span>

          <span className="hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:block">
            Digital / Creative / Entertainment
          </span>

          <MoveUpRight
            size={13}
            className="text-neutral-400"
          />
        </div>
      </div>
    </section>
  )
}