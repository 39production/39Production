import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title?: string
  description?: string
  icon?: React.ReactNode
}

/**
 * Reusable placeholder page for routes that are not yet implemented.
 * Provides consistent styling and breadcrumb navigation.
 */
export function PlaceholderPage({
  title = 'Page Not Found',
  description,
  icon,
}: PlaceholderPageProps) {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-text-muted">
          <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
          {pathSegments.map((segment, index) => (
            <span key={index} className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3" />
              <span className={index === pathSegments.length - 1 ? 'text-text-primary capitalize' : 'capitalize'}>
                {segment.replace(/-/g, ' ')}
              </span>
            </span>
          ))}
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold text-text-primary md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-lg text-text-secondary">{description}</p>
          )}
          <div className="section-line mt-6" />
        </div>

        {/* Coming Soon Content */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border-default bg-bg-surface py-20 text-center">
          <div className="rounded-2xl bg-brand-primary/10 p-4">
            {icon || <Construction className="h-10 w-10 text-brand-primary" />}
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold text-text-primary">
            Coming Soon
          </h2>
          <p className="mt-3 max-w-md text-sm text-text-muted">
            This page is under construction. We're working hard to bring you an amazing experience.
          </p>
          <Link
            to="/"
            className="mt-8 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-secondary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
