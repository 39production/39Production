import { Link } from 'react-router-dom'
import {
    ArrowRight,
    ArrowUpRight,
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
            id="how-it-works"
            aria-labelledby="process-section-title"
            className="relative overflow-hidden bg-white text-zinc-950"
        >
            {/* =========================================================
                SUBTLE BACKGROUND
            ========================================================== */}

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

                <div className="absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />

                <div className="absolute left-[5%] bottom-[22%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            </div>

            {/* =========================================================
                CONTENT
            ========================================================== */}

            <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
                {/* =====================================================
                    SECTION HEADER
                ====================================================== */}

                <div className="mb-12 border-t border-black/10 pt-4 sm:mb-14">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                                39Production / How It Works
                            </span>
                        </div>

                        <span className="font-mono text-[9px] font-medium tracking-[0.16em] text-neutral-400 sm:text-[10px]">
                            39 / 05
                        </span>
                    </div>
                </div>

                {/* =====================================================
                    INTRO
                ====================================================== */}

                <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-end lg:gap-16">
                    <div className="max-w-md">
                        <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
                            Tidak perlu langsung tahu semuanya. Mulai dari
                            kebutuhanmu, lalu kami bantu menerjemahkannya menjadi
                            scope dan langkah kerja yang jelas.
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#7C3AED]" />

                            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Request / Quote / Production
                            </span>
                        </div>
                    </div>

                    <div className="max-w-5xl">
                        <p className="mb-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                            <Sparkles size={12} />
                            Our Process
                        </p>

                        <h2
                            id="process-section-title"
                            className="text-[clamp(2.6rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
                        >
                            From request
                            <span className="text-neutral-300">
                                {' '}
                                to production.
                            </span>
                        </h2>

                        <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
                            Proses dibuat sederhana dan transparan. Kamu tahu
                            apa yang terjadi di setiap tahap sebelum project
                            benar-benar mulai dikerjakan.
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    PROCESS INTRO
                ====================================================== */}

                <div className="mt-16 border-t border-black/10 pt-7 sm:mt-20">
                    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                                Before Production
                            </p>

                            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
                                Know the path before we build.
                            </h3>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                                No payment at quote stage
                            </span>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    DESKTOP PROCESS
                ====================================================== */}

                <div className="mt-7 hidden lg:block">
                    <div className="relative border-t border-black/10">
                        {/* Connecting line */}
                        <div
                            aria-hidden="true"
                            className="absolute left-[8.3%] right-[8.3%] top-9 h-px bg-black/10"
                        />

                        <div className="grid grid-cols-6">
                            {steps.map((step, index) => {
                                const Icon = step.icon

                                return (
                                    <article
                                        key={step.number}
                                        className="process-step group relative border-r border-black/10 px-5 pb-2 pt-7 first:border-l last:border-r-0"
                                        style={{
                                            animationDelay: `${index * 80}ms`,
                                        }}
                                    >
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex h-[54px] w-[54px] items-center justify-center border border-black/10 bg-white text-black transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                                                    <Icon
                                                        className="h-[21px] w-[21px]"
                                                        strokeWidth={1.7}
                                                    />
                                                </div>

                                                <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#7C3AED]">
                                                    {step.number}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-7">
                                            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                                                Step {step.number}
                                            </p>

                                            <h3 className="mt-2 text-[15px] font-black tracking-[-0.025em] text-black transition-transform duration-300 group-hover:translate-x-1">
                                                {step.title}
                                            </h3>

                                            <p className="mt-3 text-xs font-medium leading-6 text-neutral-500">
                                                {step.description}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex items-center gap-2 opacity-50 transition-opacity duration-300 group-hover:opacity-100">
                                            <span className="h-px w-6 bg-black/10 transition-all duration-300 group-hover:w-9 group-hover:bg-[#7C3AED]" />

                                            <ArrowUpRight
                                                size={12}
                                                className="text-neutral-300 transition-colors duration-300 group-hover:text-[#7C3AED]"
                                            />
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    TABLET PROCESS
                ====================================================== */}

                <div className="mt-7 hidden sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0 lg:hidden">
                    {steps.map((step, index) => {
                        const Icon = step.icon

                        return (
                            <article
                                key={step.number}
                                className="process-step group border-t border-black/10 py-6"
                                style={{
                                    animationDelay: `${index * 80}ms`,
                                }}
                            >
                                <div className="flex items-start justify-between gap-5">
                                    <div className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white text-black transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                                        <Icon
                                            className="h-[18px] w-[18px]"
                                            strokeWidth={1.7}
                                        />
                                    </div>

                                    <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#7C3AED]">
                                        {step.number}
                                    </span>
                                </div>

                                <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                                    Step {step.number}
                                </p>

                                <h3 className="mt-2 text-lg font-black tracking-[-0.035em] text-black">
                                    {step.title}
                                </h3>

                                <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-neutral-500">
                                    {step.description}
                                </p>
                            </article>
                        )
                    })}
                </div>

                {/* =====================================================
                    MOBILE PROCESS
                ====================================================== */}

                <div className="relative mt-7 sm:hidden">
                    <div
                        aria-hidden="true"
                        className="absolute bottom-8 left-[21px] top-8 w-px bg-black/10"
                    />

                    <div>
                        {steps.map((step, index) => {
                            const Icon = step.icon

                            return (
                                <article
                                    key={step.number}
                                    className="process-step group relative grid grid-cols-[44px_1fr] gap-4 border-t border-black/10 py-6"
                                    style={{
                                        animationDelay: `${index * 80}ms`,
                                    }}
                                >
                                    <div className="relative z-10 flex h-11 w-11 items-center justify-center border border-black/10 bg-white text-black transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                                        <Icon
                                            className="h-[18px] w-[18px]"
                                            strokeWidth={1.7}
                                        />

                                        <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#7C3AED] text-[7px] font-bold text-white ring-2 ring-white">
                                            {index + 1}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                                                Step {step.number}
                                            </p>

                                            <span className="font-mono text-[8px] font-bold tracking-[0.14em] text-[#7C3AED]">
                                                {step.number}
                                            </span>
                                        </div>

                                        <h3 className="mt-2 text-base font-black tracking-[-0.03em] text-black">
                                            {step.title}
                                        </h3>

                                        <p className="mt-2 text-sm font-medium leading-6 text-neutral-500">
                                            {step.description}
                                        </p>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </div>

                {/* =====================================================
                    PAYMENT / QUOTATION INFORMATION
                ====================================================== */}

                <div className="mt-14 border-t border-black/10 pt-7 sm:mt-16">
                    <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 bg-white text-[#7C3AED]">
                                <WalletCards
                                    className="h-[18px] w-[18px]"
                                    strokeWidth={1.7}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-black tracking-[-0.02em] text-black">
                                    No payment when requesting a quote.
                                </p>

                                <p className="mt-2 max-w-2xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                                    Harga final dan DP baru ditentukan setelah
                                    kebutuhan project direview dan quotation
                                    diberikan. Kamu bisa melihat,
                                    mempertimbangkan, lalu menerima quotation
                                    sebelum melakukan pembayaran.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/contact"
                            className="group inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-black px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#7C3AED] sm:w-auto"
                        >
                            Request a Quote

                            <ArrowRight
                                size={14}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>
                </div>

                {/* =====================================================
                    BOTTOM STATEMENT
                ====================================================== */}

                <div className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                        Clear scope. Clear quotation. Then we build.
                    </p>

                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                        39 / Sankyuu Production
                    </span>
                </div>
            </div>

            {/* =========================================================
                ANIMATIONS
            ========================================================== */}

            <style>{`
                .process-step {
                    animation: processStepReveal 0.7s ease-out both;
                }

                @keyframes processStepReveal {
                    from {
                        opacity: 0;
                        transform: translateY(14px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .process-step {
                        animation: none !important;
                    }
                }
            `}</style>
        </section>
    )
}
