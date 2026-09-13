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
      image: 'h-8 w-8',
      wordmark: 'text-[17px]',
      subtext: 'text-[7px]',
      gap: 'gap-2.5',
      radius: 'rounded-lg',
    },
    md: {
      image: 'h-10 w-10',
      wordmark: 'text-[21px]',
      subtext: 'text-[8px]',
      gap: 'gap-3',
      radius: 'rounded-xl',
    },
    lg: {
      image: 'h-14 w-14',
      wordmark: 'text-[30px]',
      subtext: 'text-[10px]',
      gap: 'gap-3.5',
      radius: 'rounded-xl',
    },
  }

  const current = sizes[size]

  return (
    <Link
      to="/"
      aria-label="39Production — SanKyuu Production"
      className={`group inline-flex items-center ${current.gap} ${className}`}
    >
      {/* =========================================================
          LOGO MARK
      ========================================================== */}

      <div
        className={`
          relative
          shrink-0
          overflow-visible
          ${current.image}
        `}
      >
        {/* Very subtle hover accent */}
        <div
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute
            inset-[10%]
            ${current.radius}
            bg-violet-500/10
            opacity-0
            blur-lg
            transition-all
            duration-500
            group-hover:scale-125
            group-hover:opacity-100
          `}
        />

        {/* Logo image */}
        <img
          src={logo39Production}
          alt="39Production"
          draggable={false}
          className={`
            relative
            z-10
            h-full
            w-full
            object-contain
            transition-transform
            duration-300
            ease-out
            group-hover:scale-[1.04]
          `}
        />
      </div>

      {/* =========================================================
          WORDMARK
      ========================================================== */}

      <div className="flex min-w-0 flex-col">
        <span
          className={`
            ${current.wordmark}
            font-display
            font-bold
            leading-none
            tracking-[-0.045em]
            text-neutral-950
            transition-colors
            duration-300
            group-hover:text-violet-600
          `}
        >
          39Production
        </span>

        {showSubtext && (
          <span
            className={`
              mt-1.5
              ${current.subtext}
              font-medium
              uppercase
              leading-none
              tracking-[0.18em]
              text-neutral-400
              transition-colors
              duration-300
              group-hover:text-neutral-500
            `}
          >
            SanKyuu Production
          </span>
        )}
      </div>
    </Link>
  )
}