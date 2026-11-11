import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * FOTO — letakkan file di /public/images/trust/ (atau ganti path di bawah).
 * Rekomendasi: JPG/WebP, rasio sesuai catatan, lebar min. 1200px.
 * Kalau file belum ada, komponen otomatis menampilkan placeholder gradient ungu.
 */
const IMAGES = {
    heroMain: '/images/trust/hero-main.jpg', // 4:5 portrait — suasana tim / meeting
    heroSub: '/images/trust/hero-sub.jpg', // 1:1 — detail kerja (sketsa, layar)
    step1: '/images/trust/step-1-discuss.jpg', // 4:5 — diskusi / briefing
    step2: '/images/trust/step-2-direction.jpg', // 4:5 — moodboard / wireframe
    step3: '/images/trust/step-3-produce.jpg', // 4:5 — produksi / coding / shooting
    step4: '/images/trust/step-4-grow.jpg', // 4:5 — review / hasil jadi
    principles: '/images/trust/principles.jpg', // 4:5 — kolaborasi tim
    cta: '/images/trust/cta.jpg', // 3:4 — foto santai tim
}

type StepKey = 'step1' | 'step2' | 'step3' | 'step4'

const process: {
    number: string
    title: string
    description: string
    tag: string
    image: StepKey
}[] = [
        {
            number: '01',
            title: 'Start with the idea.',
            description:
                'Kami memahami kebutuhan, goals, dan konteks project terlebih dahulu sebelum menentukan approach yang tepat.',
            tag: 'Discover',
            image: 'step1',
        },
        {
            number: '02',
            title: 'Shape the direction.',
            description:
                'Ide diterjemahkan menjadi konsep, visual, dan technical direction yang jelas agar proses tetap focused.',
            tag: 'Define',
            image: 'step2',
        },
        {
            number: '03',
            title: 'Turn it into work.',
            description:
                'Creative thinking dan technology kami satukan untuk menghasilkan karya digital yang functional, relevant, dan siap digunakan.',
            tag: 'Produce',
            image: 'step3',
        },
        {
            number: '04',
            title: 'Grow it together.',
            description:
                'Project tidak berhenti saat selesai. Kami tetap membuka ruang untuk improvement, development, dan kebutuhan berikutnya.',
            tag: 'Evolve',
            image: 'step4',
        },
    ]

const principles = [
    {
        title: 'Listen first.',
        description: 'Memahami kebutuhan dan konteks sebelum menentukan solusi.',
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

const TAGLINE = ['Creating Digital Works', 'Producing Stories', 'Sharing Gratitude']

/* ------------------------------------------------------------------ */
/* Image dengan fallback placeholder                                   */
/* ------------------------------------------------------------------ */
function Photo({
    src,
    alt,
    className = '',
    label,
}: {
    src: string
    alt: string
    className?: string
    label?: string
}) {
    const [failed, setFailed] = useState(false)

    if (failed) {
        return (
            <div
                role="img"
                aria-label={alt}
                className={`relative flex items-end overflow-hidden bg-neutral-100 ${className}`}
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 20% 15%, rgba(124,58,237,.35), transparent 55%), radial-gradient(circle at 85% 90%, rgba(231,143,186,.35), transparent 50%)',
                }}
            >
                <span className="m-3 font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">
                    {label ?? 'Photo'}
                </span>
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={`object-cover ${className}`}
        />
    )
}

export function TrustSection() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const timelineRef = useRef<HTMLDivElement | null>(null)
    const [activeStep, setActiveStep] = useState(0)

    /* Reveal on scroll */
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
            { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
        )

        items.forEach((item) => observer.observe(item))
        return () => observer.disconnect()
    }, [])

    /* Step aktif (untuk foto sticky di desktop) */
    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const steps = section.querySelectorAll<HTMLElement>('[data-step]')
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveStep(Number(entry.target.getAttribute('data-step')))
                    }
                })
            },
            { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
        )

        steps.forEach((s) => observer.observe(s))
        return () => observer.disconnect()
    }, [])

    /* Parallax foto + progress garis timeline */
    useEffect(() => {
        const section = sectionRef.current
        if (!section) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const parallaxEls = Array.from(
            section.querySelectorAll<HTMLElement>('[data-parallax]'),
        )
        let ticking = false

        const update = () => {
            const vh = window.innerHeight

            parallaxEls.forEach((el) => {
                const speed = Number(el.getAttribute('data-parallax')) || 0.08
                const rect = el.parentElement!.getBoundingClientRect()
                if (rect.bottom < -200 || rect.top > vh + 200) return
                const offset = (rect.top + rect.height / 2 - vh / 2) * speed
                el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.12)`
            })

            const tl = timelineRef.current
            if (tl) {
                const r = tl.getBoundingClientRect()
                const p = Math.min(
                    1,
                    Math.max(0, (vh * 0.55 - r.top) / Math.max(r.height, 1)),
                )
                tl.style.setProperty('--progress', p.toFixed(3))
            }

            ticking = false
        }

        const onScroll = () => {
            if (!ticking) {
                ticking = true
                requestAnimationFrame(update)
            }
        }

        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            className="trust relative overflow-hidden bg-white text-zinc-950"
        >
            {/* Background */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div
                    className="absolute inset-0 opacity-[0.018]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
                        backgroundSize: '100px 100px',
                    }}
                />
                <div className="trust-float absolute right-[8%] top-[24%] h-2 w-2 rounded-full bg-[#7C3AED]" />
                <div
                    className="trust-float absolute left-[3%] top-[63%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
                    style={{ animationDelay: '-2s' }}
                />
            </div>

            <div className="relative mx-auto max-w-[1240px] px-5 py-8 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
                {/* Section Header */}
                <div
                    data-reveal
                    className="rv mb-5 flex items-center justify-between border-t border-black/10 pt-4 sm:mb-10"
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

                {/* ============================ INTRO ============================ */}
                <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-7 lg:pr-8 xl:pr-16">
                        <p
                            data-reveal
                            className="rv mb-5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]"
                        >
                            Our Approach
                        </p>

                        <h2
                            data-reveal
                            style={{ ['--d' as string]: '80ms' }}
                            className="rv text-[clamp(2.4rem,5.2vw,4.75rem)] font-black leading-[0.88] tracking-[-0.065em] text-black"
                        >
                            From idea
                            <br />
                            <span className="text-neutral-300">to something</span>
                            <br />
                            <span className="relative inline-block">
                                <span className="relative z-10">worth making.</span>
                                <span
                                    aria-hidden="true"
                                    className="draw absolute bottom-[1%] left-0 right-[-3%] z-0 h-[0.1em] bg-[#7C3AED]"
                                />
                            </span>
                        </h2>

                        <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-8">
                            <div
                                data-reveal
                                style={{ ['--d' as string]: '200ms' }}
                                className="rv flex items-center gap-3 sm:flex-col sm:items-start sm:gap-4"
                            >
                                <span className="h-px w-10 bg-[#7C3AED] sm:h-10 sm:w-px" />
                                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 sm:[writing-mode:vertical-rl]">
                                    Idea / Direction / Production
                                </span>
                            </div>

                            <div
                                data-reveal
                                style={{ ['--d' as string]: '260ms' }}
                                className="rv max-w-xl space-y-4"
                            >
                                <p className="text-sm font-semibold leading-7 text-neutral-800 sm:text-base">
                                    Setiap project punya kebutuhan yang berbeda. That's why
                                    we don't believe in a one-size-fits-all approach.
                                </p>
                                <p className="text-sm font-medium leading-7 text-neutral-500 sm:text-[15px]">
                                    39Production works between creativity, technology, and
                                    entertainment untuk mengubah ideas, needs, dan challenges
                                    menjadi digital works yang relevant dan siap digunakan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Foto kolase */}
                    <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:col-span-5 lg:mb-0 lg:max-w-none">
                        <div
                            data-reveal="mask"
                            className="mask relative aspect-[3/2] w-[88%] overflow-hidden bg-neutral-100 sm:aspect-[4/5] lg:ml-auto lg:w-[82%]"
                        >
                            <div data-parallax="0.06" className="absolute inset-0 will-change-transform">
                                <Photo
                                    src={IMAGES.heroMain}
                                    alt="Tim 39Production berdiskusi"
                                    label="hero-main.jpg"
                                    className="h-full w-full"
                                />
                            </div>
                        </div>

                        <div
                            data-reveal="mask"
                            style={{ ['--d' as string]: '250ms' }}
                            className="mask absolute -bottom-2 left-0 aspect-square w-[34%] overflow-hidden border-[6px] border-white bg-neutral-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] sm:-bottom-10 lg:-left-6 lg:w-[40%]"
                        >
                            <div data-parallax="-0.05" className="absolute inset-0 will-change-transform">
                                <Photo
                                    src={IMAGES.heroSub}
                                    alt="Detail proses kreatif"
                                    label="hero-sub.jpg"
                                    className="h-full w-full"
                                />
                            </div>
                        </div>

                        {/* Badge berputar */}
                        <div
                            aria-hidden="true"
                            className="trust-float absolute right-0 top-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-lg sm:h-24 sm:w-24 lg:-right-2"
                        >
                            <svg viewBox="0 0 100 100" className="trust-spin absolute inset-0 h-full w-full">
                                <defs>
                                    <path id="trust-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                                </defs>
                                <text fill="white" fontSize="9.5" fontWeight="700" letterSpacing="3.2">
                                    <textPath href="#trust-circle">IDEA • DIRECTION • PRODUCTION •</textPath>
                                </text>
                            </svg>
                            <span className="text-lg font-black tracking-tight">39</span>
                        </div>
                    </div>
                </div>

                {/* ============================ PROCESS ============================ */}
                <div className="mt-4 sm:mt-14 lg:mt-20">
                    <div
                        data-reveal
                        className="rv mb-5 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between"
                    >
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                                Our Process
                            </p>
                            <h3 className="mt-3 text-3xl font-black leading-[0.95] tracking-[-0.05em] text-black sm:text-4xl lg:text-5xl">
                                Cara kami
                                <span className="text-neutral-300"> bekerja.</span>
                            </h3>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-neutral-500">
                            A simple process untuk menjaga setiap project tetap clear,
                            focused, dan flexible.
                        </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12 lg:gap-12">
                        {/* Foto sticky (desktop) */}
                        <div className="relative hidden lg:col-span-5 lg:block">
                            <div className="sticky top-24">
                                <div className="relative aspect-[5/6] w-full overflow-hidden bg-neutral-100">
                                    {process.map((item, i) => (
                                        <div
                                            key={item.number}
                                            className="absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)]"
                                            style={{
                                                opacity: activeStep === i ? 1 : 0,
                                                transform:
                                                    activeStep === i ? 'scale(1)' : 'scale(1.06)',
                                            }}
                                        >
                                            <Photo
                                                src={IMAGES[item.image]}
                                                alt={item.title}
                                                label={`${item.image}.jpg`}
                                                className="h-full w-full"
                                            />
                                        </div>
                                    ))}

                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                                    <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-white">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/60">
                                                {process[activeStep].tag}
                                            </p>
                                            <p
                                                key={activeStep}
                                                className="trust-pop mt-1 text-xl font-black tracking-[-0.03em]"
                                            >
                                                {process[activeStep].title}
                                            </p>
                                        </div>
                                        <span className="font-mono text-xs tracking-[0.15em] text-white/70">
                                            {process[activeStep].number} / 04
                                        </span>
                                    </div>
                                </div>

                                {/* Indikator */}
                                <div className="mt-5 flex gap-2">
                                    {process.map((item, i) => (
                                        <span
                                            key={item.number}
                                            className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/10"
                                        >
                                            <span
                                                className="block h-full origin-left bg-[#7C3AED] transition-transform duration-700"
                                                style={{
                                                    transform: `scaleX(${i <= activeStep ? 1 : 0})`,
                                                }}
                                            />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div
                            ref={timelineRef}
                            className="relative lg:col-span-7"
                            style={{ ['--progress' as string]: 0 }}
                        >
                            {/* Garis */}
                            <span
                                aria-hidden="true"
                                className="absolute bottom-4 left-[15px] top-4 w-px bg-black/10"
                            />
                            <span
                                aria-hidden="true"
                                className="absolute left-[15px] top-4 w-px origin-top bg-[#7C3AED]"
                                style={{
                                    bottom: '1rem',
                                    transform: 'scaleY(var(--progress))',
                                }}
                            />

                            <div className="space-y-8 lg:space-y-20 lg:py-4">
                                {process.map((item, i) => (
                                    <article
                                        key={item.number}
                                        data-step={i}
                                        data-reveal
                                        className="rv group relative pl-12 sm:pl-16"
                                    >
                                        {/* Node */}
                                        <span
                                            aria-hidden="true"
                                            className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border bg-white font-mono text-[9px] font-bold tracking-[0.1em] transition-all duration-500 ${activeStep >= i
                                                    ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                                                    : 'border-black/15 text-[#7C3AED]'
                                                }`}
                                        >
                                            {item.number}
                                        </span>

                                        {/* Foto (mobile & tablet) */}
                                        <div className="relative mb-4 aspect-[16/10] overflow-hidden bg-neutral-100 lg:hidden">
                                            <Photo
                                                src={IMAGES[item.image]}
                                                alt={item.title}
                                                label={`${item.image}.jpg`}
                                                className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <span className="absolute left-3 top-3 bg-white/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black backdrop-blur">
                                                {item.tag}
                                            </span>
                                        </div>

                                        <p className="mb-2 hidden text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED] lg:block">
                                            {item.tag}
                                        </p>

                                        <h4 className="text-2xl font-black leading-[1] tracking-[-0.04em] text-black lg:text-4xl">
                                            {item.title}
                                        </h4>

                                        <p className="mt-3 max-w-md text-sm font-medium leading-7 text-neutral-500">
                                            {item.description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================ PRINCIPLES ============================ */}
                <div className="mt-16 grid items-center gap-8 sm:mt-20 lg:grid-cols-12 lg:gap-12">
                    <div
                        data-reveal="mask"
                        className="mask relative order-2 aspect-[16/10] w-full overflow-hidden bg-neutral-100 lg:order-1 lg:col-span-5 lg:aspect-square"
                    >
                        <div data-parallax="0.05" className="absolute inset-0 will-change-transform">
                            <Photo
                                src={IMAGES.principles}
                                alt="Kolaborasi bersama partner"
                                label="principles.jpg"
                                className="h-full w-full"
                            />
                        </div>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        <p className="absolute bottom-5 left-5 max-w-[16rem] text-sm font-semibold leading-6 text-white">
                            Hubungan baik dimulai dari komunikasi yang jujur.
                        </p>
                    </div>

                    <div className="order-1 lg:order-2 lg:col-span-7">
                        <div data-reveal className="rv">
                            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]">
                                Our Principles
                            </p>
                            <h3 className="mt-3 text-3xl font-black leading-[0.92] tracking-[-0.055em] text-black sm:text-4xl lg:text-5xl">
                                Built with
                                <span className="text-neutral-300"> purpose.</span>
                            </h3>
                            <p className="mt-5 max-w-md text-sm leading-7 text-neutral-500">
                                Prinsip sederhana yang kami gunakan untuk menjaga quality of
                                work dan hubungan yang baik dengan setiap partner.
                            </p>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
                            {principles.map((principle, index) => (
                                <div
                                    key={principle.title}
                                    data-reveal
                                    style={{ ['--d' as string]: `${index * 110}ms` }}
                                    className={`rv group relative overflow-hidden border border-black/10 bg-white/80 p-5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-[#7C3AED]/40 hover:shadow-[0_24px_50px_-28px_rgba(124,58,237,0.5)] ${''
                                        } ${index === 1 ? 'sm:mt-6' : ''}`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#7C3AED] opacity-0 transition-opacity duration-500 group-hover:opacity-10"
                                    />
                                    <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition-all duration-300 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white">
                                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                                    </div>
                                    <h4 className="text-xl font-black tracking-[-0.03em] text-black">
                                        {principle.title}
                                    </h4>
                                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                                        {principle.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ============================ CTA ============================ */}
                <div
                    data-reveal
                    className="rv relative mt-16 overflow-hidden bg-black text-white sm:mt-20"
                >
                    <div
                        aria-hidden="true"
                        className="trust-float pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-[#7C3AED] opacity-70"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute right-[34%] top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full border border-white/10 lg:block"
                    />

                    <div className="relative z-10 grid lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="flex flex-col justify-between gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                            <div className="max-w-2xl">
                                <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#E78FBA]">
                                    39Production / Start Something
                                </p>
                                <h3 className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-[0.9] tracking-[-0.06em]">
                                    Have a project
                                    <span className="text-white/35"> in mind?</span>
                                </h3>
                                <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
                                    Punya idea atau project yang sedang disiapkan? Ceritakan
                                    kebutuhanmu, and let's figure out the next step together.
                                </p>
                            </div>

                            <Link
                                to="/contact"
                                className="group inline-flex w-full items-center justify-center gap-3 self-start rounded-full bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-black transition-all duration-300 hover:bg-[#7C3AED] hover:text-white sm:w-auto"
                            >
                                Start a Project
                                <ArrowRight
                                    size={14}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>

                        {/* Foto CTA */}
                        <div className="relative order-first aspect-[16/10] lg:order-none lg:aspect-auto lg:min-h-[320px]">
                            <div className="absolute inset-0 overflow-hidden">
                                <div data-parallax="0.05" className="absolute inset-0 will-change-transform">
                                    <Photo
                                        src={IMAGES.cta}
                                        alt="Tim 39Production"
                                        label="cta.jpg"
                                        className="h-full w-full opacity-90"
                                    />
                                </div>
                            </div>
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black lg:via-black/10 lg:to-transparent" />
                            <div className="pointer-events-none absolute inset-0 bg-[#7C3AED]/20 mix-blend-multiply" />
                            <ArrowUpRight
                                aria-hidden="true"
                                className="absolute bottom-5 right-5 h-5 w-5 text-white/70"
                            />
                        </div>
                    </div>

                    {/* Marquee tagline */}
                    <div className="relative z-10 overflow-hidden border-t border-white/10 py-4">
                        <div className="trust-marquee flex w-max items-center gap-8 whitespace-nowrap">
                            {[...Array(2)].map((_, copy) => (
                                <div key={copy} className="flex items-center gap-8" aria-hidden={copy === 1}>
                                    {TAGLINE.map((t) => (
                                        <span key={t} className="flex items-center gap-8">
                                            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">
                                                {t}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-[#7C3AED]" />
                                        </span>
                                    ))}
                                    {TAGLINE.map((t) => (
                                        <span key={`${t}-b`} className="flex items-center gap-8">
                                            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">
                                                {t}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-[#7C3AED]" />
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .trust .rv {
                    opacity: 0;
                    transform: translate3d(0, 28px, 0);
                    transition:
                        opacity .9s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
                        transform .9s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
                        border-color .5s, box-shadow .5s;
                    will-change: transform, opacity;
                }
                .trust .rv.is-visible {
                    opacity: 1;
                    transform: none;
                }

                .trust .mask {
                    clip-path: inset(0 0 100% 0);
                    transition: clip-path 1.2s cubic-bezier(.77,0,.18,1) var(--d, 0ms);
                }
                .trust .mask.is-visible {
                    clip-path: inset(0 0 0% 0);
                }

                .trust .draw {
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 1s cubic-bezier(.77,0,.18,1) .7s;
                }
                .trust .rv.is-visible .draw {
                    transform: scaleX(1);
                }

                @keyframes trust-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .trust .trust-float { animation: trust-float 6s ease-in-out infinite; }

                @keyframes trust-spin { to { transform: rotate(360deg); } }
                .trust .trust-spin { animation: trust-spin 18s linear infinite; }

                @keyframes trust-marquee { to { transform: translateX(-50%); } }
                .trust .trust-marquee { animation: trust-marquee 28s linear infinite; }

                @keyframes trust-pop {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: none; }
                }
                .trust .trust-pop { animation: trust-pop .5s ease-out both; }

                @media (prefers-reduced-motion: reduce) {
                    .trust .rv,
                    .trust .mask {
                        opacity: 1 !important;
                        transform: none !important;
                        clip-path: none !important;
                        transition: none !important;
                    }
                    .trust .draw { transform: scaleX(1) !important; transition: none !important; }
                    .trust .trust-float,
                    .trust .trust-spin,
                    .trust .trust-marquee,
                    .trust .trust-pop { animation: none !important; }
                }
            `}</style>
        </section>
    )
}