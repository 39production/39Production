import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ArrowRight,
  Loader2,
  Tag,
  Sparkles,
  ShoppingBag,
  Zap,
} from 'lucide-react'

const API_BASE_URL =
  'https://39production-api.39production.workers.dev'

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

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

function isPromotionValid(p: Promotion) {
  const today = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'Asia/Jakarta',
    },
  ).format(new Date())

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

  if (
    promotion.discount_type ===
    'Percentage'
  ) {
    return Math.min(
      product.price,
      Math.round(
        product.price *
        (Number(
          promotion.discount_value,
        ) / 100),
      ),
    )
  }

  return Math.min(
    product.price,
    Number(promotion.discount_value),
  )
}

function discountLabel(
  promotion: Promotion,
) {
  return promotion.discount_type ===
    'Percentage'
    ? `${promotion.discount_value}% OFF`
    : `Save ${formatPrice(
      Number(promotion.discount_value),
    )}`
}

export function ProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([])

  const [promotions, setPromotions] =
    useState<Promotion[]>([])

  const [loading, setLoading] =
    useState(true)

  const [promotionLoading, setPromotionLoading] =
    useState(true)

  const [error, setError] =
    useState('')

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

        const result =
          await response.json()

        if (result?.success === false) {
          throw new Error(
            result.message ||
            'Failed to load products',
          )
        }

        const data = Array.isArray(result)
          ? result
          : Array.isArray(
            result?.data,
          )
            ? result.data
            : Array.isArray(
              result?.products,
            )
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

        const result =
          await response.json()

        const data = Array.isArray(result)
          ? result
          : Array.isArray(
            result?.data,
          )
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

  const getProductPromotion = (
    id: number,
  ) =>
    promotions
      .filter(
        (p) =>
          p.target_type === 'Product' &&
          Number(p.product_id) ===
          Number(id) &&
          isPromotionValid(p),
      )
      .sort(
        (a, b) => b.id - a.id,
      )[0] ?? null

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50" />

        <div className="absolute -left-56 top-0 h-[460px] w-[460px] rounded-full bg-violet-100/65 blur-[130px]" />

        <div className="absolute -right-56 top-[28%] h-[460px] w-[460px] rounded-full bg-pink-100/55 blur-[130px]" />

        <div className="absolute left-[35%] top-[48%] h-[380px] w-[380px] rounded-full bg-fuchsia-100/35 blur-[120px]" />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24">
        {/* ===================================================
            HERO
        ==================================================== */}
        <div className="mb-10 max-w-3xl sm:mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700 sm:text-xs">
              Digital Marketplace
            </span>
          </div>

          <h1 className="text-4xl font-black leading-[0.98] tracking-[-0.04em] text-neutral-950 sm:text-5xl md:text-6xl">
            Products{' '}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
              Built to Create
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
            Explore ready-to-use digital products
            crafted for creators, brands, and modern
            digital experiences — from creative assets
            and templates to interactive works and
            production-ready ideas.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
              <Package className="h-3.5 w-3.5 text-violet-600" />
              Creative Assets
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
              <Zap className="h-3.5 w-3.5 text-pink-600" />
              Ready to Deploy
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
              <ShoppingBag className="h-3.5 w-3.5 text-cyan-600" />
              Made for Creators
            </div>
          </div>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}
        {loading && (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                Loading products...
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            ERROR
        ==================================================== */}
        {!loading && error && (
          <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Package className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-neutral-900">
                  Unable to load products
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            EMPTY
        ==================================================== */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-[0_15px_50px_rgba(0,0,0,0.04)] sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Package className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                The collection is coming
                together
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                Our digital product collection is
                currently being updated. New creative
                products will appear here as they are
                published.
              </p>
            </div>
          )}

        {/* ===================================================
            PRODUCTS
        ==================================================== */}
        {!loading &&
          !error &&
          products.length > 0 && (
            <>
              <div className="mb-6 flex items-end justify-between gap-4 sm:mb-7">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
                    The Collection
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                    What You Can Get
                  </h2>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 shadow-sm sm:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />

                  {products.length}{' '}
                  {products.length === 1
                    ? 'Product'
                    : 'Products'}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map(
                  (product) => {
                    const promotion =
                      getProductPromotion(
                        product.id,
                      )

                    const discount =
                      getDiscount(
                        product,
                        promotion,
                      )

                    const finalPrice =
                      Math.max(
                        0,
                        product.price -
                        discount,
                      )

                    const isAvailable =
                      product.stock > 0

                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
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
                        {/* Hover line */}
                        <div className="absolute inset-x-6 top-0 z-30 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* =================================================
                            PRODUCT IMAGE
                        ================================================== */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                          {product.image_url ? (
                            <>
                              <img
                                src={
                                  product.image_url
                                }
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition-transform
                                  duration-500
                                  group-hover:scale-[1.04]
                                "
                              />

                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />

                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10" />
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
                                  <Package className="h-9 w-9" />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Category */}
                          <div className="absolute bottom-4 left-4 z-20">
                            <span className="inline-flex rounded-full border border-white/30 bg-neutral-950/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow-sm backdrop-blur-md">
                              {product.category}
                            </span>
                          </div>

                          {/* Promotion */}
                          {promotion && (
                            <div className="absolute right-4 top-4 z-20">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-green-700 shadow-sm backdrop-blur-md">
                                <Tag className="h-3 w-3" />

                                {discountLabel(
                                  promotion,
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* =================================================
                            CONTENT
                        ================================================== */}
                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                              Digital Product
                            </span>

                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-green-600">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                                Available
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium uppercase tracking-wide text-red-500">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          <h2 className="line-clamp-2 text-lg font-bold leading-6 text-neutral-950 transition-colors group-hover:text-violet-700 sm:text-xl">
                            {product.name}
                          </h2>

                          <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-6 text-neutral-500">
                            {product.description}
                          </p>

                          {/* Promotion */}
                          {promotion && (
                            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3.5">
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                                  <Tag className="h-3.5 w-3.5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-green-800">
                                    {
                                      promotion.title
                                    }
                                  </p>

                                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-green-700/80">
                                    {
                                      promotion.description
                                    }
                                  </p>

                                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-green-700/60">
                                    Code:{' '}
                                    {
                                      promotion.code
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="mt-auto pt-5">
                            <div className="flex items-end justify-between gap-4 border-t border-neutral-100 pt-4">
                              <div className="min-w-0">
                                {promotion ? (
                                  <>
                                    <p className="text-[10px] font-medium text-neutral-400 line-through">
                                      {formatPrice(
                                        product.price,
                                      )}
                                    </p>

                                    <p className="mt-0.5 text-lg font-bold text-green-600 sm:text-xl">
                                      {formatPrice(
                                        finalPrice,
                                      )}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-lg font-bold text-neutral-950 sm:text-xl">
                                    {formatPrice(
                                      product.price,
                                    )}
                                  </p>
                                )}
                              </div>

                              <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 transition-colors group-hover:text-violet-800 sm:text-sm">
                                Explore Product

                                <ArrowRight
                                  className="
                                    h-3.5
                                    w-3.5
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1
                                  "
                                />
                              </span>
                            </div>

                            <Sparkles className="pointer-events-none absolute bottom-5 right-5 h-3 w-3 text-violet-600/0 transition-all duration-300 group-hover:text-violet-600/30" />
                          </div>
                        </div>
                      </Link>
                    )
                  },
                )}
              </div>
            </>
          )}

        {/* ===================================================
            PROMOTION NOTICE
        ==================================================== */}
        {!promotionLoading &&
          products.length > 0 &&
          promotions.some(
            (p) =>
              p.target_type ===
              'Product' &&
              isPromotionValid(p),
          ) && (
            <div className="relative mt-7 overflow-hidden rounded-2xl border border-violet-200 bg-violet-50/70 p-4 sm:mt-8 sm:p-5">
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-200/50 blur-3xl" />

              <div className="relative flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-white text-violet-700 shadow-sm">
                  <Tag className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Active promotions are
                    automatically applied
                  </p>

                  <p className="mt-1 max-w-3xl text-xs leading-5 text-neutral-500 sm:text-sm">
                    No promo code is required.
                    Eligible promotions are
                    automatically reflected in the
                    product price when you place
                    an order.
                  </p>
                </div>
              </div>
            </div>
          )}
      </main>
    </section>
  )
}