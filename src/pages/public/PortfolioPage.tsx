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

const SITE_URL = 'https://39production.digital'
const PAGE_URL = `${SITE_URL}/portfolio`
const DEFAULT_OG_IMAGE =
  'https://39production.digital/og-image.jpg'

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

function setMetaTag(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`,
  ) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', key)
    if (attribute === 'property') {
      element.removeAttribute('name')
      element.setAttribute('property', key)
    }

    document.head.appendChild(element)
  }

  element.setAttribute('content', content)

  return element
}

function setCanonical(url: string) {
  let canonical = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', url)

  return canonical
}

function createJsonLdScript(
  id: string,
  data: Record<string, unknown>,
) {
  const existing = document.getElementById(id)

  existing?.remove()

  const script = document.createElement('script')

  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)

  document.head.appendChild(script)

  return script
}

export function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedItem, setSelectedItem] =
    useState<PortfolioItem | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  /*
   * ============================================================
   * SEO
   * ============================================================
   */

  useEffect(() => {
    const previousTitle = document.title

    const previousDescription =
      document.head.querySelector(
        'meta[name="description"]',
      ) as HTMLMetaElement | null

    const previousKeywords =
      document.head.querySelector(
        'meta[name="keywords"]',
      ) as HTMLMetaElement | null

    const previousRobots =
      document.head.querySelector(
        'meta[name="robots"]',
      ) as HTMLMetaElement | null

    const previousThemeColor =
      document.head.querySelector(
        'meta[name="theme-color"]',
      ) as HTMLMetaElement | null

    const previousCanonical =
      document.head.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement | null

    const previousOgTitle =
      document.head.querySelector(
        'meta[property="og:title"]',
      ) as HTMLMetaElement | null

    const previousOgDescription =
      document.head.querySelector(
        'meta[property="og:description"]',
      ) as HTMLMetaElement | null

    const previousOgUrl =
      document.head.querySelector(
        'meta[property="og:url"]',
      ) as HTMLMetaElement | null

    const previousOgType =
      document.head.querySelector(
        'meta[property="og:type"]',
      ) as HTMLMetaElement | null

    const previousOgSiteName =
      document.head.querySelector(
        'meta[property="og:site_name"]',
      ) as HTMLMetaElement | null

    const previousOgImage =
      document.head.querySelector(
        'meta[property="og:image"]',
      ) as HTMLMetaElement | null

    const previousOgImageAlt =
      document.head.querySelector(
        'meta[property="og:image:alt"]',
      ) as HTMLMetaElement | null

    const previousOgImageWidth =
      document.head.querySelector(
        'meta[property="og:image:width"]',
      ) as HTMLMetaElement | null

    const previousOgImageHeight =
      document.head.querySelector(
        'meta[property="og:image:height"]',
      ) as HTMLMetaElement | null

    const previousTwitterCard =
      document.head.querySelector(
        'meta[name="twitter:card"]',
      ) as HTMLMetaElement | null

    const previousTwitterTitle =
      document.head.querySelector(
        'meta[name="twitter:title"]',
      ) as HTMLMetaElement | null

    const previousTwitterDescription =
      document.head.querySelector(
        'meta[name="twitter:description"]',
      ) as HTMLMetaElement | null

    const previousTwitterImage =
      document.head.querySelector(
        'meta[name="twitter:image"]',
      ) as HTMLMetaElement | null

    const previousTwitterImageAlt =
      document.head.querySelector(
        'meta[name="twitter:image:alt"]',
      ) as HTMLMetaElement | null

    const previousJsonLd =
      document.getElementById(
        'portfolio-page-jsonld',
      )

    const previousBreadcrumbJsonLd =
      document.getElementById(
        'portfolio-breadcrumb-jsonld',
      )

    document.title =
      'Portfolio — 39Production | Digital & Creative Production'

    const description =
      'Explore selected digital works, visual experiences, websites, UI/UX designs, games, animation, graphic design and creative technology projects produced by 39Production.'

    const keywords =
      '39Production, portfolio 39Production, digital production, creative production, digital creative agency, UI UX design, website development, game development, animation, graphic design, creative technology, Indonesia'

    setMetaTag(
      'name',
      'description',
      description,
    )

    setMetaTag(
      'name',
      'keywords',
      keywords,
    )

    setMetaTag(
      'name',
      'robots',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    setMetaTag(
      'name',
      'theme-color',
      '#ffffff',
    )

    setMetaTag(
      'property',
      'og:title',
      'Portfolio — 39Production',
    )

    setMetaTag(
      'property',
      'og:description',
      description,
    )

    setMetaTag(
      'property',
      'og:url',
      PAGE_URL,
    )

    setMetaTag(
      'property',
      'og:type',
      'website',
    )

    setMetaTag(
      'property',
      'og:site_name',
      '39Production',
    )

    setMetaTag(
      'property',
      'og:image',
      DEFAULT_OG_IMAGE,
    )

    setMetaTag(
      'property',
      'og:image:alt',
      '39Production Portfolio — Digital and Creative Production',
    )

    setMetaTag(
      'property',
      'og:image:width',
      '1200',
    )

    setMetaTag(
      'property',
      'og:image:height',
      '630',
    )

    setMetaTag(
      'name',
      'twitter:card',
      'summary_large_image',
    )

    setMetaTag(
      'name',
      'twitter:title',
      'Portfolio — 39Production',
    )

    setMetaTag(
      'name',
      'twitter:description',
      description,
    )

    setMetaTag(
      'name',
      'twitter:image',
      DEFAULT_OG_IMAGE,
    )

    setMetaTag(
      'name',
      'twitter:image:alt',
      '39Production Portfolio — Digital and Creative Production',
    )

    setCanonical(PAGE_URL)

    createJsonLdScript(
      'portfolio-page-jsonld',
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '39Production Portfolio',
        headline:
          'Portfolio — 39Production | Digital & Creative Production',
        description,
        url: PAGE_URL,
        inLanguage: 'en',
        isPartOf: {
          '@type': 'WebSite',
          name: '39Production',
          url: SITE_URL,
        },
        about: {
          '@type': 'Organization',
          name: '39Production',
          url: SITE_URL,
        },
      },
    )

    createJsonLdScript(
      'portfolio-breadcrumb-jsonld',
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Portfolio',
            item: PAGE_URL,
          },
        ],
      },
    )

    return () => {
      document.title = previousTitle

      if (previousDescription) {
        setMetaTag(
          'name',
          'description',
          previousDescription.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="description"]',
          )
          ?.remove()
      }

      if (previousKeywords) {
        setMetaTag(
          'name',
          'keywords',
          previousKeywords.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="keywords"]',
          )
          ?.remove()
      }

      if (previousRobots) {
        setMetaTag(
          'name',
          'robots',
          previousRobots.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="robots"]',
          )
          ?.remove()
      }

      if (previousThemeColor) {
        setMetaTag(
          'name',
          'theme-color',
          previousThemeColor.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="theme-color"]',
          )
          ?.remove()
      }

      if (previousCanonical) {
        setCanonical(previousCanonical.href)
      } else {
        document.head
          .querySelector(
            'link[rel="canonical"]',
          )
          ?.remove()
      }

      if (previousOgTitle) {
        setMetaTag(
          'property',
          'og:title',
          previousOgTitle.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:title"]',
          )
          ?.remove()
      }

      if (previousOgDescription) {
        setMetaTag(
          'property',
          'og:description',
          previousOgDescription.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:description"]',
          )
          ?.remove()
      }

      if (previousOgUrl) {
        setMetaTag(
          'property',
          'og:url',
          previousOgUrl.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:url"]',
          )
          ?.remove()
      }

      if (previousOgType) {
        setMetaTag(
          'property',
          'og:type',
          previousOgType.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:type"]',
          )
          ?.remove()
      }

      if (previousOgSiteName) {
        setMetaTag(
          'property',
          'og:site_name',
          previousOgSiteName.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:site_name"]',
          )
          ?.remove()
      }

      if (previousOgImage) {
        setMetaTag(
          'property',
          'og:image',
          previousOgImage.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:image"]',
          )
          ?.remove()
      }

      if (previousOgImageAlt) {
        setMetaTag(
          'property',
          'og:image:alt',
          previousOgImageAlt.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:image:alt"]',
          )
          ?.remove()
      }

      if (previousOgImageWidth) {
        setMetaTag(
          'property',
          'og:image:width',
          previousOgImageWidth.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:image:width"]',
          )
          ?.remove()
      }

      if (previousOgImageHeight) {
        setMetaTag(
          'property',
          'og:image:height',
          previousOgImageHeight.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[property="og:image:height"]',
          )
          ?.remove()
      }

      if (previousTwitterCard) {
        setMetaTag(
          'name',
          'twitter:card',
          previousTwitterCard.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:card"]',
          )
          ?.remove()
      }

      if (previousTwitterTitle) {
        setMetaTag(
          'name',
          'twitter:title',
          previousTwitterTitle.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:title"]',
          )
          ?.remove()
      }

      if (previousTwitterDescription) {
        setMetaTag(
          'name',
          'twitter:description',
          previousTwitterDescription.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:description"]',
          )
          ?.remove()
      }

      if (previousTwitterImage) {
        setMetaTag(
          'name',
          'twitter:image',
          previousTwitterImage.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:image"]',
          )
          ?.remove()
      }

      if (previousTwitterImageAlt) {
        setMetaTag(
          'name',
          'twitter:image:alt',
          previousTwitterImageAlt.content,
        )
      } else {
        document.head
          .querySelector(
            'meta[name="twitter:image:alt"]',
          )
          ?.remove()
      }

      previousJsonLd?.remove()
      previousBreadcrumbJsonLd?.remove()

      document.getElementById(
        'portfolio-items-jsonld',
      )?.remove()
    }
  }, [])

  /*
   * ============================================================
   * SEO — DYNAMIC PORTFOLIO STRUCTURED DATA
   * ============================================================
   */

  useEffect(() => {
    if (portfolio.length === 0) return

    const items = portfolio
      .slice(0, 50)
      .map((item, index) => {
        const images = getPortfolioImages(item)

        const itemUrl =
          item.project_url || PAGE_URL

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'CreativeWork',
            '@id': `${PAGE_URL}#portfolio-${item.id}`,
            name: item.title,
            description:
              item.description ||
              `${item.title} — creative project by 39Production.`,
            url: itemUrl,
            image: images[0],
            creator: {
              '@type': 'Organization',
              name: '39Production',
              url: SITE_URL,
            },
            publisher: {
              '@type': 'Organization',
              name: '39Production',
              url: SITE_URL,
            },
            ...(item.category
              ? {
                genre: getCategoryLabel(
                  item.category,
                ),
              }
              : {}),
            ...(item.client
              ? {
                client: {
                  '@type': 'Organization',
                  name: item.client,
                },
              }
              : {}),
            ...(item.year
              ? {
                dateCreated: String(
                  item.year,
                ),
              }
              : {}),
          },
        }
      })

    const jsonLd = createJsonLdScript(
      'portfolio-items-jsonld',
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: '39Production Portfolio',
        url: PAGE_URL,
        numberOfItems: portfolio.length,
        itemListElement: items,
      },
    )

    return () => {
      jsonLd.remove()
    }
  }, [portfolio])

  /*
   * ============================================================
   * FETCH PORTFOLIO
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false

    async function fetchPortfolio() {
      try {
        setLoading(true)

        const response = await fetch(
          `${API_BASE_URL}/api/portfolio`,
        )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch portfolio',
          )
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
        console.error(
          'Failed to load portfolio:',
          error,
        )

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

  /*
   * ============================================================
   * CATEGORIES
   * ============================================================
   */

  const categories = useMemo(() => {
    const uniqueCategories = portfolio
      .map((item) => item.category)
      .filter(Boolean)

    return [
      'All',
      ...Array.from(
        new Set(uniqueCategories),
      ),
    ]
  }, [portfolio])

  /*
   * ============================================================
   * FILTER
   * ============================================================
   */

  const filteredPortfolio = useMemo(() => {
    if (activeCategory === 'All') {
      return portfolio
    }

    return portfolio.filter(
      (item) =>
        item.category === activeCategory,
    )
  }, [portfolio, activeCategory])

  /*
   * ============================================================
   * SELECTED PROJECT
   * ============================================================
   */

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

  /*
   * ============================================================
   * KEYBOARD NAVIGATION
   * ============================================================
   */

  useEffect(() => {
    if (!selectedItem) return

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
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

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    selectedItem,
    selectedImages.length,
  ])

  /*
   * ============================================================
   * BODY SCROLL CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      {/* ======================================================
          GRID BACKGROUND
          ====================================================== */}

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

      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="relative border-b border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 pb-14 pt-7 sm:px-8 sm:pb-20 sm:pt-10 lg:px-12 lg:pb-28 lg:pt-14">
          <div className="mb-12 flex items-center justify-between border-b border-neutral-200 pb-4 sm:mb-16">
            <span className="font-mono text-[8px] font-medium uppercase tracking-[0.22em] text-neutral-500 sm:text-[9px]">
              39Production • Portfolio
            </span>

            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 sm:block">
              Selected Works
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end lg:gap-12">
            <div>
              <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-violet-600 sm:mb-6 sm:text-[10px]">
                04 / Portfolio
              </p>

              <h1 className="max-w-5xl text-[3.25rem] font-medium leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-[7rem]">
                Work that
                <br />
                <span className="text-neutral-400">
                  speaks for itself.
                </span>
              </h1>
            </div>

            <div className="max-w-sm lg:pb-2">
              <p className="text-[13px] leading-6 text-neutral-500 sm:text-sm sm:leading-7">
                A selection of digital works,
                visual experiences, products,
                and creative projects produced
                by 39Production.
              </p>

              <div className="mt-6 flex items-center gap-3 sm:mt-8 sm:gap-4">
                <span className="font-mono text-xs text-neutral-400">
                  {String(
                    portfolio.length,
                  ).padStart(2, '0')}
                </span>

                <span className="h-px w-10 bg-neutral-300 sm:w-16" />

                <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-400 sm:text-[9px]">
                  Projects
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FILTER
          ====================================================== */}

      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="flex h-14 shrink-0 items-center border-b border-neutral-200 lg:h-16 lg:w-48 lg:border-b-0 lg:border-r">
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-neutral-400 sm:text-[9px]">
                Filter
              </span>
            </div>

            <div className="-mx-5 flex overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
              <div className="flex shrink-0">
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
                        className={`shrink-0 border-r px-4 py-4 font-mono text-[8px] uppercase tracking-[0.15em] transition-colors first:border-l sm:px-5 sm:py-5 sm:text-[9px] ${isActive
                            ? 'bg-neutral-950 text-white'
                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
                          }`}
                      >
                        {getCategoryLabel(
                          category,
                        )}
                      </button>
                    )
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          PORTFOLIO
          ====================================================== */}

      <section aria-labelledby="portfolio-list-title">
        <h2
          id="portfolio-list-title"
          className="sr-only"
        >
          39Production Portfolio Projects
        </h2>

        <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          {loading ? (
            <>
              {/* MOBILE SKELETON */}
              <div className="space-y-3 md:hidden">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="flex gap-3 border border-neutral-200 p-2.5"
                  >
                    <div className="h-[82px] w-[105px] shrink-0 animate-pulse bg-neutral-100" />

                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                      <div className="h-2 w-16 animate-pulse bg-neutral-100" />
                      <div className="h-4 w-3/4 animate-pulse bg-neutral-100" />
                      <div className="h-2 w-full animate-pulse bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP SKELETON */}
              <div className="hidden gap-x-8 gap-y-16 md:grid md:grid-cols-2 lg:grid-cols-3">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div key={index}>
                    <div className="aspect-[4/3] animate-pulse bg-neutral-100" />

                    <div className="mt-5 space-y-3">
                      <div className="h-2 w-20 animate-pulse bg-neutral-100" />
                      <div className="h-5 w-2/3 animate-pulse bg-neutral-100" />
                      <div className="h-3 w-full animate-pulse bg-neutral-100" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : filteredPortfolio.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center border border-dashed border-neutral-300 px-5 text-center sm:min-h-[420px]">
              <ImageIcon
                size={28}
                strokeWidth={1.2}
                className="mb-5 text-neutral-300"
              />

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400 sm:text-[10px]">
                No projects found
              </p>
            </div>
          ) : (
            <>
              {/* ==================================================
                  MOBILE — COMPACT SIDE CARD LIST
                  ================================================== */}

              <div className="space-y-2.5 md:hidden">
                {filteredPortfolio.map(
                  (item, index) => {
                    const images =
                      getPortfolioImages(
                        item,
                      )

                    const coverImage =
                      images[0] ||
                      FALLBACK_IMAGE

                    return (
                      <article
                        key={item.id}
                        className="group cursor-pointer border border-neutral-200 bg-white p-2.5 transition-all duration-300 active:bg-neutral-50"
                        onClick={() =>
                          openPortfolio(
                            item,
                          )
                        }
                        data-cursor="view"
                        data-cursor-label="VIEW"
                      >
                        <div className="flex gap-3">
                          {/* IMAGE */}

                          <div className="relative h-[82px] w-[105px] shrink-0 overflow-hidden bg-neutral-100">
                            <img
                              src={coverImage}
                              alt={`${item.title} — 39Production portfolio`}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              loading={
                                index < 3
                                  ? 'eager'
                                  : 'lazy'
                              }
                            />

                            {images.length >
                              1 && (
                                <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-1 text-white backdrop-blur-sm">
                                  <ImageIcon
                                    size={8}
                                    strokeWidth={1.5}
                                  />

                                  <span className="font-mono text-[7px]">
                                    {String(
                                      images.length,
                                    ).padStart(
                                      2,
                                      '0',
                                    )}
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* CONTENT */}

                          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                            <div className="min-w-0">
                              <div className="mb-1.5 flex items-center justify-between gap-2">
                                <p className="truncate font-mono text-[7px] uppercase tracking-[0.15em] text-violet-600">
                                  {getCategoryLabel(
                                    item.category,
                                  )}
                                </p>

                                <span className="shrink-0 font-mono text-[7px] text-neutral-400">
                                  {String(
                                    index + 1,
                                  ).padStart(
                                    2,
                                    '0',
                                  )}
                                </span>
                              </div>

                              <h3 className="truncate text-[14px] font-medium leading-tight tracking-[-0.025em] text-neutral-950">
                                {item.title}
                              </h3>

                              {item.description && (
                                <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-neutral-500">
                                  {
                                    item.description
                                  }
                                </p>
                              )}
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-mono text-[7px] uppercase tracking-[0.13em] text-neutral-400">
                                View project
                              </span>

                              <ArrowUpRight
                                size={12}
                                strokeWidth={1.5}
                                className="text-neutral-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-950"
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>

              {/* ==================================================
                  TABLET + DESKTOP — EDITORIAL GRID
                  ================================================== */}

              <div className="hidden gap-x-8 gap-y-16 md:grid md:grid-cols-2 lg:grid-cols-3">
                {filteredPortfolio.map(
                  (item, index) => {
                    const images =
                      getPortfolioImages(
                        item,
                      )

                    const coverImage =
                      images[0] ||
                      FALLBACK_IMAGE

                    return (
                      <article
                        key={item.id}
                        className="group cursor-pointer"
                        onClick={() =>
                          openPortfolio(
                            item,
                          )
                        }
                        data-cursor="view"
                        data-cursor-label="VIEW"
                      >
                        <div className="relative overflow-hidden bg-neutral-100">
                          <div className="aspect-[4/3] overflow-hidden">
                            <img
                              src={coverImage}
                              alt={`${item.title} — 39Production portfolio`}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                              loading={
                                index < 3
                                  ? 'eager'
                                  : 'lazy'
                              }
                            />
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                          {images.length >
                            1 && (
                              <div className="absolute right-4 top-4 flex items-center gap-2 bg-white/90 px-3 py-2 backdrop-blur-sm">
                                <ImageIcon
                                  size={11}
                                  strokeWidth={1.5}
                                />

                                <span className="font-mono text-[9px]">
                                  {String(
                                    images.length,
                                  ).padStart(
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
                              {getCategoryLabel(
                                item.category,
                              )}
                            </p>

                            <h3 className="text-xl font-medium tracking-[-0.035em]">
                              {item.title}
                            </h3>

                            {item.description && (
                              <p className="mt-2 line-clamp-2 max-w-md text-sm leading-6 text-neutral-500">
                                {
                                  item.description
                                }
                              </p>
                            )}
                          </div>

                          <span className="font-mono text-[10px] text-neutral-400">
                            {String(
                              index + 1,
                            ).padStart(2, '0')}
                          </span>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ======================================================
          BOTTOM STATEMENT
          ====================================================== */}

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[180px_1fr] lg:gap-10">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
              04.01
            </div>

            <div>
              <p className="max-w-4xl text-2xl font-medium leading-[1.15] tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                Every project is an opportunity
                to turn an idea into something
                people can see, use, experience,
                and remember.
              </p>

              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-3 border-b border-neutral-950 pb-2 text-sm font-medium transition-all hover:gap-5 sm:mt-10"
              >
                Start a project

                <ArrowRight
                  size={15}
                  strokeWidth={1.5}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          DETAIL MODAL
          ====================================================== */}

      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePortfolio()
            }
          }}
        >
          <div className="flex h-full w-full items-center justify-center p-2 sm:p-6 lg:p-10">
            <div className="relative flex max-h-[96vh] w-full max-w-[1500px] flex-col overflow-hidden bg-white shadow-2xl lg:max-h-[92vh]">
              {/* ==================================================
                  MODAL HEADER
                  ================================================== */}

              <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 sm:px-7 sm:py-4">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <span className="max-w-[150px] truncate font-mono text-[8px] uppercase tracking-[0.18em] text-violet-600 sm:max-w-none sm:text-[9px]">
                    {getCategoryLabel(
                      selectedItem.category,
                    )}
                  </span>

                  <span className="hidden h-3 w-px bg-neutral-300 sm:block" />

                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-400 sm:block">
                    {selectedImages.length}{' '}
                    {selectedImages.length ===
                      1
                      ? 'Image'
                      : 'Images'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closePortfolio}
                  aria-label="Close portfolio detail"
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-neutral-200 transition-colors hover:bg-neutral-950 hover:text-white sm:h-9 sm:w-9"
                >
                  <X
                    size={15}
                    strokeWidth={1.5}
                  />
                </button>
              </div>

              {/* ==================================================
                  DETAIL CONTENT
                  ================================================== */}

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                  {/* IMAGE VIEWER */}

                  <div className="min-w-0 border-b border-neutral-200 lg:border-b-0 lg:border-r">
                    <div className="relative flex min-h-[250px] max-h-[62vh] w-full items-center justify-center overflow-hidden bg-neutral-100 p-3 sm:min-h-[420px] sm:p-8 lg:min-h-[560px] lg:max-h-[76vh]">
                      <img
                        src={activeImage}
                        alt={`${selectedItem.title} — image ${activeImageIndex + 1}`}
                        className="max-h-[58vh] max-w-full object-contain sm:max-h-[70vh]"
                      />

                      {selectedImages.length >
                        1 && (
                          <>
                            <button
                              type="button"
                              onClick={
                                showPreviousImage
                              }
                              aria-label="Previous image"
                              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/70 bg-white/90 text-neutral-950 backdrop-blur-sm transition-colors hover:bg-neutral-950 hover:text-white sm:left-4 sm:h-10 sm:w-10"
                            >
                              <ChevronLeft
                                size={17}
                                strokeWidth={1.5}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={
                                showNextImage
                              }
                              aria-label="Next image"
                              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/70 bg-white/90 text-neutral-950 backdrop-blur-sm transition-colors hover:bg-neutral-950 hover:text-white sm:right-4 sm:h-10 sm:w-10"
                            >
                              <ChevronRight
                                size={17}
                                strokeWidth={1.5}
                              />
                            </button>

                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 px-2.5 py-1.5 font-mono text-[8px] text-white backdrop-blur-sm sm:bottom-4 sm:px-3 sm:py-2 sm:text-[9px]">
                              {String(
                                activeImageIndex +
                                1,
                              ).padStart(
                                2,
                                '0',
                              )}{' '}
                              /{' '}
                              {String(
                                selectedImages.length,
                              ).padStart(
                                2,
                                '0',
                              )}
                            </div>
                          </>
                        )}
                    </div>

                    {/* THUMBNAILS */}

                    {selectedImages.length >
                      1 && (
                        <div className="border-t border-neutral-200 bg-white p-3 sm:p-5">
                          <div className="flex gap-2.5 overflow-x-auto pb-1 sm:gap-3">
                            {selectedImages.map(
                              (
                                image,
                                index,
                              ) => (
                                <button
                                  key={`${image}-${index}`}
                                  type="button"
                                  onClick={() =>
                                    setActiveImageIndex(
                                      index,
                                    )
                                  }
                                  aria-label={`View image ${index + 1}`}
                                  className={`relative h-16 w-20 shrink-0 overflow-hidden border transition-all sm:h-24 sm:w-32 ${activeImageIndex ===
                                      index
                                      ? 'border-neutral-950'
                                      : 'border-neutral-200 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                  <img
                                    src={image}
                                    alt=""
                                    className="h-full w-full bg-neutral-100 object-contain p-1"
                                  />

                                  <span className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-1 font-mono text-[8px] text-white">
                                    {String(
                                      index + 1,
                                    ).padStart(
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

                  {/* ==================================================
                      PROJECT INFORMATION
                      ================================================== */}

                  <aside className="bg-white">
                    <div className="p-5 sm:p-8 lg:p-9">
                      <p className="mb-3 font-mono text-[8px] uppercase tracking-[0.2em] text-neutral-400 sm:mb-4 sm:text-[9px]">
                        Project Detail
                      </p>

                      <h2 className="text-2xl font-medium leading-[0.98] tracking-[-0.05em] sm:text-4xl">
                        {selectedItem.title}
                      </h2>

                      {selectedItem.description && (
                        <p className="mt-5 text-[13px] leading-6 text-neutral-500 sm:mt-6 sm:text-sm sm:leading-7">
                          {
                            selectedItem.description
                          }
                        </p>
                      )}

                      <div className="mt-8 border-t border-neutral-200 sm:mt-10">
                        {selectedItem.client && (
                          <div className="grid grid-cols-[85px_1fr] border-b border-neutral-200 py-3.5 sm:grid-cols-[100px_1fr] sm:py-4">
                            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px]">
                              Client
                            </span>

                            <span className="text-[13px] text-neutral-800 sm:text-sm">
                              {
                                selectedItem.client
                              }
                            </span>
                          </div>
                        )}

                        {selectedItem.year && (
                          <div className="grid grid-cols-[85px_1fr] border-b border-neutral-200 py-3.5 sm:grid-cols-[100px_1fr] sm:py-4">
                            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px]">
                              Year
                            </span>

                            <span className="text-[13px] text-neutral-800 sm:text-sm">
                              {
                                selectedItem.year
                              }
                            </span>
                          </div>
                        )}

                        {selectedItem.role && (
                          <div className="grid grid-cols-[85px_1fr] border-b border-neutral-200 py-3.5 sm:grid-cols-[100px_1fr] sm:py-4">
                            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px]">
                              Role
                            </span>

                            <span className="text-[13px] text-neutral-800 sm:text-sm">
                              {
                                selectedItem.role
                              }
                            </span>
                          </div>
                        )}

                        {selectedItem.tools &&
                          selectedItem.tools
                            .length >
                          0 && (
                            <div className="grid grid-cols-[85px_1fr] border-b border-neutral-200 py-3.5 sm:grid-cols-[100px_1fr] sm:py-4">
                              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px]">
                                Tools
                              </span>

                              <div className="flex flex-wrap gap-x-3 gap-y-2">
                                {selectedItem.tools.map(
                                  (
                                    tool,
                                  ) => (
                                    <span
                                      key={
                                        tool
                                      }
                                      className="text-[13px] text-neutral-800 sm:text-sm"
                                    >
                                      {
                                        tool
                                      }
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      {selectedItem.project_url && (
                        <a
                          href={
                            selectedItem.project_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-7 flex items-center justify-between border border-neutral-950 px-4 py-3.5 text-[13px] font-medium transition-colors hover:bg-neutral-950 hover:text-white sm:mt-8 sm:px-5 sm:py-4 sm:text-sm"
                        >
                          <span>
                            View Project
                          </span>

                          <ExternalLink
                            size={15}
                            strokeWidth={1.5}
                          />
                        </a>
                      )}

                      <div className="mt-8 flex items-center gap-3 sm:mt-10">
                        <Grid2X2
                          size={14}
                          strokeWidth={1.4}
                          className="text-neutral-400"
                        />

                        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400 sm:text-[9px]">
                          Gallery{' '}
                          {String(
                            selectedImages.length,
                          ).padStart(
                            2,
                            '0',
                          )}
                        </span>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              {/* ==================================================
                  MODAL FOOTER
                  ================================================== */}

              <div className="flex shrink-0 items-center justify-between border-t border-neutral-200 bg-white px-4 py-2.5 sm:px-7 sm:py-3">
                <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-neutral-400 sm:text-[8px]">
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