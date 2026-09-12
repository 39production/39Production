interface SectionHeadingProps {
  label?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ label, title, description, align = 'center', className = '' }: SectionHeadingProps) {
  return (
    <div className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      {label && (
        <span className="mb-3 inline-block text-sm font-semibold tracking-widest text-brand-primary uppercase">
          {label}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          {description}
        </p>
      )}
      <div className={`section-line mt-6 ${align === 'center' ? 'mx-auto' : ''}`} />
    </div>
  )
}
