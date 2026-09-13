import { Link } from 'react-router-dom'
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    Lightbulb,
    MessageSquareText,
    Rocket,
    Sparkles,
    WalletCards,
} from 'lucide-react'

const steps = [
    {
        number: '01',
        icon: Lightbulb,
        title: 'Tell Us',
        description:
            'Ceritakan ide, kebutuhan, atau project yang ingin kamu wujudkan bersama 39Production.',
    },
    {
        number: '02',
        icon: MessageSquareText,
        title: 'Request Quote',
        description:
            'Kirim request tanpa pembayaran. Di tahap ini belum ada harga final dan belum ada order.',
    },
    {
        number: '03',
        icon: FileText,
        title: 'Get Your Quote',
        description:
            'Kami review kebutuhan dan scope project, lalu memberikan quotation dengan harga final dan DP.',
    },
    {
        number: '04',
        icon: CheckCircle2,
        title: 'Accept',
        description:
            'Review quotation yang diberikan. Jika sudah sesuai, kamu dapat menerima penawaran tersebut.',
    },
    {
        number: '05',
        icon: WalletCards,
        title: 'Pay DP',
        description:
            'Setelah quotation diterima, lakukan pembayaran DP sesuai jumlah yang tercantum.',
    },
    {
        number: '06',
        icon: Rocket,
        title: 'We Build',
        description:
            'Setelah DP terkonfirmasi, project mulai dikerjakan sesuai scope dan kesepakatan.',
    },
]

const accentStyles = [
    {
        icon: 'bg-violet-50 text-violet-600 ring-violet-100',
        number: 'bg-violet-600 text-white',
        line: 'bg-violet-200',
    },
    {
        icon: 'bg-pink-50 text-pink-600 ring-pink-100',
        number: 'bg-pink-500 text-white',
        line: 'bg-pink-200',
    },
    {
        icon: 'bg-purple-50 text-purple-600 ring-purple-100',
        number: 'bg-purple-600 text-white',
        line: 'bg-purple-200',
    },
    {
        icon: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
        number: 'bg-indigo-600 text-white',
        line: 'bg-indigo-200',
    },
    {
        icon: 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100',
        number: 'bg-fuchsia-600 text-white',
        line: 'bg-fuchsia-200',
    },
    {
        icon: 'bg-violet-50 text-violet-600 ring-violet-100',
        number: 'bg-violet-600 text-white',
        line: 'bg-violet-200',
    },
]

export function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            aria-labelledby="process-section-title"
            className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
        >
            {/* =========================================================
          SUBTLE BACKGROUND
      ========================================================== */}

            <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
                <div className="processGlow processGlowOne absolute -left-40 top-[10%] h-[420px] w-[420px] rounded-full" />

                <div className="processGlow processGlowTwo absolute -right-40 top-[48%] h-[460px] w-[460px] rounded-full" />

                <div className="processGlow processGlowThree absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full" />
            </div>

            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="processGrid absolute inset-0" />
            </div>

            {/* Subtle moving accent */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="processLightLine processLightLineOne absolute left-[-20%] top-[28%] h-px w-[140%]" />

                <div className="processLightLine processLightLineTwo absolute left-[-20%] top-[73%] h-px w-[140%]" />
            </div>

            {/* =========================================================
          CONTENT
      ========================================================== */}

            <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
                {/* =======================================================
            HEADER
        ======================================================== */}

                <div className="mx-auto max-w-3xl text-center">
                    <div className="processEyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2">
                        <Sparkles className="h-3.5 w-3.5 text-violet-600" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 sm:text-[11px]">
                            HOW IT WORKS
                        </span>
                    </div>

                    <h2
                        id="process-section-title"
                        className="text-3xl font-semibold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl"
                    >
                        From your idea
                        <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                            to something real.
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base sm:leading-7">
                        Kamu tidak perlu memahami proses teknisnya. Cukup mulai dari
                        kebutuhanmu, lalu kami membantu mengarahkan project dari request
                        sampai mulai dikerjakan.
                    </p>
                </div>

                {/* =======================================================
            PROCESS INTRO
        ======================================================== */}

                <div className="mx-auto mt-12 max-w-[1180px] rounded-[26px] border border-neutral-200 bg-neutral-50/80 p-5 sm:mt-14 sm:p-7 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                                A clear process
                            </p>

                            <h3 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                                Know what happens before your project starts.
                            </h3>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                                Kami memisahkan proses diskusi, quotation, approval, dan
                                pembayaran agar kamu bisa memahami project terlebih dahulu
                                sebelum pekerjaan dimulai.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60 motion-reduce:animate-none" />

                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500" />
                            </span>

                            <span className="text-xs font-medium text-neutral-600">
                                Start with an idea
                            </span>
                        </div>
                    </div>
                </div>

                {/* =======================================================
            PROCESS STEPS
        ======================================================== */}

                <div className="mx-auto mt-8 max-w-[1180px]">
                    {/* Desktop */}
                    <div className="relative hidden lg:block">
                        {/* Connecting line */}
                        <div
                            aria-hidden="true"
                            className="absolute left-[8%] right-[8%] top-[34px] h-px bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200"
                        />

                        <div className="grid grid-cols-6 gap-5">
                            {steps.map((step, index) => {
                                const Icon = step.icon
                                const accent =
                                    accentStyles[index % accentStyles.length]

                                return (
                                    <article
                                        key={step.number}
                                        className="processStep group relative"
                                        style={{
                                            animationDelay: `${index * 90}ms`,
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className="relative z-10 mx-auto flex w-fit">
                                            <div
                                                className={`flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-white ring-1 ${accent.icon} shadow-[0_8px_25px_rgba(15,23,42,0.06)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_15px_30px_rgba(124,58,237,0.10)]`}
                                            >
                                                <Icon
                                                    className="h-6 w-6"
                                                    strokeWidth={1.8}
                                                />
                                            </div>

                                            <span
                                                className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full ${accent.number} text-[9px] font-bold shadow-sm ring-4 ring-white`}
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="mt-6 text-center">
                                            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-neutral-400">
                                                STEP {step.number}
                                            </p>

                                            <h3 className="mt-2 text-[15px] font-semibold text-neutral-950">
                                                {step.title}
                                            </h3>

                                            <p className="mt-3 text-xs leading-6 text-neutral-500">
                                                {step.description}
                                            </p>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tablet */}
                    <div className="hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:hidden">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const accent =
                                accentStyles[index % accentStyles.length]

                            return (
                                <article
                                    key={step.number}
                                    className="processStep group rounded-[22px] border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                                    style={{
                                        animationDelay: `${index * 90}ms`,
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${accent.icon}`}
                                        >
                                            <Icon
                                                className="h-5 w-5"
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-neutral-400">
                                            {step.number}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 text-base font-semibold text-neutral-950">
                                        {step.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                                        {step.description}
                                    </p>
                                </article>
                            )
                        })}
                    </div>

                    {/* Mobile */}
                    <div className="relative sm:hidden">
                        {/* Vertical timeline */}
                        <div
                            aria-hidden="true"
                            className="absolute bottom-7 left-[26px] top-7 w-px bg-gradient-to-b from-violet-200 via-purple-200 to-pink-200"
                        />

                        <div className="space-y-5">
                            {steps.map((step, index) => {
                                const Icon = step.icon
                                const accent =
                                    accentStyles[index % accentStyles.length]

                                return (
                                    <article
                                        key={step.number}
                                        className="processStep group relative grid grid-cols-[52px_1fr] gap-4"
                                        style={{
                                            animationDelay: `${index * 90}ms`,
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className="relative z-10">
                                            <div
                                                className={`flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-white ring-1 ${accent.icon} shadow-[0_5px_18px_rgba(15,23,42,0.05)]`}
                                            >
                                                <Icon
                                                    className="h-5 w-5"
                                                    strokeWidth={1.8}
                                                />
                                            </div>

                                            <span
                                                className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full ${accent.number} text-[8px] font-bold ring-2 ring-white`}
                                            >
                                                {index + 1}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="rounded-[20px] border border-neutral-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.035)]">
                                            <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-neutral-400">
                                                STEP {step.number}
                                            </p>

                                            <h3 className="mt-2 text-base font-semibold text-neutral-950">
                                                {step.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                                                {step.description}
                                            </p>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* =======================================================
            PAYMENT INFORMATION
        ======================================================== */}

                <div className="mx-auto mt-8 max-w-[1180px] rounded-[24px] border border-violet-100 bg-violet-50/60 p-5 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                                <WalletCards
                                    className="h-5 w-5"
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-neutral-900">
                                    No payment when requesting a quote.
                                </p>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                                    Harga final dan DP baru ditentukan setelah kebutuhan project
                                    direview dan quotation diberikan. Kamu bisa melihat dan
                                    mempertimbangkannya terlebih dahulu.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/contact"
                            className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-200 sm:w-auto"
                        >
                            Request a Quote

                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* =======================================================
            BOTTOM STATEMENT
        ======================================================== */}

                <div className="mt-10 flex flex-col gap-3 border-t border-neutral-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-neutral-500">
                        No complicated process. Just a clear path forward.
                    </p>

                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                        39 — Sankyuu Production
                    </span>
                </div>
            </div>

            {/* =========================================================
          ANIMATIONS
      ========================================================== */}

            <style>{`
        .processGlow {
          filter: blur(90px);
          opacity: 0.45;
        }

        .processGlowOne {
          background: rgba(139, 92, 246, 0.045);
          animation: processGlowOne 16s ease-in-out infinite;
        }

        .processGlowTwo {
          background: rgba(236, 72, 153, 0.035);
          animation: processGlowTwo 19s ease-in-out infinite;
        }

        .processGlowThree {
          background: rgba(124, 58, 237, 0.03);
          animation: processGlowThree 18s ease-in-out infinite;
        }

        .processGrid {
          background-image:
            linear-gradient(
              to right,
              rgba(15, 23, 42, 0.022) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0.022) 1px,
              transparent 1px
            );

          background-size: 76px 76px;

          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 14%,
              black 82%,
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 14%,
              black 82%,
              transparent
            );

          animation: processGridMove 24s linear infinite;
        }

        .processLightLine {
          background: linear-gradient(
            to right,
            transparent,
            rgba(139, 92, 246, 0.07),
            transparent
          );

          opacity: 0.5;
          animation: processLineMove 11s ease-in-out infinite;
        }

        .processLightLineTwo {
          background: linear-gradient(
            to right,
            transparent,
            rgba(236, 72, 153, 0.06),
            transparent
          );

          animation-delay: 4s;
        }

        .processEyebrow {
          animation: processEyebrowIn 0.7s ease-out both;
        }

        .processStep {
          animation: processStepReveal 0.7s ease-out both;
        }

        @keyframes processEyebrowIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes processStepReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes processGridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 76px 76px;
          }
        }

        @keyframes processGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(45px, 30px, 0);
          }
        }

        @keyframes processGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-45px, -30px, 0);
          }
        }

        @keyframes processGlowThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(35px, -35px, 0);
          }
        }

        @keyframes processLineMove {
          0%,
          100% {
            transform: translateX(-3%);
            opacity: 0.15;
          }

          50% {
            transform: translateX(3%);
            opacity: 0.55;
          }
        }

        @media (max-width: 640px) {
          .processGlow {
            opacity: 0.3;
          }

          .processGrid {
            background-size: 56px 56px;
          }

          .processLightLine {
            opacity: 0.2;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .processGlow,
          .processGrid,
          .processLightLine,
          .processEyebrow,
          .processStep {
            animation: none !important;
          }
        }
      `}</style>
        </section>
    )
}