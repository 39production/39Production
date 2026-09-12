import { Link } from 'react-router-dom'
import logo39Production from '@/assets/logo-39production.png'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtext?: boolean
  className?: string
}

export function Logo({
  size = 'md',
  showSubtext = false,
  className = '',
}: LogoProps) {
  const sizes = {
    sm: {
      image: 'h-9 w-9',
      wordmark: 'text-lg',
      subtext: 'text-[8px]',
      gap: 'gap-2.5',
    },
    md: {
      image: 'h-11 w-11',
      wordmark: 'text-2xl',
      subtext: 'text-[9px]',
      gap: 'gap-3',
    },
    lg: {
      image: 'h-16 w-16',
      wordmark: 'text-4xl',
      subtext: 'text-[11px]',
      gap: 'gap-4',
    },
  }

  const current = sizes[size]

  return (
    <Link
      to="/"
      aria-label="39Production — SanKyuu Production"
      className={`group inline-flex items-center ${current.gap} ${className}`}
    >
      {/* LOGO */}
      <div
        className={`
          relative shrink-0
          ${current.image}
        `}
      >
        {/* Glow */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            rounded-xl
            bg-brand-primary/20
            opacity-0
            blur-xl
            transition-all
            duration-500
            group-hover:scale-110
            group-hover:opacity-100
          "
        />

        {/* Image */}
        <img
          src={logo39Production}
          alt="39Production"
          className="
            relative
            h-full
            w-full
            object-contain
            transition-all
            duration-300
            ease-out
            group-hover:scale-105
          "
        />
      </div>

      {/* WORDMARK */}
      <div className="flex min-w-0 flex-col">
        <span
          className={`
            font-display
            font-bold
            leading-none
            tracking-[-0.04em]
            text-text-primary
            transition-colors
            duration-300
            group-hover:text-brand-primary
            ${current.wordmark}
          `}
        >
          39Production
        </span>

        {showSubtext && (
          <span
            className={`
              mt-1
              font-medium
              tracking-[0.16em]
              text-text-muted
              ${current.subtext}
            `}
          >
            SanKyuu Production
          </span>
        )}
      </div>
    </Link>
  )
}