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

        const result =
          await response.json()

        if (!response.ok) {
          throw new Error(
            result?.message ||
            'Failed to fetch portfolio.',
          )
        }

        const data = Array.isArray(
          result?.data,
        )
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

    void fetchPortfolio()
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories =
      Array.from(
        new Set(
          portfolio
            .filter(
              (item) =>
                item.status ===
                'Published',
            )
            .map(
              (item) =>
                item.category,
            )
            .filter(Boolean),
        ),
      )

    return [
      'All',
      ...uniqueCategories,
    ]
  }, [portfolio])

  const filteredPortfolio =
    useMemo(() => {
      return portfolio.filter(
        (item) =>
          item.status ===
          'Published' &&
          (activeCategory ===
            'All' ||
            item.category ===
            activeCategory),
      )
    }, [
      portfolio,
      activeCategory,
    ])

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* =========================================================
          BACKGROUND
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50" />

        <div className="absolute -left-56 -top-32 h-[500px] w-[500px] rounded-full bg-violet-100/60 blur-[130px]" />

        <div className="absolute -right-56 top-[18%] h-[480px] w-[480px] rounded-full bg-pink-100/50 blur-[130px]" />

        <div className="absolute left-1/2 top-[8%] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-fuchsia-100/35 blur-[110px]" />
      </div>

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 pb-9 pt-24 sm:px-6 sm:pb-10 sm:pt-28 lg:px-8 lg:pb-12 lg:pt-32">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-violet-600" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 sm:text-xs">
                  Creative Portfolio
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl">
                Selected{' '}
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
                  Works
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                A selection of digital experiences,
                creative products, and production work
                crafted across technology, design,
                animation, games, and entertainment.
              </p>
            </div>

            {/* Published Count */}
            {!loading && !error && (
              <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <FolderOpen className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Published Works
                  </p>

                  <p className="text-lg font-black text-neutral-950">
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
      <section className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        {/* =======================================================
            CATEGORY FILTER
        ======================================================== */}
        {!loading &&
          !error &&
          categories.length > 1 && (
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1 w-5 rounded-full bg-gradient-to-r from-violet-600 to-pink-500" />

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Explore by category
                </p>
              </div>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible">
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
                        className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${isActive
                            ? 'bg-neutral-950 text-white shadow-[0_8px_20px_rgba(0,0,0,0.10)]'
                            : 'border border-neutral-200 bg-white text-neutral-500 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700'
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
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />

                <div>
                  <p className="font-semibold text-neutral-900">
                    Loading portfolio
                  </p>

                  <p className="text-xs text-neutral-400">
                    Menyiapkan selected works...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            ERROR
        ======================================================== */}
        {!loading && error && (
          <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-6 text-center sm:p-7">
            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <FolderOpen className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-neutral-950">
                Unable to load portfolio
              </h2>

              <p className="mt-1 text-sm text-red-600">
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
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-7 text-center shadow-[0_15px_50px_rgba(0,0,0,0.04)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-400">
                <FolderOpen className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-neutral-950">
                No published work yet
              </h2>

              <p className="mt-1 max-w-md text-sm leading-6 text-neutral-500">
                Our portfolio is continuously evolving.
                Published projects will appear here as
                they become available.
              </p>
            </div>
          )}

        {/* =======================================================
            PORTFOLIO GRID
        ======================================================== */}
        {!loading &&
          !error &&
          filteredPortfolio.length >
          0 && (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredPortfolio.map(
                (item) => (
                  <article
                    key={item.id}
                    className="
                      group
                      relative
                      flex
                      h-full
                      flex-col
                      overflow-hidden
                      rounded-[1.5rem]
                      border
                      border-neutral-200
                      bg-white
                      shadow-[0_10px_35px_rgba(0,0,0,0.045)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-violet-200
                      hover:shadow-[0_20px_55px_rgba(124,58,237,0.10)]
                    "
                  >
                    {/* Top hover line */}
                    <div className="absolute inset-x-6 top-0 z-30 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* =================================================
                        IMAGE
                    ================================================== */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      {item.image_url ? (
                        <>
                          <img
                            src={
                              item.image_url
                            }
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/65 via-neutral-950/5 to-transparent" />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-pink-100" />

                          <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{
                              backgroundImage: `
                                linear-gradient(rgba(124,58,237,0.7) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(124,58,237,0.7) 1px, transparent 1px)
                              `,
                              backgroundSize:
                                '32px 32px',
                            }}
                          />

                          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2">
                            <div className="absolute -inset-8 rounded-full bg-violet-200/50 blur-2xl" />

                            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-600 shadow-xl">
                              <FolderOpen className="h-9 w-9" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Category */}
                      <div className="absolute left-4 top-4">
                        <span className="inline-flex rounded-full border border-white/30 bg-neutral-950/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow-sm backdrop-blur-md">
                          {item.category}
                        </span>
                      </div>

                      {/* Year */}
                      {item.year && (
                        <div className="absolute right-4 top-4">
                          <span className="inline-flex rounded-full border border-white/30 bg-neutral-950/45 px-3 py-1.5 text-[10px] font-medium text-white shadow-sm backdrop-blur-md">
                            {item.year}
                          </span>
                        </div>
                      )}

                      {/* Client */}
                      {item.client && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
                            Client
                          </p>

                          <p className="mt-0.5 truncate text-xs font-semibold text-white">
                            {item.client}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================== */}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h2 className="line-clamp-2 text-lg font-bold leading-6 text-neutral-950 transition-colors group-hover:text-violet-700 sm:text-xl">
                        {item.title}
                      </h2>

                      {item.description && (
                        <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-6 text-neutral-500">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-auto pt-5">
                        <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-4">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                              Category
                            </p>

                            <p className="mt-0.5 truncate text-xs font-medium text-neutral-800">
                              {item.category}
                            </p>
                          </div>

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 shadow-sm transition-all duration-300 group-hover:border-violet-200 group-hover:bg-violet-50 group-hover:text-violet-700">
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </div>
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