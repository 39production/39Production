interface SectionHeadingProps {
  label?: string
  eyebrow?: string
  title: string
  highlight?: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  label,
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const headingLabel = eyebrow ?? label

  const isCenter = align === 'center'

  return (
    <div
      className={`
        ${isCenter ? 'text-center' : 'text-left'}
        ${className}
      `}
    >
      {/* =========================================================
          EYEBROW
      ========================================================== */}

      {headingLabel && (
        <div
          className={`
            mb-4
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-violet-100
            bg-violet-50
            px-3.5
            py-2
            ${isCenter ? 'justify-center' : ''}
          `}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 sm:text-[11px]">
            {headingLabel}
          </span>
        </div>
      )}

      {/* =========================================================
          TITLE
      ========================================================== */}

      <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
        <span>{title}</span>

        {highlight && (
          <>
            {' '}

            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              {highlight}
            </span>
          </>
        )}
      </h2>

      {/* =========================================================
          DESCRIPTION
      ========================================================== */}

      {description && (
        <p
          className={`
            mt-5
            text-sm
            leading-6
            text-neutral-500
            sm:text-base
            sm:leading-7
            ${isCenter ? 'mx-auto max-w-2xl' : 'max-w-2xl'}
          `}
        >
          {description}
        </p>
      )}

      {/* =========================================================
          DECORATIVE LINE
      ========================================================== */}

      <div
        aria-hidden="true"
        className={`
          sectionHeadingLine
          mt-6
          h-px
          w-14
          bg-gradient-to-r
          from-violet-500
          to-pink-500
          transition-all
          duration-500
          ${isCenter ? 'mx-auto' : ''}
        `}
      />
    </div>
  )
}
