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
    <footer className="relative overflow-hidden border-t border-neutral-200 bg-white">
      {/* =========================================================
          SUBTLE BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="footerGlow footerGlowOne absolute -left-40 top-[-180px] h-[420px] w-[420px] rounded-full" />

        <div className="footerGlow footerGlowTwo absolute -right-40 bottom-[-180px] h-[420px] w-[420px] rounded-full" />

        <div className="footerGrid absolute inset-0" />
      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================== */}

      <div className="relative mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        {/* =======================================================
            TOP AREA
        ======================================================== */}

        <div className="grid gap-12 lg:grid-cols-[1.45fr_0.75fr_0.75fr_1.25fr] lg:gap-10 xl:gap-14">
          {/* =====================================================
              BRAND
          ====================================================== */}

          <div className="max-w-md">
            <Link
              to="/"
              className="inline-flex transition-opacity duration-300 hover:opacity-75"
            >
              <Logo />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-500">
              Creative technology and entertainment production house yang
              menggabungkan technology, design, storytelling, music, dan
              digital experiences.
            </p>

            <div className="mt-6 border-l-2 border-violet-200 pl-4">
              <p className="text-sm font-medium leading-6 text-neutral-700">
                Imagine it. Build it. Make it matter.
              </p>
            </div>

            {/* Small brand statement */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
                <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-sm font-black text-transparent">
                  39
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-800">
                  39Production
                </p>

                <p className="text-[10px] text-neutral-400">
                  Creative Technology & Entertainment
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              EXPLORE
          ====================================================== */}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
              Explore
            </h3>

            <ul className="mt-5 space-y-3.5">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors duration-300 hover:text-violet-600"
                  >
                    <span>{link.label}</span>

                    <ArrowUpRight className="h-3.5 w-3.5 translate-y-px opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =====================================================
              COMPANY
          ====================================================== */}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
              Company
            </h3>

            <ul className="mt-5 space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors duration-300 hover:text-violet-600"
                  >
                    <span>{link.label}</span>

                    <ArrowUpRight className="h-3.5 w-3.5 translate-y-px opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =====================================================
              CONTACT / CTA
          ====================================================== */}

          <div className="lg:pl-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
              Let&apos;s Work Together
            </span>

            <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-neutral-950">
              Have an idea?
              <span className="block text-neutral-500">
                Let&apos;s make it real.
              </span>
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-500">
              Punya project, creative idea, atau kebutuhan digital? Ceritakan
              kepada kami dan mari mulai percakapan.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/contact"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-100"
              >
                Start a Project

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:text-green-600 hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-105" />

                WhatsApp Us
              </a>
            </div>

            {/* Email */}
            <a
              href="mailto:39production.contact@gmail.com"
              className="group mt-5 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors duration-300 hover:text-violet-600"
            >
              <Mail className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-violet-500" />

              <span>
                39production.contact@gmail.com
              </span>
            </a>
          </div>
        </div>

        {/* =======================================================
            DIVIDER
        ======================================================== */}

        <div className="mt-12 border-t border-neutral-200 pt-6 sm:mt-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Copyright */}
            <p className="text-xs leading-5 text-neutral-400">
              {APP_COPYRIGHT}
            </p>

            {/* Bottom statement */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-400">
              <span>39Production</span>

              <span className="text-neutral-300">•</span>

              <span>Creative Technology & Entertainment</span>

              <span className="text-neutral-300">•</span>

              <span>Built with purpose.</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        .footerGlow {
          filter: blur(90px);
          opacity: 0.35;
        }

        .footerGlowOne {
          background: rgba(139, 92, 246, 0.045);
          animation: footerGlowOne 16s ease-in-out infinite;
        }

        .footerGlowTwo {
          background: rgba(236, 72, 153, 0.035);
          animation: footerGlowTwo 19s ease-in-out infinite;
        }

        .footerGrid {
          background-image:
            linear-gradient(
              to right,
              rgba(15, 23, 42, 0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0.018) 1px,
              transparent 1px
            );

          background-size: 72px 72px;

          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 18%,
              black 82%,
              transparent
            );

          -webkit-mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 18%,
              black 82%,
              transparent
            );
        }

        @keyframes footerGlowOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(40px, 25px, 0);
          }
        }

        @keyframes footerGlowTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-40px, -25px, 0);
          }
        }

        @media (max-width: 640px) {
          .footerGlow {
            opacity: 0.25;
          }

          .footerGrid {
            background-size: 56px 56px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .footerGlow {
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  )
}