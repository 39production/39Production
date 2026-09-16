
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
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

export function ContactPage() {
  const [form, setForm] =
    useState<ContactForm>(initialForm)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [submitted, setSubmitted] =
    useState(false)

  const [error, setError] =
    useState('')

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

  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-900">
      <EditorialGrid />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative border-b border-zinc-200">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-100/60 blur-[110px]" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-fuchsia-100/40 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-12 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                39Production
              </span>

              <span className="h-1 w-1 bg-zinc-300" />

              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Contact / Studio
              </span>
            </div>

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-300">
              08 / 08
            </span>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[150px_1fr] lg:gap-16">
            {/* INDEX */}

            <div className="hidden lg:block">
              <p className="font-mono text-[10px] text-zinc-400">
                CONTACT
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="font-mono text-[9px] text-zinc-300">
                  01
                </span>

                <span className="h-px w-8 bg-violet-500" />
              </div>

              <p className="mt-4 max-w-[100px] font-mono text-[9px] uppercase leading-5 tracking-[0.15em] text-zinc-400">
                Projects
                <br />
                Ideas
                <br />
                Collaboration
              </p>
            </div>

            {/* HERO CONTENT */}

            <div className="relative">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 lg:hidden">
                Get in touch
              </p>

              <h1 className="max-w-5xl text-[3.4rem] font-semibold leading-[0.92] tracking-[-0.07em] text-zinc-950 sm:text-6xl lg:text-8xl xl:text-[7.5rem]">
                Let's make
                <br />
                something
                <br />
                <span className="text-violet-600">
                  happen.
                </span>
              </h1>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-20">
                <p className="max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg sm:leading-9">
                  Punya project, ide kreatif, atau membutuhkan
                  partner untuk mengembangkan sesuatu?
                  Ceritakan apa yang sedang kamu bangun,
                  ciptakan, atau bayangkan — lalu let's see
                  what we can create together.
                </p>

                <div className="border-l border-zinc-200 pl-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                    Prefer a direct conversation?
                  </p>

                  <div className="mt-5">
                    <WhatsAppButton variant="inline" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT DESK
      ===================================================== */}

      <section className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-18 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-20">
            {/* CONTACT INFO */}

            <aside>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-zinc-400">
                  02
                </span>

                <span className="h-px w-8 bg-violet-500" />

                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Contact desk
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.04em] text-zinc-950">
                Choose the way
                <span className="block text-zinc-400">
                  you want to connect.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-zinc-500">
                Untuk inquiry project, collaboration,
                proposal, maupun pertanyaan lainnya,
                kamu bisa menghubungi kami melalui salah
                satu channel berikut.
              </p>

              <div className="mt-9 space-y-0 border-t border-zinc-200">
                {/* WHATSAPP */}

                <div className="group border-b border-zinc-200 py-6">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-100 bg-emerald-50">
                        <MessageCircle className="h-4 w-4 text-emerald-600" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          WhatsApp
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Fast & direct communication
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                  </div>

                  <div className="mt-5 pl-14">
                    <WhatsAppButton variant="inline" />
                  </div>
                </div>

                {/* EMAIL */}

                <div className="group border-b border-zinc-200 py-6">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-100 bg-blue-50">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900">
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
                    className="mt-5 ml-14 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-700 transition-colors hover:text-violet-600"
                  >
                    Send an email
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* LOCATION */}

                <div className="group border-b border-zinc-200 py-6">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-violet-100 bg-violet-50">
                        <MapPin className="h-4 w-4 text-violet-600" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                          Location
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Remote / Indonesia
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-violet-600" />
                  </div>

                  <p className="mt-5 ml-14 text-xs leading-6 text-zinc-500">
                    39Production beroperasi secara remote
                    dan dapat berkolaborasi dengan client
                    maupun creative partner dari berbagai
                    lokasi.
                  </p>
                </div>
              </div>
            </aside>

            {/* =================================================
                FORM
            ================================================= */}

            <div>
              <div className="border-b border-zinc-200 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                      Start a project
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-4xl">
                      Tell us about it.
                    </h2>
                  </div>

                  <div className="hidden h-12 w-12 items-center justify-center border border-zinc-200 sm:flex">
                    <ArrowDownRight className="h-5 w-5 text-zinc-400" />
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">
                  Ceritakan project, kebutuhan, timeline,
                  atau ide yang ingin kamu diskusikan.
                  Setelah submit, aplikasi email akan
                  terbuka dengan pesan yang sudah disiapkan.
                </p>
              </div>

              {/* SUCCESS */}

              {submitted && (
                <div className="mt-7 border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-semibold text-emerald-700">
                        Pesan berhasil disiapkan
                      </p>

                      <p className="mt-1 text-sm leading-6 text-emerald-600">
                        Aplikasi email kamu seharusnya
                        sudah terbuka dengan pesan yang
                        siap dikirim ke 39Production.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mt-7 border border-red-200 bg-red-50 p-5">
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
                className="mt-8"
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-1 border-l border-t border-zinc-200 sm:grid-cols-2">
                  {/* NAME */}

                  <div className="border-b border-r border-zinc-200 p-5 sm:p-6">
                    <label
                      htmlFor="contact-name"
                      className="block font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-zinc-400"
                    >
                      Name
                      <span className="ml-1 text-violet-600">
                        *
                      </span>
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
                      className="mt-4 w-full border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* EMAIL */}

                  <div className="border-b border-r border-zinc-200 p-5 sm:p-6">
                    <label
                      htmlFor="contact-email"
                      className="block font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-zinc-400"
                    >
                      Email
                      <span className="ml-1 text-violet-600">
                        *
                      </span>
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
                      className="mt-4 w-full border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* SUBJECT */}

                  <div className="border-b border-r border-zinc-200 p-5 sm:col-span-2 sm:p-6">
                    <label
                      htmlFor="contact-subject"
                      className="block font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-zinc-400"
                    >
                      Subject
                      <span className="ml-1 text-violet-600">
                        *
                      </span>
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
                      className="mt-4 w-full border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* MESSAGE */}

                  <div className="border-b border-r border-zinc-200 p-5 sm:col-span-2 sm:p-6">
                    <label
                      htmlFor="contact-message"
                      className="block font-mono text-[9px] font-semibold uppercase tracking-[0.17em] text-zinc-400"
                    >
                      Message
                      <span className="ml-1 text-violet-600">
                        *
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
                      className="mt-4 w-full resize-none border-0 bg-transparent p-0 text-sm leading-7 text-zinc-900 outline-none placeholder:text-zinc-300 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* SUBMIT */}

                <div className="flex flex-col gap-5 border-b border-zinc-200 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md text-xs leading-5 text-zinc-400">
                    Form ini akan membuka aplikasi email
                    default dengan pesan yang sudah terisi.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group inline-flex w-full items-center justify-center gap-3 bg-zinc-950 px-7 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-8 sm:grid-cols-[150px_1fr] sm:gap-16">
            <div>
              <p className="font-mono text-[10px] text-zinc-400">
                03
              </p>

              <div className="mt-5 h-px w-8 bg-violet-500" />

              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">
                Good to know
              </p>
            </div>

            <div className="max-w-3xl">
              <p className="text-2xl font-medium leading-tight tracking-[-0.035em] text-zinc-900 sm:text-3xl">
                Good projects start with a good
                conversation.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                <Link
                  to="/services"
                  className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition-colors hover:text-violet-600"
                >
                  Explore services
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/portfolio"
                  className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400 transition-colors hover:text-zinc-900"
                >
                  See our work
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* =========================================================
   EDITORIAL GRID
========================================================= */

function EditorialGrid() {
  return (
    <div
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