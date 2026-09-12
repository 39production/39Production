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

  return (
    <div
      className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}
    >
      {headingLabel && (
        <span className="mb-3 inline-block text-sm font-semibold tracking-widest text-brand-primary uppercase">
          {headingLabel}
        </span>
      )}

      <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
        {title}{' '}
        {highlight && (
          <span className="text-brand-primary">
            {highlight}
          </span>
        )}
      </h2>

      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          {description}
        </p>
      )}

      <div
        className={`section-line mt-6 ${align === 'center' ? 'mx-auto' : ''
          }`}
      />
    </div>
  )
}