import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Disc3,
  Layers3,
  Music2,
  Sparkles,
  Wand2,
} from 'lucide-react'

const pillars = [
  {
    icon: Music2,
    label: 'Entertainment',
    note: 'Music, artist & story',
  },
  {
    icon: Code2,
    label: 'Creative Technology',
    note: 'Web, app & interactive',
  },
  {
    icon: Wand2,
    label: 'Creative Services',
    note: 'Design, visual & motion',
  },
  {
    icon: Layers3,
    label: 'Digital Products',
    note: 'Ready-to-use works',
  },
]

const TAGLINE = [
  'Creating Digital Works.',
  'Producing Stories.',
  'Sharing Gratitude.',
]

export function CTASection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

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
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  /* Cahaya ungu mengikuti kursor + parallax watermark */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = panel.getBoundingClientRect()
      panel.style.setProperty('--mx', `${e.clientX - r.left}px`)
      panel.style.setProperty('--my', `${e.clientY - r.top}px`)
      panel.style.setProperty(
        '--tx',
        `${(((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3)}`,
      )
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const r = panel.getBoundingClientRect()
        const vh = window.innerHeight
        const p = (r.top + r.height / 2 - vh / 2) / vh
        panel.style.setProperty('--sy', `${(p * -40).toFixed(1)}px`)
        ticking = false
      })
    }

    onScroll()
    panel.addEventListener('pointermove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      panel.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cta-title"
      className="cta relative isolate overflow-hidden border-t border-black/10 bg-white"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <div
        aria-hidden="true"
        className="cta-float pointer-events-none absolute left-[8%] top-[22%] -z-10 h-2 w-2 rounded-full bg-[#7C3AED]"
      />

      <div
        aria-hidden="true"
        className="cta-float pointer-events-none absolute bottom-[20%] right-[9%] -z-10 h-1.5 w-1.5 rounded-full bg-black/20"
        style={{ animationDelay: '-2.5s' }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div
          ref={panelRef}
          data-reveal
          className="rv group/panel relative overflow-hidden border border-neutral-200 bg-neutral-50"
        >
          {/* Cahaya mengikuti kursor */}
          <div
            aria-hidden="true"
            className="cta-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/panel:opacity-100"
          />

          {/* Watermark 39 */}
          <div
            aria-hidden="true"
            className="cta-watermark pointer-events-none absolute -right-4 top-1/2 hidden select-none text-[16rem] font-black leading-none tracking-[-0.14em] lg:block xl:text-[20rem]"
          >
            39
          </div>

          {/* Brand line */}
          <div className="relative z-10 flex flex-col gap-3 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5 lg:px-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black tracking-[-0.04em] text-black">
                39Production
              </span>
              <span className="cta-ping h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Digital Production House
              </span>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Start something worth making
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 px-5 pb-8 pt-10 sm:px-8 sm:pt-12 lg:px-10 lg:pt-14">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
              {/* LEFT */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center bg-black text-white">
                    <Sparkles
                      className="cta-twinkle h-3.5 w-3.5"
                      strokeWidth={1.8}
                    />
                  </span>
                  <span className="cta-grow h-px w-8 origin-left bg-[#7C3AED]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-400">
                    Let&apos;s build something
                  </span>
                </div>

                <h2
                  id="cta-title"
                  className="mt-6 max-w-3xl text-[clamp(3rem,7.2vw,6.2rem)] font-black leading-[0.88] tracking-[-0.075em] text-black"
                >
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span className="cta-line block">Bring your</span>
                  </span>

                  <span className="block overflow-hidden pb-[0.06em]">
                    <span
                      className="cta-line block"
                      style={{ animationDelay: '0.14s' }}
                    >
                      <span className="relative inline-block">
                        idea
                        <span
                          aria-hidden="true"
                          className="cta-draw absolute bottom-[4%] left-0 right-[-4%] h-[0.09em] bg-[#7C3AED]"
                        />
                      </span>{' '}
                      <span className="text-neutral-300">to life.</span>
                    </span>
                  </span>
                </h2>

                <p className="cta-copy mt-6 max-w-xl text-sm leading-7 text-neutral-500 sm:text-[15px]" style={{ animationDelay: '0.5s' }}>
                  Punya project, produk, atau cerita yang ingin diwujudkan?
                  39Production membantu mengubahnya menjadi digital experience,
                  creative work, atau entertainment project yang siap dibuat.
                </p>

                <div
                  className="cta-copy mt-7 flex flex-col gap-3 sm:flex-row"
                  style={{ animationDelay: '0.65s' }}
                >
                  <Link
                    to="/contact"
                    className="group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden bg-black px-7 py-3.5 text-xs font-bold text-white transition-all duration-300 hover:bg-[#7C3AED]"
                  >
                    <span
                      aria-hidden="true"
                      className="cta-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/20"
                    />
                    <span className="relative">Start a Project</span>
                    <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/services"
                    className="group inline-flex min-h-12 items-center justify-center gap-3 border border-black bg-white px-7 py-3.5 text-xs font-bold text-black transition-all duration-300 hover:bg-black hover:text-white"
                  >
                    Explore Services
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* RIGHT — pilar sebagai kotak bergeser */}
              <div className="lg:col-span-5">
                <div
                  data-reveal
                  className="rv mb-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                      What we build
                    </p>
                    <p className="mt-2 max-w-[17rem] text-xs leading-6 text-neutral-500">
                      Satu production house untuk berbagai kebutuhan digital,
                      creative, dan entertainment.
                    </p>
                  </div>
                  <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-neutral-300 sm:block" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {pillars.map((item, index) => {
                    const Icon = item.icon

                    return (
                      <div
                        key={item.label}
                        data-reveal
                        style={{ ['--d' as string]: `${index * 90}ms` }}
                        className={`rv group relative flex min-h-[148px] flex-col justify-between overflow-hidden border border-black/10 bg-white p-4 transition-all duration-500 hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white ${index % 2 === 1 ? 'sm:mt-6' : ''
                          } ${index % 2 === 1 ? 'sm:-mb-6' : ''}`}
                      >
                        <div className="absolute left-0 top-0 h-0.5 w-0 bg-[#7C3AED] transition-all duration-700 group-hover:w-full group-hover:bg-white" />

                        <div className="flex items-start justify-between">
                          <span className="text-[9px] font-black tracking-[0.16em] text-[#7C3AED] transition-colors duration-300 group-hover:text-white">
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          <Icon
                            aria-hidden="true"
                            className="h-5 w-5 text-neutral-400 transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:text-white"
                            strokeWidth={1.7}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-black leading-tight tracking-[-0.025em]">
                            {item.label}
                          </p>
                          <p className="mt-1 text-[10px] font-medium text-neutral-400 transition-colors duration-300 group-hover:text-white/70">
                            {item.note}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Marquee tagline */}
          <div className="relative z-10 mt-6 flex items-center border-t border-black/10 sm:mt-8">
            <div className="hidden shrink-0 items-center gap-3 border-r border-black/10 px-5 py-4 sm:flex lg:px-10">
              <div className="flex h-9 w-9 items-center justify-center bg-black text-white">
                <span className="text-sm font-black tracking-[-0.08em]">39</span>
              </div>
              <div>
                <p className="text-xs font-bold text-black">39Production</p>
                <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-400">
                  Creative Production House
                </p>
              </div>
            </div>

            <div
              aria-label="Creating Digital Works. Producing Stories. Sharing Gratitude."
              className="relative flex-1 overflow-hidden py-4"
            >
              <div className="cta-marquee flex w-max items-center gap-6 whitespace-nowrap">
                {[0, 1].map((copy) => (
                  <div
                    key={copy}
                    aria-hidden={copy === 1}
                    className="flex items-center gap-6"
                  >
                    {Array.from({ length: 4 }).flatMap((_, round) =>
                      TAGLINE.map((t) => (
                        <span
                          key={`${copy}-${round}-${t}`}
                          className="flex items-center gap-6"
                        >
                          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                            {t}
                          </span>
                          <Disc3 className="cta-spin h-3.5 w-3.5 text-[#7C3AED]" />
                        </span>
                      )),
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accent edge */}
          <div
            aria-hidden="true"
            className="cta-edge absolute bottom-0 left-0 h-1 bg-[#7C3AED]"
          />
        </div>
      </div>

      <style>{`
        .cta .rv {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
          transition:
            opacity .9s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            transform .9s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
            background-color .5s, border-color .5s, color .5s;
          will-change: transform, opacity;
        }
        .cta .rv.is-visible { opacity: 1; transform: none; }

        /* Judul naik per baris setelah panel terlihat */
        .cta .cta-line, .cta .cta-copy { opacity: 0; }
        .cta .rv.is-visible .cta-line {
          animation: cta-line-up 1s cubic-bezier(.2,.7,.2,1) .35s both;
        }
        .cta .rv.is-visible .cta-copy {
          animation: cta-fade-up .8s cubic-bezier(.2,.7,.2,1) .5s both;
        }
        @keyframes cta-line-up {
          from { transform: translateY(110%); opacity: 1; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes cta-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }

        .cta .cta-draw {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1s cubic-bezier(.77,0,.18,1) 1.2s;
        }
        .cta .rv.is-visible .cta-draw { transform: scaleX(1); }

        .cta .cta-grow {
          transform: scaleX(0);
          transition: transform 1s cubic-bezier(.77,0,.18,1) .4s;
        }
        .cta .rv.is-visible .cta-grow { transform: scaleX(1); }

        .cta .cta-edge { width: 0; transition: width 1.4s cubic-bezier(.77,0,.18,1) .8s; }
        .cta .rv.is-visible .cta-edge { width: 8rem; }

        /* Cahaya kursor */
        .cta .cta-glow {
          background: radial-gradient(
            420px circle at var(--mx, 50%) var(--my, 50%),
            rgba(124,58,237,.12),
            transparent 60%
          );
        }

        /* Watermark outline, bergerak dengan scroll & kursor */
        .cta .cta-watermark {
          color: transparent;
          -webkit-text-stroke: 1px rgba(0,0,0,.07);
          transform:
            translate3d(calc(var(--tx, 0) * -14px), calc(-50% + var(--sy, 0px)), 0);
          transition: transform .4s ease-out;
        }

        @keyframes cta-shine {
          0%, 60% { left: -50%; }
          100% { left: 130%; }
        }
        .cta .cta-shine { animation: cta-shine 4.5s ease-in-out infinite; }

        @keyframes cta-marquee { to { transform: translateX(-50%); } }
        .cta .cta-marquee { animation: cta-marquee 40s linear infinite; }

        @keyframes cta-spin { to { transform: rotate(360deg); } }
        .cta .cta-spin { animation: cta-spin 6s linear infinite; }

        @keyframes cta-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .cta .cta-float { animation: cta-float 6s ease-in-out infinite; }

        @keyframes cta-ping {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.5); }
          50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
        }
        .cta .cta-ping { animation: cta-ping 2s ease-out infinite; }

        @keyframes cta-twinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.3) rotate(20deg); opacity: .6; }
        }
        .cta .cta-twinkle { animation: cta-twinkle 2.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .cta .rv {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .cta .cta-line, .cta .cta-copy {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
          .cta .rv.is-visible .cta-line,
          .cta .rv.is-visible .cta-copy { animation: none !important; }
          .cta .cta-draw, .cta .cta-grow { transform: scaleX(1) !important; transition: none !important; }
          .cta .cta-edge { width: 8rem !important; transition: none !important; }
          .cta .cta-watermark { transition: none !important; }
          .cta .cta-shine, .cta .cta-marquee, .cta .cta-spin, .cta .cta-float,
          .cta .cta-ping, .cta .cta-twinkle { animation: none !important; }
        }
      `}</style>
    </section>
  )
}