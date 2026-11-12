import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    Lightbulb,
    MessageSquareText,
    Rocket,
    WalletCards,
} from 'lucide-react'

import processHero from '../../assets/process-hero.jpg'
import processStep1 from '../../assets/process-step-1-tell.jpg'
import processStep2 from '../../assets/process-step-2-request.jpg'
import processStep3 from '../../assets/process-step-3-quote.jpg'
import processStep4 from '../../assets/process-step-4-accept.jpg'
import processStep5 from '../../assets/process-step-5-pay.jpg'
import processStep6 from '../../assets/process-step-6-build.jpg'
import processCta from '../../assets/process-cta.jpg'

import logo39 from '../../assets/logo-39production.png'
/**
 * FOTO & LOGO — letakkan file di /public/images/process/ (atau ganti path di bawah).
 * Rekomendasi: JPG/WebP, lebar min. 1000px.
 * LOGO: kalau punya logo sendiri, taruh di /public/images/logo-39.svg (atau .png).
 * Kalau file belum ada, otomatis tampil placeholder gradient ungu / logo teks "39".
 */
const IMAGES = {
    hero: processHero, // 4:3
    step1: processStep1,
    step2: processStep2,
    step3: processStep3,
    step4: processStep4,
    step5: processStep5,
    step6: processStep6,
    cta: processCta, // 4:3
}

const LOGO = logo39

const steps = [
    {
        number: '01',
        icon: Lightbulb,
        title: 'Tell Us',
        tag: 'Idea',
        image: IMAGES.step1,
        description:
            'Ceritakan ide, kebutuhan, atau project yang ingin kamu wujudkan bersama 39Production.',
    },
    {
        number: '02',
        icon: MessageSquareText,
        title: 'Request Quote',
        tag: 'No payment',
        image: IMAGES.step2,
        description:
            'Kirim request tanpa pembayaran. Di tahap ini belum ada harga final dan belum ada order.',
    },
    {
        number: '03',
        icon: FileText,
        title: 'Get Your Quote',
        tag: 'Review',
        image: IMAGES.step3,
        description:
            'Kami review kebutuhan dan scope project, lalu memberikan quotation dengan harga final dan DP.',
    },
    {
        number: '04',
        icon: CheckCircle2,
        title: 'Accept',
        tag: 'Agreement',
        image: IMAGES.step4,
        description:
            'Review quotation yang diberikan. Jika sudah sesuai, kamu dapat menerima penawaran tersebut.',
    },
    {
        number: '05',
        icon: WalletCards,
        title: 'Pay DP',
        tag: 'Down payment',
        image: IMAGES.step5,
        description:
            'Setelah quotation diterima, lakukan pembayaran DP sesuai jumlah yang tercantum.',
    },
    {
        number: '06',
        icon: Rocket,
        title: 'We Build',
        tag: 'Production',
        image: IMAGES.step6,
        description:
            'Setelah DP terkonfirmasi, project mulai dikerjakan sesuai scope dan kesepakatan.',
    },
]

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
                className={`flex items-end overflow-hidden bg-neutral-100 ${className}`}
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 20% 15%, rgba(124,58,237,.35), transparent 55%), radial-gradient(circle at 85% 90%, rgba(231,143,186,.35), transparent 50%)',
                }}
            >
                <span className="m-2 font-mono text-[8px] uppercase tracking-[0.18em] text-black/35">
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

/* Logo 39 — pakai file logo kalau ada, fallback ke mark teks */
function LogoMark({ className = '' }: { className?: string }) {
    const [failed, setFailed] = useState(false)

    return (
        <div
            className={`flex items-center justify-center bg-[#7C3AED] text-white ${className}`}
        >
            {failed ? (
                <span className="text-base font-black leading-none tracking-[-0.06em]">
                    39
                </span>
            ) : (
                <img
                    src={LOGO}
                    alt="39Production"
                    onError={() => setFailed(true)}
                    className="h-3/5 w-3/5 object-contain"
                />
            )}
        </div>
    )
}

export function HowItWorksSection() {
    const sectionRef = useRef<HTMLElement | null>(null)
    const timelineRef = useRef<HTMLDivElement | null>(null)

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
            { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
        )

        items.forEach((item) => observer.observe(item))
        return () => observer.disconnect()
    }, [])

    /* Parallax ringan */
    useEffect(() => {
        const section = sectionRef.current
        if (!section) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const els = Array.from(
            section.querySelectorAll<HTMLElement>('[data-parallax]'),
        )
        let ticking = false

        const update = () => {
            const vh = window.innerHeight
            els.forEach((el) => {
                const speed = Number(el.getAttribute('data-parallax')) || 0.06
                const rect = el.parentElement!.getBoundingClientRect()
                if (rect.bottom < -200 || rect.top > vh + 200) return
                const offset = (rect.top + rect.height / 2 - vh / 2) * speed
                el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.14)`
            })
            const tl = timelineRef.current
            if (tl) {
                const r = tl.getBoundingClientRect()
                const p = Math.min(
                    1,
                    Math.max(0, (vh * 0.6 - r.top) / Math.max(r.height, 1)),
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
            id="how-it-works"
            aria-labelledby="process-section-title"
            className="hw relative overflow-hidden bg-white text-zinc-950"
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
                <div className="hw-float absolute right-[8%] top-[18%] h-2 w-2 rounded-full bg-[#7C3AED]" />
                <div
                    className="hw-float absolute bottom-[22%] left-[5%] h-1.5 w-1.5 rounded-full bg-[#7C3AED]"
                    style={{ animationDelay: '-2.5s' }}
                />
            </div>

            <div className="relative mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
                {/* Section Header */}
                <div
                    data-reveal
                    className="rv flex items-center justify-between border-t border-black/10 pt-4"
                >
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

                {/* ============================ INTRO ============================ */}
                <div className="mt-6 grid gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
                    <div className="lg:col-span-6">
                        <p
                            data-reveal
                            className="rv mb-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7C3AED]"
                        >
                            Our Process
                        </p>

                        <h2
                            id="process-section-title"
                            data-reveal
                            style={{ ['--d' as string]: '80ms' }}
                            className="rv text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-[0.9] tracking-[-0.065em] text-black"
                        >
                            From request
                            <br />
                            <span className="relative inline-block">
                                <span className="relative z-10 text-neutral-300">
                                    to production.
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="draw absolute bottom-[2%] left-0 right-[-2%] z-0 h-[0.09em] bg-[#7C3AED]"
                                />
                            </span>
                        </h2>

                        <div
                            data-reveal
                            style={{ ['--d' as string]: '160ms' }}
                            className="rv mt-6 max-w-md space-y-3"
                        >
                            <p className="text-sm font-medium leading-7 text-neutral-600 sm:text-[15px]">
                                Tidak perlu langsung tahu semuanya. Mulai dari
                                kebutuhanmu, lalu kami bantu menerjemahkannya
                                menjadi scope dan langkah kerja yang jelas.
                            </p>
                            <p className="text-sm font-medium leading-7 text-neutral-500">
                                Proses dibuat sederhana dan transparan. Kamu tahu
                                apa yang terjadi di setiap tahap sebelum project
                                benar-benar mulai dikerjakan.
                            </p>
                        </div>

                        <div
                            data-reveal
                            style={{ ['--d' as string]: '240ms' }}
                            className="rv mt-6 flex items-center gap-3"
                        >
                            <span className="h-px w-10 bg-[#7C3AED]" />
                            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Request / Quote / Production
                            </span>
                        </div>
                    </div>

                    {/* Foto hero + logo */}
                    <div className="relative mt-2 lg:col-span-6 lg:mt-0">
                        <div
                            data-reveal
                            className="mask relative aspect-[4/3] w-full overflow-hidden bg-neutral-100"
                        >
                            <div
                                data-parallax="0.06"
                                className="absolute inset-0 will-change-transform"
                            >
                                <Photo
                                    src={IMAGES.hero}
                                    alt="Diskusi kebutuhan project bersama 39Production"
                                    label="hero.jpg"
                                    className="h-full w-full"
                                />
                            </div>
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white sm:inset-x-5 sm:bottom-5">
                                <div className="flex items-center gap-3">
                                    <LogoMark className="h-9 w-9 shrink-0" />
                                    <div>
                                        <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/60">
                                            39Production
                                        </p>
                                        <p className="text-sm font-black tracking-[-0.02em]">
                                            Clear scope. Clear quote.
                                        </p>
                                    </div>
                                </div>
                                <span className="hidden font-mono text-[9px] tracking-[0.18em] text-white/60 sm:block">
                                    06 Steps
                                </span>
                            </div>
                        </div>

                        {/* Chip: no payment */}
                        <div className="hw-float absolute -top-3 right-3 flex items-center gap-2 bg-[#7C3AED] px-3 py-2 text-white shadow-lg sm:-right-3 sm:-top-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            <span className="text-[8px] font-bold uppercase tracking-[0.16em]">
                                No payment at quote stage
                            </span>
                        </div>
                    </div>
                </div>

                {/* ============================ STEPS ============================ */}
                <div
                    data-reveal
                    className="rv mt-6 flex flex-col gap-2 border-t border-black/10 pt-4 sm:mt-16 sm:gap-3 sm:pt-6 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                            Before Production
                        </p>
                        <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-black sm:text-3xl">
                            Know the path
                            <span className="text-neutral-300"> before we build.</span>
                        </h3>
                    </div>

                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                        01 → 06
                    </span>
                </div>

                <div
                    ref={timelineRef}
                    className="relative mt-5 sm:mt-8"
                    style={{ ['--progress' as string]: 0 }}
                >
                    {/* Garis proses */}
                    <span
                        aria-hidden="true"
                        className="absolute bottom-4 left-4 top-4 w-px bg-black/10 md:left-1/2"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute bottom-4 left-4 top-4 w-px origin-top bg-[#7C3AED] md:left-1/2"
                        style={{ transform: 'scaleY(var(--progress))' }}
                    />

                    <div className="space-y-4 sm:space-y-5">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const right = index % 2 === 1

                            return (
                                <div
                                    key={step.number}
                                    data-reveal
                                    className="rv hw-row group grid grid-cols-[32px_1fr] items-center gap-x-4 md:grid-cols-[1fr_48px_1fr] md:gap-x-0"
                                >
                                    {/* Node */}
                                    <div className="relative z-10 col-start-1 row-start-1 flex justify-center md:col-start-2">
                                        <span className="hw-node relative flex h-8 w-8 items-center justify-center border border-black/15 bg-white font-mono text-[9px] font-bold tracking-[0.08em] text-[#7C3AED] transition-all duration-500">
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Kartu kompak */}
                                    <div
                                        className={`relative col-start-2 row-start-1 ${right
                                            ? 'md:col-start-3 md:pl-8'
                                            : 'md:col-start-1 md:justify-self-end md:pr-8'
                                            } w-full md:max-w-[460px]`}
                                    >
                                        {/* Konektor ke node (desktop) */}
                                        <span
                                            aria-hidden="true"
                                            className={`absolute top-1/2 hidden h-px w-8 bg-black/15 transition-colors duration-500 group-hover:bg-[#7C3AED] md:block ${right ? 'left-0' : 'right-0'
                                                }`}
                                        />

                                        <article className="relative flex gap-3.5 overflow-hidden border border-black/10 bg-white p-2.5 transition-all duration-500 group-hover:border-[#7C3AED]/50 group-hover:shadow-[0_18px_40px_-24px_rgba(124,58,237,0.55)] sm:gap-4 sm:p-3">
                                            <div className="absolute left-0 top-0 z-10 h-0.5 w-0 bg-[#7C3AED] transition-all duration-700 group-hover:w-full" />

                                            <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden bg-neutral-100 sm:h-[108px] sm:w-[108px]">
                                                <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.1]">
                                                    <Photo
                                                        src={step.image}
                                                        alt={step.title}
                                                        label={`step-${step.number}`}
                                                        className="h-full w-full"
                                                    />
                                                </div>
                                                <div className="pointer-events-none absolute inset-0 bg-[#7C3AED]/0 mix-blend-multiply transition-colors duration-500 group-hover:bg-[#7C3AED]/20" />
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5 pr-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
                                                        {step.tag}
                                                    </span>
                                                    <Icon
                                                        className="h-4 w-4 text-neutral-300 transition-colors duration-300 group-hover:text-[#7C3AED]"
                                                        strokeWidth={1.7}
                                                    />
                                                </div>

                                                <h3 className="mt-1 text-base font-black tracking-[-0.03em] text-black sm:text-lg">
                                                    {step.title}
                                                </h3>

                                                <p className="mt-1 text-[11px] font-medium leading-5 text-neutral-500 sm:text-xs sm:leading-5">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </article>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ============================ PAYMENT / CTA ============================ */}
                <div
                    data-reveal
                    className="rv relative mt-10 overflow-hidden bg-black text-white sm:mt-14"
                >
                    <div
                        aria-hidden="true"
                        className="hw-float pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#7C3AED] opacity-60"
                    />

                    <div className="relative z-10 grid lg:grid-cols-[1.3fr_0.7fr]">
                        <div className="flex flex-col justify-between gap-7 p-6 sm:p-8 lg:p-10">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 text-[#E78FBA]">
                                    <WalletCards className="h-[18px] w-[18px]" strokeWidth={1.7} />
                                </div>

                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#E78FBA]">
                                        Quotation First
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black leading-[1] tracking-[-0.045em] sm:text-3xl">
                                        No payment when requesting a quote.
                                    </h3>
                                    <p className="mt-3 max-w-xl text-xs font-medium leading-6 text-white/55 sm:text-sm">
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
                                className="group inline-flex w-full items-center justify-center gap-3 bg-white px-5 py-3.5 text-[9px] font-bold uppercase tracking-[0.14em] text-black transition-all duration-300 hover:bg-[#7C3AED] hover:text-white sm:w-fit"
                            >
                                Request a Quote
                                <ArrowRight
                                    size={14}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </Link>
                        </div>

                        <div className="relative order-first aspect-[16/9] overflow-hidden lg:order-none lg:aspect-auto lg:min-h-[280px]">
                            <div
                                data-parallax="0.05"
                                className="absolute inset-0 will-change-transform"
                            >
                                <Photo
                                    src={IMAGES.cta}
                                    alt="Tim 39Production"
                                    label="cta.jpg"
                                    className="h-full w-full opacity-90"
                                />
                            </div>
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent lg:bg-gradient-to-r lg:from-black lg:via-black/10 lg:to-transparent" />
                            <div className="pointer-events-none absolute inset-0 bg-[#7C3AED]/20 mix-blend-multiply" />
                        </div>
                    </div>

                    {/* Marquee langkah */}
                    <div
                        aria-hidden="true"
                        className="relative z-10 overflow-hidden border-t border-white/10 py-3.5"
                    >
                        <div className="hw-marquee flex w-max items-center gap-7 whitespace-nowrap">
                            {[0, 1].map((copy) => (
                                <div key={copy} className="flex items-center gap-7">
                                    {[...steps, ...steps].map((s, i) => (
                                        <span key={`${copy}-${i}`} className="flex items-center gap-7">
                                            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">
                                                {s.number} {s.title}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-[#7C3AED]" />
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Statement */}
                <div
                    data-reveal
                    className="rv mt-8 flex flex-col gap-3 border-t border-black/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <LogoMark className="h-6 w-6" />
                        <p className="text-xs font-medium leading-6 text-neutral-500 sm:text-sm">
                            Clear scope. Clear quotation. Then we build.
                        </p>
                    </div>

                    <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                        39 / Sankyuu Production
                    </span>
                </div>
            </div>

            <style>{`
                .hw .rv {
                    opacity: 0;
                    transform: translate3d(0, 24px, 0);
                    transition:
                        opacity .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
                        transform .85s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
                        border-color .5s, box-shadow .5s;
                    will-change: transform, opacity;
                }
                .hw .rv.is-visible { opacity: 1; transform: none; }
                
                .hw .mask {
                    clip-path: inset(0 0 100% 0);
                    transition: clip-path 1.2s cubic-bezier(.77,0,.18,1) var(--d, 0ms);
                }
                .hw .mask.is-visible { clip-path: inset(0 0 0% 0); }

                .hw .draw {
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 1s cubic-bezier(.77,0,.18,1) .7s;
                }
                .hw .rv.is-visible .draw { transform: scaleX(1); }

                .hw .hw-row.is-visible .hw-node {
                    background: #7C3AED;
                    border-color: #7C3AED;
                    color: #fff;
                    animation: hw-pulse 1.6s ease-out .5s 1;
                }
                @keyframes hw-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(124,58,237,.45); }
                    100% { box-shadow: 0 0 0 14px rgba(124,58,237,0); }
                }

                @keyframes hw-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-9px); }
                }
                .hw .hw-float { animation: hw-float 6s ease-in-out infinite; }

                @keyframes hw-marquee { to { transform: translateX(-50%); } }
                .hw .hw-marquee { animation: hw-marquee 40s linear infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .hw .rv, .hw .mask {
                        opacity: 1 !important;
                        transform: none !important;
                        clip-path: none !important;
                        transition: none !important;
                    }
                    .hw .draw { transform: scaleX(1) !important; transition: none !important; }
                    .hw .hw-float, .hw .hw-marquee, .hw .hw-row .hw-node { animation: none !important; }
                }
            `}</style>
        </section>
    )
}