import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Gamepad2,
  Layers3,
  MonitorPlay,
  Palette,
  PenTool,
  Sparkles,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/common/SectionHeading'

const services = [
  {
    number: '01',
    title: 'Web Development',
    description:
      'Website dan web application yang dirancang untuk kebutuhan bisnis, personal brand, maupun digital platform.',
    icon: Code2,
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-violet-600/80 via-purple-600/50 to-transparent',
  },
  {
    number: '02',
    title: 'UI/UX Design',
    description:
      'Interface dan pengalaman pengguna yang terstruktur, intuitif, dan siap diterjemahkan menjadi produk digital.',
    icon: Layers3,
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-pink-600/80 via-fuchsia-600/50 to-transparent',
  },
  {
    number: '03',
    title: 'Graphic Design',
    description:
      'Identitas visual, promotional artwork, social media content, dan kebutuhan komunikasi visual lainnya.',
    icon: Palette,
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-purple-600/80 via-violet-600/50 to-transparent',
  },
  {
    number: '04',
    title: 'Digital Illustration',
    description:
      'Ilustrasi custom untuk karakter, campaign, merchandise, storytelling, dan berbagai kebutuhan visual.',
    icon: PenTool,
    image:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-fuchsia-600/80 via-pink-600/50 to-transparent',
  },
  {
    number: '05',
    title: 'Animation',
    description:
      'Motion graphic dan animasi untuk campaign, promotional content, visual storytelling, dan digital media.',
    icon: MonitorPlay,
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-violet-600/80 via-indigo-600/50 to-transparent',
  },
  {
    number: '06',
    title: 'Game Development',
    description:
      'Game experience dengan perpaduan gameplay, visual, interaction, dan storytelling yang sesuai konsep.',
    icon: Gamepad2,
    image:
      'https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-indigo-600/80 via-purple-600/50 to-transparent',
  },
  {
    number: '07',
    title: 'Creative Production',
    description:
      'Produksi digital untuk content, entertainment, talent, campaign, dan konsep kreatif yang lebih kompleks.',
    icon: Sparkles,
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-pink-600/80 via-purple-600/50 to-transparent',
  },
]

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative isolate overflow-hidden bg-bg-base py-24 lg:py-36"
    >
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div
          className="absolute left-1/2 top-[-280px] h-[650px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(236,72,153,0.12) 35%, transparent 70%)',
          }}
        />
      </div>

      {/* Aurora */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="servicesAuroraOne absolute -left-32 top-40 h-[420px] w-[420px] rounded-full bg-violet-600/[0.10] blur-[110px]" />

        <div className="servicesAuroraTwo absolute right-[-100px] top-[35%] h-[500px] w-[500px] rounded-full bg-pink-600/[0.08] blur-[120px]" />

        <div className="servicesAuroraThree absolute bottom-[-180px] left-[30%] h-[450px] w-[450px] rounded-full bg-purple-600/[0.08] blur-[120px]" />
      </div>

      {/* Grid */}
      <div className="servicesGrid pointer-events-none absolute inset-0 -z-10 opacity-[0.045]" />

      {/* Light beams */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="servicesBeamHorizontal absolute left-[-20%] top-[30%] h-px w-[140%] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

        <div className="servicesBeamHorizontal servicesBeamDelay absolute left-[-20%] top-[70%] h-px w-[140%] bg-gradient-to-r from-transparent via-pink-400/20 to-transparent" />

        <div className="servicesBeamVertical absolute left-[25%] top-[-20%] h-[140%] w-px bg-gradient-to-b from-transparent via-violet-400/20 to-transparent" />

        <div className="servicesBeamVertical servicesBeamVerticalDelay absolute left-[75%] top-[-20%] h-[140%] w-px bg-gradient-to-b from-transparent via-pink-400/15 to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <span className="servicesParticle servicesParticleOne absolute left-[12%] top-[22%] h-1 w-1 rounded-full bg-violet-300/50" />
        <span className="servicesParticle servicesParticleTwo absolute left-[78%] top-[18%] h-1.5 w-1.5 rounded-full bg-pink-300/40" />
        <span className="servicesParticle servicesParticleThree absolute left-[88%] top-[60%] h-1 w-1 rounded-full bg-violet-300/40" />
        <span className="servicesParticle servicesParticleFour absolute left-[18%] top-[78%] h-1.5 w-1.5 rounded-full bg-pink-300/30" />
        <span className="servicesParticle servicesParticleFive absolute left-[52%] top-[45%] h-1 w-1 rounded-full bg-white/30" />
      </div>

      {/* Decorative orbit */}
      <div className="pointer-events-none absolute right-[-180px] top-[15%] -z-10 h-[420px] w-[420px] rounded-full border border-white/[0.035]" />

      <div className="pointer-events-none absolute right-[-130px] top-[20%] -z-10 h-[320px] w-[320px] rounded-full border border-violet-400/[0.05]" />

      <div className="pointer-events-none absolute bottom-[5%] left-[-180px] -z-10 h-[360px] w-[360px] rounded-full border border-white/[0.03]" />

      {/* Content */}
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        {/* Heading */}
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.12] blur-[80px]" />

          <SectionHeading
            eyebrow="WHAT WE CREATE"
            title="Technology meets"
            highlight="creative production."
            description="From digital products and interfaces to visual experiences and entertainment, we turn ideas into digital works."
            align="center"
          />
        </div>

        {/* Service Cards */}
        <div className="mx-auto mt-14 grid max-w-[1180px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon

            return (
              <article
                key={service.title}
                className="group relative min-h-[285px] overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-black/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-violet-400/20 hover:shadow-violet-500/10"
              >
                {/* Image */}
                <img
                  src={service.image}
                  alt={service.title}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/55 transition-opacity duration-500 group-hover:bg-black/45" />

                {/* Gradient overlay */}
                <div
                  className={`absolute inset - 0 bg - gradient - to - t ${service.gradient} opacity - 70 transition - opacity duration - 500 group - hover: opacity - 90`}
                />

                {/* Bottom dark gradient */}
                <div className="absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Top metadata */}
                <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white/60 backdrop-blur-md">
                    {service.number}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/70 backdrop-blur-md transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                {/* Content */}
                <div className="absolute inset-x-5 bottom-5">
                  {/* Icon */}
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-white/15">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {service.title}
                  </h3>

                  <p className="mt-2 max-w-[330px] text-[13px] leading-5 text-white/65 transition-colors duration-300 group-hover:text-white/80">
                    {service.description}
                  </p>

                  <div className="mt-4 h-px w-10 bg-white/30 transition-all duration-500 group-hover:w-20 group-hover:bg-white/60" />
                </div>

                {/* Hover shine */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                {/* Inner border */}
                <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/[0.05]" />
              </article>
            )
          })}
        </div>

        {/* Conversion CTA */}
        <div className="mx-auto mt-14 flex max-w-[760px] flex-col items-center text-center">
          <div className="mb-5 flex items-center gap-2 rounded-full border border-violet-400/10 bg-violet-500/[0.05] px-4 py-2 text-xs text-white/55 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            <span>Have a different idea?</span>
          </div>

          <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Let&apos;s build something{' '}
            <span className="gradient-text">custom.</span>
          </h3>

          <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted">
            Tidak menemukan layanan yang tepat? Ceritakan kebutuhanmu dan kita
            bisa membahas scope, konsep, dan estimasi project terlebih dahulu.
          </p>

          <Link
            to="/contact"
            className="group mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:border-violet-400/30 hover:bg-violet-500/10"
          >
            Start a Project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style>{`
  .servicesGrid {
  background - image:
  linear - gradient(to right, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    linear - gradient(to bottom, rgba(255, 255, 255, 0.7) 1px, transparent 1px);
  background - size: 80px 80px;
  mask - image: linear - gradient(
    to bottom,
    transparent 0 %,
    black 15 %,
    black 80 %,
    transparent 100 %
          );
  animation: servicesGridMove 18s linear infinite;
}

        .servicesAuroraOne {
  animation: servicesAuroraFloatOne 14s ease -in -out infinite;
}

        .servicesAuroraTwo {
  animation: servicesAuroraFloatTwo 18s ease -in -out infinite;
}

        .servicesAuroraThree {
  animation: servicesAuroraFloatThree 16s ease -in -out infinite;
}

        .servicesBeamHorizontal {
  animation: servicesBeamHorizontalMove 9s ease -in -out infinite;
}

        .servicesBeamDelay {
  animation - delay: 4s;
}

        .servicesBeamVertical {
  animation: servicesBeamVerticalMove 12s ease -in -out infinite;
}

        .servicesBeamVerticalDelay {
  animation - delay: 5s;
}

        .servicesParticle {
  animation: servicesParticleFloat 5s ease -in -out infinite;
}

        .servicesParticleOne {
  animation - delay: 0s;
}

        .servicesParticleTwo {
  animation - delay: 1s;
}

        .servicesParticleThree {
  animation - delay: 2s;
}

        .servicesParticleFour {
  animation - delay: 3s;
}

        .servicesParticleFive {
  animation - delay: 1.5s;
}

@keyframes servicesGridMove {
          from {
    background - position: 0 0;
  }
          to {
    background - position: 80px 80px;
  }
}

@keyframes servicesAuroraFloatOne {
  0 %,
    100 % {
      transform: translate3d(0, 0, 0) scale(1);
    }
  50 % {
    transform: translate3d(80px, 40px, 0) scale(1.12);
  }
}

@keyframes servicesAuroraFloatTwo {
  0 %,
    100 % {
      transform: translate3d(0, 0, 0) scale(1);
    }
  50 % {
    transform: translate3d(-70px, -50px, 0) scale(1.08);
  }
}

@keyframes servicesAuroraFloatThree {
  0 %,
    100 % {
      transform: translate3d(0, 0, 0) scale(1);
    }
  50 % {
    transform: translate3d(50px, -60px, 0) scale(1.1);
  }
}

@keyframes servicesBeamHorizontalMove {
  0 %,
    100 % {
      transform: translateX(-5 %);
      opacity: 0.25;
    }
  50 % {
    transform: translateX(5 %);
    opacity: 0.65;
  }
}

@keyframes servicesBeamVerticalMove {
  0 %,
    100 % {
      transform: translateY(-4 %);
      opacity: 0.2;
    }
  50 % {
    transform: translateY(4 %);
    opacity: 0.55;
  }
}

@keyframes servicesParticleFloat {
  0 %,
    100 % {
      transform: translateY(0) scale(1);
            opacity: 0.25;
    }
  50 % {
    transform: translateY(-18px) scale(1.4);
            opacity: 0.8;
  }
}

@media(prefers - reduced - motion: reduce) {
          .servicesGrid,
          .servicesAuroraOne,
          .servicesAuroraTwo,
          .servicesAuroraThree,
          .servicesBeamHorizontal,
          .servicesBeamVertical,
          .servicesParticle {
    animation: none!important;
  }
}
`}</style>
    </section>
  )
}