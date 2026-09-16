import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Grid2X2,
  Image as ImageIcon,
  X,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

type PortfolioItem = {
  id: number
  title: string
  slug?: string
  category: string
  description?: string
  client?: string
  year?: string | number
  role?: string
  tools?: string[]
  image_url?: string | null
  image_urls?: string[]
  project_url?: string | null
  status?: string
  created_at?: string
  updated_at?: string
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1600&q=85'

function getPortfolioImages(item: PortfolioItem) {
  const gallery = Array.isArray(item.image_urls)
    ? item.image_urls.filter(Boolean)
    : []

  if (gallery.length > 0) {
    return gallery
  }

  if (item.image_url) {
    return [item.image_url]
  }

  return [FALLBACK_IMAGE]
}

function getCategoryLabel(category?: string) {
  if (!category) return 'Creative'

  return category
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedItem, setSelectedItem] =
    useState<PortfolioItem | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchPortfolio() {
      try {
        setLoading(true)

        const response = await fetch(
          `${API_BASE_URL}/api/portfolio`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch portfolio')
        }

        const data = await response.json()

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.portfolio)
              ? data.portfolio
              : []

        if (!cancelled) {
          setPortfolio(items)
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error)

        if (!cancelled) {
          setPortfolio([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPortfolio()

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const uniqueCategories = portfolio
      .map((item) => item.category)
      .filter(Boolean)

    return ['All', ...Array.from(new Set(uniqueCategories))]
  }, [portfolio])

  const filteredPortfolio = useMemo(() => {
    if (activeCategory === 'All') {
      return portfolio
    }

    return portfolio.filter(
      (item) => item.category === activeCategory,
    )
  }, [portfolio, activeCategory])

  const selectedImages = selectedItem
    ? getPortfolioImages(selectedItem)
    : []

  const activeImage =
    selectedImages[activeImageIndex] ||
    selectedImages[0] ||
    FALLBACK_IMAGE

  function openPortfolio(item: PortfolioItem) {
    setSelectedItem(item)
    setActiveImageIndex(0)
    document.body.style.overflow = 'hidden'
  }

  function closePortfolio() {
    setSelectedItem(null)
    setActiveImageIndex(0)
    document.body.style.overflow = ''
  }

  function showNextImage() {
    if (selectedImages.length <= 1) return

    setActiveImageIndex((current) =>
      current >= selectedImages.length - 1
        ? 0
        : current + 1,
    )
  }

  function showPreviousImage() {
    if (selectedImages.length <= 1) return

    setActiveImageIndex((current) =>
      current <= 0
        ? selectedImages.length - 1
        : current - 1,
    )
  }

  useEffect(() => {
    if (!selectedItem) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closePortfolio()
      }

      if (event.key === 'ArrowRight') {
        showNextImage()
      }

      if (event.key === 'ArrowLeft') {
        showPreviousImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedItem, selectedImages.length])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      {/* GRID BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #111 1px, transparent 1px),
            linear-gradient(to bottom, #111 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* HERO */}
      <section className="relative border-b border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 pb-20 pt-10 sm:px-8 sm:pb-28 lg:px-12 lg:pt-14">
          <div className="mb-20 flex items-center justify-between border-b border-neutral-200 pb-5">
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              39Production • Portfolio
            </span>

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
              Selected Works
            </span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-600">
                04 / Portfolio
              </p>

              <h1 className="max-w-5xl text-5xl font-medium leading-[0.92] tracking-[-0.06em] sm:text-6xl lg:text-[7rem]">
                Work that
                <br />
                <span className="text-neutral-400">
                  speaks for itself.
                </span>
              </h1>
            </div>

            <div className="max-w-sm lg:pb-2">
              <p className="text-sm leading-7 text-neutral-500">
                A selection of digital works, visual experiences,
                products, and creative projects produced by
                39Production.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <span className="font-mono text-xs text-neutral-400">
                  {String(portfolio.length).padStart(2, '0')}
                </span>

                <span className="h-px w-16 bg-neutral-300" />

                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                  Projects
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="flex h-16 items-center border-b border-neutral-200 lg:w-48 lg:border-b-0 lg:border-r">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                Filter
              </span>
            </div>

            <div className="flex flex-wrap">
              {categories.map((category) => {
                const isActive = activeCategory === category

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`border-r px-5 py-5 font-mono text-[9px] uppercase tracking-[0.16em] transition-colors first:border-l ${isActive
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
                      }`}
                  >
                    {getCategoryLabel(category)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section>
        <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          {loading ? (
            <div className="grid gap-px bg-neutral-200 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] animate-pulse bg-neutral-100"
                />
              ))}
            </div>
          ) : filteredPortfolio.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-neutral-300 text-center">
              <ImageIcon
                size={28}
                strokeWidth={1.2}
                className="mb-5 text-neutral-300"
              />

              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                No projects found
              </p>
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {filteredPortfolio.map((item, index) => {
                const images = getPortfolioImages(item)
                const coverImage =
                  images[0] || FALLBACK_IMAGE

                return (
                  <article
                    key={item.id}
                    className="group cursor-pointer"
                    onClick={() => openPortfolio(item)}
                    data-cursor="view"
                    data-cursor-label="VIEW"
                  >
                    <div className="relative overflow-hidden bg-neutral-100">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={coverImage}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                          loading={index < 3 ? 'eager' : 'lazy'}
                        />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {images.length > 1 && (
                        <div className="absolute right-4 top-4 flex items-center gap-2 bg-white/90 px-3 py-2 backdrop-blur-sm">
                          <ImageIcon
                            size={11}
                            strokeWidth={1.5}
                          />

                          <span className="font-mono text-[9px]">
                            {String(images.length).padStart(
                              2,
                              '0',
                            )}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 flex h-9 w-9 translate-y-2 items-center justify-center bg-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight
                          size={15}
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-start justify-between gap-6">
                      <div>
                        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-violet-600">
                          {getCategoryLabel(item.category)}
                        </p>

                        <h2 className="text-xl font-medium tracking-[-0.035em]">
                          {item.title}
                        </h2>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 max-w-md text-sm leading-6 text-neutral-500">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <span className="font-mono text-[10px] text-neutral-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM STATEMENT */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              04.01
            </div>

            <div>
              <p className="max-w-4xl text-3xl font-medium leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Every project is an opportunity to turn an
                idea into something people can see, use,
                experience, and remember.
              </p>

              <Link
                to="/contact"
                className="mt-10 inline-flex items-center gap-3 border-b border-neutral-950 pb-2 text-sm font-medium transition-all hover:gap-5"
              >
                Start a project
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePortfolio()
            }
          }}
        >
          <div className="flex h-full w-full items-center justify-center p-3 sm:p-6 lg:p-10">
            <div className="relative flex max-h-[95vh] w-full max-w-[1500px] flex-col overflow-hidden bg-white shadow-2xl lg:max-h-[92vh]">
              {/* MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 sm:px-7">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-violet-600">
                    {getCategoryLabel(selectedItem.category)}
                  </span>

                  <span className="h-3 w-px bg-neutral-300" />

                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                    {selectedImages.length}{' '}
                    {selectedImages.length === 1
                      ? 'Image'
                      : 'Images'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closePortfolio}
                  aria-label="Close portfolio detail"
                  className="flex h-9 w-9 items-center justify-center border border-neutral-200 transition-colors hover:bg-neutral-950 hover:text-white"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              {/* DETAIL CONTENT */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                  {/* IMAGE VIEWER */}
                  <div className="min-w-0 border-b border-neutral-200 lg:border-b-0 lg:border-r">
                    <div className="relative flex min-h-[320px] max-h-[76vh] w-full items-center justify-center overflow-hidden bg-neutral-100 p-4 sm:min-h-[420px] sm:p-8 lg:min-h-[560px] lg:max-h-[76vh]">
                      {/* 
                        IMPORTANT:
                        Tidak menggunakan aspect ratio.
                        Tidak menggunakan object-cover.
                        object-contain menjaga foto asli agar
                        tidak terpotong.
                      */}
                      <img
                        src={activeImage}
                        alt={`${selectedItem.title} — image ${activeImageIndex + 1
                          }`}
                        className="max-h-[70vh] max-w-full object-contain"
                      />

                      {selectedImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={showPreviousImage}
                            aria-label="Previous image"
                            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/70 bg-white/90 text-neutral-950 backdrop-blur-sm transition-colors hover:bg-neutral-950 hover:text-white"
                          >
                            <ChevronLeft
                              size={17}
                              strokeWidth={1.5}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={showNextImage}
                            aria-label="Next image"
                            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/70 bg-white/90 text-neutral-950 backdrop-blur-sm transition-colors hover:bg-neutral-950 hover:text-white"
                          >
                            <ChevronRight
                              size={17}
                              strokeWidth={1.5}
                            />
                          </button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-2 font-mono text-[9px] text-white backdrop-blur-sm">
                            {String(
                              activeImageIndex + 1,
                            ).padStart(2, '0')}{' '}
                            /{' '}
                            {String(
                              selectedImages.length,
                            ).padStart(2, '0')}
                          </div>
                        </>
                      )}
                    </div>

                    {/* THUMBNAILS */}
                    {selectedImages.length > 1 && (
                      <div className="border-t border-neutral-200 bg-white p-4 sm:p-5">
                        <div className="flex gap-3 overflow-x-auto pb-1">
                          {selectedImages.map(
                            (image, index) => (
                              <button
                                key={`${image}-${index}`}
                                type="button"
                                onClick={() =>
                                  setActiveImageIndex(index)
                                }
                                aria-label={`View image ${index + 1
                                  }`}
                                className={`relative h-20 w-24 shrink-0 overflow-hidden border transition-all sm:h-24 sm:w-32 ${activeImageIndex === index
                                    ? 'border-neutral-950'
                                    : 'border-neutral-200 opacity-60 hover:opacity-100'
                                  }`}
                              >
                                <img
                                  src={image}
                                  alt=""
                                  className="h-full w-full object-contain bg-neutral-100 p-1"
                                />

                                <span className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-1 font-mono text-[8px] text-white">
                                  {String(index + 1).padStart(
                                    2,
                                    '0',
                                  )}
                                </span>
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PROJECT INFORMATION */}
                  <aside className="bg-white">
                    <div className="p-6 sm:p-8 lg:p-9">
                      <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">
                        Project Detail
                      </p>

                      <h2 className="text-3xl font-medium leading-[0.95] tracking-[-0.05em] sm:text-4xl">
                        {selectedItem.title}
                      </h2>

                      {selectedItem.description && (
                        <p className="mt-6 text-sm leading-7 text-neutral-500">
                          {selectedItem.description}
                        </p>
                      )}

                      <div className="mt-10 border-t border-neutral-200">
                        {selectedItem.client && (
                          <div className="grid grid-cols-[100px_1fr] border-b border-neutral-200 py-4">
                            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                              Client
                            </span>

                            <span className="text-sm text-neutral-800">
                              {selectedItem.client}
                            </span>
                          </div>
                        )}

                        {selectedItem.year && (
                          <div className="grid grid-cols-[100px_1fr] border-b border-neutral-200 py-4">
                            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                              Year
                            </span>

                            <span className="text-sm text-neutral-800">
                              {selectedItem.year}
                            </span>
                          </div>
                        )}

                        {selectedItem.role && (
                          <div className="grid grid-cols-[100px_1fr] border-b border-neutral-200 py-4">
                            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                              Role
                            </span>

                            <span className="text-sm text-neutral-800">
                              {selectedItem.role}
                            </span>
                          </div>
                        )}

                        {selectedItem.tools &&
                          selectedItem.tools.length > 0 && (
                            <div className="grid grid-cols-[100px_1fr] border-b border-neutral-200 py-4">
                              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                                Tools
                              </span>

                              <div className="flex flex-wrap gap-x-3 gap-y-2">
                                {selectedItem.tools.map(
                                  (tool) => (
                                    <span
                                      key={tool}
                                      className="text-sm text-neutral-800"
                                    >
                                      {tool}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {selectedItem.project_url && (
                        <a
                          href={selectedItem.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-8 flex items-center justify-between border border-neutral-950 px-5 py-4 text-sm font-medium transition-colors hover:bg-neutral-950 hover:text-white"
                        >
                          <span>View Project</span>

                          <ExternalLink
                            size={15}
                            strokeWidth={1.5}
                          />
                        </a>
                      )}

                      <div className="mt-10 flex items-center gap-3">
                        <Grid2X2
                          size={14}
                          strokeWidth={1.4}
                          className="text-neutral-400"
                        />

                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                          Gallery{' '}
                          {String(
                            selectedImages.length,
                          ).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex shrink-0 items-center justify-between border-t border-neutral-200 bg-white px-5 py-3 sm:px-7">
                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-400">
                  39Production / Portfolio
                </span>

                <div className="hidden items-center gap-3 sm:flex">
                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                    ← →
                  </span>

                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                    Navigate
                  </span>

                  <span className="h-3 w-px bg-neutral-300" />

                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                    ESC
                  </span>

                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                    Close
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}