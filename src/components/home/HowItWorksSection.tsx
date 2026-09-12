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

export function HowItWorksSection() {
    return (
        <section
            aria-labelledby="process-section-title"
            className="relative isolate overflow-hidden bg-bg-base py-24 lg:py-36"
        >
            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div className="pointer-events-none absolute inset-0 -z-20">
                <div
                    className="absolute left-1/2 top-[-260px] h-[620px] w-[850px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.10) 40%, transparent 70%)',
                    }}
                />
            </div>

            <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
                <div className="processAuroraOne absolute -left-40 top-[25%] h-[430px] w-[430px] rounded-full bg-violet-600/[0.08] blur-[120px]" />

                <div className="processAuroraTwo absolute -right-32 bottom-[5%] h-[500px] w-[500px] rounded-full bg-pink-600/[0.07] blur-[120px]" />

                <div className="processAuroraThree absolute left-[35%] top-[55%] h-[350px] w-[350px] rounded-full bg-purple-600/[0.06] blur-[110px]" />
            </div>

            {/* Grid */}

            <div className="processGrid pointer-events-none absolute inset-0 -z-10 opacity-[0.04]" />

            {/* Light beams */}

            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="processBeamHorizontal absolute left-[-20%] top-[28%] h-px w-[140%] bg-gradient-to-r from-transparent via-violet-400/25 to-transparent" />

                <div className="processBeamHorizontal processBeamDelay absolute left-[-20%] top-[75%] h-px w-[140%] bg-gradient-to-r from-transparent via-pink-400/20 to-transparent" />

                <div className="processBeamVertical absolute left-[30%] top-[-20%] h-[140%] w-px bg-gradient-to-b from-transparent via-violet-400/15 to-transparent" />

                <div className="processBeamVertical processBeamVerticalDelay absolute left-[70%] top-[-20%] h-[140%] w-px bg-gradient-to-b from-transparent via-pink-400/15 to-transparent" />
            </div>

            {/* Decorative rings */}

            <div className="pointer-events-none absolute left-[-190px] top-[20%] -z-10 h-[400px] w-[400px] rounded-full border border-white/[0.03]" />

            <div className="pointer-events-none absolute left-[-140px] top-[25%] -z-10 h-[300px] w-[300px] rounded-full border border-violet-400/[0.05]" />

            <div className="pointer-events-none absolute right-[-180px] bottom-[8%] -z-10 h-[420px] w-[420px] rounded-full border border-white/[0.03]" />

            {/* =========================================================
                CONTENT
            ========================================================== */}

            <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="relative mx-auto max-w-3xl text-center">

                    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.10] blur-[80px]" />

                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/20 bg-pink-500/[0.07] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-300 backdrop-blur">
                        <Sparkles
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                        />

                        <span>Simple Project Process</span>
                    </div>

                    <h2
                        id="process-section-title"
                        className="mt-7 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
                    >
                        From Your Idea
                        <br />

                        <span className="gradient-text">
                            To Something Real.
                        </span>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-text-muted sm:text-lg">
                        Kamu tidak perlu memahami proses teknisnya.
                        Cukup mulai dari kebutuhanmu, lalu ikuti langkahnya
                        satu per satu.
                    </p>
                </div>

                {/* =====================================================
                    PROCESS PANEL
                ====================================================== */}

                <div className="mx-auto mt-14 max-w-[1180px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-black/10 backdrop-blur-sm">

                    {/* Panel top */}

                    <div className="border-b border-white/[0.08] px-6 py-6 sm:px-8 lg:px-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                                    Your Journey
                                </p>

                                <p className="mt-2 text-sm text-white/55">
                                    Enam langkah sederhana untuk memulai project.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400 motion-reduce:animate-none" />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                                    Start With An Idea
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        DESKTOP
                    ================================================== */}

                    <div className="hidden lg:block">

                        <div className="relative px-10 py-12">

                            {/* Main line */}

                            <div
                                aria-hidden="true"
                                className="absolute left-[8%] right-[8%] top-[79px] h-px bg-gradient-to-r from-violet-500/40 via-white/10 to-pink-500/40"
                            />

                            {/* Progress glow */}

                            <div
                                aria-hidden="true"
                                className="absolute left-[8%] top-[78px] h-[3px] w-[22%] rounded-full bg-gradient-to-r from-violet-500/60 to-pink-500/40 blur-[2px]"
                            />

                            <div className="grid grid-cols-6 gap-5">
                                {steps.map((step, index) => {
                                    const Icon = step.icon

                                    return (
                                        <div
                                            key={step.number}
                                            className="processStep group relative"
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                            }}
                                        >
                                            {/* Icon */}

                                            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.10] bg-bg-base text-white/65 shadow-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:border-violet-400/30 group-hover:bg-violet-500/10 group-hover:text-violet-300 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">

                                                <Icon className="h-6 w-6" />

                                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-bg-base bg-violet-500 text-[9px] font-bold text-white">
                                                    {index + 1}
                                                </span>
                                            </div>

                                            {/* Content */}

                                            <div className="mt-7">
                                                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-violet-400">
                                                    STEP {step.number}
                                                </p>

                                                <h3 className="mt-3 min-h-[24px] text-sm font-semibold text-white">
                                                    {step.title}
                                                </h3>

                                                <p className="mt-3 text-xs leading-6 text-white/50">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        MOBILE
                    ================================================== */}

                    <div className="px-6 py-8 lg:hidden sm:px-8">

                        <div className="relative">

                            {/* Vertical line */}

                            <div
                                aria-hidden="true"
                                className="absolute bottom-8 left-7 top-8 w-px bg-gradient-to-b from-violet-500/50 via-white/10 to-pink-500/40"
                            />

                            <div className="space-y-8">
                                {steps.map((step, index) => {
                                    const Icon = step.icon

                                    return (
                                        <div
                                            key={step.number}
                                            className="group relative grid grid-cols-[56px_1fr] gap-5"
                                        >
                                            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.10] bg-bg-base text-white/65">
                                                <Icon className="h-5 w-5" />

                                                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-bg-base bg-violet-500 text-[9px] font-bold text-white">
                                                    {index + 1}
                                                </span>
                                            </div>

                                            <div className="pb-1">
                                                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-violet-400">
                                                    STEP {step.number}
                                                </p>

                                                <h3 className="mt-2 text-base font-semibold text-white">
                                                    {step.title}
                                                </h3>

                                                <p className="mt-2 text-sm leading-7 text-white/50">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        PAYMENT INFO
                    ================================================== */}

                    <div className="border-t border-white/[0.08] bg-white/[0.02] px-6 py-7 sm:px-8 lg:px-10">

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                                    <WalletCards className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        No payment when requesting a quote.
                                    </p>

                                    <p className="mt-1 max-w-2xl text-sm leading-6 text-white/45">
                                        Harga final dan DP baru ditentukan setelah
                                        kebutuhan project direview dan quotation diberikan.
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/services"
                                className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black shadow-xl outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                            >
                                <span>Choose a Service</span>

                                <ArrowRight
                                    aria-hidden="true"
                                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom statement */}

                <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.08] pt-7 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-white/40">
                        No complicated process. Just a clear path forward.
                    </p>

                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/25">
                        39 — Sankyuu
                    </span>
                </div>
            </div>

            {/* =========================================================
                ANIMATIONS
            ========================================================== */}

            <style>{`
                .processGrid {
                    background-image:
                        linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px);
                    background-size: 80px 80px;
                    mask-image: linear-gradient(
                        to bottom,
                        transparent 0%,
                        black 15%,
                        black 80%,
                        transparent 100%
                    );
                    animation: processGridMove 18s linear infinite;
                }

                .processAuroraOne {
                    animation: processAuroraFloatOne 14s ease-in-out infinite;
                }

                .processAuroraTwo {
                    animation: processAuroraFloatTwo 18s ease-in-out infinite;
                }

                .processAuroraThree {
                    animation: processAuroraFloatThree 16s ease-in-out infinite;
                }

                .processBeamHorizontal {
                    animation: processBeamHorizontalMove 9s ease-in-out infinite;
                }

                .processBeamDelay {
                    animation-delay: 4s;
                }

                .processBeamVertical {
                    animation: processBeamVerticalMove 12s ease-in-out infinite;
                }

                .processBeamVerticalDelay {
                    animation-delay: 5s;
                }

                .processStep {
                    animation: processStepReveal 0.7s ease-out both;
                }

                @keyframes processGridMove {
                    from {
                        background-position: 0 0;
                    }

                    to {
                        background-position: 80px 80px;
                    }
                }

                @keyframes processAuroraFloatOne {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(70px, 40px, 0) scale(1.12);
                    }
                }

                @keyframes processAuroraFloatTwo {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(-70px, -50px, 0) scale(1.08);
                    }
                }

                @keyframes processAuroraFloatThree {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(50px, -60px, 0) scale(1.1);
                    }
                }

                @keyframes processBeamHorizontalMove {
                    0%,
                    100% {
                        transform: translateX(-5%);
                        opacity: 0.2;
                    }

                    50% {
                        transform: translateX(5%);
                        opacity: 0.6;
                    }
                }

                @keyframes processBeamVerticalMove {
                    0%,
                    100% {
                        transform: translateY(-4%);
                        opacity: 0.15;
                    }

                    50% {
                        transform: translateY(4%);
                        opacity: 0.5;
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

                @media (prefers-reduced-motion: reduce) {
                    .processGrid,
                    .processAuroraOne,
                    .processAuroraTwo,
                    .processAuroraThree,
                    .processBeamHorizontal,
                    .processBeamVertical,
                    .processStep {
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    )
}