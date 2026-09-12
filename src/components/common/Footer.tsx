import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { APP_COPYRIGHT } from '@/utils/constants'
import {
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
  const whatsappUrl = getWhatsAppUrl(projectInquiryMessage)

  return (
    <footer className="border-t border-border-default bg-bg-base">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex transition-opacity hover:opacity-80"
            >
              <Logo />
            </Link>

            <p className="mt-6 text-sm leading-7 text-text-muted">
              Creative technology and entertainment production
              house yang menggabungkan technology, design,
              storytelling, music, dan digital experiences.
            </p>

            <p className="mt-5 text-sm font-medium leading-6 text-text-secondary">
              Imagine it. Build it. Make it matter.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-primary">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted transition-colors hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-primary">
              Company
            </h3>

            <ul className="mt-5 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted transition-colors hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / CTA */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-text-primary">
              Let's Work Together
            </span>

            <h3 className="mt-4 font-display text-xl font-bold leading-tight text-text-primary">
              Have an idea?
              <br />
              Let’s make it real.
            </h3>

            <p className="mt-3 text-sm leading-6 text-text-muted">
              Punya project, creative idea, atau kebutuhan digital?
              Ceritakan kepada kami dan let's start a conversation.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-secondary"
              >
                Start a Project
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-default bg-bg-surface px-5 py-3 text-sm font-semibold text-text-primary transition-all hover:border-brand-primary/40 hover:bg-bg-surface-hover"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>

            <a
              href="mailto:hello@39production.com"
              className="mt-5 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              <Mail className="h-4 w-4" />
              39production.contact@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-border-default pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            {APP_COPYRIGHT}
          </p>

          <p className="text-xs text-text-muted">
            39Production — Creative Technology & Entertainment
          </p>
        </div>
      </div>
    </footer>
  )
}