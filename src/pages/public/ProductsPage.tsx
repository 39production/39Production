
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Package,
  Tag,
  Sparkles,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

const SITE_URL = 'https://39production.digital'
const PAGE_URL = `${SITE_URL}/products`

interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
  stock: number
  status: 'Published' | 'Draft'
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

interface Promotion {
  id: number
  title: string
  code: string
  description: string
  discount_type: 'Percentage' | 'Fixed'
  discount_value: number
  target_type: 'Product' | 'Service'
  product_id: number | null
  service_id: number | null
  start_date: string
  end_date: string
  status:
  | 'Active'
  | 'Scheduled'
  | 'Expired'
  | 'Draft'
}

/* =========================================================
   SEO
========================================================= */

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
) {
  let element = document.head.querySelector(
    selector,
  ) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')

    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )

    element.dataset.seoPage = 'products'
    document.head.appendChild(element)
  } else {
    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )
  }

  return element
}

function upsertLink(
  selector: string,
  attributes: Record<string, string>,
) {
  let element = document.head.querySelector(
    selector,
  ) as HTMLLinkElement | null

  if (!element) {
    element = document.createElement('link')

    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )

    element.dataset.seoPage = 'products'
    document.head.appendChild(element)
  } else {
    Object.entries(attributes).forEach(
      ([key, value]) => {
        element?.setAttribute(key, value)
      },
    )
  }

  return element
}

function setProductsSEO(products: Product[]) {
  const title =
    'Digital Products & Creative Assets | 39Production'

  const description =
    'Explore digital products, creative assets, and production-ready digital works from 39Production for creators, brands, businesses, and modern digital experiences.'

  const keywords =
    'digital products, creative digital products, digital assets, creative assets, website templates, design assets, 39Production, digital production, creative production, Indonesia'

  document.title = title

  document.documentElement.lang = 'en'

  /* =======================================================
     BASIC META
  ======================================================== */

  upsertMeta('meta[name="description"]', {
    name: 'description',
    content: description,
  })

  upsertMeta('meta[name="keywords"]', {
    name: 'keywords',
    content: keywords,
  })

  upsertMeta('meta[name="robots"]', {
    name: 'robots',
    content:
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  })

  upsertMeta('meta[name="author"]', {
    name: 'author',
    content: '39Production',
  })

  upsertMeta('meta[name="application-name"]', {
    name: 'application-name',
    content: '39Production',
  })

  upsertMeta('meta[name="theme-color"]', {
    name: 'theme-color',
    content: '#ffffff',
  })

  /* =======================================================
     CANONICAL
  ======================================================== */

  upsertLink('link[rel="canonical"]', {
    rel: 'canonical',
    href: PAGE_URL,
  })

  /* =======================================================
     OPEN GRAPH
  ======================================================== */

  upsertMeta('meta[property="og:type"]', {
    property: 'og:type',
    content: 'website',
  })

  upsertMeta('meta[property="og:url"]', {
    property: 'og:url',
    content: PAGE_URL,
  })

  upsertMeta('meta[property="og:title"]', {
    property: 'og:title',
    content: title,
  })

  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  })

  upsertMeta('meta[property="og:site_name"]', {
    property: 'og:site_name',
    content: '39Production',
  })

  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: 'en_US',
  })

  upsertMeta('meta[property="og:image"]', {
    property: 'og:image',
    content: `${SITE_URL}/og-products.jpg`,
  })

  upsertMeta('meta[property="og:image:alt"]', {
    property: 'og:image:alt',
    content:
      '39Production digital products and creative assets',
  })

  /* =======================================================
     TWITTER / X
  ======================================================== */

  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary_large_image',
  })

  upsertMeta('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: title,
  })

  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: description,
  })

  upsertMeta('meta[name="twitter:image"]', {
    name: 'twitter:image',
    content: `${SITE_URL}/og-products.jpg`,
  })

  /* =======================================================
     JSON-LD
  ======================================================== */

  const existingSchema = document.head.querySelector(
    'script[data-seo-page="products"]',
  )

  if (existingSchema) {
    existingSchema.remove()
  }

  const itemList = products.map(
    (product, index) => {
      const productUrl =
        `${SITE_URL}/products/${product.id}`

      const item: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        url: productUrl,
        name: product.name,
      }

      if (product.image_url) {
        item.image = product.image_url
      }

      return item
    },
  )

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: PAGE_URL,
    isPartOf: {
      '@type': 'WebSite',
      name: '39Production',
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: 'Digital Products',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: '39Production Digital Products',
      numberOfItems: products.length,
      itemListElement: itemList,
    },
  }

  const script =
    document.createElement('script')

  script.type = 'application/ld+json'
  script.dataset.seoPage = 'products'
  script.textContent = JSON.stringify(schema)

  document.head.appendChild(script)
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

function isPromotionValid(p: Promotion) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
  }).format(new Date())

  return (
    p.status === 'Active' &&
    p.start_date <= today &&
    p.end_date >= today
  )
}

function getDiscount(
  product: Product,
  promotion: Promotion | null,
) {
  if (!promotion) {
    return 0
  }

  if (promotion.discount_type === 'Percentage') {
    return Math.min(
      product.price,
      Math.round(
        product.price *
        (Number(promotion.discount_value) / 100),
      ),
    )
  }

  return Math.min(
    product.price,
    Number(promotion.discount_value),
  )
}

function discountLabel(promotion: Promotion) {
  return promotion.discount_type === 'Percentage'
    ? `${promotion.discount_value}% OFF`
    : `Save ${formatPrice(
      Number(promotion.discount_value),
    )}`
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [promotionLoading, setPromotionLoading] =
    useState(true)
  const [error, setError] = useState('')

  /* =========================================================
     SEO INITIALIZATION
  ========================================================= */

  useEffect(() => {
    setProductsSEO([])

    return () => {
      const seoElements =
        document.head.querySelectorAll(
          '[data-seo-page="products"]',
        )

      seoElements.forEach((element) =>
        element.remove(),
      )
    }
  }, [])

  /* =========================================================
     SEO UPDATE WHEN PRODUCTS ARE LOADED
  ========================================================= */

  useEffect(() => {
    if (!loading) {
      setProductsSEO(products)
    }
  }, [products, loading])

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_BASE_URL}/api/products`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error(
            `Failed to load products (${response.status})`,
          )
        }

        const result = await response.json()

        if (result?.success === false) {
          throw new Error(
            result.message ||
            'Failed to load products',
          )
        }

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result?.products)
              ? result.products
              : []

        setProducts(
          data.filter(
            (p: Product) =>
              p.status === 'Published',
          ),
        )
      } catch (err) {
        console.error(
          'Fetch products error:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load products.',
        )
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  /* =========================================================
     FETCH PROMOTIONS
  ========================================================= */

  useEffect(() => {
    const run = async () => {
      try {
        setPromotionLoading(true)

        const response = await fetch(
          `${API_BASE_URL}/api/promotions`,
          {
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          setPromotions([])
          return
        }

        const result = await response.json()

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
            ? result.data
            : []

        setPromotions(data)
      } catch (err) {
        console.error(
          'Fetch promotions error:',
          err,
        )

        setPromotions([])
      } finally {
        setPromotionLoading(false)
      }
    }

    void run()
  }, [])

  const getProductPromotion = (id: number) =>
    promotions
      .filter(
        (p) =>
          p.target_type === 'Product' &&
          Number(p.product_id) === Number(id) &&
          isPromotionValid(p),
      )
      .sort((a, b) => b.id - a.id)[0] ?? null

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-white text-zinc-950">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(24,24,27,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(24,24,27,0.035) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-violet-600"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[13%] top-[34%] h-1.5 w-1.5 rounded-full bg-violet-500"
      />

      <div className="relative mx-auto max-w-[1600px] px-4 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-12 lg:pb-28 lg:pt-24">
        {/* ===================================================
            TOP EDITORIAL LINE
        ==================================================== */}

        <div className="mb-10 flex items-center justify-between border-b border-black/10 pb-5 sm:mb-16">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 sm:text-xs">
            <span className="text-zinc-950">
              39Production
            </span>

            <span className="h-1 w-1 rounded-full bg-violet-600" />

            <span>Products</span>
          </div>

          <div className="hidden items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:flex">
            <span>Digital</span>
            <span>/</span>
            <span>Creative</span>
            <span>/</span>
            <span>Ready to Use</span>
          </div>
        </div>

        {/* ===================================================
            HERO
        ==================================================== */}

        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-7">
              <span className="inline-flex items-center gap-2 border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
                <Sparkles className="h-3.5 w-3.5" />
                Digital Marketplace
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Ready to Explore
              </span>
            </div>

            <h1 className="max-w-5xl text-[clamp(3.25rem,8vw,8rem)] font-black leading-[0.82] tracking-[-0.065em]">
              <span className="block text-zinc-950">
                Built
              </span>

              <span className="block text-zinc-300">
                to create.
              </span>
            </h1>

            <div className="mt-7 max-w-2xl border-l-2 border-violet-600 pl-4 sm:mt-8 sm:pl-5">
              <p className="text-sm leading-6 text-zinc-600 sm:text-lg sm:leading-7">
                Explore digital products crafted
                for creators, brands and modern
                digital experiences — ready to use,
                adapt and make your own.
              </p>
            </div>
          </div>

          <div className="relative lg:pb-2">
            <div className="absolute -right-2 -top-8 hidden text-[9rem] font-black leading-none tracking-[-0.08em] text-zinc-100 lg:block">
              39
            </div>

            <div className="relative border-t border-black/10 pt-5">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    Product Philosophy
                  </p>

                  <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
                    Creative assets, digital works and
                    production-ready products designed
                    to move ideas forward.
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-3xl font-black tracking-[-0.04em] text-violet-600">
                    {products.length
                      .toString()
                      .padStart(2, '0')}
                  </span>

                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                    Products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            COLLECTION HEADING
        ==================================================== */}

        <div className="mt-16 flex flex-col justify-between gap-4 border-y border-black/10 py-5 sm:mt-24 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                03
              </span>

              <span className="h-px w-10 bg-violet-600" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                The Collection
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
              What you can get.
            </h2>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-600" />

            {products.length}{' '}
            {products.length === 1
              ? 'Product'
              : 'Products'}
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="mt-8 flex min-h-[220px] items-center justify-center border border-black/10 bg-neutral-50 sm:mt-10 sm:min-h-[300px]">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              Loading products
            </div>
          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}

        {!loading && error && (
          <div className="mt-8 border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700 sm:mt-10 sm:px-6">
            {error}
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="mt-8 border border-black/10 bg-neutral-50 px-6 py-16 text-center sm:mt-10 sm:py-20">
              <Package className="mx-auto h-7 w-7 text-violet-600" />

              <h3 className="mt-5 text-xl font-black tracking-tight">
                The collection is coming together
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                New digital products will appear
                here as they are published.
              </p>
            </div>
          )}

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="mt-8 space-y-3 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0 lg:grid-cols-12">
              {products.map((product, index) => {
                const promotion =
                  getProductPromotion(product.id)

                const discount = getDiscount(
                  product,
                  promotion,
                )

                const finalPrice = Math.max(
                  0,
                  product.price - discount,
                )

                const isAvailable =
                  product.stock > 0

                const isFeatured =
                  index % 5 === 0

                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className={`
                      group relative overflow-hidden
                      border border-black/10
                      bg-white
                      transition-all duration-500
                      hover:border-violet-300
                      hover:shadow-[0_18px_50px_rgba(124,58,237,0.10)]

                      sm:block
                      sm:hover:-translate-y-1

                      ${isFeatured
                        ? 'lg:col-span-7'
                        : 'lg:col-span-5'
                      }
                    `}
                  >
                    {/* Accent */}

                    <div className="absolute inset-x-0 top-0 z-30 h-1 bg-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* =================================================
                        MOBILE COMPACT PRODUCT ROW
                    ================================================== */}

                    <div className="flex min-h-[122px] items-stretch sm:hidden">
                      {/* Thumbnail */}

                      <div className="relative w-[112px] shrink-0 overflow-hidden bg-neutral-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={`${product.name} — 39Production digital product`}
                            loading={
                              index < 2
                                ? 'eager'
                                : 'lazy'
                            }
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-pink-100" />

                            <div
                              className="absolute inset-0 opacity-[0.07]"
                              style={{
                                backgroundImage: `
                                  linear-gradient(rgba(124,58,237,0.8) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(124,58,237,0.8) 1px, transparent 1px)
                                `,
                                backgroundSize: '22px 22px',
                              }}
                            />

                            <Package className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-violet-500" />
                          </>
                        )}

                        <div className="absolute left-2.5 top-2.5">
                          <span className="inline-flex bg-black/65 px-2 py-1 text-[7px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                            {String(index + 1).padStart(
                              2,
                              '0',
                            )}
                          </span>
                        </div>

                        {promotion && (
                          <div className="absolute bottom-2.5 left-2.5">
                            <span className="inline-flex items-center gap-1 bg-white/95 px-2 py-1 text-[7px] font-black uppercase tracking-[0.08em] text-violet-700 shadow-sm">
                              <Tag className="h-2.5 w-2.5" />

                              {discountLabel(
                                promotion,
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Compact content */}

                      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[8px] font-black uppercase tracking-[0.15em] text-violet-600">
                              {product.category}
                            </span>

                            <span
                              className={`shrink-0 text-[7px] font-bold uppercase tracking-[0.12em] ${isAvailable
                                ? 'text-green-600'
                                : 'text-red-500'
                                }`}
                            >
                              {isAvailable
                                ? 'Available'
                                : 'Sold Out'}
                            </span>
                          </div>

                          <h3 className="mt-1.5 line-clamp-2 pr-5 text-[15px] font-black leading-[1.05] tracking-[-0.035em] text-zinc-950 transition-colors group-hover:text-violet-700">
                            {product.name}
                          </h3>

                          <p className="mt-1.5 line-clamp-1 text-[10px] leading-4 text-zinc-400">
                            {product.description}
                          </p>
                        </div>

                        <div className="mt-2 flex items-end justify-between gap-2">
                          <div className="min-w-0">
                            {promotion ? (
                              <div className="flex flex-wrap items-baseline gap-1.5">
                                <span className="text-[12px] font-black tracking-tight text-violet-600">
                                  {formatPrice(
                                    finalPrice,
                                  )}
                                </span>

                                <span className="text-[8px] text-zinc-400 line-through">
                                  {formatPrice(
                                    product.price,
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[12px] font-black tracking-tight text-zinc-950">
                                {formatPrice(
                                  product.price,
                                )}
                              </span>
                            )}
                          </div>

                          <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-black/10 text-zinc-500 transition-all group-hover:border-violet-600 group-hover:bg-violet-600 group-hover:text-white">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        TABLET / DESKTOP PRODUCT CARD
                    ================================================== */}

                    <div className="hidden sm:block">
                      {/* Visual */}

                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                        {product.image_url ? (
                          <>
                            <img
                              src={product.image_url}
                              alt={`${product.name} — 39Production digital product`}
                              loading={
                                index < 2
                                  ? 'eager'
                                  : 'lazy'
                              }
                              decoding="async"
                              className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-700
                                ease-out
                                group-hover:scale-[1.045]
                              "
                            />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-pink-500/[0.08] mix-blend-soft-light" />
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-pink-100" />

                            <div
                              className="absolute inset-0 opacity-[0.07]"
                              style={{
                                backgroundImage: `
                                  linear-gradient(rgba(124,58,237,0.8) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(124,58,237,0.8) 1px, transparent 1px)
                                `,
                                backgroundSize: '36px 36px',
                              }}
                            />

                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                              <div className="absolute -inset-10 rounded-full bg-violet-200/60 blur-3xl" />

                              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-200 bg-white text-violet-600 shadow-xl">
                                <Package className="h-10 w-10" />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Product number */}

                        <div className="absolute left-5 top-5 z-20">
                          <span className="inline-flex items-center border border-white/25 bg-black/55 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                            Product{' '}
                            {String(index + 1).padStart(
                              2,
                              '0',
                            )}
                          </span>
                        </div>

                        {/* Category */}

                        <div className="absolute bottom-5 left-5 z-20">
                          <span className="inline-flex border border-white/25 bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                            {product.category}
                          </span>
                        </div>

                        {/* Promotion */}

                        {promotion && (
                          <div className="absolute right-5 top-5 z-20">
                            <span className="inline-flex items-center gap-1.5 border border-green-200/70 bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-green-700 shadow-sm backdrop-blur-md">
                              <Tag className="h-3 w-3" />

                              {discountLabel(
                                promotion,
                              )}
                            </span>
                          </div>
                        )}

                        {/* Explore */}

                        <div className="absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center border border-white/25 bg-black/55 text-white backdrop-blur-md transition-all duration-300 group-hover:border-violet-400 group-hover:bg-violet-600">
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>

                      {/* Content */}

                      <div className="flex flex-col p-6 sm:p-7">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-600">
                            Digital Product
                          </span>

                          {isAvailable ? (
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-green-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Available
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-500">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <h2 className="mt-4 max-w-2xl text-2xl font-black leading-[0.98] tracking-[-0.045em] text-zinc-950 transition-colors duration-300 group-hover:text-violet-700 sm:text-3xl">
                          {product.name}
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">
                          {product.description}
                        </p>

                        {promotion && (
                          <div className="mt-6 border border-violet-200 bg-violet-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-violet-600 text-white">
                                  <Tag className="h-3.5 w-3.5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-violet-700">
                                    {promotion.title}
                                  </p>

                                  <p className="mt-1 text-xs text-violet-700/70">
                                    Code:{' '}
                                    <span className="font-bold">
                                      {promotion.code}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <span className="shrink-0 text-sm font-black text-violet-700">
                                {discountLabel(
                                  promotion,
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="mt-7 border-t border-black/10 pt-5">
                          <div className="flex items-end justify-between gap-5">
                            <div>
                              {promotion ? (
                                <>
                                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                                    Promotional Price
                                  </p>

                                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                                    <span className="text-xl font-black tracking-tight text-green-600 sm:text-2xl">
                                      {formatPrice(
                                        finalPrice,
                                      )}
                                    </span>

                                    <span className="text-xs text-zinc-400 line-through">
                                      {formatPrice(
                                        product.price,
                                      )}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                                    Product Price
                                  </p>

                                  <p className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
                                    {formatPrice(
                                      product.price,
                                    )}
                                  </p>
                                </>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-2 border-b border-black pb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors group-hover:border-violet-600 group-hover:text-violet-600">
                              Explore Product

                              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

        {/* ===================================================
            PROMOTION NOTICE
        ==================================================== */}

        {!promotionLoading &&
          products.length > 0 &&
          promotions.some(
            (p) =>
              p.target_type === 'Product' &&
              isPromotionValid(p),
          ) && (
            <div className="mt-8 grid border border-violet-200 bg-violet-50 sm:mt-10 lg:grid-cols-[auto_1fr_auto]">
              <div className="flex items-center justify-center bg-violet-600 p-4 text-white sm:p-5">
                <Tag className="h-5 w-5" />
              </div>

              <div className="px-5 py-5 sm:px-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
                  Current Offers
                </p>

                <p className="mt-1 text-sm leading-6 text-violet-900/80">
                  Selected products currently have
                  active promotional offers. Eligible
                  discounts are reflected directly in
                  the product pricing.
                </p>
              </div>

              <div className="flex items-center px-5 pb-5 sm:px-6 lg:pb-0">
                <Link
                  to="/promotions"
                  className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-violet-700"
                >
                  View Promotions

                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}

        {/* ===================================================
            CTA
        ==================================================== */}

        <div className="relative mt-16 overflow-hidden bg-black px-6 py-10 text-white sm:mt-24 sm:px-10 sm:py-12 lg:mt-28 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-3rem] top-1/2 hidden -translate-y-1/2 text-[15rem] font-black leading-none tracking-[-0.12em] text-white/[0.035] sm:block"
          >
            39
          </div>

          <div
            aria-hidden="true"
            className="absolute right-6 top-6 h-2 w-2 rounded-full bg-violet-500 sm:right-8 sm:top-8"
          />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
                  39Production
                </span>

                <span className="h-px w-10 bg-violet-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Need Something Custom?
                </span>
              </div>

              <h2 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                Have something
                <span className="block text-violet-400">
                  different in mind?
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
                If you need something beyond the
                products in our collection, tell us
                what you want to build and we can
                create it with you.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-3 bg-violet-600 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-violet-500"
              >
                Start a Project

                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <Link
                to="/services"
                className="group inline-flex items-center justify-center gap-3 border border-white/15 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/75 transition-all duration-300 hover:border-violet-400 hover:text-violet-300"
              >
                Explore Services

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* ===================================================
            SIGNATURE
        ==================================================== */}

        <div className="mt-7 flex flex-col justify-between gap-3 border-t border-black/10 pt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:flex-row sm:items-center">
          <span>
            39Production / Digital / Creative /
            Entertainment
          </span>

          <span className="inline-flex items-center gap-2">
            Creating Digital Works

            <ArrowUpRight className="h-3 w-3 text-violet-600" />
          </span>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </section>
  )
}