import { Link } from 'react-router-dom'
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    FileCheck2,
    MessageCircle,
    ReceiptText,
    Sparkles,
} from 'lucide-react'

const trustPoints = [
    {
        number: '01',
        icon: FileCheck2,
        title: 'Start With The Brief',
        description:
            'Kebutuhan dan scope project dibahas terlebih dahulu agar kedua pihak memahami apa yang akan dikerjakan.',
        label: 'Clarity',
        accent: 'violet',
    },
    {
        number: '02',
        icon: MessageCircle,
        title: 'Discuss Before Commit',
        description:
            'Untuk project custom, kamu bisa mengirim Request Quote tanpa harus langsung menentukan atau membayar harga.',
        label: 'Communication',
        accent: 'cyan',
    },
    {
        number: '03',
        icon: ReceiptText,
        title: 'See The Final Quote',
        description:
            'Setelah kebutuhan direview, harga final dan detail DP diberikan melalui quotation sebelum kamu memutuskan.',
        label: 'Transparency',
        accent: 'pink',
    },
    {
        number: '04',
        icon: BadgeCheck,
        title: 'You Approve The Project',
        description:
            'Kamu memiliki kesempatan untuk meninjau quotation terlebih dahulu sebelum menerima dan melanjutkan ke pembayaran DP.',
        label: 'Approval',
        accent: 'amber',
    },
]

const processSteps = [
    {
        number: '01',
        title: 'Request',
        description: 'Ceritakan kebutuhan',
    },
    {
        number: '02',
        title: 'Review',
        description: 'Kami memahami scope',
    },
    {
        number: '03',
        title: 'Quote',
        description: 'Harga final diberikan',
    },
    {
        number: '04',
        title: 'Approve',
        description: 'Kamu menentukan lanjut',
    },
]

function getAccentClasses(accent: string) {
    switch (accent) {
        case 'cyan':
            return {
                icon: 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-100 group-hover:border-cyan-200',
                glow: 'bg-cyan-400/10',
                line: 'from-cyan-400',
                number: 'text-cyan-600/60',
            }

        case 'pink':
            return {
                icon: 'bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-100 group-hover:border-pink-200',
                glow: 'bg-pink-400/10',
                line: 'from-pink-400',
                number: 'text-pink-600/60',
            }

        case 'amber':
            return {
                icon: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100 group-hover:border-amber-200',
                glow: 'bg-amber-400/10',
                line: 'from-amber-400',
                number: 'text-amber-600/60',
            }

        default:
            return {
                icon: 'bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-100 group-hover:border-violet-200',
                glow: 'bg-violet-400/10',
                line: 'from-violet-500',
                number: 'text-violet-600/60',
            }
    }
}

export function TrustSection() {
    return (
        <section
            aria-labelledby="trust-section-title"
            className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-32"
        >
            {/* =========================================================
                SUBTLE BACKGROUND
            ========================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
                {/* Soft purple accent */}
                <div className="trustSoftGlow absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-100/70 blur-[120px]" />

                {/* Soft pink accent */}
                <div className="trustSoftGlowTwo absolute -right-32 top-[35%] h-[420px] w-[420px] rounded-full bg-pink-100/50 blur-[120px]" />

                {/* Very subtle grid */}
                <div className="trustGrid absolute inset-0 opacity-[0.025]" />

                {/* Small moving light */}
                <div className="trustLight absolute left-0 top-[28%] h-px w-[35%] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />

                <div
                    className="trustLight trustLightDelay absolute right-0 top-[72%] h-px w-[30%] bg-gradient-to-l from-transparent via-pink-400/20 to-transparent"
                />
            </div>

            {/* =========================================================
                CONTENT
            ========================================================== */}

            <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">

                {/* =====================================================
                    INTRO
                ====================================================== */}

                <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">

                    {/* =================================================
                        LEFT — INTRODUCTION
                    ================================================== */}

                    <div className="relative">

                        <div
                            aria-hidden="true"
                            className="absolute -left-8 top-0 h-40 w-40 rounded-full bg-violet-100/60 blur-[80px]"
                        />

                        <div className="relative">

                            {/* Label */}

                            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                                <Sparkles
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5"
                                />

                                <span>Why 39Production</span>
                            </div>

                            {/* Heading */}

                            <h2
                                id="trust-section-title"
                                className="mt-6 max-w-xl font-display text-4xl font-bold leading-[1.06] tracking-tight text-neutral-950 sm:text-5xl lg:text-[3.6rem]"
                            >
                                A clearer way to
                                <br className="hidden sm:block" />

                                <span className="gradient-text">
                                    {' '}build together.
                                </span>
                            </h2>

                            {/* Description */}

                            <p className="mt-6 max-w-lg text-[15px] leading-7 text-neutral-600 sm:text-base sm:leading-8">
                                Project yang baik bukan hanya tentang hasil akhir.
                                Proses yang jelas membantu ide berkembang menjadi
                                sesuatu yang benar-benar sesuai kebutuhan.
                            </p>

                            {/* Trust statement */}

                            <div className="mt-8 flex items-start gap-3.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50">
                                    <CheckCircle2 className="h-4 w-4 text-violet-600" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                                        Customer-first process
                                    </p>

                                    <p className="mt-1 text-sm text-neutral-600">
                                        Understand first. Quote clearly. Build together.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* =================================================
                        RIGHT — APPROACH CARD
                    ================================================== */}

                    <div className="relative">

                        <div className="trustApproachCard relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8 lg:p-9">

                            {/* Subtle top accent */}

                            <div
                                aria-hidden="true"
                                className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"
                            />

                            {/* Decorative circle */}

                            <div
                                aria-hidden="true"
                                className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-100/70 blur-[80px]"
                            />

                            <div
                                aria-hidden="true"
                                className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-pink-100/50 blur-[80px]"
                            />

                            {/* Top metadata */}

                            <div className="relative flex items-center justify-between border-b border-neutral-100 pb-5">

                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                        Our Approach
                                    </p>

                                    <p className="mt-1.5 text-sm font-medium text-neutral-700">
                                        Built around your project.
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50">
                                    <Sparkles className="h-4 w-4 text-violet-600" />
                                </div>

                            </div>

                            {/* Main quote */}

                            <div className="relative py-7 sm:py-8">

                                <p className="max-w-2xl font-display text-2xl font-semibold leading-[1.3] tracking-tight text-neutral-900 sm:text-3xl">
                                    You should know what happens
                                    <span className="text-violet-600"> before </span>
                                    your project moves forward.
                                </p>

                                <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500">
                                    That is why custom projects begin with a request,
                                    continue through a clear quotation, and only move
                                    to checkout after the quote is accepted.
                                </p>

                            </div>

                            {/* =================================================
                                PROCESS
                            ================================================== */}

                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">

                                {processSteps.map((step, index) => (
                                    <div
                                        key={step.number}
                                        className="group relative rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:bg-violet-50/30"
                                    >
                                        <div className="flex items-center justify-between">

                                            <span className="font-mono text-[9px] font-semibold tracking-[0.18em] text-violet-500/70">
                                                {step.number}
                                            </span>

                                            {index < processSteps.length - 1 && (
                                                <span className="hidden h-px w-4 bg-neutral-200 lg:block" />
                                            )}

                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-neutral-800">
                                            {step.title}
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}

                            </div>

                        </div>
                    </div>
                </div>

                {/* =====================================================
                    TRUST PRINCIPLES
                ====================================================== */}

                <div className="mt-20 sm:mt-24">

                    {/* Section header */}

                    <div className="mb-7 flex items-center gap-4">

                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                            What You Can Expect
                        </span>

                        <div className="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent" />

                    </div>

                    {/* =================================================
                        CARDS
                    ================================================== */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {trustPoints.map((point) => {
                            const Icon = point.icon
                            const accent = getAccentClasses(point.accent)

                            return (
                                <article
                                    key={point.number}
                                    className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.035)] transition-all duration-500 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)] sm:p-6 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                >

                                    {/* Hover glow */}

                                    <div
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full ${accent.glow} opacity-0 blur-[65px] transition-opacity duration-500 group-hover:opacity-100`}
                                    />

                                    {/* Top accent */}

                                    <div
                                        aria-hidden="true"
                                        className={`absolute left-0 top-0 h-[2px] w-0 bg-gradient-to-r ${accent.line} to-transparent transition-all duration-500 group-hover:w-24`}
                                    />

                                    <div className="relative">

                                        {/* Header */}

                                        <div className="flex items-center justify-between">

                                            <span
                                                className={`font-mono text-[10px] font-semibold tracking-[0.2em] ${accent.number}`}
                                            >
                                                {point.number}
                                            </span>

                                            <span className="rounded-full border border-neutral-100 bg-neutral-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                                                {point.label}
                                            </span>

                                        </div>

                                        {/* Icon */}

                                        <div
                                            className={`mt-7 flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-400 group-hover:-translate-y-1 group-hover:scale-105 ${accent.icon} motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {/* Content */}

                                        <h3 className="mt-5 text-[17px] font-semibold tracking-tight text-neutral-900">
                                            {point.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-neutral-500">
                                            {point.description}
                                        </p>

                                        {/* Bottom */}

                                        <div className="mt-6 flex items-center gap-2 border-t border-neutral-100 pt-4">

                                            <CheckCircle2 className="h-3.5 w-3.5 text-violet-500/60" />

                                            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                                                Part of the process
                                            </span>

                                        </div>

                                    </div>

                                    {/* Shine */}

                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                                    />

                                </article>
                            )
                        })}

                    </div>
                </div>

                {/* =====================================================
                    BOTTOM CTA
                ====================================================== */}

                <div className="mt-16 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 sm:mt-20">

                    <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-9">

                        <div className="flex items-start gap-3.5">

                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-white shadow-sm">
                                <FileCheck2 className="h-4 w-4 text-violet-600" />
                            </div>

                            <div>

                                <p className="text-sm font-semibold text-neutral-800">
                                    Punya project yang belum punya bentuk yang jelas?
                                </p>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                                    Mulai dengan menceritakan kebutuhanmu. Tidak perlu
                                    langsung menentukan harga atau paket.
                                </p>

                            </div>
                        </div>

                        <Link
                            to="/contact"
                            className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
                        >
                            <span>Start With Your Idea</span>

                            <ArrowRight
                                aria-hidden="true"
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>

                    </div>
                </div>

                {/* =====================================================
                    BOTTOM STATEMENT
                ====================================================== */}

                <div className="mt-8 flex flex-col gap-2 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-neutral-400 sm:text-sm">
                        Clear communication creates better work.
                    </p>

                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">
                        39 — Sankyuu Production
                    </span>

                </div>

            </div>

            {/* =========================================================
                ANIMATIONS
            ========================================================== */}

            <style>{`

                /* =====================================================
                   BACKGROUND MOVEMENT
                ====================================================== */

                .trustSoftGlow {
                    animation: trustSoftGlowMove 14s ease-in-out infinite;
                }

                .trustSoftGlowTwo {
                    animation: trustSoftGlowMoveTwo 17s ease-in-out infinite;
                }

                .trustGrid {
                    background-image:
                        linear-gradient(
                            to right,
                            rgba(115, 115, 115, 0.45) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(115, 115, 115, 0.45) 1px,
                            transparent 1px
                        );

                    background-size: 72px 72px;

                    mask-image: linear-gradient(
                        to bottom,
                        transparent 0%,
                        black 18%,
                        black 78%,
                        transparent 100%
                    );

                    animation: trustGridMove 22s linear infinite;
                }

                .trustLight {
                    animation: trustLightMove 10s ease-in-out infinite;
                }

                .trustLightDelay {
                    animation-delay: 4s;
                }

                /* =====================================================
                   APPROACH CARD
                ====================================================== */

                .trustApproachCard {
                    animation: trustCardFloat 7s ease-in-out infinite;
                }

                /* =====================================================
                   KEYFRAMES
                ====================================================== */

                @keyframes trustSoftGlowMove {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(45px, 25px, 0) scale(1.08);
                    }
                }

                @keyframes trustSoftGlowMoveTwo {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(-40px, -25px, 0) scale(1.06);
                    }
                }

                @keyframes trustGridMove {
                    from {
                        background-position: 0 0;
                    }

                    to {
                        background-position: 72px 72px;
                    }
                }

                @keyframes trustLightMove {
                    0%,
                    100% {
                        transform: translateX(-12%);
                        opacity: 0;
                    }

                    25% {
                        opacity: 0.25;
                    }

                    50% {
                        transform: translateX(12%);
                        opacity: 0.5;
                    }

                    75% {
                        opacity: 0.2;
                    }
                }

                @keyframes trustCardFloat {
                    0%,
                    100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-5px);
                    }
                }

                /* =====================================================
                   REDUCED MOTION
                ====================================================== */

                @media (prefers-reduced-motion: reduce) {

                    .trustSoftGlow,
                    .trustSoftGlowTwo,
                    .trustGrid,
                    .trustLight,
                    .trustApproachCard {
                        animation: none !important;
                    }

                    * {
                        scroll-behavior: auto !important;
                    }
                }

                /* =====================================================
                   MOBILE
                ====================================================== */

                @media (max-width: 639px) {

                    .trustApproachCard {
                        animation-duration: 9s;
                    }

                    .trustGrid {
                        background-size: 56px 56px;
                        opacity: 0.018;
                    }
                }

            `}</style>
        </section>
    )
}