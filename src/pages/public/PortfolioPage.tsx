import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  FolderOpen,
  Loader2,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

interface Portfolio {
  id: number
  title: string
  category: string
  client: string
  description: string
  year: string
  status: 'Published' | 'Draft'
  image_url?: string
  created_at?: string
  updated_at?: string
}

export function PortfolioPage() {
  const [portfolio, setPortfolio] =
    useState<Portfolio[]>([])

  const [loading, setLoading] =
    useState(true)

  const [activeCategory, setActiveCategory] =
    useState('All')

  const [error, setError] =
    useState('')

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/portfolio`,
          {
            cache: 'no-store',
          },
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result?.message ||
            'Failed to fetch portfolio.',
          )
        }

        const data = Array.isArray(result?.data)
          ? result.data
          : []

        setPortfolio(data)
      } catch (err) {
        console.error(
          'Fetch portfolio error:',
          err,
        )

        setError(
          'Gagal memuat portfolio.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        portfolio
          .filter(
            (item) =>
              item.status === 'Published',
          )
          .map((item) => item.category)
          .filter(Boolean),
      ),
    )

    return ['All', ...uniqueCategories]
  }, [portfolio])

  const filteredPortfolio = useMemo(() => {
    return portfolio.filter(
      (item) =>
        item.status === 'Published' &&
        (activeCategory === 'All' ||
          item.category === activeCategory),
    )
  }, [portfolio, activeCategory])

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg-base">
      {/* =========================================================
          BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 -top-32 h-[500px] w-[500px] rounded-full bg-brand-primary/12 blur-[140px]" />

        <div className="absolute -right-48 top-[20%] h-[500px] w-[500px] rounded-full bg-brand-accent/10 blur-[140px]" />

        <div className="absolute left-1/2 top-[8%] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-brand-primary/5 blur-[100px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative border-b border-border-default">
        <div className="mx-auto max-w-7xl px-5 pb-9 pt-16 sm:px-8 sm:pb-10 lg:px-10 lg:pb-12 lg:pt-20">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-bg-surface/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Creative Portfolio
              </div>

              {/* Heading */}
              <h1 className="font-display text-4xl font-black leading-[1.02] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                Selected{' '}
                <span className="gradient-text">
                  Works
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-text-muted sm:text-base">
                A selection of digital experiences,
                creative products, and production work
                crafted across technology, design,
                animation, games, and entertainment.
              </p>
            </div>

            {/* Published count */}
            {!loading && !error && (
              <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-border-default bg-bg-surface/50 px-4 py-3 backdrop-blur-md sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10">
                  <FolderOpen className="h-4 w-4 text-brand-primary" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
                    Published Works
                  </p>

                  <p className="font-display text-lg font-bold text-text-primary">
                    {filteredPortfolio.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTENT
      ========================================================== */}
      <section className="relative mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        {/* =======================================================
            CATEGORY FILTER
        ======================================================== */}
        {!loading &&
          !error &&
          categories.length > 1 && (
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1 w-5 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Explore by category
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map(
                  (category) => {
                    const isActive =
                      activeCategory ===
                      category

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setActiveCategory(
                            category,
                          )
                        }
                        className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${isActive
                            ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-md shadow-brand-primary/20'
                            : 'border border-border-default bg-bg-surface/60 text-text-muted backdrop-blur-md hover:border-brand-primary/40 hover:text-text-primary'
                          }`}
                      >
                        {category}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          )}

        {/* =======================================================
            LOADING
        ======================================================== */}
        {loading && (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="relative flex items-center gap-3 rounded-2xl border border-border-default bg-bg-surface/70 px-5 py-4 backdrop-blur-xl">
              <div className="absolute -inset-5 -z-10 rounded-full bg-brand-primary/10 blur-2xl" />

              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />

              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Loading portfolio
                </p>

                <p className="text-xs text-text-muted">
                  Menyiapkan selected works...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            ERROR
        ======================================================== */}
        {!loading && error && (
          <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-bg-surface/70 p-7 text-center backdrop-blur-xl">
            <div className="absolute inset-0 bg-red-500/[0.025]" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <FolderOpen className="h-5 w-5 text-red-400" />
              </div>

              <h2 className="mt-4 font-display text-lg font-bold text-text-primary">
                Unable to load portfolio
              </h2>

              <p className="mt-1 text-sm text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =======================================================
            EMPTY
        ======================================================== */}
        {!loading &&
          !error &&
          filteredPortfolio.length ===
          0 && (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-border-default bg-bg-surface/60 p-7 text-center backdrop-blur-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border-default bg-bg-elevated">
                <FolderOpen className="h-6 w-6 text-text-muted" />
              </div>

              <h2 className="mt-4 font-display text-lg font-bold text-text-primary">
                No published work yet
              </h2>

              <p className="mt-1 max-w-md text-sm leading-6 text-text-muted">
                Our portfolio is continuously
                evolving. Published projects will
                appear here as they become available.
              </p>
            </div>
          )}

        {/* =======================================================
            PORTFOLIO GRID
        ======================================================== */}
        {!loading &&
          !error &&
          filteredPortfolio.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredPortfolio.map(
                (item) => (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface/70 shadow-lg backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-xl hover:shadow-brand-primary/5"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-bg-base">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                          <div className="absolute h-32 w-32 rounded-full bg-brand-primary/15 blur-[70px]" />

                          <FolderOpen className="relative h-11 w-11 text-text-muted" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-80" />

                      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-accent/20 opacity-0 transition duration-500 group-hover:opacity-100" />

                      {/* Category */}
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                          {item.category}
                        </span>
                      </div>

                      {/* Year */}
                      {item.year && (
                        <div className="absolute right-3 top-3">
                          <span className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                            {item.year}
                          </span>
                        </div>
                      )}

                      {/* Client */}
                      {item.client && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-[9px] uppercase tracking-[0.15em] text-white/55">
                            Client
                          </p>

                          <p className="mt-0.5 truncate text-xs font-semibold text-white">
                            {item.client}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h2 className="font-display text-lg font-bold leading-tight text-text-primary transition group-hover:text-brand-primary">
                        {item.title}
                      </h2>

                      {item.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-border-default pt-3">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.15em] text-text-muted">
                            Category
                          </p>

                          <p className="mt-0.5 text-xs font-medium text-text-primary">
                            {item.category}
                          </p>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-base/50 text-text-muted transition group-hover:border-brand-primary/30 group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
      </section>
    </main>
  )
}
