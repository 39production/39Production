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

const services = [
  {
    number: '01',
    title: 'Web Development',
    shortTitle: 'Web',
    description:
      'Website dan web application untuk bisnis, brand, startup, maupun kebutuhan digital yang membutuhkan solusi yang terstruktur.',
    icon: Code2,
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85',
    accent: 'violet',
  },
  {
    number: '02',
    title: 'UI/UX Design',
    shortTitle: 'Design',
    description:
      'Perancangan interface dan user experience yang membantu produk digital menjadi lebih jelas, mudah digunakan, dan siap dikembangkan.',
    icon: Layers3,
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85',
    accent: 'pink',
  },
  {
    number: '03',
    title: 'Graphic Design',
    shortTitle: 'Visual',
    description:
      'Kebutuhan visual untuk brand, campaign, social media, promotional material, dan komunikasi kreatif.',
    icon: Palette,
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=85',
    accent: 'purple',
  },
  {
    number: '04',
    title: 'Digital Illustration',
    shortTitle: 'Illustration',
    description:
      'Ilustrasi custom untuk karakter, campaign, merchandise, storytelling, maupun kebutuhan visual khusus.',
    icon: PenTool,
    image:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=85',
    accent: 'fuchsia',
  },
  {
    number: '05',
    title: 'Animation',
    shortTitle: 'Motion',
    description:
      'Motion graphic dan animasi untuk promotional content, campaign, storytelling, dan media digital.',
    icon: MonitorPlay,
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
    accent: 'indigo',
  },
  {
    number: '06',
    title: 'Game Development',
    shortTitle: 'Game',
    description:
      'Pengembangan game dengan kombinasi gameplay, visual, interaction, dan storytelling sesuai konsep.',
    icon: Gamepad2,
    image:
      'https://images.unsplash.com/photo-1556438064-2d7646166914?auto=format&fit=crop&w=1200&q=85',
    accent: 'violet',
  },
  {
    number: '07',
    title: 'Creative Production',
    shortTitle: 'Creative',
    description:
      'Produksi digital untuk content, entertainment, campaign, talent, maupun konsep kreatif yang membutuhkan eksekusi lintas bidang.',
    icon: Sparkles,
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
    accent: 'pink',
  },
]

function getAccent(accent: string) {
  switch (accent) {
    case 'pink':
      return {
        icon: 'bg-pink-50 text-pink-600 ring-pink-100',
        badge: 'bg-pink-50 text-pink-700 border-pink-100',
        line: 'bg-pink-500',
      }

    case 'purple':
      return {
        icon: 'bg-purple-50 text-purple-600 ring-purple-100',
        badge: 'bg-purple-50 text-purple-700 border-purple-100',
        line: 'bg-purple-500',
      }

    case 'fuchsia':
      return {
        icon: 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100',
        badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
        line: 'bg-fuchsia-500',
      }

    case 'indigo':
      return {
        icon: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        line: 'bg-indigo-500',
      }

    default:
      return {
        icon: 'bg-violet-50 text-violet-600 ring-violet-100',
        badge: 'bg-violet-50 text-violet-700 border-violet-100',
        line: 'bg-violet-500',
      }
  }
}

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="servicesGlow servicesGlowOne absolute -left-40 top-16 h-[420px] w-[420px] rounded-full" />

        <div className="servicesGlow servicesGlowTwo absolute -right-40 top-[42%] h-[460px] w-[460px] rounded-full" />

        <div className="servicesGlow servicesGlowThree absolute bottom-[-180px] left-[38%] h-[420px] w-[420px] rounded-full" />
      </div>

      {/* Very subtle moving lines */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="servicesLine servicesLineOne absolute left-[-15%] top-[30%] h-px w-[130%]" />

        <div className="servicesLine servicesLineTwo absolute left-[-15%] top-[72%] h-px w-[130%]" />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
        {/* =======================================================
            SECTION HEADER
        ======================================================== */}

        <div className="mx-auto max-w-3xl text-center">
          <div className="servicesEyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

            <span className="text-[10px] font-semibold tracking-[0.18em] text-violet-700 sm:text-[11px]">
              WHAT WE DO
            </span>
          </div>

          <h2 className="text-3xl font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
            Digital solutions for
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              ideas that matter.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
            39Production membantu mengubah ide menjadi website, product
            experience, visual, dan digital content yang siap digunakan.
          </p>
        </div>

        {/* =======================================================
            SERVICE INTRO
        ======================================================== */}

        <div className="mx-auto mt-12 max-w-[1180px] rounded-[26px] border border-neutral-200 bg-neutral-50/80 p-5 sm:mt-14 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                One creative team
              </p>

              <h3 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                Technology, design, and creative production in one place.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
                Kamu tidak harus menentukan semuanya dari awal. Ceritakan
                kebutuhan dan tujuanmu, lalu kami bantu menentukan pendekatan
                yang paling sesuai untuk project tersebut.
              </p>
            </div>

            <Link
              to="/contact"
              className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 sm:w-auto"
            >
              Discuss Your Project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* =======================================================
            SERVICES
        ======================================================== */}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            const accent = getAccent(service.accent)

            return (
              <article
                key={service.title}
                className="serviceCard group relative overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.07)]"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />

                  {/* Gentle white fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                  {/* Number */}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] text-neutral-700 shadow-sm backdrop-blur-sm">
                      {service.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-5 sm:p-6">
                  {/* Small icon */}
                  <div
                    className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accent.icon} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${accent.badge}`}
                      >
                        {service.shortTitle}
                      </span>

                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-950 sm:text-xl">
                        {service.title}
                      </h3>
                    </div>

                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-all duration-300 group-hover:border-violet-200 group-hover:text-violet-600">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  <p className="mt-3 text-[13px] leading-[1.7] text-neutral-500">
                    {service.description}
                  </p>

                  {/* Bottom line */}
                  <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                      39Production
                    </span>

                    <div
                      className={`h-1 w-8 rounded-full ${accent.line} transition-all duration-500 group-hover:w-14`}
                    />
                  </div>
                </div>

                {/* Very subtle shine */}
                <div className="serviceShine pointer-events-none absolute inset-y-0 left-0 w-[35%] -translate-x-[180%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-18deg]" />
              </article>
            )
          })}
        </div>

        {/* =======================================================
            BOTTOM CTA
        ======================================================== */}

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />

            <span className="text-xs font-medium text-neutral-600">
              Have something different in mind?
            </span>
          </div>

          <h3 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Let&apos;s create the right solution
            <span className="text-violet-600"> for your idea.</span>
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            Tidak menemukan layanan yang persis sesuai? Tidak masalah.
            Ceritakan kebutuhanmu dan kita bisa membahas solusi yang paling
            masuk akal untuk project tersebut.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              to="/contact"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-200 sm:w-auto"
            >
              Start a Project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .servicesGlow {
          filter: blur(90px);
          opacity: 0.5;
        }

        .servicesGlowOne {
          background: rgba(139, 92, 246, 0.045);
          animation: servicesGlowOne 16s ease-in-out infinite;
        }

        .servicesGlowTwo {
          background: rgba(236, 72, 153, 0.035);
          animation: servicesGlowTwo 19s ease-in-out infinite;
        }

        .servicesGlowThree {
          background: rgba(124, 58, 237, 0.03);
          animation: servicesGlowThree 18s ease-in-out infinite;
        }

        .servicesLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.08),
            transparent
          );
          opacity: 0.5;
          animation: servicesLineMove 10s ease-in-out infinite;
        }

        .servicesLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.07),
            transparent
          );
          animation-delay: 3.5s;
        }

        .servicesEyebrow {
          animation: servicesEyebrowIn 0.7s ease-out both;
        }

        .serviceShine {
          opacity: 0;
          transition:
            transform 1s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.3s ease;
        }

        .serviceCard:hover .serviceShine {
          opacity: 1;
          transform: translateX(380%);
        }

        @keyframes servicesEyebrowIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes servicesGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(50px, 30px, 0);
          }
        }

        @keyframes servicesGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, -30px, 0);
          }
        }

        @keyframes servicesGlowThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(35px, -35px, 0);
          }
        }

        @keyframes servicesLineMove {
          0%,
          100% {
            transform: translateX(-3%);
            opacity: 0.15;
          }

          50% {
            transform: translateX(3%);
            opacity: 0.5;
          }
        }

        @media (max-width: 640px) {
          .servicesGlow {
            opacity: 0.35;
          }

          .servicesLine {
            opacity: 0.2;
          }

          .serviceShine {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .servicesGlow,
          .servicesLine,
          .servicesEyebrow {
            animation: none !important;
          }

          .serviceShine {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}