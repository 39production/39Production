import { FormEvent, useState } from 'react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import {
  Mail,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
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
    <div className="min-h-screen bg-white pb-16 pt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* HERO */}
        <div className="relative overflow-hidden py-12 sm:py-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-100/70 blur-3xl" />

          <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl" />

          <div className="relative text-center">
            <SectionHeading
              label="Get in Touch"
              title="Let's Start a Conversation"
              description="Punya project, ide kreatif, atau membutuhkan partner untuk mengembangkan sesuatu? Ceritakan kebutuhanmu dan let's see what we can create together."
              align="center"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* CONTACT INFORMATION */}
          <div className="space-y-5">
            {/* WHATSAPP */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/30">
              <div className="inline-flex rounded-xl bg-emerald-50 p-3">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                WhatsApp
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Untuk komunikasi yang lebih cepat dan langsung.
                Hubungi 39Production melalui WhatsApp untuk
                membicarakan project atau kebutuhanmu.
              </p>

              <div className="mt-5">
                <WhatsAppButton variant="inline" />
              </div>
            </div>

            {/* EMAIL */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/30">
              <div className="inline-flex rounded-xl bg-blue-50 p-3">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                Email
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Cocok untuk project inquiries, proposal, maupun
                komunikasi business yang membutuhkan detail lebih
                lengkap.
              </p>

              <a
                href="mailto:39production.contact@gmail.com"
                className="mt-5 inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700"
              >
                <Mail className="h-4 w-4 shrink-0" />
                39production.contact@gmail.com
              </a>
            </div>

            {/* LOCATION */}
            <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30">
              <div className="inline-flex rounded-xl bg-purple-50 p-3">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                Location
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                39Production beroperasi secara remote dan dapat
                berkolaborasi dengan client maupun creative partner
                dari berbagai lokasi.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-700">
                Indonesia
              </span>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-600">
                  Contact Form
                </span>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                  Tell us about your project
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Ceritakan project, kebutuhan, timeline, atau ide
                  yang ingin kamu diskusikan. Setelah submit, aplikasi
                  email akan terbuka dengan pesan yang sudah disiapkan.
                </p>
              </div>

              {/* SUCCESS */}
              {submitted && (
                <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Pesan berhasil disiapkan
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-600">
                      Aplikasi email kamu seharusnya sudah terbuka
                      dengan pesan yang siap dikirim ke 39Production.
                    </p>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
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
              )}

              <form
                className="mt-8 space-y-6"
                onSubmit={handleSubmit}
              >
                {/* NAME & EMAIL */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-2 block text-sm font-medium text-zinc-800"
                    >
                      Name
                      <span className="ml-1 text-purple-600">
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
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-2 block text-sm font-medium text-zinc-800"
                    >
                      Email
                      <span className="ml-1 text-purple-600">
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
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* SUBJECT */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="mb-2 block text-sm font-medium text-zinc-800"
                  >
                    Subject
                    <span className="ml-1 text-purple-600">
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
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* MESSAGE */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm font-medium text-zinc-800"
                  >
                    Message
                    <span className="ml-1 text-purple-600">
                      *
                    </span>
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    rows={7}
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
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* SUBMIT */}
                <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md text-xs leading-5 text-zinc-400">
                    Form ini akan membuka aplikasi email default
                    dengan pesan yang sudah terisi.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}