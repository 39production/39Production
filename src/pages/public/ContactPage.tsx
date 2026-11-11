import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Loader2,
} from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const initialForm: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const topics = [
  'Website Development',
  'UI/UX Design',
  'Animation',
  'Game Development',
  'Music & Idol Project',
  'Collaboration',
]

const delay = (ms: number) =>
  ({ '--d': `${ms}ms` }) as CSSProperties

export function ContactPage() {
  const [form, setForm] =
    useState<ContactForm>(initialForm)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [submitted, setSubmitted] =
    useState(false)

  const [error, setError] =
    useState('')

  const rootRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)

  const filled = [
    form.name,
    form.email,
    form.subject,
    form.message,
  ].filter((value) => value.trim()).length

  const handleChange = (
    field: keyof ContactForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    if (error) {
      setError('')
    }

    if (submitted) {
      setSubmitted(false)
    }
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setSubmitted(false)
    setIsSubmitting(true)

    try {
      const name = form.name.trim()
      const email = form.email.trim()
      const subject = form.subject.trim()
      const message = form.message.trim()

      if (!name || !email || !subject || !message) {
        throw new Error(
          'Silakan lengkapi semua field yang diperlukan.',
        )
      }

      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailPattern.test(email)) {
        throw new Error(
          'Silakan masukkan alamat email yang valid.',
        )
      }

      const emailSubject =
        `[39Production] ${subject}`

      const emailBody = [
        `Hello 39Production,`,
        '',
        `Saya ingin menghubungi 39Production mengenai:`,
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        `Message:`,
        message,
        '',
        'Sent from the 39Production website.',
      ].join('\n')

      const mailtoUrl =
        `mailto:39production.contact@gmail.com` +
        `?subject=${encodeURIComponent(
          emailSubject,
        )}` +
        `&body=${encodeURIComponent(
          emailBody,
        )}`

      window.location.href = mailtoUrl

      setSubmitted(true)
      setForm(initialForm)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan. Silakan coba lagi.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /* Reveal saat di-scroll */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const items = root.querySelectorAll('[data-reveal]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(x * 22).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
  }

  const onLeave = () => {
    const el = stageRef.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }

  const fieldCell =
    'ct-field relative border-b border-r border-zinc-200 p-5 sm:p-6'

  const inputClass =
    'mt-3 w-full border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base'

  const labelClass =
    'flex items-center justify-between font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-zinc-400'

  return (
    <>
      <Helmet>
        <title>
          Contact 39Production — Creative Technology & Entertainment
        </title>

        <meta
          name="description"
          content="Hubungi 39Production untuk project web development, UI/UX design, graphic design, animation, game development, multimedia, creative technology, dan entertainment production."
        />

        <meta
          name="keywords"
          content="contact 39Production, 39Production contact, creative technology Indonesia, digital production house Indonesia, web development Indonesia, UI UX design Indonesia, animation studio Indonesia, game development Indonesia, entertainment production"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href="https://39production.github.io/39Production/contact"
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:title"
          content="Contact 39Production — Creative Technology & Entertainment"
        />

        <meta
          property="og:description"
          content="Hubungi 39Production untuk membicarakan project digital, creative technology, design, animation, game, multimedia, dan entertainment production."
        />

        <meta
          property="og:url"
          content="https://39production.github.io/39Production/contact"
        />

        <meta
          property="og:site_name"
          content="39Production"
        />

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content="Contact 39Production — Creative Technology & Entertainment"
        />

        <meta
          name="twitter:description"
          content="Hubungi 39Production untuk project digital, creative technology, design, animation, game, multimedia, dan entertainment production."
        />
      </Helmet>

      <main
        ref={rootRef}
        className="ct min-h-screen overflow-x-hidden bg-white text-zinc-900"
      >
        <EditorialGrid />

        {/* =====================================================
            MASTHEAD / HERO
        ===================================================== */}

        <section className="relative border-b-2 border-zinc-950">
          <div className="mx-auto max-w-7xl px-5 pb-10 pt-[84px] sm:px-6 sm:pb-14 sm:pt-[100px] lg:px-8 lg:pt-[108px]">
            {/* Dateline */}
            <div
              className="ct-in flex items-center justify-between gap-4 border-b border-zinc-200 pb-3"
              style={delay(0)}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="ct-blink h-1.5 w-1.5 shrink-0 bg-violet-600" />
                <span className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-violet-600 sm:text-[10px]">
                  39Production
                </span>
                <span className="hidden h-1 w-1 bg-zinc-300 sm:block" />
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 sm:block sm:text-[10px]">
                  Contact / Newsroom Desk
                </span>
              </div>

              <span className="flex shrink-0 items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:text-[10px]">
                <span className="ct-blink h-1.5 w-1.5 bg-emerald-500" />
                Desk open
              </span>
            </div>

            <div className="grid items-center gap-8 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
              {/* Headline */}
              <div className="relative z-10">
                <p
                  className="ct-in flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px]"
                  style={delay(80)}
                >
                  <span className="ct-grow h-px w-8 bg-violet-600" />
                  Projects · Ideas · Collaboration
                </p>

                <h1 className="mt-5 text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.07em] text-zinc-950 sm:text-7xl lg:text-[5.6rem] xl:text-[6.4rem]">
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span className="ct-up block" style={delay(140)}>
                      Let's make
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span className="ct-up block" style={delay(240)}>
                      something
                    </span>
                  </span>
                  <span className="block overflow-hidden pb-[0.06em]">
                    <span
                      className="ct-up block text-violet-600"
                      style={delay(340)}
                    >
                      happen.
                    </span>
                  </span>
                </h1>

                <div
                  className="ct-in mt-7 sm:mt-9"
                  style={delay(460)}
                >
                  <p className="max-w-xl text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                    Punya project, ide kreatif, atau membutuhkan partner
                    untuk mengembangkan sesuatu? Ceritakan apa yang
                    sedang kamu bangun, ciptakan, atau bayangkan — lalu
                    let's see what we can create together.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <a
                      href="#form"
                      className="group inline-flex items-center gap-3 bg-zinc-950 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-violet-600"
                    >
                      Write to us
                      <ArrowDownRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                    </a>

                    <div className="flex items-center gap-4">
                      <span className="hidden font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400 sm:block">
                        Prefer a direct
                        <br />
                        conversation?
                      </span>
                      <WhatsAppButton variant="inline" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage 3D: amplop */}
              <div
                ref={stageRef}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className="ct-in ct-stage relative h-[300px] sm:h-[400px] lg:h-[470px]"
                style={delay(220)}
              >
                <div className="ct-tilt absolute inset-0">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 border border-zinc-200"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-2.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[9px]"
                  >
                    Fig.02 / Incoming
                  </span>

                  <div
                    aria-hidden="true"
                    className="ct-floor pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                  />

                  {/* Amplop */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[44%]"
                  >
                    <div className="ct-float">
                      <div className="ct-env">
                        <div className="ct-env-back" />

                        <div className="ct-letter">
                          <i />
                          <i />
                          <i />
                          <strong>39</strong>
                        </div>

                        <div className="ct-env-front" />
                        <div className="ct-env-flap" />
                      </div>
                    </div>
                  </div>

                  {/* Gelembung chat */}
                  <div
                    aria-hidden="true"
                    className="ct-z-a pointer-events-none absolute left-[5%] top-[14%]"
                  >
                    <div className="ct-float-slow">
                      <div className="ct-bubble">
                        <span className="ct-dots">
                          <b />
                          <b />
                          <b />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kubus */}
                  <div
                    aria-hidden="true"
                    className="ct-z-a pointer-events-none absolute right-[8%] top-[14%]"
                  >
                    <div className="ct-float-slow" style={{ animationDelay: '-3s' }}>
                      <div className="ct-cube">
                        <i className="f1">@</i>
                        <i className="f2" />
                        <i className="f3">39</i>
                        <i className="f4" />
                        <i className="f5" />
                        <i className="f6" />
                      </div>
                    </div>
                  </div>

                  {/* Bola */}
                  <div
                    aria-hidden="true"
                    className="ct-z-b pointer-events-none absolute bottom-[14%] right-[10%]"
                  >
                    <div className="ct-float" style={{ animationDelay: '-2s' }}>
                      <div className="ct-sphere" />
                    </div>
                  </div>

                  {/* Label */}
                  <div
                    aria-hidden="true"
                    className="ct-z-b pointer-events-none absolute bottom-[12%] left-[6%]"
                  >
                    <div className="ct-float" style={{ animationDelay: '-4s' }}>
                      <div className="ct-plane border border-zinc-950 bg-white px-2.5 py-1.5 shadow-[5px_5px_0_0_rgba(124,58,237,0.9)]">
                        <p className="flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-violet-600">
                          <span className="ct-blink h-1.5 w-1.5 bg-violet-600" />
                          New message
                        </p>
                      </div>
                    </div>
                  </div>

                  {[
                    ['12%', '48%'],
                    ['90%', '56%'],
                    ['46%', '90%'],
                  ].map(([l, t], i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="ct-twinkle pointer-events-none absolute h-1.5 w-1.5 bg-violet-600"
                      style={{ left: l, top: t, animationDelay: `${i * 0.7}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ticker topik */}
          <div className="overflow-hidden border-t border-zinc-950 bg-zinc-950 text-white">
            <div className="ct-marquee flex w-max items-center py-3">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex items-center"
                >
                  {topics.map((word) => (
                    <span
                      key={`${copy}-${word}`}
                      className="flex items-center gap-5 whitespace-nowrap px-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                      {word}
                      <span className="h-1.5 w-1.5 bg-violet-500" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTACT DESK
        ===================================================== */}

        <section id="form" className="scroll-mt-20 border-b border-zinc-200">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
              {/* CONTACT INFO */}

              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div
                  data-reveal
                  className="ct-rv flex items-center gap-3 border-b-2 border-zinc-950 pb-3"
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-600">
                    01
                  </span>
                  <span className="h-px w-8 bg-violet-600" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Contact desk
                  </span>
                </div>

                <h2
                  data-reveal
                  style={delay(60)}
                  className="ct-rv mt-5 text-2xl font-semibold leading-tight tracking-[-0.04em] text-zinc-950 sm:text-3xl"
                >
                  Choose the way
                  <span className="block text-zinc-400">
                    you want to connect.
                  </span>
                </h2>

                <p
                  data-reveal
                  style={delay(100)}
                  className="ct-rv mt-4 text-sm leading-7 text-zinc-500"
                >
                  Untuk inquiry project, collaboration, proposal,
                  maupun pertanyaan lainnya, kamu bisa menghubungi kami
                  melalui salah satu channel berikut.
                </p>

                <div className="mt-7 border border-zinc-950">
                  <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-white">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                      Channels
                    </p>
                    <span className="ct-blink h-1.5 w-1.5 bg-violet-400" />
                  </div>

                  {/* WHATSAPP */}

                  <div
                    data-reveal
                    className="ct-rv group relative border-b border-zinc-200 p-4 transition-colors hover:bg-emerald-50/40 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-100 bg-emerald-50 transition-transform duration-500 group-hover:-rotate-6">
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
                        </div>

                        <div>
                          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                            01 · Fastest
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                            WhatsApp
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Fast & direct communication
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                    </div>

                    <div className="mt-4 pl-14">
                      <WhatsAppButton variant="inline" />
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div
                    data-reveal
                    style={delay(80)}
                    className="ct-rv group relative border-b border-zinc-200 p-4 transition-colors hover:bg-blue-50/40 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-100 bg-blue-50 transition-transform duration-500 group-hover:-rotate-6">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-blue-600">
                            02 · Detailed
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                            Email
                          </h3>

                          <p className="mt-1 break-all text-xs leading-5 text-zinc-500">
                            39production.contact@gmail.com
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                    </div>

                    <a
                      href="mailto:39production.contact@gmail.com"
                      className="mt-4 ml-14 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-700 transition-colors hover:text-violet-600"
                    >
                      Send an email
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* LOCATION */}

                  <div
                    data-reveal
                    style={delay(160)}
                    className="ct-rv group relative p-4 transition-colors hover:bg-violet-50/40 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-violet-100 bg-violet-50 transition-transform duration-500 group-hover:-rotate-6">
                          <MapPin className="h-4 w-4 text-violet-600" />
                        </div>

                        <div>
                          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-violet-600">
                            03 · Base
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                            Location
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Remote / Indonesia
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-violet-600" />
                    </div>

                    <p className="mt-4 ml-14 text-xs leading-6 text-zinc-500">
                      39Production beroperasi secara remote dan dapat
                      berkolaborasi dengan client maupun creative
                      partner dari berbagai lokasi.
                    </p>
                  </div>
                </div>
              </aside>

              {/* =================================================
                  FORM
              ================================================= */}

              <div>
                <div
                  data-reveal
                  className="ct-rv flex items-center gap-3 border-b-2 border-zinc-950 pb-3"
                >
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-600">
                    02
                  </span>
                  <span className="h-px w-8 bg-violet-600" />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Start a project · Letter to the studio
                  </span>
                </div>

                <div
                  data-reveal
                  style={delay(60)}
                  className="ct-rv mt-5 flex items-end justify-between gap-4"
                >
                  <h2 className="text-3xl font-semibold leading-[1.02] tracking-[-0.05em] text-zinc-950 sm:text-5xl">
                    Tell us about it.
                  </h2>

                  <div className="hidden h-12 w-12 shrink-0 items-center justify-center border border-zinc-200 sm:flex">
                    <ArrowDownRight className="h-5 w-5 text-zinc-400" />
                  </div>
                </div>

                <p
                  data-reveal
                  style={delay(100)}
                  className="ct-rv mt-4 max-w-2xl text-sm leading-7 text-zinc-500"
                >
                  Ceritakan project, kebutuhan, timeline, atau ide yang
                  ingin kamu diskusikan. Setelah submit, aplikasi email
                  akan terbuka dengan pesan yang sudah disiapkan.
                </p>

                {/* SUCCESS */}

                {submitted && (
                  <div
                    role="status"
                    className="ct-pop mt-6 border border-emerald-200 bg-emerald-50 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <div>
                        <p className="text-sm font-semibold text-emerald-700">
                          Pesan berhasil disiapkan
                        </p>

                        <p className="mt-1 text-sm leading-6 text-emerald-600">
                          Aplikasi email kamu seharusnya sudah terbuka
                          dengan pesan yang siap dikirim ke
                          39Production.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <div
                    role="alert"
                    className="ct-pop mt-6 border border-red-200 bg-red-50 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                      <div>
                        <p className="text-sm font-semibold text-red-700">
                          Unable to submit
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-600">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form
                  className="mt-6"
                  onSubmit={handleSubmit}
                >
                  {/* Progress */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={`h-[3px] flex-1 transition-colors duration-500 ${i < filled ? 'bg-violet-600' : 'bg-zinc-200'}`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      {filled}/4 filled
                    </span>
                  </div>

                  <div
                    data-reveal
                    className="ct-rv grid grid-cols-1 border-l border-t border-zinc-200 sm:grid-cols-2"
                  >
                    {/* NAME */}

                    <div className={fieldCell}>
                      <label
                        htmlFor="contact-name"
                        className={labelClass}
                      >
                        <span>
                          Name
                          <span className="ml-1 text-violet-600">
                            *
                          </span>
                        </span>
                        <span className="text-zinc-300">01</span>
                      </label>

                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                          handleChange(
                            'name',
                            event.target.value,
                          )
                        }
                        placeholder="Nama kamu"
                        autoComplete="name"
                        required
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </div>

                    {/* EMAIL */}

                    <div className={fieldCell}>
                      <label
                        htmlFor="contact-email"
                        className={labelClass}
                      >
                        <span>
                          Email
                          <span className="ml-1 text-violet-600">
                            *
                          </span>
                        </span>
                        <span className="text-zinc-300">02</span>
                      </label>

                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          handleChange(
                            'email',
                            event.target.value,
                          )
                        }
                        placeholder="your@email.com"
                        autoComplete="email"
                        required
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </div>

                    {/* SUBJECT */}

                    <div className={`${fieldCell} sm:col-span-2`}>
                      <label
                        htmlFor="contact-subject"
                        className={labelClass}
                      >
                        <span>
                          Subject
                          <span className="ml-1 text-violet-600">
                            *
                          </span>
                        </span>
                        <span className="text-zinc-300">03</span>
                      </label>

                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={(event) =>
                          handleChange(
                            'subject',
                            event.target.value,
                          )
                        }
                        placeholder="Contoh: Website Development"
                        required
                        disabled={isSubmitting}
                        className={inputClass}
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        {topics.map((topic) => (
                          <button
                            key={topic}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              handleChange('subject', topic)
                            }
                            className={`border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${form.subject === topic
                              ? 'border-violet-600 bg-violet-600 text-white'
                              : 'border-zinc-200 text-zinc-500 hover:border-violet-600 hover:text-violet-600'
                              }`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* MESSAGE */}

                    <div className={`${fieldCell} sm:col-span-2`}>
                      <label
                        htmlFor="contact-message"
                        className={labelClass}
                      >
                        <span>
                          Message
                          <span className="ml-1 text-violet-600">
                            *
                          </span>
                        </span>
                        <span className="text-zinc-300">
                          {form.message.length} chars
                        </span>
                      </label>

                      <textarea
                        id="contact-message"
                        name="message"
                        rows={8}
                        value={form.message}
                        onChange={(event) =>
                          handleChange(
                            'message',
                            event.target.value,
                          )
                        }
                        placeholder="Ceritakan project, kebutuhan, timeline, atau pertanyaan yang ingin kamu diskusikan..."
                        required
                        disabled={isSubmitting}
                        className={`${inputClass} resize-none leading-7`}
                      />
                    </div>
                  </div>

                  {/* SUBMIT */}

                  <div className="flex flex-col gap-5 border-b border-zinc-200 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-xs leading-5 text-zinc-400">
                      Form ini akan membuka aplikasi email default
                      dengan pesan yang sudah terisi.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden bg-zinc-950 px-7 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section>
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div
              data-reveal
              className="ct-rv relative overflow-hidden bg-zinc-950 px-6 py-12 text-white sm:px-12 sm:py-14"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-2 select-none text-[12rem] font-black leading-none tracking-[-0.12em] text-white/[0.05] sm:text-[18rem]"
              >
                39
              </div>

              <div className="relative max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-violet-400">
                    03
                  </span>
                  <span className="h-px w-8 bg-violet-400" />
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    Good to know
                  </p>
                </div>

                <p className="mt-6 text-3xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
                  Good projects start with a{' '}
                  <span className="text-violet-400">
                    good conversation.
                  </span>
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/services"
                    className="group inline-flex items-center justify-center gap-3 bg-violet-600 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-violet-500"
                  >
                    Explore services
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    to="/portfolio"
                    className="group inline-flex items-center justify-center gap-3 border border-white/20 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition-colors hover:border-violet-400 hover:text-violet-300"
                  >
                    See our work
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <style>{`
          html { scroll-behavior: smooth; }

          /* ---------- Reveal ---------- */
          @keyframes ct-in {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .ct .ct-in {
            opacity: 0;
            animation: ct-in .85s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
          }

          .ct .ct-rv {
            opacity: 0;
            transform: translate3d(0, 26px, 0);
            transition:
              opacity .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms),
              transform .8s cubic-bezier(.2,.7,.2,1) var(--d, 0ms);
          }
          .ct .ct-rv.is-visible { opacity: 1; transform: none; }

          @keyframes ct-up {
            from { transform: translateY(105%); }
            to   { transform: translateY(0); }
          }
          .ct .ct-up {
            transform: translateY(105%);
            animation: ct-up .95s cubic-bezier(.22,1,.36,1) var(--d, 0ms) forwards;
          }
          @keyframes ct-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
          .ct .ct-grow {
            transform-origin: left;
            animation: ct-grow .9s cubic-bezier(.77,0,.18,1) .4s both;
          }

          @keyframes ct-pop {
            from { opacity: 0; transform: translateY(-8px) scale(.98); }
            to   { opacity: 1; transform: none; }
          }
          .ct .ct-pop { animation: ct-pop .45s cubic-bezier(.22,1,.36,1) both; }

          /* Field: garis ungu saat fokus */
          .ct .ct-field::after {
            content: '';
            position: absolute;
            left: 0; right: 0; bottom: -1px;
            height: 2px;
            background: #7C3AED;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform .5s cubic-bezier(.22,1,.36,1);
          }
          .ct .ct-field:focus-within::after { transform: scaleX(1); }
          .ct .ct-field:focus-within { background: rgba(245, 243, 255, .5); }

          /* ---------- Misc motion ---------- */
          @keyframes ct-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          .ct .ct-float { animation: ct-float 6s ease-in-out infinite; }
          .ct .ct-float-slow { animation: ct-float 9s ease-in-out infinite; }

          @keyframes ct-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
          .ct .ct-blink { animation: ct-blink 1.6s ease-in-out infinite; }

          @keyframes ct-twinkle {
            0%, 100% { opacity: .15; transform: scale(.6) rotate(45deg); }
            50% { opacity: 1; transform: scale(1) rotate(45deg); }
          }
          .ct .ct-twinkle { animation: ct-twinkle 3s ease-in-out infinite; }

          @keyframes ct-marquee { to { transform: translateX(-50%); } }
          .ct .ct-marquee { animation: ct-marquee 36s linear infinite; }
          .ct .ct-marquee:hover { animation-play-state: paused; }

          /* ---------- Stage 3D ---------- */
          .ct .ct-stage { perspective: 1100px; }
          .ct .ct-tilt {
            transform-style: preserve-3d;
            transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
            transition: transform .35s cubic-bezier(.22,1,.36,1);
          }
          .ct .ct-z-a { transform: translateZ(90px); }
          .ct .ct-z-b { transform: translateZ(60px); }
          @media (max-width: 1023px) {
            .ct .ct-z-a, .ct .ct-z-b { transform: translateZ(30px); }
          }

          .ct .ct-floor {
            background-image:
              linear-gradient(to right, rgba(124,58,237,.22) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(124,58,237,.22) 1px, transparent 1px);
            background-size: 34px 34px;
            transform: rotateX(68deg) translateZ(-40px);
            transform-origin: bottom;
            -webkit-mask-image: linear-gradient(to top, #000, transparent 90%);
            mask-image: linear-gradient(to top, #000, transparent 90%);
          }

          /* Amplop */
          .ct .ct-env {
            --w: 190px;
            --h: 126px;
            position: relative;
            width: var(--w);
            height: var(--h);
            transform-style: preserve-3d;
            animation: ct-sway 8s ease-in-out infinite alternate;
          }
          @media (min-width: 640px) { .ct .ct-env { --w: 250px; --h: 166px; } }
          @media (min-width: 1024px) { .ct .ct-env { --w: 300px; --h: 200px; } }
          @keyframes ct-sway {
            from { transform: rotateY(-24deg) rotateX(14deg); }
            to   { transform: rotateY(24deg) rotateX(6deg); }
          }

          .ct .ct-env-back {
            position: absolute; inset: 0;
            background: #ede9fe;
            border: 1.5px solid #111;
            box-shadow: 8px 8px 0 0 rgba(124,58,237,.9);
          }
          .ct .ct-letter {
            position: absolute;
            left: 9%; right: 9%;
            top: 8%; bottom: 6%;
            background: #fff;
            border: 1.5px solid #111;
            transform: translateZ(14px);
            animation: ct-letter 5.5s ease-in-out infinite;
            padding: 12% 10% 0;
          }
          .ct .ct-letter i {
            display: block;
            height: 5px;
            margin-bottom: 9px;
            background: rgba(0,0,0,.16);
          }
          .ct .ct-letter i:nth-child(1) { width: 62%; background: #111; }
          .ct .ct-letter i:nth-child(3) { width: 76%; }
          .ct .ct-letter strong {
            position: absolute;
            right: 8%; bottom: 8%;
            font-size: 34px;
            line-height: 1;
            font-weight: 900;
            letter-spacing: -.08em;
            color: transparent;
            -webkit-text-stroke: 1.5px #7C3AED;
          }
          @keyframes ct-letter {
            0%, 18% { transform: translateZ(14px) translateY(0); }
            45%, 70% { transform: translateZ(14px) translateY(-46%); }
            100% { transform: translateZ(14px) translateY(0); }
          }
          .ct .ct-env-front {
            position: absolute; inset: 0;
            transform: translateZ(28px);
            background: linear-gradient(135deg, #7C3AED, #6d28d9);
            border: 1.5px solid #111;
            clip-path: polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%);
          }
          .ct .ct-env-flap {
            position: absolute;
            left: 0; right: 0; top: 0;
            height: 56%;
            transform-origin: top;
            background: linear-gradient(180deg, #E78FBA, #c75f98);
            border: 1.5px solid #111;
            clip-path: polygon(0 0, 100% 0, 50% 100%);
            transform: translateZ(30px) rotateX(0deg);
            animation: ct-flap 5.5s ease-in-out infinite;
          }
          @keyframes ct-flap {
            0%, 8% { transform: translateZ(30px) rotateX(0deg); }
            30%, 78% { transform: translateZ(2px) rotateX(180deg); }
            100% { transform: translateZ(30px) rotateX(0deg); }
          }

          /* Gelembung chat */
          .ct .ct-bubble {
            position: relative;
            padding: 10px 14px;
            background: #fff;
            border: 1.5px solid #111;
            box-shadow: 4px 4px 0 0 rgba(124,58,237,.9);
            transform: rotateY(14deg) rotateX(-4deg);
          }
          .ct .ct-bubble::after {
            content: '';
            position: absolute;
            left: 12px; bottom: -8px;
            width: 12px; height: 12px;
            background: #fff;
            border-right: 1.5px solid #111;
            border-bottom: 1.5px solid #111;
            transform: rotate(45deg);
          }
          .ct .ct-dots { display: flex; gap: 4px; }
          .ct .ct-dots b {
            width: 6px; height: 6px;
            background: #7C3AED;
            animation: ct-dot 1.2s ease-in-out infinite;
          }
          .ct .ct-dots b:nth-child(2) { animation-delay: .15s; }
          .ct .ct-dots b:nth-child(3) { animation-delay: .3s; }
          @keyframes ct-dot {
            0%, 100% { transform: translateY(0); opacity: .4; }
            40% { transform: translateY(-4px); opacity: 1; }
          }

          /* Kubus */
          .ct .ct-cube {
            --s: 40px;
            position: relative;
            width: var(--s);
            height: var(--s);
            transform-style: preserve-3d;
            animation: ct-cube 14s linear infinite;
          }
          @media (min-width: 640px) { .ct .ct-cube { --s: 50px; } }
          @keyframes ct-cube {
            from { transform: rotateX(-24deg) rotateY(0deg); }
            to   { transform: rotateX(-24deg) rotateY(360deg); }
          }
          .ct .ct-cube i {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-style: normal;
            font-weight: 900;
            font-size: calc(var(--s) * .34);
            letter-spacing: -.06em;
            color: #7C3AED;
            border: 1.5px solid rgba(124,58,237,.85);
            background: rgba(124,58,237,.1);
          }
          .ct .ct-cube .f1 { transform: translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.8); }
          .ct .ct-cube .f2 { transform: rotateY(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.4); }
          .ct .ct-cube .f3 { transform: rotateY(180deg) translateZ(calc(var(--s) / 2)); background: rgba(255,255,255,.8); }
          .ct .ct-cube .f4 { transform: rotateY(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.24); }
          .ct .ct-cube .f5 { transform: rotateX(90deg) translateZ(calc(var(--s) / 2)); background: rgba(231,143,186,.5); }
          .ct .ct-cube .f6 { transform: rotateX(-90deg) translateZ(calc(var(--s) / 2)); background: rgba(124,58,237,.32); }

          /* Bola */
          .ct .ct-sphere {
            width: 28px; height: 28px;
            border-radius: 9999px;
            background: radial-gradient(circle at 30% 28%, #fbd5e6 0%, #E78FBA 38%, #7C3AED 100%);
            box-shadow: 0 12px 18px -6px rgba(124,58,237,.55);
          }
          @media (min-width: 1024px) { .ct .ct-sphere { width: 40px; height: 40px; } }

          .ct .ct-plane { transform: rotateY(-14deg) rotateX(6deg); }

          @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            .ct *, .ct *::before, .ct *::after {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
            .ct .ct-in, .ct .ct-rv, .ct .ct-up {
              opacity: 1 !important;
              transform: none !important;
            }
            .ct .ct-grow { transform: scaleX(1) !important; }
            .ct .ct-tilt { transform: none !important; }
          }
        `}</style>
      </main>
    </>
  )
}

/* =========================================================
   EDITORIAL GRID
========================================================= */

function EditorialGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #111 1px, transparent 1px),
          linear-gradient(to bottom, #111 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
      }}
    />
  )
}

export default ContactPage