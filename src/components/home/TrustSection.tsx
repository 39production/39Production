import { useEffect, useRef } from 'react'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TrustSection() {
    const sectionRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const items = section.querySelectorAll('[data-reveal]')

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible')
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.08 },
        )

        items.forEach((item) => observer.observe(item))

        return () => observer.disconnect()
    }, [])

    const process = [
        {
            number: '01',
            title: 'Start with the idea.',
            description:
                'Kami memahami kebutuhan, goals, dan konteks project terlebih dahulu sebelum menentukan approach yang tepat.',
        },
        {
            number: '02',
            title: 'Shape the direction.',
            description:
                'Ide diterjemahkan menjadi konsep, visual, dan technical direction yang jelas agar proses tetap focused.',
        },
        {
            number: '03',
            title: 'Turn it into work.',
            description:
                'Creative thinking dan technology kami satukan untuk menghasilkan karya digital yang functional, relevant, dan siap digunakan.',
        },
        {
            number: '04',
            title: 'Grow it together.',
            description:
                'Project tidak berhenti saat selesai. Kami tetap membuka ruang untuk improvement, development, dan kebutuhan berikutnya.',
        },
    ]

    const principles = [
        {
            title: 'Listen first.',
            description:
                'Memahami kebutuhan dan konteks sebelum menentukan solusi.',
        },
        {
            title: 'Make it clear.',
            description:
                'Setiap keputusan punya purpose, direction, dan alasan yang jelas.',
        },
        {
            title: 'Build together.',
            description:
                'Kolaborasi dan komunikasi menjadi bagian penting dari setiap proses.',
        },
    ]

    return (
        <section
            ref={sectionRef}
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

                <div className="absolute right-[8%] top-[24%] h-2 w-2 rounded-full bg-[#7C3AED]" />

                <div className="absolute left-[3%] top-[63%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            </div>

            <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
                {/* Section Header */}
                <div
                    data-reveal
                    className="reveal-item mb-12 flex items-center justify-between border-t border-black/10 pt-4 opacity-0 translate-y-4 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 sm:mb-14"
                >
                    <div className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

                        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-500 sm:text-[10px]">
                            39Production / How We Work
                        </span>
                    </div>

                    <span className="hidden font-mono text-[9px] tracking-[0.16em] text-neutral-400 sm:block">
                        39 / 02
                    </span>
                </div>

                {/* Introduction */}
                <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 xl:grid-cols-[0.65fr_1.35fr]">
                    <div
                        data-reveal
                        className="reveal-item max-w-md opacity-0 translate-y-4 transition-all delay-100 duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100"
                    >
                        <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px] sm:leading-7">
                            Setiap project punya kebutuhan yang berbeda.
                            That's why we don't believe in a one-size-fits-all
                            approach.
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                            <span className="h-px w-10 bg-[#7C3AED]" />

                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                                Idea / Direction / Production
                            </span>
                        </div>
                    </div>

                    <div
                        data-reveal
                        className="reveal-item max-w-4xl opacity-0 translate-y-4 transition-all delay-150 duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100"
                    >
                        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                            Our Approach
                        </p>

                        <h2 className="text-[clamp(2.5rem,4.8vw,5rem)] font-black leading-[0.9] tracking-[-0.065em] text-black">
                            From idea
                            <span className="text-neutral-300">
                                {' '}
                                to something
                            </span>
                            <br className="hidden sm:block" />
                            <span className="relative inline-block">
                                <span className="relative z-10">
                                    worth making.
                                </span>

                                <span
                                    aria-hidden="true"
                                    className="absolute bottom-[1%] left-0 right-[-3%] z-0 h-[0.1em] bg-[#7C3AED]"
                                />
                            </span>
                        </h2>

                        <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
                            39Production works between creativity, technology,
                            and entertainment untuk mengubah ideas, needs,
                            dan challenges menjadi digital works yang relevant
                            dan siap digunakan.
                        </p>
                    </div>
                </div>

                {/* Process */}
                <div className="mt-20 sm:mt-24">
                    <div
                        data-reveal
                        className="reveal-item mb-7 flex flex-col gap-2 opacity-0 translate-y-4 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 sm:flex-row sm:items-end sm:justify-between"
                    >
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                                Our Process
                            </p>

                            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
                                Cara kami bekerja.
                            </h3>
                        </div>

                        <p className="max-w-sm text-xs leading-6 text-neutral-500 sm:text-sm">
                            A simple process untuk menjaga setiap project tetap
                            clear, focused, dan flexible.
                        </p>
                    </div>

                    <div className="border-t border-black/10">
                        {process.map((item, index) => (
                            <div
                                key={item.number}
                                data-reveal
                                className="reveal-item group grid gap-4 border-b border-black/10 py-5 opacity-0 translate-y-4 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 md:grid-cols-[64px_0.75fr_1fr_auto] md:items-center md:gap-8 lg:py-6"
                                style={{
                                    transitionDelay: `${index * 70 + 100}ms`,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#7C3AED]">
                                        {item.number}
                                    </span>

                                    <span className="h-px w-5 bg-black/10 md:hidden" />
                                </div>

                                <h4 className="text-lg font-black tracking-[-0.035em] text-black transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                                    {item.title}
                                </h4>

                                <p className="max-w-xl text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                                    {item.description}
                                </p>

                                <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-black/10 text-neutral-300 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white md:flex">
                                    <ArrowUpRight
                                        size={14}
                                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Principles */}
                <div className="mt-20 sm:mt-24">
                    <div
                        data-reveal
                        className="reveal-item grid gap-8 opacity-0 translate-y-4 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16"
                    >
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                                Our Principles
                            </p>

                            <h3 className="mt-3 max-w-md text-3xl font-black leading-[0.92] tracking-[-0.055em] text-black sm:text-4xl">
                                Built with
                                <span className="text-neutral-300">
                                    {' '}
                                    purpose.
                                </span>
                            </h3>

                            <p className="mt-5 max-w-sm text-xs leading-6 text-neutral-500 sm:text-sm">
                                Prinsip sederhana yang kami gunakan untuk
                                menjaga quality of work dan hubungan yang baik
                                dengan setiap partner.
                            </p>
                        </div>

                        <div className="grid border-t border-black/10 sm:grid-cols-3 sm:border-t-0">
                            {principles.map((principle, index) => (
                                <div
                                    key={principle.title}
                                    className={`group py-6 sm:px-6 sm:py-2 ${index !== 0
                                            ? 'border-t border-black/10 sm:border-l sm:border-t-0'
                                            : ''
                                        }`}
                                >
                                    <div className="mb-5 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                                        <Check
                                            className="h-3.5 w-3.5"
                                            strokeWidth={2}
                                        />
                                    </div>

                                    <h4 className="text-base font-black tracking-[-0.025em] text-black">
                                        {principle.title}
                                    </h4>

                                    <p className="mt-2 max-w-[210px] text-xs leading-6 text-neutral-500 sm:text-sm">
                                        {principle.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div
                    data-reveal
                    className="reveal-item relative mt-20 overflow-hidden rounded-[1.5rem] bg-black px-6 py-8 text-white opacity-0 translate-y-4 transition-all duration-700 ease-out [&.is-visible]:translate-y-0 [&.is-visible]:opacity-100 sm:px-8 sm:py-9 lg:mt-24 lg:px-10 lg:py-10"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-[#7C3AED] opacity-70"
                    />

                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-[14%] top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-white/10"
                    />

                    <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#E78FBA]">
                                39Production / Start Something
                            </p>

                            <h3 className="text-[clamp(2rem,3.8vw,4rem)] font-black leading-[0.9] tracking-[-0.06em]">
                                Have a project
                                <span className="text-white/35">
                                    {' '}
                                    in mind?
                                </span>
                            </h3>

                            <p className="mt-4 max-w-xl text-xs leading-6 text-white/50 sm:text-sm">
                                Punya idea atau project yang sedang disiapkan?
                                Ceritakan kebutuhanmu, and let's figure out the
                                next step together.
                            </p>
                        </div>

                        <Link
                            to="/contact"
                            className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-white px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-black transition-all duration-300 hover:bg-[#7C3AED] hover:text-white"
                        >
                            Start a Project

                            <ArrowRight
                                size={14}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </div>

                    <div className="relative z-10 mt-7 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-[8px] font-semibold tracking-[0.18em] text-white/30">
                            39PRODUCTION
                        </span>

                        <span className="hidden text-[8px] font-medium uppercase tracking-[0.18em] text-white/25 sm:block">
                            Creating Digital Works. Producing Stories. Sharing
                            Gratitude.
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                .reveal-item {
                    will-change: transform, opacity;
                }

                @media (prefers-reduced-motion: reduce) {
                    .reveal-item {
                        opacity: 1 !important;
                        transform: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
        </section>
    )
}