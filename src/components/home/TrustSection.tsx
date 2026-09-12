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
                icon: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/20 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40',
                glow: 'bg-cyan-500/10',
                line: 'from-cyan-400',
                number: 'text-cyan-300/60',
            }

        case 'pink':
            return {
                icon: 'bg-pink-500/10 text-pink-300 border-pink-400/20 group-hover:bg-pink-500/20 group-hover:border-pink-400/40',
                glow: 'bg-pink-500/10',
                line: 'from-pink-400',
                number: 'text-pink-300/60',
            }

        case 'amber':
            return {
                icon: 'bg-amber-500/10 text-amber-300 border-amber-400/20 group-hover:bg-amber-500/20 group-hover:border-amber-400/40',
                glow: 'bg-amber-500/10',
                line: 'from-amber-400',
                number: 'text-amber-300/60',
            }

        default:
            return {
                icon: 'bg-violet-500/10 text-violet-300 border-violet-400/20 group-hover:bg-violet-500/20 group-hover:border-violet-400/40',
                glow: 'bg-violet-500/10',
                line: 'from-violet-400',
                number: 'text-violet-300/60',
            }
    }
}

export function TrustSection() {
    return (
        <section
            aria-labelledby="trust-section-title"
            className="relative isolate overflow-hidden bg-bg-base py-24 lg:py-36"
        >
            {/* =========================================================
                BACKGROUND
            ========================================================== */}

            <div className="pointer-events-none absolute inset-0 -z-20">
                <div
                    className="absolute left-1/2 top-[-280px] h-[650px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.10) 35%, transparent 70%)',
                    }}
                />
            </div>

            {/* Aurora */}

            <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
                <div className="trustAuroraOne absolute -left-32 top-32 h-[420px] w-[420px] rounded-full bg-violet-600/[0.09] blur-[110px]" />

                <div className="trustAuroraTwo absolute right-[-100px] top-[38%] h-[500px] w-[500px] rounded-full bg-pink-600/[0.07] blur-[120px]" />

                <div className="trustAuroraThree absolute bottom-[-180px] left-[30%] h-[450px] w-[450px] rounded-full bg-cyan-600/[0.05] blur-[120px]" />
            </div>

            {/* Grid */}

            <div className="trustGrid pointer-events-none absolute inset-0 -z-10 opacity-[0.04]" />

            {/* Light beams */}

            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="trustBeamHorizontal absolute left-[-20%] top-[25%] h-px w-[140%] bg-gradient-to-r from-transparent via-violet-400/25 to-transparent" />

                <div className="trustBeamHorizontal trustBeamDelay absolute left-[-20%] top-[72%] h-px w-[140%] bg-gradient-to-r from-transparent via-pink-400/20 to-transparent" />

                <div className="trustBeamVertical absolute left-[22%] top-[-20%] h-[140%] w-px bg-gradient-to-b from-transparent via-violet-400/15 to-transparent" />

                <div className="trustBeamVertical trustBeamVerticalDelay absolute left-[78%] top-[-20%] h-[140%] w-px bg-gradient-to-b from-transparent via-pink-400/15 to-transparent" />
            </div>

            {/* Particles */}

            <div className="pointer-events-none absolute inset-0 -z-10">
                <span className="trustParticle trustParticleOne absolute left-[12%] top-[22%] h-1 w-1 rounded-full bg-violet-300/50" />

                <span className="trustParticle trustParticleTwo absolute left-[82%] top-[20%] h-1.5 w-1.5 rounded-full bg-pink-300/40" />

                <span className="trustParticle trustParticleThree absolute left-[90%] top-[62%] h-1 w-1 rounded-full bg-cyan-300/40" />

                <span className="trustParticle trustParticleFour absolute left-[15%] top-[78%] h-1.5 w-1.5 rounded-full bg-pink-300/30" />

                <span className="trustParticle trustParticleFive absolute left-[52%] top-[45%] h-1 w-1 rounded-full bg-white/25" />
            </div>

            {/* Decorative rings */}

            <div className="pointer-events-none absolute right-[-180px] top-[15%] -z-10 h-[420px] w-[420px] rounded-full border border-white/[0.035]" />

            <div className="pointer-events-none absolute right-[-130px] top-[20%] -z-10 h-[320px] w-[320px] rounded-full border border-violet-400/[0.05]" />

            <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] -z-10 h-[360px] w-[360px] rounded-full border border-white/[0.03]" />

            {/* =========================================================
                CONTENT
            ========================================================== */}

            <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">

                {/* =====================================================
                    INTRO
                ====================================================== */}

                <div className="grid items-end gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">

                    {/* Left — Statement */}

                    <div className="relative">
                        <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-violet-500/[0.10] blur-[90px]" />

                        <div className="relative">

                            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.07] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 backdrop-blur">
                                <Sparkles
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5"
                                />

                                <span>Why 39Production</span>
                            </div>

                            <h2
                                id="trust-section-title"
                                className="mt-7 max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
                            >
                                A clearer way to
                                <br />

                                <span className="gradient-text">
                                    build together.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-xl text-base leading-8 text-text-muted sm:text-lg">
                                Project yang baik bukan hanya tentang hasil akhir.
                                Proses yang jelas membantu ide berkembang menjadi
                                sesuatu yang benar-benar sesuai kebutuhan.
                            </p>

                            {/* Mini trust statement */}

                            <div className="mt-8 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.07]">
                                    <CheckCircle2 className="h-4 w-4 text-violet-300" />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                                        Customer-first process
                                    </p>

                                    <p className="mt-1 text-sm text-white/65">
                                        Understand first. Quote clearly. Build together.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right — Main statement card */}

                    <div className="relative">
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-white/[0.025] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10">

                            {/* Decorative glow */}

                            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.10] blur-[90px]" />

                            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-pink-500/[0.07] blur-[90px]" />

                            {/* Top metadata */}

                            <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-5">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                                        Our Approach
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-white/70">
                                        Built around your project.
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                                    <Sparkles className="h-4 w-4 text-violet-300" />
                                </div>
                            </div>

                            {/* Main quote */}

                            <div className="relative py-8">
                                <p className="max-w-2xl font-display text-2xl font-semibold leading-[1.3] tracking-tight text-white sm:text-3xl">
                                    You should know what happens
                                    <span className="text-violet-300"> before </span>
                                    your project moves forward.
                                </p>

                                <p className="mt-4 max-w-xl text-sm leading-7 text-white/45">
                                    That is why custom projects begin with a request,
                                    continue through a clear quotation, and only move
                                    to checkout after the quote is accepted.
                                </p>
                            </div>

                            {/* Process indicators */}

                            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {processSteps.map((step, index) => (
                                    <div
                                        key={step.number}
                                        className="relative rounded-xl border border-white/[0.07] bg-black/20 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-[9px] font-semibold tracking-[0.18em] text-violet-300/60">
                                                {step.number}
                                            </span>

                                            {index < processSteps.length - 1 && (
                                                <span className="hidden h-px w-5 bg-white/[0.08] sm:block" />
                                            )}
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-white/80">
                                            {step.title}
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-white/35">
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

                <div className="mt-16">

                    {/* Section label */}

                    <div className="mb-7 flex items-center gap-4">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
                            What You Can Expect
                        </span>

                        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.10] to-transparent" />
                    </div>

                    {/* Cards */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {trustPoints.map((point) => {
                            const Icon = point.icon
                            const accent = getAccentClasses(point.accent)

                            return (
                                <article
                                    key={point.number}
                                    className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.035] sm:p-7 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                                >
                                    {/* Glow */}

                                    <div
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full ${accent.glow} opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-100`}
                                    />

                                    {/* Accent line */}

                                    <div
                                        aria-hidden="true"
                                        className={`absolute left-0 top-0 h-px w-0 bg-gradient-to-r ${accent.line} to-transparent transition-all duration-700 group-hover:w-full`}
                                    />

                                    <div className="relative">

                                        {/* Header */}

                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`font-mono text-[10px] font-semibold tracking-[0.2em] ${accent.number}`}
                                            >
                                                {point.number}
                                            </span>

                                            <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30">
                                                {point.label}
                                            </span>
                                        </div>

                                        {/* Icon */}

                                        <div
                                            className={`mt-7 flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-105 ${accent.icon} motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {/* Content */}

                                        <h3 className="mt-6 text-lg font-semibold tracking-tight text-white">
                                            {point.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-white/50">
                                            {point.description}
                                        </p>

                                        {/* Bottom */}

                                        <div className="mt-7 flex items-center gap-2 border-t border-white/[0.07] pt-5">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-violet-300/60" />

                                            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
                                                Part of the process
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shine */}

                                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.035] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                                </article>
                            )
                        })}
                    </div>
                </div>

                {/* =====================================================
                    BOTTOM CTA / STATEMENT
                ====================================================== */}

                <div className="mt-14 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.025]">
                    <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">

                        <div className="flex items-start gap-4">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.07]">
                                <FileCheck2 className="h-4 w-4 text-violet-300" />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-white/75">
                                    Punya project yang belum punya bentuk yang jelas?
                                </p>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-white/40">
                                    Mulai dengan menceritakan kebutuhanmu. Tidak perlu
                                    langsung menentukan harga atau paket.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/contact"
                            className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black shadow-xl outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                        >
                            <span>Start With Your Idea</span>

                            <ArrowRight
                                aria-hidden="true"
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>

                {/* Bottom statement */}

                <div className="mt-9 flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-white/35">
                        Clear communication creates better work.
                    </p>

                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/20">
                        39 — Sankyuu Production
                    </span>
                </div>
            </div>

            {/* =========================================================
                ANIMATIONS
            ========================================================== */}

            <style>{`
                .trustGrid {
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
                    animation: trustGridMove 18s linear infinite;
                }

                .trustAuroraOne {
                    animation: trustAuroraFloatOne 14s ease-in-out infinite;
                }

                .trustAuroraTwo {
                    animation: trustAuroraFloatTwo 18s ease-in-out infinite;
                }

                .trustAuroraThree {
                    animation: trustAuroraFloatThree 16s ease-in-out infinite;
                }

                .trustBeamHorizontal {
                    animation: trustBeamHorizontalMove 9s ease-in-out infinite;
                }

                .trustBeamDelay {
                    animation-delay: 4s;
                }

                .trustBeamVertical {
                    animation: trustBeamVerticalMove 12s ease-in-out infinite;
                }

                .trustBeamVerticalDelay {
                    animation-delay: 5s;
                }

                .trustParticle {
                    animation: trustParticleFloat 5s ease-in-out infinite;
                }

                .trustParticleOne {
                    animation-delay: 0s;
                }

                .trustParticleTwo {
                    animation-delay: 1s;
                }

                .trustParticleThree {
                    animation-delay: 2s;
                }

                .trustParticleFour {
                    animation-delay: 3s;
                }

                .trustParticleFive {
                    animation-delay: 1.5s;
                }

                @keyframes trustGridMove {
                    from {
                        background-position: 0 0;
                    }

                    to {
                        background-position: 80px 80px;
                    }
                }

                @keyframes trustAuroraFloatOne {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(70px, 40px, 0) scale(1.12);
                    }
                }

                @keyframes trustAuroraFloatTwo {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(-70px, -50px, 0) scale(1.08);
                    }
                }

                @keyframes trustAuroraFloatThree {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(50px, -60px, 0) scale(1.1);
                    }
                }

                @keyframes trustBeamHorizontalMove {
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

                @keyframes trustBeamVerticalMove {
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

                @keyframes trustParticleFloat {
                    0%,
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.2;
                    }

                    50% {
                        transform: translateY(-18px) scale(1.4);
                        opacity: 0.75;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .trustGrid,
                    .trustAuroraOne,
                    .trustAuroraTwo,
                    .trustAuroraThree,
                    .trustBeamHorizontal,
                    .trustBeamVertical,
                    .trustParticle {
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    )
}