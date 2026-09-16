import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { APP_COPYRIGHT } from '@/utils/constants'
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  MessageCircle,
} from 'lucide-react'
import {
  getWhatsAppUrl,
  projectInquiryMessage,
} from '@/utils/whatsapp'

const footerLinks = {
  explore: [
    { label: 'Services', path: '/services' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Products', path: '/products' },
    { label: 'News', path: '/news' },
  ],
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Idol Production', path: '/idol' },
    { label: 'Contact', path: '/contact' },
  ],
}

export function Footer() {
  const whatsappUrl = getWhatsAppUrl(
    projectInquiryMessage(),
  )

  return (
    <footer className="relative overflow-hidden border-t border-black/10 bg-white">
      {/* =========================================================
          SUBTLE BACKGROUND
      ========================================================== */}

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
        className="pointer-events-none absolute left-[7%] top-[22%] h-2 w-2 rounded-full bg-[#7C3AED]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[10%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-black/20"
      />

      {/* =========================================================
          MAIN FOOTER
      ========================================================== */}

      <div className="relative mx-auto max-w-[1440px] px-6 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 xl:px-16">
        {/* =======================================================
            TOP BRAND LINE
        ======================================================== */}

        <div className="mb-12 flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black tracking-[-0.05em] text-black">
              39Production
            </span>

            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Digital Production House
            </span>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300">
            Indonesia · 2026
          </span>
        </div>

        {/* =======================================================
            MAIN GRID
        ======================================================== */}

        <div className="grid gap-12 lg:grid-cols-[1.45fr_0.7fr_0.7fr_1.15fr] lg:gap-10 xl:gap-16">
          {/* =====================================================
              BRAND
          ====================================================== */}

          <div className="max-w-md">
            <div className="inline-flex">
              <Logo />
            </div>

            <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-500">
              Creative technology and entertainment
              production house yang menggabungkan technology,
              design, storytelling, music, dan digital
              experiences.
            </p>

            <div className="mt-7 flex items-start gap-3 border-l-2 border-[#7C3AED] pl-4">
              <div>
                <p className="text-sm font-semibold leading-6 text-black">
                  Creating Digital Works.
                </p>

                <p className="text-sm font-semibold leading-6 text-neutral-400">
                  Producing Stories. Sharing Gratitude.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                <span className="text-sm font-black tracking-[-0.08em]">
                  39
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-black">
                  39Production
                </p>

                <p className="text-[9px] uppercase tracking-[0.12em] text-neutral-400">
                  Create · Produce · Deliver
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              EXPLORE
          ====================================================== */}

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
              Explore
            </h3>

            <ul className="mt-6 space-y-4">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors duration-300 hover:text-[#7C3AED]"
                  >
                    <span>{link.label}</span>

                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =====================================================
              COMPANY
          ====================================================== */}

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
              Company
            </h3>

            <ul className="mt-6 space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors duration-300 hover:text-[#7C3AED]"
                  >
                    <span>{link.label}</span>

                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =====================================================
              CONTACT
          ====================================================== */}

          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#7C3AED]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Let&apos;s Work Together
              </span>
            </div>

            <h3 className="mt-5 text-2xl font-black leading-[1.05] tracking-[-0.045em] text-black sm:text-3xl">
              Have an idea?
              <br />
              <span className="text-neutral-300">
                Let&apos;s make it real.
              </span>
            </h3>

            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-500">
              Punya project, creative idea, atau kebutuhan
              digital? Ceritakan kepada kami dan mari mulai
              percakapan.
            </p>

            {/* CTA */}

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/contact"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-[#7C3AED]"
              >
                Start a Project

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black bg-white px-5 py-3 text-xs font-bold text-black transition-all duration-300 hover:bg-black hover:text-white"
              >
                <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-105" />

                WhatsApp Us
              </a>
            </div>

            {/* Email */}

            <a
              href="mailto:39production.contact@gmail.com"
              className="group mt-5 inline-flex items-center gap-2 text-xs text-neutral-500 transition-colors duration-300 hover:text-[#7C3AED]"
            >
              <Mail className="h-4 w-4 text-neutral-400 transition-colors duration-300 group-hover:text-[#7C3AED]" />

              <span>
                39production.contact@gmail.com
              </span>
            </a>
          </div>
        </div>

        {/* =======================================================
            BOTTOM
        ======================================================== */}

        <div className="mt-14 border-t border-black/10 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Copyright */}

            <p className="text-[10px] leading-5 text-neutral-400">
              {APP_COPYRIGHT}
            </p>

            {/* Brand statement */}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-400">
              <span>39Production</span>

              <span className="text-neutral-300">
                •
              </span>

              <span>Creative Technology</span>

              <span className="text-neutral-300">
                •
              </span>

              <span>Entertainment</span>

              <span className="text-neutral-300">
                •
              </span>

              <span className="text-[#7C3AED]">
                Built with purpose.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM ACCENT
      ========================================================== */}

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-1 w-24 bg-[#7C3AED]"
      />
    </footer>
  )
}

